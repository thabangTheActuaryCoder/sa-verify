from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.citizen import Citizen
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.verification import RegisterRequest
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    hash_password,
)
from app.services.audit_service import log_action
from app.services.id_validator import validate_sa_id

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(data={"sub": user.username, "role": user.role})

    log_action(
        db,
        action="login",
        resource_type="user",
        resource_id=user.id,
        user_id=user.id,
        username=user.username,
        details={"role": user.role},
    )

    return TokenResponse(
        access_token=token,
        role=user.role,
        full_name=user.full_name,
    )


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Self-registration for candidates.

    Citizens register with their SA ID number. The system looks up
    (or creates) the citizen record and links a new user account.
    """
    # Validate ID format
    validation = validate_sa_id(payload.id_number)
    if not validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid SA ID number: {validation['error']}",
        )

    # Check username not taken
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    # Find or flag citizen record
    citizen = db.query(Citizen).filter(Citizen.id_number == payload.id_number).first()
    if not citizen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No citizen record found for this ID number. Contact an administrator.",
        )

    # Check no user already linked
    if citizen.user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user account is already linked to this ID number.",
        )

    user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role="candidate",
        citizen_id=citizen.id,
    )
    db.add(user)
    db.commit()

    log_action(
        db,
        action="self_registration",
        resource_type="user",
        resource_id=user.id,
        user_id=user.id,
        username=user.username,
    )

    return {"message": "Registration successful. You can now log in.", "username": user.username}
