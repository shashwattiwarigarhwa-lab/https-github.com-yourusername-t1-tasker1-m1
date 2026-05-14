# API Testing Guide

Base URL:

```txt
http://localhost:5001
```

## Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Manish Singh",
  "email": "manish@example.com",
  "password": "Password123!"
}
```

## Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "manish@example.com",
  "password": "Password123!"
}
```

The response includes a `token`. Browser clients also receive an httpOnly cookie.

For Postman or Insomnia, set:

```txt
Authorization: Bearer <token>
```

## Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

## Create Project

```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Launch",
  "description": "Tasks for the upcoming launch."
}
```

The creator becomes project Admin.

## Add Member

The user must already have an account.

```http
POST /api/projects/:projectId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

## Create Task

Admin only.

```http
POST /api/projects/:projectId/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Prepare QA checklist",
  "description": "List core flows to test before demo.",
  "dueDate": "2026-05-20T00:00:00.000Z",
  "priority": "HIGH",
  "status": "TODO",
  "assignedToId": "<user-id>"
}
```

## Update Task Status

Admins can update any project task. Members can update only tasks assigned to them.

```http
PATCH /api/tasks/:taskId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

## Dashboard

```http
GET /api/dashboard
Authorization: Bearer <token>
```

```http
GET /api/projects/:projectId/dashboard
Authorization: Bearer <token>
```
