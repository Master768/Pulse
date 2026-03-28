# Deployment & Hosting Guide

This guide describes how to deploy the three Pulse components to production using **Vercel** and **Render**.

## 🚀 1. Database Setup (MongoDB Atlas)

Before deploying any code, you need a cloud database.
1.  **Sign up** for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create a Cluster** (The free tier is perfectly fine).
3.  **Configure Access**: Add `0.0.0.0/0` to your IP Whitelist (to allow Render to connect).
4.  **Get Connection String**: Save your `mongodb+srv://...` URI.

---

## ⚡ 2. Backend & ML API (Render)

We recommend creating **two separate Web Services** on Render.

### Service A: The ML Engine (Flask)
1.  **New Web Service**: Connect your repo.
2.  **Root Directory**: `ml_api`
3.  **Environment**: `Python 3`
4.  **Build Command**: `pip install flask pandas scikit-learn joblib`
5.  **Start Command**: `python app.py` (or `gunicorn app:app` for production).
6.  **Take Note**: Save the generated URL (e.g., `https://pulse-ml-api.onrender.com`).

### Service B: The API Server (Node.js)
1.  **New Web Service**: Connect your repo.
2.  **Root Directory**: `.` (Root)
3.  **Environment**: `Node`
4.  **Build Command**: `npm install`
5.  **Start Command**: `node server.js`
6.  **Environment Variables**:
    - `MONGO_URI`: Your Atlas string.
    - `JWT_SECRET`: A secure random key.
    - `FLASK_API_URL`: The URL of your ML Engine + `/predict`.

---

## 🎨 3. Frontend (Vercel)

Vercel is the ultimate host for Vite projects.

1.  **New Project**: Connect your GitHub repo.
2.  **Framework Preset**: Select `Vite`.
3.  **Root Directory**: `client`
4.  **Build Command**: `npm run build`
5.  **Output Directory**: `dist`
6.  **Environment Variables**:
    - If you use a custom API URL in production, add `VITE_API_URL` pointing to your Render Backend.

---

## 🏗️ 4. Monorepo Considerations

If you keeping all three in a single repo, the most important thing is setting the correct **Root Directory** for each service in the hosting provider's dashboard.

| Service | Host | Root Dir | Build Command |
|---|---|---|---|
| **Frontend** | Vercel | `/client` | `npm install && npm run build` |
| **Backend** | Render | `/` | `npm install` |
| **ML Engine** | Render | `/ml_api` | `pip install -r requirements.txt` |

> [!WARNING]
> Render's free tier services "spin down" after 15 minutes of inactivity. The first request after a long break might take 30-60 seconds to respond as the server wakes up.
