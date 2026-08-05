# 🦷 DentalWorkforce AI — Skill & Capacity Intelligence Platform

**DentalWorkforce AI** is a production-grade clinical workforce intelligence platform engineered to optimize practitioner shift assignments, monitor real-time capacity and burnout risks, automate continuing education (CE) upskilling pathways, and ensure algorithmic fairness across dental clinic networks.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Custom role portals and dashboards for **HR Admin**, **Workforce Planner**, **Team Lead**, and **Employee**.
- **Role-Garded Navigation**: Dynamic sidebar hiding unaccessed pages with strict URL route protection (`RoleGuard`).
- **Live Supabase PostgreSQL Database**: User authentication, practitioner profiles, skill matrices, and audit logging stored in Supabase with fallback capabilities.
- **AI-Driven Shift & Skill Matching**: Grok decision-support algorithms for emergency coverage and skill gap forecasting.
- **Fairness & Bias Review**: Algorithmic auditing (disparate impact ratio, shift distribution equity) to prevent bias.
- **Proactive Certification Tracking**: 30/15/7-day license expiry monitoring with automated mentor pairing.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM v6
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), BcryptJS, Zod Schemas
- **Database & Cloud**: Supabase (PostgreSQL), Supabase Auth & JS Client
- **AI Integration**: Grok AI Decision Support API

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/rashnavrika/DentalWorkforce-AI.git
cd DentalWorkforce-AI
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET=super-secret-jwt-key-dentalworkforce-ai-2026
JWT_EXPIRES_IN=240d
SUPABASE_URL=https://svhtnymfgyobhvtjyolb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run Locally
```bash
# Run both Frontend & Backend concurrently
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔑 Organization Demo Logins (Password: `Password123!`)

| Role | Email | Password |
| :--- | :--- | :--- |
| 👑 **HR Admin** | `admin@dentalworkforce.ai` | `Password123!` |
| 📊 **Workforce Planner** | `planner@dentalworkforce.ai` | `Password123!` |
| 🩺 **Team Lead** | `lead@dentalworkforce.ai` | `Password123!` |
| 🦷 **Employee (Dentist)** | `dentist@dentalworkforce.ai` | `Password123!` |
| 🪥 **Employee (Hygienist)** | `hygienist@dentalworkforce.ai` | `Password123!` |

---

## 📜 License
Licensed under the MIT License.
