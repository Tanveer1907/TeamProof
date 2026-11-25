# TeamProof — Academic Contribution Assessment Platform
> **Tagline:** Every contribution deserves recognition.  
> **Course:** Back End Engineering-II (24CSE0315)  
> **Institution:** Department of Computer Science & Engineering, Chitkara University, Punjab, India  

---

## 1. Project Overview

**TeamProof** is an evidence-based academic project collaboration platform designed to eliminate ambiguous group-project marks. It provides student teams and faculty evaluators with a unified workspace connecting:
- Task planning and milestone tracking with acceptance criteria.
- Non-code and code contribution evidence records (wireframes, research reports, documentation, test plans, and Git commits).
- Teammate peer verification workflows preventing free-riding.
- Transparent faculty review workspaces with deterministic AI-assisted summary drafts.

### Core Principle
> **Human Academic Judgment:** TeamProof supports faculty evaluation. It **never** automatically assigns student grades or claims to objectively calculate individual effort.

---

## 2. Visual Alignment with CE-1 Presentation

The user interface matches the proposed designs from the **TeamProof CE-1 Presentation** (Slides 9–14):
1. **Slide 9 — Project Dashboard:** Personalized welcome banner, next milestone countdown, awaiting review queue, team roster, upcoming tasks table, and real-time activity feed.
2. **Slide 10 — Tasks & Milestones:** 4-column Kanban board (`To Do`, `In Progress`, `In Review`, `Verified`) with priority badges, assignment avatars, due dates, and modal editors.
3. **Slide 11 — GitHub Activity:** Repository connection status, branch indicator, Git activity timeline (PRs, commits) connected directly to evidence records, and contribution context notices.
4. **Slide 12 — Contribution Evidence:** Filterable table (`All Evidence`, `My Submissions`, `Needs Review`), evidence IDs (`EV-01` to `EV-06`), category badges, and submission review drawer.
5. **Slide 13 — Submit a Contribution:** Contribution form linking work directly to project tasks, supporting attachments or PR URLs, teammate reviewer routing, and submission checklist.
6. **Slide 14 — Faculty Review Workspace:** Team contribution matrix, peer evaluation insights, AI-assisted deterministic summaries, and faculty observation recording.

---

## 3. Technology Stack

- **Frontend:** React 18, JavaScript (ES6+), JSX, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios, Lucide React icons.
- **Backend:** Node.js (v22), Express.js (ES Modules), JavaScript, Argon2id password hashing, HTTP-only secure cookie sessions, Multer file uploads, Zod schema validation.
- **Database:** MongoDB, Mongoose 8 with strict schemas and cross-document relational references.
- **Testing:** Vitest & Supertest integration test suite (100% passing).

---

## 4. Getting Started & Installation

### Prerequisites
- Node.js (v18+ or v22 LTS recommended)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI

### Installation
```bash
# Clone and enter the repository
cd TeamProof

# Install all workspace dependencies
npm install

# Build shared package and applications
npm run build
```

### Seeding Demonstration Data
Seed the database with the pre-configured project **CampusConnect** (`Team Atlas`) and sample records matching the CE-1 presentation:
```bash
npm run seed
```

### Running the Application
Run both frontend and backend concurrently in development mode:
```bash
npm run dev
```
- **Web Application:** [http://localhost:5173](http://localhost:5173)
- **REST API Backend:** [http://localhost:5001](http://localhost:5001)

Alternatively, run individually:
```bash
# Start backend API (Port 5001)
npm run dev --workspace=apps/api

# Start frontend Web (Port 5173)
npm run dev --workspace=apps/web
```

---

## 5. Demo Login Credentials

The following demonstration accounts are seeded and ready for immediate testing:

| Role | Name | Email | Password |
|---|---|---|---|
| **Student (Project Lead)** | Aarav Mehta | `aarav@teamproof.edu` | `DemoPass123!` |
| **Student (Teammate)** | Nisha Rao | `nisha@teamproof.edu` | `DemoPass123!` |
| **Student (Teammate)** | Rohan Shah | `rohan@teamproof.edu` | `DemoPass123!` |
| **Faculty Reviewer** | Dr. Neelam Kumari | `faculty@teamproof.edu` | `DemoPass123!` |

*Quick login buttons are also available directly on the login page for fast switching.*

---

## 6. Verification and Test Results

Run the automated integration tests:
```bash
npm run test
```

### Test Coverage Highlights:
- User registration and Argon2id hash authentication.
- Secure session cookie creation and authentication middleware checks.
- Dashboard metric aggregation (`/api/v1/dashboard/overview`).
- Task creation with auto-incrementing ID (`CC-x`).
- **Enforcement Rule:** Preventing direct movement of tasks to `Verified` status without evidence verification.
- Evidence submission with attachments/links (`EV-x`).
- **Enforcement Rule:** Strict permission check preventing contributors from verifying their own evidence.
- Teammate peer verification workflow updating task states to `Verified`.
- Faculty workspace data synthesis and deterministic AI summary generation.
