from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter(tags=["pages"])


@router.get("/", response_class=HTMLResponse)
@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@router.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("auth/register.html", {"request": request})


# ---- Candidate pages ----

@router.get("/candidate/dashboard", response_class=HTMLResponse)
def candidate_dashboard(request: Request):
    return templates.TemplateResponse("candidate/dashboard.html", {"request": request})


@router.get("/candidate/profile", response_class=HTMLResponse)
def candidate_profile(request: Request):
    return templates.TemplateResponse("candidate/profile.html", {"request": request})


@router.get("/candidate/request/{request_id}", response_class=HTMLResponse)
def candidate_request_detail(request: Request, request_id: int):
    return templates.TemplateResponse(
        "candidate/request_detail.html",
        {"request": request, "request_id": request_id},
    )


@router.get("/candidate/disputes", response_class=HTMLResponse)
def candidate_disputes(request: Request):
    return templates.TemplateResponse("candidate/disputes.html", {"request": request})


@router.get("/candidate/blocked", response_class=HTMLResponse)
def candidate_blocked(request: Request):
    return templates.TemplateResponse("candidate/blocked.html", {"request": request})


@router.get("/candidate/notifications", response_class=HTMLResponse)
def candidate_notifications(request: Request):
    return templates.TemplateResponse("candidate/notifications.html", {"request": request})


@router.get("/candidate/documents", response_class=HTMLResponse)
def candidate_documents(request: Request):
    return templates.TemplateResponse("candidate/documents.html", {"request": request})


@router.get("/candidate/history", response_class=HTMLResponse)
def candidate_history(request: Request):
    return templates.TemplateResponse("candidate/history.html", {"request": request})


# ---- Employer pages ----

@router.get("/employer/dashboard", response_class=HTMLResponse)
def employer_dashboard(request: Request):
    return templates.TemplateResponse("employer/dashboard.html", {"request": request})


@router.get("/employer/request/{request_id}", response_class=HTMLResponse)
def employer_request_detail(request: Request, request_id: int):
    return templates.TemplateResponse(
        "employer/request_detail.html",
        {"request": request, "request_id": request_id},
    )


@router.get("/employer/bulk-verify", response_class=HTMLResponse)
def employer_bulk_verify(request: Request):
    return templates.TemplateResponse("employer/bulk_verify.html", {"request": request})


# ---- Admin pages ----

@router.get("/admin/dashboard", response_class=HTMLResponse)
def admin_dashboard(request: Request):
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})


@router.get("/admin/users", response_class=HTMLResponse)
def admin_users(request: Request):
    return templates.TemplateResponse("admin/users.html", {"request": request})


@router.get("/admin/companies", response_class=HTMLResponse)
def admin_companies(request: Request):
    return templates.TemplateResponse("admin/companies.html", {"request": request})


@router.get("/admin/disputes", response_class=HTMLResponse)
def admin_disputes(request: Request):
    return templates.TemplateResponse("admin/disputes.html", {"request": request})
