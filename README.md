# Team Task Manager

A production-style full-stack Team Task Manager assignment built with Next.js App Router, TypeScript, Express, PostgreSQL, Prisma, JWT authentication, bcrypt, Tailwind CSS, and shadcn-style UI components.

## Features

- Signup, login, logout, and authenticated sessions
- Project-level roles: Admin and Member
- Admin project and member management
- Task creation, assignment, editing, deletion, filtering, and status updates
- Member-only status updates for assigned tasks
- Dashboard analytics for totals, status counts, per-user workload, overdue tasks, and recent activity
- RESTful API with validation, centralized errors, and role authorization
- Railway-ready frontend, backend, and PostgreSQL deployment

## Local Setup

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend runs on `http://localhost:5001`.
Frontend runs on `http://localhost:3000`.

## Demo Accounts

Seed script creates:

- Admin: `admin@example.com` / `Password123!`
- Member: `member@example.com` / `Password123!`

## Railway Deployment

1. Push this repository to GitHub.
2. Create a Railway PostgreSQL database.
3. Deploy `apps/backend` as a Railway service.
4. Set backend variables from `apps/backend/.env.example`.
5. Run `npx prisma migrate deploy` in the backend service.
6. Deploy `apps/frontend` as a Railway service.
7. Set `NEXT_PUBLIC_API_URL` to the public backend URL.
8. Set backend `CLIENT_URL` to the public frontend URL.

## Environment Variables

Backend:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=
PORT=5001
NODE_ENV=production
```

Frontend:

```env
NEXT_PUBLIC_API_URL=
```

## Folder Structure

```txt
apps/
  backend/
    prisma/
    src/
      config/
      middleware/
      modules/
        auth/
        dashboard/
        projects/
        tasks/
        users/
      utils/
  frontend/
    src/
      app/
      components/
      hooks/
      lib/
      types/
```

## API Testing Guide

Use a REST client such as Postman or Insomnia.

1. `POST /api/auth/signup`
2. `POST /api/auth/login`
3. `GET /api/auth/me`
4. `POST /api/projects`
5. `POST /api/projects/:projectId/members`
6. `POST /api/projects/:projectId/tasks`
7. `PATCH /api/tasks/:taskId/status`
8. `GET /api/projects/:projectId/dashboard`

Cookies are used for browser authentication. Bearer tokens are also supported for API testing:

```txt
Authorization: Bearer <token>
```

## Interview Notes

- Roles are project-scoped through `ProjectMember`, which is more realistic than global roles.
- Auth uses bcrypt for password hashing and signed JWTs for stateless sessions.
- Authorization checks happen server-side before sensitive reads and writes.
- Prisma models express the core relationships clearly: users belong to projects, projects contain tasks, and tasks are assigned to users.
- The frontend keeps API access centralized and uses a protected app shell for authenticated pages.
