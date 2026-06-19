# G2C Platform — Interview Notes

Use this after you finish the rebuild. Every claim maps to real code in `g2c-platform/`.

---

## 30-second pitch

> G2C is a MERN platform connecting local growers with consumers. Growers register, build a profile, and list produce by category and city. Consumers search by filters and view grower details. I used a **layered backend** — routes, controllers, services, models — with **bcrypt**, **JWT**, and **server-side RBAC**. The frontend is React with Vite and Tailwind. It's deployed on Vercel, Render, and MongoDB Atlas.

---

## Architecture (draw on paper)

```
Client → API Gateway (Express) → Service Layer → MongoDB
              ↓
         Middleware: auth, validate, error
```

---

## How CRUD maps to DB (new project)

| CRUD | Mongoose | Example endpoint |
|------|----------|------------------|
| Create | `Model.create()` / `doc.save()` | POST /listings |
| Read | `find()`, `findOne()`, `distinct()` | GET /search/cities |
| Update | `findOneAndUpdate()` | PUT /growers/profile |
| Delete | `findByIdAndDelete()` | DELETE /listings/:id |

**Interview line:** "Routes stay thin; controllers handle HTTP; services contain all Mongoose queries so business logic isn't duplicated."

---

## Auth flow

1. Register → bcrypt.hash(password, 12) → save User
2. Login → bcrypt.compare → jwt.sign({ userId, role })
3. Protected route → verify token → attach req.user → authorize(role)

**Improvement over old project:** passwords hashed, role checked on server, not just client routing.

---

## Why MongoDB?

Document model fits grower listings (items as array). Fast iteration with Node/Mongoose. Trade-off: complex financial reporting would need SQL — acceptable for this domain.

---

## Folder structure (why company standard)

- **Separation of concerns** — easy to test services without HTTP
- **Scalable** — add `order.service.js` without touching routes
- **Onboarding** — new dev finds auth in `middleware/auth.middleware.js`

---

## Common questions + answers

**Q: How do you handle errors?**  
A: Custom ApiError class + global error middleware returns consistent JSON.

**Q: How do you validate input?**  
A: express-validator in validators/ folder, runs before controller.

**Q: How does search work?**  
A: MongoDB query with `$and` on category, city, and `$in` on items array.

**Q: Security?**  
A: bcrypt, JWT expiry, helmet, CORS whitelist, no secrets in code (.env).

**Q: What would you add next?**  
A: Order module, payment gateway, geospatial nearby search, Cloudinary, unit tests.

---

## Old project vs new (if asked)

| Old | New |
|-----|-----|
| Plain text passwords | bcrypt |
| JWT on some routes only | All protected routes + RBAC |
| Logic in controllers | Services layer |
| Mixed folder names | Standard src/ layout |
| Half UI | Full pages + landing |
| POST for everything | REST methods |
