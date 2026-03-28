# Pulse ⚡ Productivity & Focus Platform

Pulse is a modern, full-stack productivity ecosystem designed to help you track work, visualize performance trends, and get real-time ML-driven insights into your focus quality.

## 🚀 Key Features

*   **Pomodoro Focus Timer**: Customizable timer with automated session quality scoring.
*   **Daily Rituals**: Rapid audits for caffeine, hydration, and performance (Self-Score & Persona).
*   **Performance Dashboards**: Real-time visualization of productivity trends and burnout risks.
*   **ML-Powered Insights**: Real-time feedback on your "Focus Persona" and "Burnout Risk" using Scikit-learn models.
*   **Export Capabilities**: Full CSV data export for your performance history logs.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React (Context API), Vite, Tailwind CSS, Recharts, Framer Motion |
| **Backend** | Node.js, Express, MongoDB (Mongoose), JWT Auth |
| **ML Engine** | Python, Flask, Pandas, Scikit-learn (Pickle) |

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18+
- **Python**: v3.9+
- **MongoDB**: A running instance (Local or Atlas)

### Quick Start
1.  **Clone the Repository** and install dependencies:
    ```bash
    # Root (Backend)
    npm install
    # Client (Frontend)
    cd client && npm install && cd ..
    ```
2.  **Environment Setup**: Create a `.env` in the root (see `REQUIREMENTS.md`).
3.  **Run the App**:
    ```bash
    # Start Backend & ML API (from root)
    npm run dev
    python ml_api/app.py
    
    # Start Frontend (from /client)
    npm run dev
    ```

## 🏗️ Architecture & Deployment
For a detailed technical breakdown and hosting instructions, see:
*   [Technical Architecture](docs/ARCHITECTURE.md)
*   [Deployment Guide](docs/DEPLOYMENT.md)
*   [Detailed Requirements](REQUIREMENTS.md)

---
*Built for deep work and high-performance teams.*
