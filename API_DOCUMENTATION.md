# Smart Leads Dashboard — API Documentation

Base URL: `http://localhost:5000/api`

All responses follow this standard envelope:

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }
```

---

## Authentication

### POST `/auth/register`

Register a new user account.

**Request Body**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "secret123",
  "role": "sales"
}
```

| Field      | Type   | Required | Constraints                   |
|------------|--------|----------|-------------------------------|
| `name`     | string | Yes      | 2–50 characters               |
| `email`    | string | Yes      | Valid email format            |
| `password` | string | Yes      | Min 6 chars, must have a digit|
| `role`     | string | No       | `admin` or `sales` (default: `sales`) |

**Response `201`**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "sales",
      "createdAt": "2024-01-12T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**
- `409 Conflict` — Email already registered
- `422 Unprocessable Entity` — Validation failure

---

### POST `/auth/login`

Login with existing credentials.

**Request Body**
```json
{
  "email": "rahul@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "Rahul Sharma", "email": "rahul@example.com", "role": "sales", "createdAt": "..." },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**
- `401 Unauthorized` — Invalid credentials

---

### GET `/auth/profile`

Get the currently authenticated user's profile.

**Headers**
```
Authorization: Bearer <token>
```

**Response `200`**
```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "sales",
    "createdAt": "2024-01-12T10:30:00.000Z"
  }
}
```

---

## Leads

> All lead endpoints require `Authorization: Bearer <token>`

---

### GET `/leads`

Get a paginated, filtered list of leads.

**Query Parameters**

| Parameter | Type   | Default  | Description                              |
|-----------|--------|----------|------------------------------------------|
| `page`    | number | `1`      | Page number                              |
| `limit`   | number | `10`     | Records per page (max 100)               |
| `status`  | string | —        | `New` / `Contacted` / `Qualified` / `Lost` |
| `source`  | string | —        | `Website` / `Instagram` / `Referral`     |
| `search`  | string | —        | Searches name and email (case-insensitive) |
| `sort`    | string | `latest` | `latest` or `oldest`                     |

**Example**
```
GET /api/leads?status=Qualified&source=Instagram&search=Rahul&sort=latest&page=1
```

**Response `200`**
```json
{
  "success": true,
  "message": "Leads fetched",
  "data": {
    "data": [
      {
        "_id": "65a1b2c3d4e5f6789012345b",
        "name": "Rahul Gupta",
        "email": "rahul.g@example.com",
        "status": "Qualified",
        "source": "Instagram",
        "createdBy": {
          "_id": "65a1b2c3d4e5f6789012345a",
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "admin"
        },
        "createdAt": "2024-01-10T08:00:00.000Z",
        "updatedAt": "2024-01-11T09:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 47,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### GET `/leads/export/csv`

Export leads as a CSV file. Accepts the same filter params as `GET /leads` (except `page` and `limit`).

**Example**
```
GET /api/leads/export/csv?status=Qualified&sort=latest
```

**Response `200`**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="leads-export.csv"`

```csv
Name,Email,Status,Source,Created By,Created At
Rahul Gupta,rahul.g@example.com,Qualified,Instagram,Admin User,1/10/2024
```

---

### GET `/leads/:id`

Get a single lead by ID.

**Response `200`**
```json
{
  "success": true,
  "message": "Lead fetched",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345b",
    "name": "Rahul Gupta",
    "email": "rahul.g@example.com",
    "status": "Qualified",
    "source": "Instagram",
    "createdBy": { ... },
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-10T08:00:00.000Z"
  }
}
```

**Errors**
- `404 Not Found` — Lead not found

---

### POST `/leads`

Create a new lead. The `createdBy` field is set automatically from the token.

**Request Body**
```json
{
  "name": "Priya Mehta",
  "email": "priya@example.com",
  "status": "New",
  "source": "Referral"
}
```

| Field    | Type   | Required | Values                                    |
|----------|--------|----------|-------------------------------------------|
| `name`   | string | Yes      | 2–100 characters                          |
| `email`  | string | Yes      | Valid email                               |
| `status` | string | No       | `New` (default) / `Contacted` / `Qualified` / `Lost` |
| `source` | string | Yes      | `Website` / `Instagram` / `Referral`     |

**Response `201`**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": { ...lead object }
}
```

---

### PUT `/leads/:id`

Update an existing lead. Admin can update any lead. Sales users can only update leads they created.

**Request Body** — All fields optional
```json
{
  "status": "Contacted",
  "source": "Website"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": { ...updated lead object }
}
```

**Errors**
- `403 Forbidden` — Not authorized to update this lead
- `404 Not Found` — Lead not found

---

### DELETE `/leads/:id`

Delete a lead. Admin can delete any lead. Sales users can only delete their own leads.

**Response `200`**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": null
}
```

---

## Users (Admin Only)

> All `/users` endpoints require `Authorization: Bearer <token>` with role `admin`.

---

### GET `/users`

Get all registered users.

**Response `200`**
```json
{
  "success": true,
  "message": "Users fetched",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH `/users/:id/role`

Change a user's role. Cannot change your own role.

**Request Body**
```json
{ "role": "admin" }
```

**Response `200`**
```json
{
  "success": true,
  "message": "User role updated",
  "data": { ...updated user }
}
```

---

### DELETE `/users/:id`

Delete a user. Cannot delete yourself.

**Response `200`**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

## Error Reference

| Status | Meaning                                          |
|--------|--------------------------------------------------|
| 400    | Bad Request — Invalid input                      |
| 401    | Unauthorized — Missing or invalid token          |
| 403    | Forbidden — Insufficient role permissions        |
| 404    | Not Found — Resource does not exist              |
| 409    | Conflict — Duplicate email                       |
| 422    | Unprocessable Entity — Validation failed         |
| 429    | Too Many Requests — Rate limit exceeded          |
| 500    | Internal Server Error — Unexpected server error  |

---

## Rate Limiting

- **Window:** 15 minutes
- **Max requests:** 100 per IP per window
- Applies to all `/api/*` routes
- Returns `429` when exceeded with message: `"Too many requests. Please try again later."`
