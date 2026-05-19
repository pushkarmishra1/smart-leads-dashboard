# Smart Leads Dashboard
Live Link-> [smart-leads-dashboard-lfzt.vercel.app](https://smart-leads-dashboard-lfzt-4si275acr-pushkarmishra1s-projects.vercel.app)

Git Repo-https://github.com/pushkarmishra1/smart-leads-dashboard

A production-ready full-stack Lead Management Dashboard built with the **MERN stack** and **TypeScript**.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **JWT Authentication** — Register, Login, Protected Routes
- **Role-Based Access Control** — Admin and Sales roles with enforced permissions
- **Leads CRUD** — Create, Read, Update, Delete leads with ownership rules
- **Advanced Filtering** — Filter by Status, Source, search by name/email; all filters composable
- **Debounced Search** — 400ms debounce to minimize API calls
- **Backend Pagination** — Efficient `skip/limit` with full metadata
- **CSV Export** — Export filtered leads as a downloadable CSV file
- **Dark Mode** — Persisted system-wide dark mode toggle
- **Docker Support** — Full production Docker Compose setup

---

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 18, TypeScript, TailwindCSS, Vite           |
| State     | Zustand (auth/theme), TanStack React Query        |
| Forms     | React Hook Form + Zod validation                  |
| Backend   | Node.js, Express.js, TypeScript                   |
| Database  | MongoDB with Mongoose ODM                         |
| Auth      | JWT (jsonwebtoken) + bcrypt password hashing      |
| DevOps    | Docker, Docker Compose, Nginx                     |

---

## Project Structure

```
smart-leads-dashboard/
├── backend/
│   └── src/
│       ├── config/          # DB connection, env config
│       ├── controllers/     # HTTP handlers (thin layer)
│       ├── middleware/       # Auth, error handler, validator
│       ├── models/          # Mongoose schemas (User, Lead)
│       ├── routes/          # Express route definitions
│       ├── services/        # Business logic layer
│       ├── types/           # Shared TypeScript interfaces
│       ├── utils/           # Logger, JWT, AppError, response helpers
│       ├── validators/      # express-validator rules
│       ├── app.ts           # Express app setup
│       └── index.ts         # Server entry point
├── frontend/
│   └── src/
│       ├── api/             # Axios API client functions
│       ├── components/
│       │   ├── auth/        # ProtectedRoute
│       │   ├── dashboard/   # StatCard
│       │   ├── layout/      # DashboardLayout (sidebar)
│       │   ├── leads/       # LeadTable, LeadForm, LeadFiltersBar, LeadDetailModal
│       │   └── ui/          # Button, Input, Select, Modal, Badge, Pagination, etc.
│       ├── hooks/           # useLeads, useAuth, useDebounce
│       ├── lib/             # axios instance, cn utility
│       ├── pages/           # Auth pages, Dashboard, Leads, Users, 404
│       ├── store/           # Zustand stores (auth, theme)
│       └── types/           # TypeScript types
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Docker + Docker Compose (optional)

---

### Option A: Run with Docker (Recommended)

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd smart-leads-dashboard

# 2. Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env — set JWT_SECRET and MONGO_URI

# 3. Start all services
docker compose up --build

# App will be available at:
# Frontend: http://localhost
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

---

### Option B: Manual Local Setup
cd backend
cd frontend

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Description                          | Example                              |
|-----------------------|--------------------------------------|--------------------------------------|
| `NODE_ENV`            | Environment mode                     | `development`                        |
| `PORT`                | Server port                          | `5000`                               |
| `MONGO_URI`           | MongoDB connection string            | `mongodb://localhost:27017/smart-leads` |
| `JWT_SECRET`          | Secret for signing JWTs              | `your_super_secret_key`              |
| `JWT_EXPIRES_IN`      | Token expiry duration                | `7d`                                 |
| `CLIENT_URL`          | Allowed CORS origin                  | `http://localhost:3000`              |
| `RATE_LIMIT_MAX`      | Max requests per window              | `100`                                |

### Frontend (`frontend/.env`)

| Variable       | Description                               | Example                        |
|----------------|-------------------------------------------|--------------------------------|
| `VITE_API_URL` | API base URL (leave empty for Vite proxy) | `https://api.yourdomain.com/api` |

---

## API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint              | Auth  | Role  | Description              |
|--------|-----------------------|-------|-------|--------------------------|
| POST   | `/auth/register`      | No    | Any   | Register new user        |
| POST   | `/auth/login`         | No    | Any   | Login and get token      |
| GET    | `/auth/profile`       | Yes   | Any   | Get current user info    |
| GET    | `/leads`              | Yes   | Any   | List leads with filters  |
| GET    | `/leads/:id`          | Yes   | Any   | Get single lead          |
| POST   | `/leads`              | Yes   | Any   | Create a lead            |
| PUT    | `/leads/:id`          | Yes   | Any*  | Update a lead            |
| DELETE | `/leads/:id`          | Yes   | Any*  | Delete a lead            |
| GET    | `/leads/export/csv`   | Yes   | Any   | Export filtered CSV      |
| GET    | `/users`              | Yes   | Admin | List all users           |
| DELETE | `/users/:id`          | Yes   | Admin | Delete a user            |
| PATCH  | `/users/:id/role`     | Yes   | Admin | Change user role         |

> `Any*` = Admin can modify any lead. Sales users can only modify their own leads.

See `API_DOCUMENTATION.md` for full request/response examples.

---

## Architecture Decisions

### Controller → Service → Model Pattern
Business logic lives in **services**, not controllers. Controllers only parse HTTP input and call services. This makes logic testable and reusable.

### React Query for Server State
All server data (leads, users) is managed by TanStack React Query — handling caching, background refetching, loading and error states. Zustand only manages client-side state (auth token, theme).

### Debounced Search
The `useDebounce` hook delays the search API call by 400ms after the user stops typing, preventing excessive requests.

### JWT in Authorization Header
Tokens are stored in `localStorage` and attached to every request via an Axios request interceptor. A response interceptor handles 401s globally.

---

## Scripts

### Backend
```bash
npm run dev      # Development with hot reload (ts-node-dev)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled production build
npm run lint     # ESLint check
```

### Frontend
```bash
npm run dev      # Vite dev server with HMR
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
npm run lint     # ESLint check
```

---

## Deployment

### Render / Railway (Backend)
1. Set root directory to `backend/`
2. Build command: `npm install && npm run build`
3. Start command: `node dist/index.js`
4. Add all environment variables from `backend/.env.example`

### Vercel (Frontend)
1. Set root directory to `frontend/`
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_URL` to your deployed backend URL

### MongoDB Atlas
Use a free M0 cluster. Get the connection string and set it as `MONGO_URI`.

---

## Security Highlights

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT with configurable expiry
- **Helmet** for HTTP security headers
- **CORS** restricted to configured client origin
- **Rate limiting** (100 req / 15 min per IP)
- Request body size limited to 10kb
- Non-root Docker user in production image
- No hardcoded secrets — all via environment variables

---

## Author

Built for the ServiceHive MERN Internship Assignment.

**Submission email:** ritik.yadav@servicehive.tech  
**Subject:** MERN Internship Assignment Submission - [Pushkar mishra]
