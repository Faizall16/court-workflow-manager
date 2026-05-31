---

# Court Reporting Management System

A production-grade court reporting management system designed to automate audio transcript document workflows, strict personnel resource delegation, and dynamic payroll calculations based on specific job location parameters.

## 🚀 Key Features

- **Strict State Machine Workflow:** Enforces data integrity across the legal document lifecycle (`NEW` ➡️ `ASSIGNED` ➡️ `TRANSCRIBED` ➡️ `REVIEWED` ➡️ `COMPLETED`).
- **Context-Aware Business Logic:** Automatically calculates custom honorarium distributions and geographic location multipliers (On-site vs. Remote).
- **Modern Clean Architecture:** Clear isolation between backend business logic/data persistence and front-end interface components.
- **Enterprise-Grade UI/UX:** Built with sleek English localization, dynamic contextual modals, auto-resetting forms, and native `Sonner` toast notifications.

---

## 🛠️ Tech Stack Architecture

### Backend (Service Layer)

- **Runtime & Framework:** Node.js, Express, TypeScript
- **Database ORM:** Prisma ORM with PostgreSQL/SQLite
- **Validation:** Strict runtime contract verification

### Frontend (Client Layer)

- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS v4 (Pure CSS Configuration)
- **Component System:** shadcn/ui (Radix Primitives)
- **State & Networking:** Axios with strict TypeScript Interface typing

---

## 📂 Project Directory Structure

```text
.
├── backend/               # Express API and Database layer
│   ├── prisma/            # Database schema models & migrations
│   ├── src/
│   │   ├── controllers/   # Request handler routes
│   │   └── index.ts       # Server initialization
│   └── .env.example
│
├── frontend/              # Next.js App Client
│   ├── src/
│   │   ├── app/           # App router layouts and views
│   │   ├── components/    # Atomic UI components (shadcn)
│   │   ├── lib/           # Axios networking service instances
│   │   └── types/         # Strict TypeScript code contracts
│   └── components.json
│
└── README.md              # Root project documentation
```

---

## 🏁 Getting Started & Local Installation

Follow these steps to spin up both server and client environments locally.

### 1. Prerequisites

Ensure you have **Node.js** and **pnpm** installed on your operating system.

### 2. Setup Backend Server

1. Navigate into the backend directory:

```
cd backend
```

2. Install dependencies:

```
pnpm install
```

3. Set up your environment variables by copying .env.example to .env and updating your database credentials.

4. Run database migrations and seed default user data:

```
pnpm prisma migrate dev
```

5. Start the backend service:

```
pnpm dev
```

The server will boot up natively at http://localhost:5001.

### 3. Setup Frontend Client

1. Open a new terminal tab and navigate into the frontend directory:

```
cd ../frontend
```

2. Install dependencies:

```
pnpm install
```

3. Create a local environment file named .env.local and specify the API gateway endpoint:

Input this:

```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

4. Start the frontend client service:

```
pnpm dev
```

The client dashboard will be available live at http://localhost:3000.

---

## 🔄 Core Workflow Operations

The system operates on a strict **State Machine** model to ensure data integrity during the legal transcription process. Below is the step-by-step lifecycle flow of a case, from registration to final payout locking.

```text
  [ NEW ]
     │
     │  (Assign Reporter)
     ▼
 [ ASSIGNED ]
     │
     │  (Submit Transcript)
     ▼
[ TRANSCRIBED ]
     │
     │  (Assign Editor)
     ▼
 [ REVIEWED ] ──(Reject Draft)──► [ ASSIGNED ]
     │
     │  (Approve Draft)
     ▼
[ COMPLETED ] 🔒 (Locked & Disbursed)

```

---
