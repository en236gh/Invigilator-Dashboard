# UNZA Administrator Dashboard

Frontend for the Digital Examination Attendance System — administrator role.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Heroicons (`@heroicons/react`)
- Inter font (self-hosted via `next/font`)

## Setup

```bash
npm install
cp .env.local.example .env.local   # or use the existing .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Backend API default: `https://fourth-91rl.onrender.com` (`API_BASE_URL`).

## Demo login

| Field | Value |
|-------|-------|
| Email | `admin@unza.zm` |
| Password | `Admin@2026` |

## Screens

- **Login** — `POST /api/auth/login`
- **Dashboard** — system-wide activity and venue occupancy
- **Staff onboarding** — create pending lecturer and invigilator accounts
- **Examinations** — examination, venue, allocation, and registration oversight
- **Attendance** — read-only register and summary
- **Incidents** — system-wide incident review
- **Reports** — generated report index

See `public/INVIGILATOR_FRONTEND.md` and the Postman collection for the full API contract.

## Invigilator assignment catalog

`/assignments` uses School → Programme → Year of study → Course → Exam → Venue.
Lookups use `/api/admin/invigilator-assignments/academics`; exam venues use
`/api/exams/{examSessionId}/venues`. Manual requests include `selection`, while
automatic assignment sends that selection directly as its JSON body. Automatic
assignment and publishing apply to the whole exam, including shared exams.

Deploy backend Flyway V27 and populate approved active schools, programmes,
courses, curriculum entries and explicit exam-to-curriculum mappings before
using this flow. Empty catalogs intentionally provide no selections. The backend
must match course code and semester, exclude completed exams, and enforce active
parents, venue links, active invigilators and timetable conflicts. The frontend
does not infer academic relationships. Phase 3 seed data is for demos only.

Use **Review existing assignments** to publish or cancel existing duties even
when they have no current catalog mapping. New assignments require the academic
selection. Database migrations and catalog provisioning belong to the backend;
this repository contains the dashboard client.
