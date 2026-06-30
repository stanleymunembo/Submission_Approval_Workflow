# Submission & Approval Workflow

A simple web app with two sides:

- **Applicant** — creates applications, submits them, tracks status
- **Reviewer** — sees the queue, approves, rejects, or sends back with a comment

Every status change is saved in an **audit log** (who did what and when).

**Built with:** React · Node.js · PostgreSQL

---

## Live app 


| | |
|---|---|
| **Frontend app URL ** | https://submission-approval-workflow-app.onrender.com/login |
| **Backend API check URL** | https://submission-approval-workflow-api.onrender.com/api/health|





**Test logins**

| Who | Email | Password |
|-----|-------|----------|
| Applicant | applicant@demo.com | Password123! |
| Reviewer | reviewer@demo.com | Password123! |



**Step-by-step deploy guide:** see `RENDER-DEPLOY.txt`


## Run on your computer

You need: **Node.js**, **PostgreSQL**, **npm**  
(Or use **Docker Desktop** — see bottom of this section.)

### 1. Set up the database

1. Open pgAdmin (or psql).
2. Create a database called: `Applicant_Reviewer_db`
3. Run these two files **in order**:
   - `Backend/Scripts/sql/001_create_schema.sql` — creates tables
   - `Backend/Scripts/sql/002_seed_data.sql` — adds demo users and sample data

### 2. Start the backend (API)

```powershell
cd Backend
copy .env.example .env
```

Open `.env` and set your Postgres password and a secret key for JWT:

```
DB_PASSWORD=your_postgres_password
JWT_SECRET=any_random_secret_string
```

Then:

```powershell
npm install
npm run dev
```

You should see: `Server is running on http://localhost:4000`  
Check: http://localhost:4000/api/health

### 3. Start the frontend (website)

Open a **new** terminal:

```powershell
cd Frontend
npm install
npm run dev
```

Open: http://localhost:5173

Log in with the test accounts above.

### Or use Docker (all 3 in one command)

If Docker Desktop is installed:

```powershell
docker compose up --build
```

Then open http://localhost:5173 — database starts automatically.  
Problems? Read `DOCKER-START.txt`.

### Run tests

```powershell
cd Backend
npm test
```

---

## Data model (how data is stored)

Three tables in PostgreSQL:

| Table | What it stores |
|-------|----------------|
| **users** | People who log in (email, password, role) |
| **applications** | Each submission (title, category, status, owner) |
| **audit_logs** | History of every status change |

**How they connect**

- Each application belongs to one user (`owner_id`)
- Each audit log row links to an application and the person who acted

**Application statuses (in order)**

```
DRAFT  →  SUBMITTED  →  UNDER_REVIEW  →  APPROVED
                                      →  REJECTED
                                      →  RETURNED  (applicant can fix and resubmit)
```

### Why I designed it this way

- **Rules live in the backend** — the server blocks bad status changes, not just the browser.
- **Separate audit table** — old statuses are never deleted; you can always see the history.
- **Simple roles** — only `applicant` and `reviewer`; keeps auth easy to follow.
- **JWT tokens** — after login, the API knows who you are without storing sessions in memory.

---

## Trade-offs (what I skipped and why)

**Kept simple for this assignment**

- No sign-up page (demo users only)
- No emails when status changes
- No file attachments
- Basic look — focus on workflow working correctly

**If I had more time**

- Sign-up and forgot-password
- Email notifications
- Search and filters on long lists
- Prettier UI
- Deploy script so hosting is one click

---

## AI tools I used

| Tool | What I used it for |
|------|-------------------|
| Cursor (AI chat)** | Help planning the project, writing backend and frontend code, Docker files, fixing bugs
| Myself | Checked all code, ran tests, tested in Postman and the browser, decided what to keep or change  and i managed the repository. No automated git actions. these allowed to create meaningful issues/branches for each development sections.

AI helped like a tutor sitting next to me — I still read the code and tested everything myself.

---

## Folder structure

```
Backend/       → API + database scripts + tests
Frontend/        → React website
docker-compose.yml → run everything with Docker
```

## Main API endpoints

| What | Route | Who |
|------|-------|-----|
| Log in | POST /api/auth/login | Everyone |
| My applications | GET /api/applications/mine | Applicant |
| Create application | POST /api/applications | Applicant |
| Submit | POST /api/applications/:id/submit | Applicant |
| Review queue | GET /api/applications/queue | Reviewer |
| Approve / reject / return | POST /api/applications/:id/review | Reviewer |
