# TalentOS — Frontend

A professional, production-grade frontend for the **AI-based HR Module & Hackathon Management System**, built with React 18 and Tailwind CSS.

---

## Tech Stack

- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Axios** — API communication with JWT interceptor
- **Lucide React** — Icons
- **React Hot Toast** — Notifications

---

## Features

### HR Portal
- 📊 **Dashboard** — Stats overview, recent applications, active jobs
- 💼 **Job Openings** — Create and manage job postings with skill tags
- 👥 **Applications** — View candidates ranked by AI screening score
- 🤖 **Bulk Screening** — Upload multiple resumes, AI scores each one automatically

### Candidate Portal
- 📋 **My Applications** — Track application status in real time
- 🎥 **Video Interview** — Upload recorded video interview
- ✅ **Onboarding** — Submit bank details and documents after selection

### General
- 🔐 **JWT Authentication** — Secure login with token-based auth
- 👤 **Role-Based Access** — HR and Candidate see different dashboards
- 🌙 **Dark / Light Mode** — Theme toggle with localStorage persistence
- 📱 **Responsive Design** — Works on desktop and tablet

---

## Folder Structure

```
hr_frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance with JWT interceptor
│   ├── context/
│   │   ├── AuthContext.jsx        # Global auth state
│   │   └── ThemeContext.jsx       # Dark/light mode
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── ScoreBar.jsx
│   │   ├── SlideOver.jsx
│   │   ├── SkillTag.jsx
│   │   ├── FileDropzone.jsx
│   │   ├── StatCard.jsx
│   │   └── EmptyState.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── hr/
│   │   │   ├── HRLayout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── ApplicationsForJob.jsx
│   │   │   └── BulkScreening.jsx
│   │   └── candidate/
│   │       ├── CandidateLayout.jsx
│   │       ├── MyApplications.jsx
│   │       ├── UploadVideo.jsx
│   │       └── Onboarding.jsx
│   └── routes/
│       └── PrivateRoute.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Setup & Installation

### 1. Install dependencies
```bash
cd hr_frontend
npm install
```

### 2. Make sure backend is running
```bash
# Backend must be running on port 5000
# See hr_backend/README.md for setup instructions
```

### 3. Start development server
```bash
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## API Connection

All API calls go through `src/api/axios.js`:

```js
Base URL: http://localhost:5000/api
```

JWT token is automatically attached to every request via Axios interceptor.
On 401 response, user is automatically logged out and redirected to login.

---

## Demo Credentials

Register accounts with these roles to test:

| Role | What they can do |
|---|---|
| **HR** | Post jobs, bulk screen resumes, manage applications |
| **Candidate** | Upload video, submit onboarding details |
| **Interviewer** | View jobs and applications |

---

## Pages & Routes

| Route | Role | Description |
|---|---|---|
| `/login` | Public | Login page |
| `/register` | Public | Register page |
| `/hr/dashboard` | HR | Overview stats |
| `/hr/jobs` | HR | Job openings |
| `/hr/jobs/:id/applications` | HR | Applications for a job |
| `/hr/bulk-screening` | HR | AI resume screening |
| `/candidate/applications` | Candidate | My applications |
| `/candidate/upload-video/:id` | Candidate | Upload video interview |
| `/candidate/onboarding` | Candidate | Onboarding form |

---

## Related

- 🔗 **Backend Repository:** [hr_backend](../hr_backend/README.md)
- 🔗 **Full Project:** [TalentOS — AI Based HR Module](https://github.com/Akshit568/TalentOS--AI-Based-HR-Module)
