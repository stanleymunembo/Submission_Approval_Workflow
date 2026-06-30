# Submission & Approval Workflow

Two-sided web app: **Applicants** submit and track applications; **Reviewers** approve, reject, or return them. Status changes are logged in an audit trail.

**Stack:** 
    React + TypeScript (Vite) 
	Node.js + Express 
	PostgreSQL 
	JWT

## Project layout

```
Backend/     API, SQL scripts, tests
Frontend/    React UI


## Demo logins

| Role      | Email                | Password      |
|-----------|----------------------|---------------|
| Applicant | applicant@demo.com   | Password123!  |
| Reviewer  | reviewer@demo.com    | Password123!  |

## Status flow

DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED / RETURNED
```

- Applicant: create, edit (draft/returned only), submit
- Reviewer: start review, approve, reject, return (comment required for reject/return)

## Run manually

**Requires:** Node.js, PostgreSQL, npm

### 1. Database

Create database `Applicant_Reviewer_db`, then run in order:

1. `Backend/Scripts/sql/001_create_schema.sql`
2. `Backend/Scripts/sql/002_seed_data.sql`

### 2. Backend

powershell
cd Backend
copy .env.example .env   # set DB_PASSWORD and JWT_SECRET
npm install
npm run dev


API: http://localhost:4000

### 3. Frontend
powershell
cd Frontend
npm install
npm run dev
```

App: http://localhost:5173


## Run with Docker

**Requires:** Docker Desktop

From project root:

powershell
docker compose up --build


- App: http://localhost:5173
- API: http://localhost:4000/api/health
- Database and seed data start automatically on first run

See `DOCKER-START.txt` if the build fails.



## Tests

```powershell
cd Backend
npm test


25 tests (workflow rules + auth).

## Main API routes

| Route | Who |
|-------|-----|
| `POST /api/auth/login` | Both |
| `GET /api/applications/mine` | Applicant |
| `POST /api/applications` | Applicant |
| `POST /api/applications/:id/submit` | Applicant |
| `GET /api/applications/queue` | Reviewer |
| `POST /api/applications/:id/review` | Reviewer |
