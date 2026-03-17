# 🏢 MyCompanyRH — Leave Management System

> Full-stack leave management app | MERN Stack | JWT Auth | Role-based access control (Staff · HR · Manager) | Leave approval workflow

A full-stack MERN web application for managing employee leave requests and exit permissions. Features JWT authentication, role-based access (Staff / HR / Manager), a 6-step request wizard, and an HR approval workflow.

---

## 🛠 Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, React Router v6, Axios  |
| Backend  | Node.js, Express.js               |
| Database | MongoDB + Mongoose                |
| Auth     | JWT + bcryptjs                    |

---

## ✨ Features

- 🔐 JWT Authentication (Login / Register)
- 👥 Role-based access: **Staff**, **HR**, **Manager**
- 📋 6-step leave request wizard
- ✅ HR approval workflow
- 👔 Manager can add / edit / delete team members
- 📊 Activity Reporting with charts
- 🔍 Filter requests by date range

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally
- [Git](https://git-scm.com/)

---

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mycompanyrh.git
cd mycompanyrh
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mycompanyrh
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Install dependencies:
```bash
npm install
```

### 3. Setup Frontend
```bash
cd ../frontend
cp .env.example .env
```

Install dependencies:
```bash
npm install
```

### 4. Seed Demo Data
```bash
cd ../backend
node seed.js
```

This creates 3 demo accounts:

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Manager | manager@mycompany.com    | password123 |
| HR      | hr@mycompany.com         | password123 |
| Staff   | staff@mycompany.com      | password123 |

### 5. Run the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Open your browser at:
```
http://localhost:3000
```

---

## 📁 Project Structure
```
mycompanyrh/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leaveController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
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
    └── src/
        ├── components/
        │   ├── Layout.js
        │   └── LeaveRequestModal.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── LeaveRequests.js
        │   ├── TeamManagement.js
        │   └── ActivityReporting.js
        ├── utils/
        │   └── api.js
        ├── App.js
        └── styles.css
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint            | Description      |
|--------|---------------------|------------------|
| POST   | /api/auth/register  | Register user    |
| POST   | /api/auth/login     | Login            |
| GET    | /api/auth/me        | Get current user |

### Leaves
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| GET    | /api/leaves            | Get all leaves        |
| POST   | /api/leaves            | Create leave request  |
| GET    | /api/leaves/stats      | Get stats             |
| GET    | /api/leaves/pending    | Get pending (HR+)     |
| PUT    | /api/leaves/:id/status | Approve / Reject      |
| DELETE | /api/leaves/:id        | Delete leave          |

### Users
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/users            | Get all users        |
| POST   | /api/users            | Create member        |
| PUT    | /api/users/:id        | Update member        |
| DELETE | /api/users/:id        | Delete member        |

---

## 👤 Role Permissions

| Feature                  | Staff | HR  | Manager |
|--------------------------|-------|-----|---------|
| Submit leave request     | ✅    | ✅  | ✅      |
| View own requests        | ✅    | ✅  | ✅      |
| Approve Staff requests   | ❌    | ✅  | ❌      |
| Approve HR requests      | ❌    | ❌  | ✅      |
| Add / Edit / Delete team | ❌    | ❌  | ✅      |
| View activity reports    | ✅    | ✅  | ✅      |

---

## 🔐 Environment Variables

**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mycompanyrh
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📝 License

This project was built as part of a MERN stack academic project.
