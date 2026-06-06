# AI-based HR Module & Hackathon Management System

A production-ready REST API built with **Node.js**, **Express**, and **MongoDB (Mongoose)**.

---

## Folder Structure

```
hr-hackathon-backend/
├── config/
│   ├── db.js               # MongoDB connection
│   └── multer.js           # File upload configuration (PDF & video)
├── controllers/
│   ├── auth.controller.js         # Register & Login
│   ├── job.controller.js          # Job CRUD
│   └── application.controller.js  # Full application lifecycle + AI screening
├── middlewares/
│   ├── auth.middleware.js     # JWT protect + RBAC authorise()
│   ├── error.middleware.js    # Global error handler + 404
│   └── validate.middleware.js # Input validation helpers
├── models/
│   ├── User.js         # User schema (HR / Candidate / Interviewer)
│   ├── Job.js          # Job opening schema
│   └── Application.js  # Application lifecycle schema
├── routes/
│   ├── auth.routes.js         # /api/auth
│   ├── job.routes.js          # /api/jobs
│   └── application.routes.js  # /api/applications
├── uploads/
│   ├── resumes/   # Uploaded PDF resumes (use S3 in production)
│   └── videos/    # Uploaded video interviews
├── utils/
│   └── resumeScreener.js  # AI keyword-matching screening engine
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## Environment Variables

| Variable          | Description                        | Default          |
|-------------------|------------------------------------|------------------|
| `PORT`            | HTTP port                          | `5000`           |
| `NODE_ENV`        | `development` or `production`      | `development`    |
| `MONGO_URI`       | MongoDB connection string          | *(required)*     |
| `JWT_SECRET`      | Secret key for signing JWTs        | *(required)*     |
| `JWT_EXPIRES_IN`  | Token expiry duration              | `7d`             |
| `MAX_FILE_SIZE_MB` | Max upload size per file (MB)     | `10`             |

---

## API Reference

### Auth (Public)

| Method | Endpoint              | Body                                      | Description         |
|--------|-----------------------|-------------------------------------------|---------------------|
| POST   | `/api/auth/register`  | `{ name, email, password, role }`         | Register a new user |
| POST   | `/api/auth/login`     | `{ email, password }`                     | Login, returns JWT  |

**Roles:** `HR` · `Candidate` · `Interviewer`

---

### Jobs (Protected)

All requests require: `Authorization: Bearer <token>`

| Method | Endpoint         | Role      | Description          |
|--------|------------------|-----------|----------------------|
| POST   | `/api/jobs`      | HR        | Create a job opening |
| GET    | `/api/jobs`      | All       | List all jobs        |
| GET    | `/api/jobs/:id`  | All       | Get one job          |

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

#### HR Endpoints

| Method | Endpoint                                  | Description                          |
|--------|-------------------------------------------|--------------------------------------|
| GET    | `/api/applications/:jobId`                | List applications sorted by AI score |
| PATCH  | `/api/applications/:id/status`            | Update status                        |
| POST   | `/api/applications/bulk-upload/:jobId`    | Bulk PDF upload + AI screening       |

**Update Status body:** `{ "status": "Shortlisted" | "Rejected" | "Onboarded" }`

**Bulk Upload:** `multipart/form-data`, field name: `resumes` (up to 50 PDFs)

#### Candidate Endpoints

| Method | Endpoint                                          | Description                   |
|--------|---------------------------------------------------|-------------------------------|
| POST   | `/api/applications/upload-video/:applicationId`   | Upload video interview        |
| POST   | `/api/applications/onboarding`                    | Submit onboarding details     |

**Upload Video:** `multipart/form-data`, field name: `video`

**Onboarding body:**
```json
{
  "applicationId": "<id>",
  "bankAccountNumber": "123456789",
  "ifscCode": "HDFC0001234",
  "panNumber": "ABCDE1234F"
}
```

---

## AI Resume Screening

The screening engine (`utils/resumeScreener.js`) works as follows:

1. **Extract** — `pdf-parse` reads text from each uploaded PDF
2. **Match** — Each `requiredSkill` keyword is matched against the resume text using word-boundary regex
3. **Score** — Two-component weighted formula:
   - **Base (70 pts):** % of required skills found in the resume
   - **Bonus (30 pts):** Frequency depth — skills mentioned multiple times score higher
4. **Store** — Each resume becomes an `Application` document with `screeningScore` set

> The screener is designed as a drop-in replacement zone — swap `extractTextFromPDF` or `calculateScreeningScore` with an OpenAI/Claude API call for semantic matching without touching any controller code.

---

## Security Notes

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWTs are short-lived (configurable, default 7d)
- **Helmet** sets secure HTTP headers
- `password` field excluded from all DB queries by default (`select: false`)
- Duplicate application guard via compound unique index `{ candidateId, jobId }`
- Sensitive onboarding data should be encrypted at rest in production (AES-256)
- In production, replace local `uploads/` with **AWS S3** or **GCS**
