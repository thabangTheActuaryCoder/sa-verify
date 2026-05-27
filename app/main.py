import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.routes import auth, candidate, employer, admin

# Import all models so they are registered with SQLAlchemy
import app.models  # noqa: F401

app = FastAPI(
    title="SA Verify",
    description="National Verification System Prototype",
    version="1.0.0",
)

# CORS middleware - allow Vite dev server during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (legacy uploads etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(auth.router)
app.include_router(candidate.router)
app.include_router(employer.router)
app.include_router(admin.router)

# Serve React build in production
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.isdir(FRONTEND_DIST):
    # Serve static assets from the React build
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="react-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the React SPA for all non-API routes."""
        # Try to serve a static file first
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fall back to index.html for client-side routing
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Auto-seed demo data if database is empty (first deploy)
    from app.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.close()
            import subprocess, sys
            subprocess.run([sys.executable, "seed_data.py"], check=True)
        else:
            db.close()
    except Exception:
        db.close()
