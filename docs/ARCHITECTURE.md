# G2C Platform — Architecture

## What this app does

**Grower2Consumer (G2C)** connects local farmers (Growers) with buyers (Consumers).

- **Growers**: register, complete profile, list available produce by category/city
- **Consumers**: search growers by city + category + item, view grower details
- **Admin** (optional phase): manage users and listings

---

## High-level architecture

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────┐     Mongoose     ┌─────────────┐
│  React (Vite)   │ ◄─────────────────► │  Express API     │ ◄──────────────► │  MongoDB    │
│  Tailwind CSS   │   JWT in header     │  Node.js         │                  │  Atlas      │
└─────────────────┘                     └──────────────────┘                  └─────────────┘
        │                                        │
        │                                        └── Static uploads / Cloudinary (images)
        └── Deployed on Vercel                     Deployed on Render
```

---

## Backend folder structure (company standard)

```
backend/src/
├── config/          # DB connection, env constants
├── controllers/     # HTTP layer — parse req, call services, send res
├── middleware/      # auth, role check, error handler, upload
├── models/          # Mongoose schemas
├── routes/          # Route definitions only (no business logic)
├── services/        # Business logic + DB queries
├── validators/      # Request validation (express-validator)
├── utils/           # ApiError, asyncHandler, JWT helpers
├── app.js           # Express app setup (middleware, routes)
└── server.js        # Start server + DB connect
```

### Why this structure?

| Layer | Responsibility | Interview line |
|-------|----------------|----------------|
| **Routes** | Map URL → controller | "Thin routes, easy to read API surface" |
| **Controllers** | Request/response handling | "Controllers don't contain DB logic" |
| **Services** | Business rules + Mongoose calls | "Reusable, testable business layer" |
| **Models** | Schema + indexes | "Data shape and validation at DB level" |
| **Middleware** | Cross-cutting concerns | "Auth, errors, uploads in one place" |

---

## Frontend folder structure

```
frontend/src/
├── api/             # Axios client + API functions
├── components/      # Reusable UI (Button, Input, Card)
├── context/         # AuthContext
├── hooks/           # useAuth, custom hooks
├── layouts/         # Navbar, DashboardLayout
├── pages/           # Route-level pages
├── routes/          # AppRouter + ProtectedRoute
└── utils/           # constants, formatters
```

---

## Data model

```
User
  email, passwordHash, role: consumer | grower | admin

ConsumerProfile (1:1 with User)
  userId, name, city, address, phone, avatar

GrowerProfile (1:1 with User)
  userId, name, city, address, phone, category, aadharLast4, avatar

Listing (grower's available items)
  growerId, category, items[], city, isActive
```

---

## Authentication flow (proper version)

1. **Register** → hash password with **bcrypt** → save User
2. **Login** → verify bcrypt → issue **JWT** (payload: userId, role, exp)
3. **Protected API** → `Authorization: Bearer <token>` → middleware verifies JWT
4. **RBAC** → `authorize('grower')` middleware blocks wrong roles
5. **Frontend** → token in `localStorage` (or httpOnly cookie in advanced setup)
6. **401** → axios interceptor clears token → redirect to login

---

## API design (REST conventions)

| Method | Endpoint | Role | Action |
|--------|----------|------|--------|
| POST | /api/v1/auth/register | public | Register |
| POST | /api/v1/auth/login | public | Login |
| GET | /api/v1/auth/me | auth | Current user |
| GET | /api/v1/growers/profile | grower | Get own profile |
| PUT | /api/v1/growers/profile | grower | Update profile |
| POST | /api/v1/listings | grower | Create listing |
| GET | /api/v1/listings/mine | grower | My listings |
| DELETE | /api/v1/listings/:id | grower | Delete listing |
| GET | /api/v1/search/cities | public | Distinct cities |
| POST | /api/v1/search/growers | public | Search growers |
| GET | /api/v1/growers/:id | public | Grower public profile |

Prefix: `/api/v1` — versioned APIs are industry standard.

---

## Request lifecycle (example: create listing)

```
POST /api/v1/listings
  → validate(listingValidator)
  → authenticate (JWT)
  → authorize('grower')
  → listingController.create
  → listingService.createListing
  → ListingModel.save()
  → JSON { success, data }
```

---

## Error handling

All errors flow to central middleware:

```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

Use custom `ApiError` class + `asyncHandler` so try/catch isn't repeated everywhere.

---

## Security checklist (vs old project)

- [x] bcrypt password hashing (not plain text)
- [x] JWT with expiry + secret in `.env`
- [x] Server-side role checks on every protected route
- [x] Input validation on all POST/PUT bodies
- [x] CORS restricted to frontend URL in production
- [x] No passwords in JWT payload
- [x] Helmet for HTTP headers

---

## Build phases (follow in order)

See `BUILD_GUIDE.md` for step-by-step tasks.

1. Backend skeleton + DB connect
2. Auth (register/login/me)
3. Profiles (grower + consumer)
4. Listings CRUD
5. Search APIs
6. Frontend auth + layouts
7. All pages + polish UI
8. Deploy (Atlas + Render + Vercel)
