# TalentOS — AI-Based HR Module & Hackathon Management System

<div align="center">

![TalentOS](https://img.shields.io/badge/TalentOS-AI%20HR%20Module-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens)

**A full-stack, production-ready HR management platform with AI-powered resume screening, video interviews, and smart onboarding.**

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [API Reference](#api-reference) · [Screenshots](#project-structure)

</div>

---

## Overview

TalentOS is a complete AI-based HR Module built as part of the **FWC IT Services Pvt. Ltd. Hackathon 2026**. It streamlines the entire hiring lifecycle — from posting jobs and AI-powered bulk resume screening, to video interviews and digital onboarding — all in one platform.

---

## Features

### 🤖 AI Resume Screening
- Upload up to 50 PDF resumes at once
- AI engine extracts text from each PDF
- Keyword matching against job's required skills
- Calculates a **screening score (0–100)** for every candidate
- Candidates automatically ranked by score — highest first

### 👥 Multi-Role Authentication
- Three roles: **HR**, **Candidate**, **Interviewer**
- JWT-based secure authentication
- Role-Based Access Control (RBAC) — each role sees only what they should
- Passwords hashed with bcryptjs (12 salt rounds)

### 💼 HR Portal
- Post job openings with required skills
- View all applications ranked by AI score
- Shortlist, Reject, or Onboard candidates
- Bulk resume upload and screening

### 🎥 Candidate Portal
- Browse job openings
- Upload video interview recordings
- Track application status in real time
- Submit onboarding documents after selection

### ✅ Smart Onboarding
- Digital onboarding form for selected candidates
- Collects bank account, IFSC code, PAN number
- Status-gated — only accessible after HR marks as Onboarded

### 🔒 Security
- JWT Authentication with expiry
- Helmet.js for secure HTTP headers
- CORS protection
- Input validation on all endpoints
- Sensitive fields excluded from API responses

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Multer | File uploads (PDF & video) |
| pdf-parse | PDF text extraction |
| Helmet | Security headers |
| CORS | Cross-origin requests |
| dotenv | Environment variables |
| nodemon | Development auto-reload |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Axios | API calls with JWT interceptor |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database (Free tier) |
| GitHub | Version control |

---

## Project Structure

```
TalentOS--AI-Based-HR-Module/
│
├── hr_backend/                     # Node.js + Express REST API
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── multer.js               # File upload configuration
│   ├── controllers/
│   │   ├── auth.controller.js      # Register & Login
│   │   ├── job.controller.js       # Job CRUD
│   │   └── application.controller.js # Full application lifecycle
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT protect + RBAC
│   │   ├── error.middleware.js     # Global error handler
│   │   └── validate.middleware.js  # Input validation
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Job.js                  # Job schema
│   │   └── Application.js          # Application schema
│   ├── routes/
│   │   ├── auth.routes.js          # /api/auth
│   │   ├── job.routes.js           # /api/jobs
│   │   └── application.routes.js   # /api/applications
│   ├── utils/
│   │   └── resumeScreener.js       # AI screening engine
│   ├── uploads/
│   │   ├── resumes/                # Uploaded PDF resumes
│   │   └── videos/                 # Uploaded video interviews
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                   # Entry point
│
└── hr_frontend/                    # React 18 + Tailwind CSS
    ├── src/
    │   ├── api/
    │   │   └── axios.js            # Axios instance + interceptors
    │   ├── context/
    │   │   ├── AuthContext.jsx     # Global auth state
    │   │   └── ThemeContext.jsx    # Dark/light mode
    │   ├── components/             # Reusable UI components
    │   ├── pages/
    │   │   ├── hr/                 # HR portal pages
    │   │   └── candidate/          # Candidate portal pages
    │   └── routes/
    │       └── PrivateRoute.jsx    # Protected route wrapper
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas account (free) or local MongoDB

### 1. Clone the repository
```bash
git clone https://github.com/Akshit568/TalentOS--AI-Based-HR-Module.git
cd TalentOS--AI-Based-HR-Module
```

### 2. Setup Backend
```bash
cd hr_backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/talentOS
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE_MB=10
```

Start backend:
```bash
npm run dev
```

Backend runs on: **http://localhost:5000**

### 3. Setup Frontend
```bash
cd ../hr_frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## API Reference

### Authentication (Public)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role }` | Register new user |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |

**Roles:** `HR` · `Candidate` · `Interviewer`

---

### Jobs (Protected — All Roles)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/jobs` | HR | Create job opening |
| GET | `/api/jobs` | All | List all jobs |
| GET | `/api/jobs/:id` | All | Get single job |

**Create Job body:**
```json
{
  "title": "Full Stack Developer",
  "description": "We are hiring...",
  "requiredSkills": ["React", "Node.js", "MongoDB"]
}
```

---

### Applications (Protected)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/applications/:jobId` | HR | List applications (sorted by AI score) |
| PATCH | `/api/applications/:id/status` | HR | Update status |
| POST | `/api/applications/bulk-upload/:jobId` | HR | Bulk PDF upload + AI screening |
| POST | `/api/applications/upload-video/:applicationId` | Candidate | Upload video interview |
| POST | `/api/applications/onboarding` | Candidate | Submit onboarding details |

**Status values:** `Shortlisted` · `Rejected` · `Onboarded`

**Status flow:**
```
Applied → Shortlisted → Onboarded
Applied → Rejected
```

---

## AI Screening Engine

The AI resume screening engine (`utils/resumeScreener.js`) works in 3 steps:

```
1. EXTRACT   — pdf-parse reads text from each uploaded PDF
       ↓
2. MATCH     — Each required skill matched against resume text
              using word-boundary regex (case-insensitive)
       ↓
3. SCORE     — Two-component weighted formula:
              Base Score  (70 pts) = % of required skills found
              Bonus Score (30 pts) = keyword frequency depth
              Final Score = min(100, base + bonus)
```

**Score interpretation:**
| Score | Meaning |
|---|---|
| 70–100 | Strong match — recommended for interview |
| 40–69 | Partial match — review manually |
| 0–39 | Weak match — likely not suitable |

> **Note:** The engine is designed as a drop-in replacement. Replace the `screenResume()` function with an OpenAI or Anthropic API call for semantic matching without touching any controller code.

---

## Database Schemas

### User
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: enum['HR', 'Candidate', 'Interviewer'],
  createdAt: Date
}
```

### Job
```js
{
  title: String,
  description: String,
  requiredSkills: [String],  // normalised to lowercase
  postedBy: ObjectId → User,
  isActive: Boolean,
  createdAt: Date
}
```

### Application
```js
{
  candidateId: ObjectId → User,
  jobId: ObjectId → Job,
  resumeUrl: String,
  videoUrl: String,
  screeningScore: Number (0-100),
  status: enum['Applied', 'Shortlisted', 'Rejected', 'Onboarded'],
  onboardingData: Object,  // bank details, PAN, etc.
  createdAt: Date
}
```

---

## Security

- ✅ Passwords hashed with **bcryptjs** (12 salt rounds)
- ✅ JWT tokens expire in 7 days (configurable)
- ✅ **Helmet.js** sets secure HTTP headers
- ✅ `password` field excluded from all DB queries (`select: false`)
- ✅ Duplicate application prevention via compound unique index
- ✅ Role-based route protection on every endpoint
- ✅ File type validation on uploads (PDF only for resumes)
- ✅ Input validation on all API endpoints

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | required |
| `JWT_SECRET` | JWT signing secret | required |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `MAX_FILE_SIZE_MB` | Max upload size | `10` |

---

## Future Improvements

- [ ] OTP-based email verification (Nodemailer)
- [ ] AI video analysis (facial expressions, confidence score)
- [ ] Semantic resume matching (OpenAI / Anthropic API)
- [ ] Docker containerization
- [ ] Real-time notifications (Socket.io)
- [ ] Interview scheduling system
- [ ] Analytics dashboard with charts
- [ ] Mobile app (React Native)

---

## Author

**Akshit Thakur**
- GitHub: [@Akshit568](https://github.com/Akshit568)

---

## Submission

**Hackathon:** FWC IT Services Pvt. Ltd. — OC.26813.2026.59489
**Submission Date:** June 7, 2026
**Project:** AI-Based HR Module & Hackathon Management System

---

<div align="center">
Built with ❤️ for FWC IT Services Hackathon 2026
</div>
