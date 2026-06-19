# G2C Platform — Build Guide (step by step)

Follow these phases in VS Code. Each phase has a **goal**, **files to work on**, and **how to test**.

---

## Phase 0 — Setup (Day 1)

### Backend
```powershell
cd d:\G2C_Project\g2c-platform\backend
npm install
copy .env.example .env
# Edit .env: MONGO_URI, JWT_SECRET, CLIENT_URL
npm run dev
```
Expected: `Server running on port 5000` + `MongoDB connected`

### Frontend
```powershell
cd d:\G2C_Project\g2c-platform\frontend
npm install
copy .env.example .env
npm run dev
```
Expected: App opens at `http://localhost:5173`

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Database Access → create user + password
3. Network Access → allow your IP (or 0.0.0.0/0 for dev)
4. Connect → copy connection string → paste in `MONGO_URI`

---

## Phase 1 — Auth (Day 2–3)

**Goal:** Register, login, protected `/auth/me`

### Backend tasks
- [ ] Test `POST /api/v1/auth/register` in Postman
- [ ] Test `POST /api/v1/auth/login` → receive token
- [ ] Test `GET /api/v1/auth/me` with `Authorization: Bearer <token>`

### Frontend tasks
- [ ] Register page → calls API → redirect to login
- [ ] Login page → stores token → redirect by role
- [ ] AuthContext loads user on refresh via `/auth/me`

### Test checklist
- Register as **grower** and **consumer**
- Wrong password returns 401
- Duplicate email returns 409

---

## Phase 2 — Profiles (Day 4–5)

**Goal:** Grower and consumer can create/update profile

### Grower
- [ ] `GET /api/v1/growers/profile` (own)
- [ ] `PUT /api/v1/growers/profile` with name, city, category, phone
- [ ] Upload avatar (multer → `/uploads`)

### Consumer
- [ ] `GET /api/v1/consumers/profile`
- [ ] `PUT /api/v1/consumers/profile`

### Frontend
- [ ] GrowerProfile page with form + validation
- [ ] ConsumerProfile page

---

## Phase 3 — Listings (Day 6–7)

**Goal:** Grower lists products; can view/delete own listings

- [ ] `POST /api/v1/listings` — category + items array + auto city from profile
- [ ] `GET /api/v1/listings/mine`
- [ ] `DELETE /api/v1/listings/:id`
- [ ] ItemsManager UI — add/remove items from listing

---

## Phase 4 — Search (Day 8)

**Goal:** Consumer finds growers

- [ ] `GET /api/v1/search/cities`
- [ ] `POST /api/v1/search/growers` { category, item, city }
- [ ] `GET /api/v1/growers/public/:userId` — full profile for modal

### Frontend
- [ ] FindGrower page with 3 dropdowns + result cards + detail modal

---

## Phase 5 — UI polish (Day 9–10)

- [ ] Landing page (hero, how it works, CTA)
- [ ] Navbar with auth state + logout
- [ ] Responsive dashboards (mobile-first Tailwind)
- [ ] Loading spinners + toast notifications
- [ ] 404 page

---

## Phase 6 — Deploy (Day 11–12)

See `DEPLOYMENT.md`

- [ ] MongoDB Atlas production cluster
- [ ] Backend → Render
- [ ] Frontend → Vercel
- [ ] Update CORS + env URLs
- [ ] Test full flow on live URLs

---

## Daily workflow in VS Code

1. Pull latest / open `g2c-platform`
2. Terminal 1: `backend` → `npm run dev`
3. Terminal 2: `frontend` → `npm run dev`
4. Postman collection for API testing
5. Git commit after each phase: `feat(auth): add register and login`

---

## Postman quick reference

**Register**
```
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "grower@test.com",
  "password": "Test@1234",
  "role": "grower"
}
```

**Login**
```
POST http://localhost:5000/api/v1/auth/login
{ "email": "grower@test.com", "password": "Test@1234" }
```

**Protected**
```
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer YOUR_TOKEN
```
