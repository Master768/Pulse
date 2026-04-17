# 🚀 Pulse: Quick Setup Guide

Welcome to Pulse! This guide will help you get the project running on your local machine in just a few minutes.

---

## 🛠 1. Software You Need
Before you start, make sure you have these installed:
- **Node.js**: [Download here](https://nodejs.org/) (Version 18 or higher)
- **Python**: [Download here](https://www.python.org/) (Version 3.9 or higher)
- **Git**: [Download here](https://git-scm.com/)
- **MongoDB**: You need a database. You can either:
  - Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally.
  - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Recommended).

---

## 📥 2. One-Time Installation

Open your terminal and run these commands in the project folder:

### A. Install Backend Dependencies
```bash
npm install
```

### B. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### C. Install Machine Learning (AI) Dependencies
```bash
cd ml_api
# Create a virtual environment (optional but recommended)
python -m venv venv
# Activate it:
# (Windows) venv\Scripts\activate
# (Mac/Linux) source venv/bin/activate

pip install -r requirements.txt
cd ..
```

---

## 🔑 3. Configuration (.env)

Pulse needs some "secrets" to run (like your database link). 
1. Create a file named `.env` in the **root** folder.
2. Copy and paste the following into it:

```env
# Your MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pulse

# A secret key for security (you can make this anything)
JWT_SECRET=my_super_secret_pulse_key

# Link to the AI engine
FLASK_API_URL=http://127.0.0.1:5000/predict
```

---

## 🏃 4. How to Run the Project

You need to keep **three terminals** open to run the whole system.

### Terminal 1: Backend (Node.js)
```bash
# In the root folder
npm run dev
```

### Terminal 2: AI Engine (Python)
```bash
# In the ml_api folder
cd ml_api
python app.py
```

### Terminal 3: Frontend (React)
```bash
# In the client folder
cd client
npm run dev
```

---

## ✅ 5. Accessing the App
Once all three are running:
1. Open your browser and go to: **http://localhost:5173**
2. Create an account, fill out your first log, and watch the AI generate your Pulse score!

---
*Questions? Check the `MASTER_ARCHITECTURE_MAP.md` for a deep dive into how it works.*
