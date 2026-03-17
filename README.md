<<<<<<< HEAD
# 🏢 Kömutel Leave Management System

A full-stack MERN web application to manage employee leave requests and short exit permissions.

## 📋 Features

- **Authentication** — JWT-based login & registration (Staff / HR / Admin roles)
- **Leave Request Wizard** — 6-step form: type → reason → medical doc → dates → supervisor → review
- **Leave Types** — Half Day (HDL), Full Day (FDL), Multi-Day (MDL), Time Off Permission (TOP)
- **HR Approval Workflow** — HR can approve or reject requests inline with comments
- **Dashboard** — Stats overview + recent requests
- **Activity Reporting** — Monthly bar chart, type breakdown, detail table
- **Filtering** — Filter requests by date range
- **Responsive UI** — Matches the Kömutel design system

## 🛠 Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | React 18, React Router v6, Axios |
| Backend  | Node.js, Express.js            |
| Database | MongoDB + Mongoose             |
| Auth     | JWT + bcryptjs                 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

---

### 1. Clone & setup environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env if your backend runs on a different port
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Seed demo data

```bash
cd backend
node seed.js
```

This creates two demo accounts:
| Role  | Email               | Password    |
|-------|---------------------|-------------|
| HR    | hr@komutel.com      | password123 |
| Staff | staff@komutel.com   | password123 |

### 4. Run the application

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
komutel-leave/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leaveController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js              # JWT protect + authorize
│   ├── models/
│   │   ├── User.js
│   │   └── LeaveRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leaves.js
│   │   └── users.js
│   ├── seed.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Layout.js          # Sidebar + topbar
        │   └── LeaveRequestModal.js  # 6-step wizard
        ├── context/
        │   └── AuthContext.js     # Global auth state
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── LeaveRequests.js
        │   └── ActivityReporting.js
        ├── utils/
        │   └── api.js             # Axios instance
        ├── App.js                 # Routes
        ├── styles.css
        └── index.js
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint           | Description        | Auth |
|--------|--------------------|--------------------|------|
| POST   | /api/auth/register | Register user      | ❌   |
| POST   | /api/auth/login    | Login              | ❌   |
| GET    | /api/auth/me       | Get current user   | ✅   |

### Leaves
| Method | Endpoint                | Description              | Auth         |
|--------|-------------------------|--------------------------|--------------|
| GET    | /api/leaves             | Get leaves (own/all)     | ✅           |
| POST   | /api/leaves             | Create leave request     | ✅           |
| GET    | /api/leaves/stats       | Get stats                | ✅           |
| GET    | /api/leaves/pending     | Get pending (HR only)    | ✅ HR/Admin  |
| GET    | /api/leaves/:id         | Get single leave         | ✅           |
| PUT    | /api/leaves/:id/status  | Approve / Reject         | ✅ HR/Admin  |
| DELETE | /api/leaves/:id         | Delete pending leave     | ✅           |

### Users
| Method | Endpoint              | Description         | Auth        |
|--------|-----------------------|---------------------|-------------|
| GET    | /api/users            | Get all users       | ✅ HR/Admin |
| GET    | /api/users/supervisors| Get supervisors     | ✅          |
| PUT    | /api/users/profile    | Update own profile  | ✅          |

---

## 🔐 Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/komutel_leave
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📸 Screenshots

The UI follows the Kömutel design system:
- Dark navy sidebar with logo and user info
- Clean white content area with data tables
- 6-step leave request wizard modal
- Inline HR approval panel
- Activity reporting with bar charts

---

## 👤 Author

Built with the MERN stack following project requirements for clean architecture, JWT auth, RESTful APIs, reusable React components, and complete end-to-end functionality.
=======
# MyCompanyHR
🏢 MyCompanyRH — Employee leave management system built with MongoDB, Express, React &amp; Node.js. Supports Staff, HR and Manager roles with full CRUD and approval workflow.
