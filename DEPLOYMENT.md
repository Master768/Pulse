# 🚀 PULSE — Deployment Guide

This guide provides a step-by-step walkthrough for deploying the PULSE ecosystem from scratch. Even with no prior experience, you can have the full 3-service system live on the cloud by following these instructions.

---

## 1. Prerequisites

Before starting, ensure you have the following:

- [ ] **GitHub Account**: A repository containing the PULSE project with all three components (`/`, `/ml_api`, `/client`).
- [ ] **MongoDB Atlas Account**: For your managed database (Free Tier).
- [ ] **Render Account**: For hosting the Node.js Backend and Flask ML API (Free Tier).
- [ ] **Vercel Account**: For hosting the React Frontend (Free Tier).
- [ ] **ML Models**: All 8 `.pkl` files must be committed to the `/pulse_models` directory in your repo.
- [ ] **Repository Pushed**: Ensure your latest code is pushed to the `main` branch.

---

## 2. MongoDB Atlas Setup

### Step-by-Step Configuration:
1. **Create Account**: Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **New Project**: Create a project named `Pulse-Production`.
3. **Build a Cluster**:
   - Choose **M0 (Free)**.
   - Select a provider (AWS/Google Cloud) and region closest to your users.
   - Click **Create**.
4. **Database Access**: 
   - Create a **Database User** (e.g., `pulse_admin`).
   - Secure it with a strong password. **Save this password!**
5. **Network Access**:
   - Go to "Network Access" -> "Add IP Address".
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`). This is necessary for Render.
6. **Get Connection String**:
   - In "Database" -> "Connect" -> "Connect your application".
   - Copy the URI: `mongodb+srv://pulse_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
7. **Prepare URI**:
   - Replace `<password>` with your actual user password.
   - Add the database name `pulsedb` before the query string: `...mongodb.net/pulsedb?retryWrites=...`

**Final Output**: Save your `MONGO_URI`.

---

## 3. Flask ML API Deployment → Render

### Files to Verify in `/ml_api`:
- **requirements.txt**: Must include `flask`, `pandas`, `scikit-learn`, `flask-cors`, and `gunicorn`.
- **Procfile**: Must contain `web: gunicorn app:app`.
- **pulse_models/**: Must contain all 8 trained `.pkl` files.

### Render Deployment Steps:
1. Log in to **Render** and click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `pulse-ml-api`
   - **Root Directory**: `ml_api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. **Environment Variables**: Click "Advanced" -> "Add Environment Variable":
   - `PYTHON_VERSION`: `3.9.0` (or your preferred version)
5. Click **Create Web Service**.

**Verification**: Once live, visit `https://pulse-ml-api.onrender.com/health`.
- Expected: `{"status": "healthy", "models_loaded": true, ...}`

---

## 4. Node.js Backend Deployment → Render

### Files to Verify in Root (`/`):
- **package.json**: Ensure `"start": "node server.js"` is in scripts.
- **.env.example**: Present in root for reference.

### Render Deployment Steps:
1. Click **New** -> **Web Service**.
2. Connect the same GitHub repository.
3. Configure the service:
   - **Name**: `pulse-backend`
   - **Root Directory**: `.` (leave horizontal/empty if using default root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables**:
   | Variable | Description | Example |
   | :--- | :--- | :--- |
   | `MONGO_URI` | Atlas connection string | `mongodb+srv://...` |
   | `JWT_SECRET` | Strong random string | `pulse_live_secret_2024` |
   | `FLASK_API_URL` | Live Flask URL from Step 3 | `https://pulse-ml-api.onrender.com/predict` |
   | `PORT` | Server port | `8080` |
   | `NODE_ENV` | Environment flag | `production` |

**Verification**: Test with a tool like Postman or the live URL.
- Expected: `GET https://pulse-backend.onrender.com/api/predictions/latest` returns `401 Unauthorized` (indicating auth is working).

---

## 5. React Frontend Deployment → Vercel

### Files to Verify in `/client`:
- **vercel.json**: Must contain the rewrite rules for React Router.
- **.env.example**: Blueprint for `VITE_API_URL`.

### Vercel Deployment Steps:
1. Log in to **Vercel** and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite` (or Create React App if using that).
   - **Root Directory**: `client`
4. **Environment Variables**:
   - `VITE_API_URL`: `https://pulse-backend.onrender.com`
5. Click **Deploy**.

**Verification**: Visit your Vercel URL (e.g., `pulse-app.vercel.app`).
- Expected: Frontend loads, Login/Signup works, and data flows from the backend.

---

## 6. Connecting All 3 Services

The ecosystem operates as a interconnected web:

```mermaid
graph LR
    A[React (Vercel)] -- VITE_API_URL --> B[Node.js (Render)]
    B -- FLASK_API_URL --> C[Flask (Render)]
    B -- MONGO_URI --> D[(MongoDB Atlas)]
```

### Updates & Maintenance:
- **URL Changes**: If you rename a service, update the corresponding environment variable in the *consuming* service's dashboard.
- **Redeploying**: Simply push to your `main` branch. Both Render and Vercel will auto-detect changes and start a new build.

---

## 7. Post-Deployment Verification Checklist

Perform these tests in order to ensure your production environment is stable:

- [ ] **Flask Health**: `GET /health` returns `200 OK`.
- [ ] **User Signup**: Create a new account. Verify user exists in MongoDB Atlas collections.
- [ ] **User Login**: Log in with the new account. Verify JWT is stored in browser.
- [ ] **Daily Log Submission**: POST a log. Verify productivity score returns.
- [ ] **Dashboard Load**: Ensure all charts (Recharts) and summary cards (Framer Motion) render.
- [ ] **Peer Benchmark**: Verify percentile bars are visible (Note: Requires cluster data).
- [ ] **Focus Timer**: Start a session, stop it, and verify the backend triggers a re-prediction.
- [ ] **Responsive Test**: Open the Vercel URL on a mobile device to verify layout integrity.

---

## 8. Keeping Services Alive (Free Tier)

Render's free tier services spin down after 15 minutes of inactivity, causing a "Cold Start" lag (30-60s) for the next user.

### Set Up UptimeRobot (Free):
1. Sign up at [uptimerobot.com](https://uptimerobot.com).
2. Create **2 HTTP Monitors**:
   - **Monitor 1**: `https://pulse-ml-api.onrender.com/health` (Every 5 mins).
   - **Monitor 2**: `https://pulse-backend.onrender.com` (Every 5 mins).
3. This "heartbeat" keeps your services warm and responsive 24/7.

---

## 9. Common Errors & Fixes

| Error | Cause | Solution |
| :--- | :--- | :--- |
| **Flask crash on startup** | Missing `.pkl` files. | Verify `/pulse_models` is committed to GitHub. |
| **MongoServerError** | IP not whitelisted. | Ensure `0.0.0.0/0` is added to Atlas settings. |
| **CORS Error** | Backend URL mismatch. | Ensure the Node.js backend allows your Vercel URL origin. |
| **404 on Page Refresh** | Missing `vercel.json`. | Add the rewrite rules for React Router to `/client`. |
| **JWT Invalid** | Secret mismatch. | Ensure `JWT_SECRET` is consistent across redeployments. |
| **Build Fails** | Missing dependencies. | Check `requirements.txt` (Python) or `package.json` (Node). |

---

### Production Summary
🌍 **Frontend**: `https://pulse-app.vercel.app`  
⚙️ **Backend**: `https://pulse-backend.onrender.com`  
🧠 **ML Engine**: `https://pulse-ml-api.onrender.com`
