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
