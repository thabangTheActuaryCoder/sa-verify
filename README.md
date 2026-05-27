# SA Verify - National Verification System

A full-stack prototype for South Africa's national verification system. Employers submit verification requests against citizen records; candidates review and consent to each query; admins monitor the system and detect fraud.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React 18, TypeScript, Mantine v7, React Router v6
- **Build:** Vite
- **Auth:** JWT (HS256)

## Quick Start

### 1. Backend Setup

```bash
cd sa-verify
python -m venv venv
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python seed_data.py        # Seed demo data
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Swagger docs at `/docs`.

### 2. Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` requests to the backend.

### 3. Production Build

```bash
cd frontend
npm run build
```

Then restart the backend. It serves the React build from `frontend/dist/` automatically.

```bash
cd sa-verify
uvicorn app.main:app
```

Open `http://localhost:8000` to use the full application.

## Demo Accounts

| Username | Password | Role |
|---|---|---|
| thabo.candidate | Demo@1234 | Candidate |
| naledi.candidate | Demo@1234 | Candidate |
| sipho.candidate | Demo@1234 | Candidate |
| hr.discovery | Demo@1234 | Employer |
| hr.standardbank | Demo@1234 | Employer |
| admin | Admin@1234 | Admin |

## Features

### Candidate Portal
- View and respond to verification requests (approve/decline each query)
- Full profile view (employment, qualifications, criminal records, credit, licence, professional registrations, addresses, references)
- Verification history
- File disputes against incorrect data
- Block companies from requesting verification
- Upload supporting documents
- Notifications

### Employer Portal
- Submit single or bulk verification requests
- 12 query types (ID, employment, salary, qualifications, criminal, Interpol, credit, licence, professional registration, address, reference checks)
- Track request status with auto-refresh
- Download verification reports
- Filter and search requests

### Admin Portal
- System statistics dashboard
- Automated fraud detection (ghost employees, SASSA anomalies, deceased grant fraud, Interpol wanted, fake qualifications)
- Send fraud notifications to SARS, employers, SASSA
- User CRUD management
- Company CRUD management
- Dispute resolution
- Full audit log

## Project Structure

```
sa-verify/
  app/                  # FastAPI backend
    routes/             # API endpoints
    models/             # SQLAlchemy ORM models
    schemas/            # Pydantic request/response models
    services/           # Business logic
  frontend/             # React application
    src/
      api/              # Axios API client modules
      types/            # TypeScript type definitions
      context/          # React context (auth)
      hooks/            # Custom hooks
      components/       # Reusable UI components
      pages/            # Page components by role
      utils/            # Formatters and constants
  static/               # Legacy static files + uploads
  seed_data.py          # Database seeding script
```
