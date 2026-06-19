# G2C Platform — Deployment Guide

## Stack

| Service | Platform | Cost |
|---------|----------|------|
| Database | MongoDB Atlas | Free tier |
| Backend API | Render | Free tier |
| Frontend | Vercel | Free tier |

---

## 1. MongoDB Atlas (production)

1. Create cluster (M0 free)
2. Create DB user with strong password
3. Network Access → Allow access from anywhere (`0.0.0.0/0`) for Render
4. Copy connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster.xxxx.mongodb.net/g2c?retryWrites=true&w=majority
   ```

---

## 2. Backend — Render

1. Push `g2c-platform` to GitHub
2. render.com → New **Web Service**
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Environment variables:

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| PORT | 5000 |
| MONGO_URI | your Atlas URI |
| JWT_SECRET | long random string (32+ chars) |
| JWT_EXPIRES_IN | 7d |
| CLIENT_URL | https://your-app.vercel.app |

7. Deploy → copy URL: `https://g2c-api.onrender.com`

**Note:** Free Render spins down after idle; first request may take ~30s.

---

## 3. Frontend — Vercel

1. vercel.com → Import GitHub repo
2. Root directory: `frontend`
3. Framework: Vite
4. Environment variable:

| Key | Value |
|-----|-------|
| VITE_API_URL | https://g2c-api.onrender.com/api/v1 |

5. Deploy → copy URL

6. Go back to Render → update `CLIENT_URL` to Vercel URL → redeploy

---

## 4. Post-deploy checklist

- [ ] Register + login works on live site
- [ ] CORS no errors in browser console
- [ ] Grower can create listing
- [ ] Consumer search returns results
- [ ] Images load (if using `/uploads`, Render ephemeral disk resets — use Cloudinary for production images)

---

## 5. Optional — Cloudinary for images

Render free tier **deletes uploaded files** on restart. For production:

1. cloudinary.com → free account
2. Add to backend `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
3. Replace local multer save with Cloudinary upload (Phase 5+ enhancement)

---

## 6. Custom domain (optional)

- Vercel: add domain in project settings
- Render: add custom domain for API
- Update `CLIENT_URL` and `VITE_API_URL`

---

## Interview talking points

> "I deployed the frontend on **Vercel**, API on **Render**, and database on **MongoDB Atlas**. Environment variables separate dev and prod. CORS is locked to the frontend origin. I version APIs under `/api/v1` for future compatibility."
