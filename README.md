# G2C Platform — Grower2Consumer (Rebuild)

Production-grade MERN rebuild with proper auth, layered backend, and complete UI.

## Quick start (VS Code)

### 1. MongoDB
- Install MongoDB locally **OR** use [MongoDB Atlas](https://mongodb.com/atlas) free tier
- Copy connection string into backend `.env`

### 2. Backend
```powershell
cd g2c-platform\backend
npm install
copy .env.example .env
# Edit .env → set MONGO_URI and JWT_SECRET
npm run dev
```
API: http://localhost:5000/api/v1/health

### 3. Frontend
```powershell
cd g2c-platform\frontend
npm install
copy .env.example .env
npm run dev
```
App: http://localhost:5173

## Documentation

| File | Purpose |
|------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & folder structure |
| [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md) | Step-by-step build phases |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy to Atlas + Render + Vercel |
| [docs/INTERVIEW_NOTES.md](docs/INTERVIEW_NOTES.md) | What to say in interviews |

## What's improved vs old project

- bcrypt password hashing
- JWT on all protected routes + server-side RBAC
- Routes → Controllers → Services → Models
- Input validation (express-validator)
- Central error handling
- Complete responsive UI (landing, dashboards, search)
- REST API under `/api/v1`

## Old project

Your original code remains in `Backend/` and `Frontend/` at the repo root.  
**Build the new version in `g2c-platform/`** — do not mix the two.

## Author

Nikhil Garg — Thapar Institute of Engineering and Technology
