# UNZA Invigilator Dashboard

Frontend for the Digital Examination Attendance System — invigilator role.

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

Backend API default: `http://localhost:8080` (`API_BASE_URL`).

## Demo login

| Field | Value |
|-------|-------|
| Email | `invigilator@unza.zm` |
| Password | `Invig@2026` |

## Screens

- **Login** — `POST /api/auth/login`
- **Dashboard** — stats tiles + quick-action tiles + assignments
- **Check-in** — lookup + verify + check-in
- **Attendance** — register, summary, scripts collected
- **Incidents** — report + list
- **Reports** — generate exam-session report metadata

See `public/INVIGILATOR_FRONTEND.md` and the Postman collection for the full API contract.
