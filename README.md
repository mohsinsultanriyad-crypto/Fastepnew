# FastEP Work — Timesheet / Work Management

This repository contains a backend (Express + MongoDB) and frontend (React + Vite) ready to run locally and deploy to Render.

Project layout (final):

- backend/
  - src/
    - index.js (Express server)
    - routes/ (auth, entries, admin)
    - models/ (User, TimeEntry)
    - middleware/ (auth, validate)
    - utils/ (calc, logger)
  - package.json
- frontend/
  - src/
    - pages/ (Landing, Register, Login, WorkerDashboard, AdminDashboard)
    - main.jsx
    - styles.css
  - package.json
- README.md


ENV VARS (backend)
- `MONGODB_URI` (required) — MongoDB Atlas connection string
- `JWT_SECRET` (required) — strong JWT signing secret
- `ADMIN_EMAIL` (optional) — email to auto-assign admin role on register
- `FRONTEND_URL` (optional) — allowed frontend URL for CORS (default http://localhost:5173)
- `DAILY_BASE_HOURS` (optional) — default 8
- `PORT` (optional) — port to bind (Render sets this automatically)

ENV VARS (frontend)
- `VITE_API_URL` — base URL of the deployed backend (set after backend deploy)


Local development

1) Backend

```bash
cd backend
npm install
# create a .env with at least MONGODB_URI and JWT_SECRET
# Example .env content (do NOT commit):
# MONGODB_URI="your mongodb uri here"
# JWT_SECRET="very_secret"
# ADMIN_EMAIL="admin@example.com"
# FRONTEND_URL="http://localhost:5173"
npm run dev
```

Server health: GET http://localhost:4000/health

2) Frontend

```bash
cd frontend
npm install
# Set VITE_API_URL in your environment to http://localhost:4000 for development
npm run dev
```


Render deploy steps

Backend (Render service)

1. Create a new Web Service on Render.
2. Connect your repository and select the `backend` folder as the root.
3. Build & Start commands:
   - Build command: `npm install`
   - Start command: `npm start`
4. Environment variables (set these in Render dashboard):
   - `MONGODB_URI` (your Atlas URI)
   - `JWT_SECRET` (strong secret)
   - `ADMIN_EMAIL` (optional)
   - `FRONTEND_URL` (set to your frontend Render URL after frontend deploy or `https://your-frontend.onrender.com`)
   - `DAILY_BASE_HOURS` (optional, default 8)
5. Important Render settings:
   - Port: Render will provide `PORT`; the server listens on `process.env.PORT` and binds `0.0.0.0`.

Frontend (Render static site)

1. Create a new Static Site on Render.
2. Connect your repository and set the root directory to `frontend`.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Environment variables (in Render static site settings):
   - `VITE_API_URL` — set to the backend URL you obtained after backend deploy (e.g. `https://fast-ep-backend.onrender.com`)


Testing / sample flow

1. Deploy backend to Render and set `MONGODB_URI` and `JWT_SECRET`.
2. Register a user via frontend (`/register`). If you set `ADMIN_EMAIL` to the address you register, that account becomes admin. If the very first registered user, it becomes admin automatically.
3. Register a worker account (role worker).
4. Login as worker and POST a time entry from Worker Dashboard (date, start/end, break minutes).
5. Login as admin and visit Admin Dashboard — you'll see pending entries; approve or reject them.
6. Use `/api/admin/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` to fetch salary summary for approved entries.


Notes & security

- Secrets must only be set in environment variables (Render or local .env). Do not hardcode.
- Rate limiting and Helmet are enabled for basic security.
- Validation uses Zod on the backend.

If you want, I can now:
- Run the backend locally here and verify health endpoint.
- Or produce step-by-step Render UI screenshots and exact env values to set.
