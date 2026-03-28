# Prerequisites & Environment Setup

This document outlines the detailed requirements and configuration steps needed to get the Pulse project running in a local development environment.

## 🛠️ Software Requirements

### 1. Node.js Ecosystem
*   **Version**: v18.0.0 or higher.
*   **Package Manager**: `npm` (v9+) or `yarn`.

### 2. Python Ecosystem
*   **Version**: v3.9 or higher.
*   **Required Libraries**: Flask, Pandas, Scikit-learn, and Joblib.
*   **Installation**:
    ```bash
    pip install flask pandas scikit-learn joblib
    ```

### 3. Database
*   **MongoDB**: A running instance (local or via MongoDB Atlas).
*   **Tools**: MongoDB Compass is recommended for visualizing your performance logs.

---

## 🔒 Configuration (`.env`)

You must create a `.env` file in the **root directory** with the following keys. Without these, the backend will fail to start or communicate with the ML engine.

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
MONGO_URI=your_mongodb_connection_string

# Authentication (JWT)
JWT_SECRET=any_long_random_string_here
JWT_EXPIRE=30d

# ML Engine Connectivity
# In development, this points to your Flask server
FLASK_API_URL=http://localhost:5000/predict
```

---

## 🚦 Running Locally

Follow these steps exactly to ensure all services are connected:

1.  **Terminal 1 (Backend)**:
    ```bash
    npm run dev
    ```
2.  **Terminal 2 (ML API)**:
    ```bash
    python ml_api/app.py
    ```
3.  **Terminal 3 (Frontend)**:
    ```bash
    cd client
    npm run dev
    ```

> [!TIP]
> **Check your ports!** If your backend runs on port 8080, ensure your frontend's `api.js` or `.env.development` is pointing to `http://localhost:8080/api/v1`.
