# 🎙️ AI Meeting Summariser + Action Tracker (SaaS)

> A multi-tenant SaaS platform that converts meeting recordings or transcripts into AI-generated summaries, structured action items with real employee email resolution, spoken summaries via ElevenLabs TTS, automated email reminders, and plan-based model selection.

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2+ECR-FF9900?logo=amazon-aws)](https://aws.amazon.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.2-1C3C3C)](https://python.langchain.com)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [SaaS Model](#-saas-model)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Data Models](#-data-models)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment — AWS EC2 + ECR](#-deployment--aws-ec2--ecr)
- [Key Technical Decisions](#-key-technical-decisions)
- [Interview Talking Points](#-interview-talking-points)
- [Roadmap](#-roadmap)

---

## 🎯 Problem Statement

Remote-first teams lose ~30% of productivity to untracked meeting outcomes. After every meeting:
- Action items get buried in chat threads
- Nobody remembers who committed to what by when
- Follow-up is manual, inconsistent, and often skipped entirely
- Managers have no visibility into cross-team action item completion

**This platform solves that by:**
1. Accepting raw audio or transcript as input
2. Running it through a Groq Whisper STT → LangChain LLM pipeline to extract structured action items
3. Matching extracted owner names against a pre-loaded employee roster (fed via Excel)
4. Sending automated email reminders to the actual employees with a one-click "Mark as Done" link
5. Providing a spoken summary via ElevenLabs TTS for async consumption
6. Offering plan-based model selection — free users get Groq Llama, paid users unlock Gemini

---

## ✨ Features

### Core Features
| Feature | Description |
|---|---|
| 🎙️ Audio upload | Drag-drop MP3/WAV/M4A up to 25MB |
| 📝 Text bypass | Paste transcript directly — skips Whisper STT |
| 🤖 AI extraction | Structured JSON: summary + action items with owner + deadline |
| 🔀 Model switching | Groq Llama 3.3 70B (free plan) or Google Gemini 1.5 Flash (pro plan) |
| 🔊 Spoken summary | ElevenLabs TTS reads summary aloud — cached after first generation |
| 📧 Smart email reminders | Resolved to real employee emails — fires automatically on creation |
| ✅ Email-to-done | Owner clicks "Mark as Done" link in email — updates status without login |
| 🔔 Manual remind | Re-send reminder from action item row at any time |
| ✅ Status tracker | Toggle: pending → in-progress → done |
| 🎨 Deadline colours | Red = overdue, yellow = due soon, green = on track |
| 📊 Analytics | Totals, overdue count, by-owner breakdown, completion rate |
| 📄 PDF export | Download meeting summary + action table as formatted PDF |
| 🔍 Owner filter | Filter meetings by action item owner name |

### SaaS Features
| Feature | Description |
|---|---|
| 🏢 Workspace isolation | All data scoped to workspace — full multi-tenancy |
| 👥 Employee roster | Import team via Excel sheet (Name, Email, Phone, Department) |
| 🔗 Owner resolution | LLM-extracted names fuzzy-matched against employee roster → real emails |
| 💳 Plan tiers | Free / Pro / Enterprise — limits on meetings, emails, TTS, models |
| ⚡ Rate limiting | Atomic MongoDB counters per workspace per resource per month |
| 📈 Usage dashboard | Shows plan limits vs used for the current month |

---

## 💳 SaaS Model

### Pricing Tiers

| Feature | Free | Pro (₹499/mo) | Enterprise (₹1999/mo) |
|---|---|---|---|
| Meetings/month | 5 | 50 | Unlimited |
| Employees in roster | 10 | 100 | Unlimited |
| LLM model | Groq Llama only | Groq + Gemini | All models |
| TTS summaries | ❌ | ✅ | ✅ |
| Email reminders/month | 20 | 500 | Unlimited |
| Analytics | Basic | Full | Full + export |
| PDF export | ❌ | ✅ | ✅ |

### Employee Roster — How It Works

1. **Admin uploads Excel sheet** via the workspace settings page
   - Required columns: `Name`, `Email`
   - Optional columns: `Phone`, `Department`, `Aliases`
   - Example row: `Sarah Johnson | sarah@acme.com | 9876543210 | Engineering | Sara, Sarah J`

2. **Meeting is processed** → LLM extracts action items with owner names like "Sarah"

3. **Owner resolution** runs in the webhook handler:
   - Fuzzy matches "Sarah" against employee roster using name + aliases
   - If matched → attaches `ownerEmail` to the action item
   - Sends reminder email to `sarah@acme.com` with a one-click "Mark as Done" link

4. **Mark as Done** — owner clicks link in email → action item status updates to `done` without requiring login

### Model Selection by Plan

At upload time, the user sees a model selector. Available options depend on their workspace plan:
- **Free plan** → Groq Llama 3.3 70B only (free, fast)
- **Pro/Enterprise plan** → Groq Llama 3.3 70B + Google Gemini 1.5 Flash

FastAPI's LangChain `get_llm(model)` function handles the actual switch — one line of code, same chain.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Browser                                     │
│                 Next.js 14 App Router (TypeScript)                    │
│                                                                       │
│  /dashboard         /meetings/[id]     /analytics                    │
│  /workspace/setup   /workspace/employees   /pricing                  │
│  /login             /register                                         │
└─────────────────────────────┬────────────────────────────────────────┘
                               │ HTTP
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy (port 80)                      │
│          /        → Next.js  :3000                                    │
│          /ai/*    → FastAPI   :8000                                   │
└────────────────────┬─────────────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        ▼                          ▼
┌───────────────┐       ┌─────────────────────────────────────────────┐
│   FastAPI     │       │           Next.js API Routes                 │
│  ai-service   │       │                                              │
│               │       │  /api/auth/[...nextauth]  (NextAuth v4)     │
│  POST         │       │  /api/auth/register                          │
│  /api/        │       │                                              │
│  transcribe   │       │  /api/workspace           (create/get)       │
│  ↓            │       │  /api/workspace/employees (list/import)      │
│  Groq Whisper │       │                                              │
│               │ POST  │  /api/meetings            (GET list, POST)   │
│  POST         │ ────► │  /api/meetings/[id]       (GET, DELETE)      │
│  /api/        │       │                                              │
│  process      │       │  /api/actions             (GET, POST)        │
│  ↓            │       │  /api/actions/[id]        (PATCH, DELETE)    │
│  LangChain    │       │  /api/actions/[id]/remind (POST)             │
│  (Groq/Gemini)│       │  /api/actions/complete/[token] (GET)        │
│  ↓            │       │                                              │
│  Pydantic     │       │  /api/tts/[meetingId]     (POST, DELETE)     │
│  validation   │       │  /api/analytics            (GET)             │
│               │       │  /api/usage                (GET)             │
└───────┬───────┘       │  /api/cron/reset-usage     (POST)           │
        │               └──────────────┬──────────────────────────────┘
        │                              │
        ▼                    ┌─────────┴──────────┐
┌───────────────┐            ▼                    ▼
│   Groq API    │   ┌──────────────┐   ┌──────────────────────┐
│               │   │ MongoDB Atlas│   │  External Services   │
│ whisper-      │   │              │   │                      │
│ large-v3      │   │  workspaces  │   │  ElevenLabs TTS      │
│               │   │  users       │   │  NodeMailer SMTP     │
│ llama-3.3-70b │   │  employees   │   │  Google OAuth        │
│               │   │  meetings    │   │                      │
└───────────────┘   │  actionitems │   └──────────────────────┘
                    │              │
┌───────────────┐   └──────────────┘
│ Google Gemini │
│               │
│ gemini-1.5-   │
│ flash         │
└───────────────┘
```

### Data Flow — Meeting Processing

```
User uploads audio/transcript
        │
        ▼
Next.js /dashboard/upload
        │  FormData (file, model, title, workspaceId)
        ▼
FastAPI POST /api/process
        │
        ├─► [if audio] Groq Whisper STT → raw transcript string
        │
        ├─► LangChain chain (prompt | get_llm(model) | JsonOutputParser)
        │         └─► Returns: { summary, action_items: [{task, owner, deadline}] }
        │
        ├─► Pydantic MeetingExtraction validation
        │
        └─► httpx webhook → POST /api/meetings (Next.js)
                    │
                    ├─► Save Meeting document (MongoDB)
                    │
                    ├─► Save ActionItem documents (MongoDB)
                    │
                    ├─► resolveOwnerEmails():
                    │       ├─► Fuzzy match owner name → Employee roster
                    │       ├─► If match found: attach ownerEmail + emailToken
                    │       └─► Fire sendReminderEmail() → void (non-blocking)
                    │
                    └─► checkRateLimit("meetingsProcessed") → 429 if limit hit
```

### Email → Mark as Done Flow

```
Action item created with ownerEmail resolved
        │
        ▼
sendReminderEmail(email, task, deadline, token)
        │
        ▼
Owner receives email
        │
        ▼
Owner clicks "✅ Mark as Done" button
        │
        ▼
GET /api/actions/complete/:token (no auth required)
        │
        ├─► Find ActionItem by emailToken
        ├─► Update status to "done"
        └─► Redirect to /action-complete page
```

---

## 🛠️ Tech Stack

### AI Service (Python)

| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.111 | Async API framework, file upload, route handling |
| uvicorn | latest | ASGI server — 1 worker on t2.micro |
| Groq SDK | latest | Whisper STT + Llama LLM API client |
| LangChain | 0.2 | Model-agnostic LLM chain — swap models in one line |
| langchain-groq | latest | Groq provider for LangChain |
| langchain-google-genai | latest | Gemini provider for LangChain |
| Pydantic v2 | latest | Response schema validation (double-layer with LangChain) |
| httpx | latest | Async HTTP client for webhook to Next.js |
| python-dotenv | latest | Env var loading |
| pytest + httpx | latest | Unit tests |

### Web App (Next.js)

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14 | Full-stack — App Router, frontend + API routes |
| TypeScript | 5.0 | Type safety across all layers |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui | latest | Pre-built accessible component library |
| MongoDB Atlas | M0 (free) | NoSQL — workspaces, users, employees, meetings, actions |
| Mongoose | 8.x | ODM with TypeScript interface support |
| NextAuth | v4 | Auth — Credentials + Google OAuth, JWT sessions |
| bcryptjs | latest | Password hashing |
| jsonwebtoken | latest | Email token generation for mark-as-done links |
| NodeMailer | latest | Email reminders via Gmail SMTP |
| ElevenLabs REST | v1 | TTS — spoken meeting summaries |
| jsPDF | latest | Client-side PDF export |
| xlsx | latest | Excel file parsing for employee roster import |
| react-dropzone | latest | Drag-and-drop file upload UI |
| axios | latest | HTTP client with session interceptor |

### Infrastructure

| Technology | Purpose | Cost |
|---|---|---|
| AWS EC2 t2.micro | VM running both Docker containers | Free tier 750hrs/month |
| AWS ECR | Container image registry | Free 500MB |
| AWS SSM Parameter Store | Secure secrets management | Free (standard tier) |
| Docker + Docker Compose | Container orchestration | Free |
| Nginx | Reverse proxy — routes `/` and `/ai/` | Free |
| MongoDB Atlas M0 | Database | Always free |

---

## 📊 Data Models

### Workspace
```typescript
{
  _id: ObjectId,
  name: string,                    // "Acme Corp"
  slug: string,                    // "acme-corp" — unique URL identifier
  ownerId: ObjectId,               // ref: User
  plan: "free" | "pro" | "enterprise",
  usageThisMonth: {
    meetingsProcessed: number,
    emailsSent: number,
    ttsCharsUsed: number,
    llmCallsGroq: number,
    llmCallsGemini: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### User
```typescript
{
  _id: ObjectId,
  email: string,
  password?: string,               // undefined for Google OAuth users
  name?: string,
  image?: string,                  // Google profile picture
  workspaceId: ObjectId,           // ref: Workspace
  role: "owner" | "admin" | "member",
  createdAt: Date,
  updatedAt: Date
}
```

### Employee
```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,           // ref: Workspace — tenant scoping
  name: string,                    // "Sarah Johnson"
  email: string,                   // "sarah@acme.com" — used for reminders
  phone?: string,                  // optional
  department?: string,             // optional
  aliases: string[],               // ["Sara", "Sarah J"] — LLM name variants
  createdAt: Date,
  updatedAt: Date
}
```

### Meeting
```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,           // ref: Workspace — tenant scoping
  title: string,
  transcript: string,
  summary: string,
  userId?: ObjectId,               // ref: User — who uploaded it
  audioBase64?: string,            // cached ElevenLabs TTS audio
  modelUsed: "groq" | "gemini",    // which LLM processed this meeting
  createdAt: Date,
  updatedAt: Date
}
```

### ActionItem
```typescript
{
  _id: ObjectId,
  meetingId: ObjectId,             // ref: Meeting
  workspaceId: ObjectId,           // ref: Workspace — for cross-meeting queries
  task: string,
  owner: string,                   // raw name from LLM: "Sarah"
  ownerEmail?: string,             // resolved from Employee roster
  ownerResolved: boolean,          // true if matched to an Employee doc
  deadline: string,                // "Friday" or "2026-05-15"
  status: "pending" | "in-progress" | "done",
  emailToken: string,              // UUID — used for email mark-as-done link
  emailSentAt?: Date,              // when last reminder was sent
  completedViaEmail: boolean,      // true if marked done via email link
  createdAt: Date,
  updatedAt: Date
}
```

### Plan Limits (constants — not a collection)
```typescript
const PLAN_LIMITS = {
  free: {
    meetingsProcessed: 5,
    emailsSent: 20,
    ttsCharsUsed: 0,              // TTS disabled on free
    llmModels: ["groq"]
  },
  pro: {
    meetingsProcessed: 50,
    emailsSent: 500,
    ttsCharsUsed: 50000,
    llmModels: ["groq", "gemini"]
  },
  enterprise: {
    meetingsProcessed: Infinity,
    emailsSent: Infinity,
    ttsCharsUsed: Infinity,
    llmModels: ["groq", "gemini"]
  }
}
```

---

## 📁 Project Structure

```
meeting-summariser/
│
├── ai-service/                              # FastAPI Python service
│   ├── app/
│   │   ├── main.py                          # FastAPI app + CORS + router registration
│   │   ├── config.py                        # env var loading (GROQ_API_KEY, GOOGLE_API_KEY, NEXT_APP_URL)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── transcribe.py                # POST /api/transcribe — Groq Whisper + text bypass
│   │   │   └── process.py                  # POST /api/process — full pipeline
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── stt_service.py               # transcribe_audio() + use_raw_transcript()
│   │   │   ├── llm_service.py               # get_llm(model) + extract_meeting_data() LangChain
│   │   │   └── webhook_service.py           # save_to_nextjs() via httpx — fire and forget
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py                   # ActionItem, MeetingExtraction, ProcessRequest (Pydantic)
│   ├── tests/
│   │   ├── test_transcribe.py
│   │   └── test_process.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                                 # gitignored
│
├── web-app/                                 # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx                       # Root layout + SessionProvider
│   │   ├── page.tsx                         # Landing page + pricing overview
│   │   ├── providers.tsx                    # NextAuth SessionProvider wrapper
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx               # Credentials + Google OAuth login
│   │   │   └── register/page.tsx            # Register → create workspace → import employees
│   │   │
│   │   ├── workspace/
│   │   │   ├── setup/page.tsx               # Create workspace name + slug
│   │   │   └── employees/page.tsx           # Employee roster — import Excel + manage list
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx                     # Meeting list + owner filter + usage bar
│   │   │   └── upload/page.tsx              # Upload page — model selector gated by plan
│   │   │
│   │   ├── meetings/
│   │   │   └── [id]/page.tsx                # Detail + action table + TTS + PDF export
│   │   │
│   │   ├── analytics/
│   │   │   └── page.tsx                     # Stats cards + by-owner table + completion rate
│   │   │
│   │   ├── pricing/
│   │   │   └── page.tsx                     # Plan comparison + upgrade CTA
│   │   │
│   │   ├── action-complete/
│   │   │   └── page.tsx                     # "Marked as Done" confirmation page (no auth)
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts   # NextAuth — Credentials + Google OAuth
│   │       │   └── register/route.ts        # POST register + create workspace
│   │       │
│   │       ├── workspace/
│   │       │   ├── route.ts                 # GET workspace info
│   │       │   └── employees/
│   │       │       ├── route.ts             # GET list + POST single employee
│   │       │       └── import/route.ts      # POST bulk import from Excel JSON
│   │       │
│   │       ├── meetings/
│   │       │   ├── route.ts                 # GET list (workspace-scoped) + POST (webhook)
│   │       │   └── [id]/route.ts            # GET detail + DELETE
│   │       │
│   │       ├── actions/
│   │       │   ├── route.ts                 # GET list + POST create + owner resolution
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts             # PATCH status + DELETE
│   │       │   │   └── remind/route.ts      # POST manual re-send email
│   │       │   └── complete/
│   │       │       └── [token]/route.ts     # GET mark-as-done via email link (no auth)
│   │       │
│   │       ├── tts/
│   │       │   └── [meetingId]/route.ts     # POST generate/cache + DELETE clear cache
│   │       │
│   │       ├── analytics/
│   │       │   └── route.ts                 # GET aggregated stats (workspace-scoped)
│   │       │
│   │       ├── usage/
│   │       │   └── route.ts                 # GET current month usage vs plan limits
│   │       │
│   │       └── cron/
│   │           └── reset-usage/route.ts     # POST reset monthly usage counters
│   │
│   ├── components/
│   │   ├── ui/                              # shadcn/ui components
│   │   ├── Navbar.tsx                       # Nav + overdue badge + usage warning
│   │   ├── MeetingCard.tsx                  # Dashboard meeting card
│   │   ├── ActionItemRow.tsx                # Table row + status toggle + remind button
│   │   ├── AudioPlayer.tsx                  # ElevenLabs TTS player (idle/loading/playing)
│   │   ├── StatsCard.tsx                    # Analytics stat card
│   │   ├── EmployeeImport.tsx               # Excel drag-drop + preview table + import button
│   │   ├── UsageBar.tsx                     # Plan usage progress bar for dashboard
│   │   └── PlanGate.tsx                     # Wrapper that hides features behind plan check
│   │
│   ├── lib/
│   │   ├── mongodb.ts                       # Cached Mongoose connection (serverless-safe)
│   │   ├── auth.ts                          # requireAuth() — returns {session, error}
│   │   ├── email.ts                         # sendReminderEmail(email, task, deadline, token)
│   │   ├── generatePDF.ts                   # jsPDF client-side export utility
│   │   ├── rateLimit.ts                     # checkRateLimit(workspaceId, resource, amount)
│   │   ├── resolveOwners.ts                 # fuzzy match LLM names → Employee docs
│   │   └── apiClient.ts                     # Axios instance with session header interceptor
│   │
│   ├── models/
│   │   ├── Workspace.ts                     # Workspace schema + plan + usageThisMonth
│   │   ├── User.ts                          # User schema + workspaceId + role
│   │   ├── Employee.ts                      # Employee schema + aliases array
│   │   ├── Meeting.ts                       # Meeting schema + audioBase64 + modelUsed
│   │   └── ActionItem.ts                    # ActionItem schema + ownerEmail + emailToken
│   │
│   ├── types/
│   │   └── index.ts                         # All shared TypeScript interfaces
│   │
│   ├── middleware.ts                         # NextAuth route protection for dashboard pages
│   ├── Dockerfile
│   ├── next.config.ts                       # output: standalone for Docker build
│   ├── .env.local.example
│   └── .env.local                           # gitignored
│
├── nginx/
│   └── nginx.conf                           # Reverse proxy — routes / and /ai/
│
├── docker-compose.yml                       # Multi-container: nginx + nextjs + fastapi
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Link |
|---|---|---|
| Node.js | v20+ | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| Docker Desktop | latest | [docker.com](https://docker.com) |
| MongoDB Atlas | M0 free | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| Groq account | — | [console.groq.com](https://console.groq.com) |
| Google Cloud project | — | [console.cloud.google.com](https://console.cloud.google.com) |
| ElevenLabs account | — | [elevenlabs.io](https://elevenlabs.io) |
| Gmail + App Password | — | [Google App Passwords](https://support.google.com/accounts/answer/185833) |
| AWS account | free tier | [aws.amazon.com](https://aws.amazon.com) |

---

## 🔐 Environment Variables

### `ai-service/.env`

```env
# Groq — Whisper STT + Llama LLM
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Google Gemini — Pro/Enterprise LLM option
GOOGLE_API_KEY=AIzaxxxxxxxxxxxxxxxxxx

# Next.js webhook target
NEXT_APP_URL=http://localhost:3000
```

### `web-app/.env.local`

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/meeting-summariser

# NextAuth — generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_min_32_chars

# Google OAuth — from Google Cloud Console → OAuth 2.0 Client
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx

# ElevenLabs TTS
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Email — Gmail App Password (NOT your Gmail password)
EMAIL_USER=youremail@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# App URLs
FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email token secret for mark-as-done links
EMAIL_TOKEN_SECRET=another_random_secret_32_chars
```

---

### Run Locally

```bash
# Clone
git clone https://github.com/yourusername/meeting-summariser.git
cd meeting-summariser

# Terminal 1 — FastAPI
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in keys
uvicorn app.main:app --reload --port 8000
# Swagger UI: http://localhost:8000/docs

# Terminal 2 — Next.js
cd web-app
npm install
cp .env.local.example .env.local  # fill in keys
npm run dev
# App: http://localhost:3000
```

### Run with Docker Compose

```bash
docker-compose up --build       # first time
docker-compose up -d            # background
docker-compose logs -f          # logs
docker-compose down             # stop
```

---

## 📡 API Reference

### FastAPI — AI Service (port 8000)
> Swagger UI available at `http://localhost:8000/docs`

#### `POST /api/transcribe`
| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | No* | MP3/WAV/M4A/OGG/WebM — max 25MB |
| `raw_text` | string | No* | Plain text — bypasses Whisper |
*One required.

**Response:**
```json
{ "transcript": "...", "source": "audio" }
```

#### `POST /api/process`
| Field | Type | Default | Notes |
|---|---|---|---|
| `file` | File | — | Audio file |
| `raw_text` | string | — | Plain text transcript |
| `model` | string | `"groq"` | `"groq"` or `"gemini"` |
| `title` | string | `"Untitled"` | Meeting title |
| `workspace_id` | string | — | For rate limit check |

**Response:**
```json
{
  "summary": "...",
  "action_items": [
    { "task": "Prepare budget report", "owner": "Sarah", "deadline": "Friday" }
  ]
}
```

---

### Next.js API Routes (port 3000)

#### Workspace
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/workspace` | ✅ | Get current user's workspace + plan info |
| `GET` | `/api/workspace/employees` | ✅ | List all employees in workspace |
| `POST` | `/api/workspace/employees` | ✅ | Add single employee |
| `POST` | `/api/workspace/employees/import` | ✅ | Bulk import from Excel JSON array |

#### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register + auto-create workspace |
| `GET/POST` | `/api/auth/[...nextauth]` | ❌ | NextAuth handler |

#### Meetings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/meetings` | ✅ | List — workspace-scoped. Supports `?owner=` |
| `POST` | `/api/meetings` | ❌ | Create meeting + actions (FastAPI webhook) |
| `GET` | `/api/meetings/:id` | ✅ | Detail with embedded action items |
| `DELETE` | `/api/meetings/:id` | ✅ | Delete meeting + cascade delete action items |

#### Action Items
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/actions` | ✅ | List — supports `?meetingId=` |
| `POST` | `/api/actions` | ✅ | Create + resolve owner email + send reminder |
| `PATCH` | `/api/actions/:id` | ✅ | Update status / task / owner / deadline |
| `DELETE` | `/api/actions/:id` | ✅ | Delete |
| `POST` | `/api/actions/:id/remind` | ✅ | Manual re-send reminder email |
| `GET` | `/api/actions/complete/:token` | ❌ | Mark as done via email link — no auth |

#### TTS + Analytics + Usage
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/tts/:meetingId` | ✅ | Generate/return cached ElevenLabs audio |
| `DELETE` | `/api/tts/:meetingId` | ✅ | Clear audio cache |
| `GET` | `/api/analytics` | ✅ | Aggregated workspace stats |
| `GET` | `/api/usage` | ✅ | Current month usage vs plan limits |
| `POST` | `/api/cron/reset-usage` | ❌* | Reset monthly usage counters |
*Protected by a secret token header, called by a cron job.

---

## ☁️ Deployment — AWS EC2 + ECR

### Architecture on AWS (all free tier)

```
AWS Free Tier
├── EC2 t2.micro  (1GB RAM + 2GB swap file)
│   ├── Nginx     (port 80 → routes traffic)
│   ├── Next.js   (container, port 3000, mem_limit: 512m)
│   └── FastAPI   (container, port 8000, mem_limit: 400m)
│
├── ECR
│   ├── meeting-summariser-next     (~80MB image)
│   └── meeting-summariser-fastapi  (~120MB image)
│
└── SSM Parameter Store
    └── /meeting-summariser/* (all secrets, SecureString type)
```

### Cost Breakdown

| Service | Free Tier | Monthly Cost |
|---|---|---|
| EC2 t2.micro | 750 hrs/month × 12 months | ₹0 |
| ECR | 500MB storage | ₹0 |
| SSM Parameter Store | Standard parameters | ₹0 |
| MongoDB Atlas M0 | Always free | ₹0 |
| Groq API | Free tier | ₹0 |
| ElevenLabs | 10k chars/month | ₹0 |
| **Total** | | **₹0/month** |

### Step-by-step Deploy

#### 1. Build and push to ECR
```bash
# Authenticate
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS \
  --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

# FastAPI
cd ai-service
docker build -t meeting-summariser-fastapi .
docker tag meeting-summariser-fastapi:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/meeting-summariser-fastapi:latest
docker push \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/meeting-summariser-fastapi:latest

# Next.js
cd ../web-app
docker build -t meeting-summariser-next \
  --build-arg NEXTAUTH_URL=http://your-ec2-ip \
  --build-arg NEXT_PUBLIC_FASTAPI_URL=http://your-ec2-ip/ai \
  --build-arg NEXT_PUBLIC_APP_URL=http://your-ec2-ip \
  .
docker tag meeting-summariser-next:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/meeting-summariser-next:latest
docker push \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/meeting-summariser-next:latest
```

#### 2. Launch EC2 t2.micro
```
AMI: Ubuntu 22.04 LTS (free tier eligible)
Instance type: t2.micro ← must be this
Security group:
  SSH   port 22  → My IP only
  HTTP  port 80  → 0.0.0.0/0
Storage: 20GB gp2
```

#### 3. Setup server
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker ubuntu && newgrp docker

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose

# 2GB swap — critical for 1GB RAM
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# AWS CLI
sudo apt-get install -y awscli && aws configure
```

#### 4. Store secrets in SSM
```bash
aws ssm put-parameter --name "/meeting-summariser/MONGODB_URI" --value "..." --type SecureString
# Repeat for: NEXTAUTH_SECRET, GROQ_API_KEY, GOOGLE_API_KEY,
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
# ELEVENLABS_API_KEY, EMAIL_USER, EMAIL_APP_PASSWORD, EMAIL_TOKEN_SECRET
```

#### 5. Pull and run
```bash
# Pull secrets to .env
aws ssm get-parameters-by-path --path "/meeting-summariser/" \
  --with-decryption --query "Parameters[*].[Name,Value]" \
  --output text | awk '{split($1,a,"/"); print a[3]"="$2}' > .env

# Start
docker-compose --env-file .env pull
docker-compose --env-file .env up -d
docker-compose ps
```

---

## 🧠 Key Technical Decisions

### Multi-tenancy via workspace scoping
Every database query includes `workspaceId` as a required filter — not optional. A missing `workspaceId` in any query is a data leak between tenants. This is enforced at the model level (required field) and the application level (requireAuth always attaches workspaceId from session).

### Employee roster + fuzzy name matching
The LLM extracts owner names as free-text strings ("Sarah", "Mike from finance"). These are fuzzy-matched against the Employee collection using case-insensitive regex across `name` and `aliases` fields. The `aliases` array handles LLM hallucinations and name variants — "Sara", "Sarah K", "Sarah Johnson" all resolve to the same employee.

### Email-to-done via token (no auth required)
Each action item gets a UUID `emailToken` on creation. The email contains a link to `/api/actions/complete/:token`. No auth is required — the token IS the proof of identity. This is the same pattern password reset links use. The `completedViaEmail` boolean tracks which items were completed this way for analytics.

### Rate limiting with atomic MongoDB increments
Plan limits are enforced using `$inc` operations inside MongoDB `findByIdAndUpdate`. This makes the increment atomic — two simultaneous requests cannot both read the same count, both pass the limit, and both succeed. The workspace document is the single source of truth for usage.

### LangChain used only for model switching
LangChain's value here is one function: `get_llm(model)` returns either `ChatGroq` or `ChatGoogleGenerativeAI`. The chain is `prompt | llm | parser` — identical regardless of model. This makes model switching a one-string change at the API level, gated by plan in the UI.

### Why not LangChain for Whisper
LangChain is LLM text-in/text-out only. Whisper is a separate speech-to-text system that sits before the LangChain chain. Audio → Groq Whisper SDK → transcript string → LangChain → structured JSON. The two never overlap.

### Two service architecture
FastAPI owns AI compute (STT, LLM, Pydantic validation). Next.js owns business logic (auth, CRUD, email, TTS proxy, rate limiting, data persistence). They communicate via a single HTTP webhook. This mirrors how teams at Amazon and Atlassian isolate ML/AI services from core application services — they scale differently, deploy independently, and fail independently.

### MongoDB connection caching
Next.js API routes run serverless-style on EC2 with Docker. Without caching, every request opens a new Mongoose connection, exhausting Atlas M0's 500-connection limit in seconds under any load. The `lib/mongodb.ts` helper caches the connection on the Node.js `global` object — if one exists, it's returned immediately.

### ElevenLabs audio caching
Generated audio is stored as base64 in the Meeting document. Subsequent "Listen" clicks serve from MongoDB — instant, no ElevenLabs API call, no quota usage. The `X-Audio-Source` response header (`cache` vs `generated`) makes this observable during debugging.

---

## 💬 Interview Talking Points

**"Why two backends?"**
> FastAPI owns AI compute, Next.js owns business logic — split by responsibility, not preference. This mirrors how teams at Amazon isolate ML services. They scale differently (AI calls are CPU-bound + slow, CRUD is fast), fail independently, and can be redeployed separately. I could have done everything in Node — OpenAI has a JS SDK — but the Python AI ecosystem (LangChain, Pydantic, Whisper) is denser, and FastAPI's async model is purpose-built for slow I/O-bound LLM calls.

**"How does multi-tenancy work?"**
> Every document has a `workspaceId` field. Every query filters by it. It's enforced at two layers — the Mongoose schema (required field) and the application layer (requireAuth always attaches workspaceId from the session). A missing workspaceId filter in any query would be a cross-tenant data leak. I treat it as a hard constraint, not a soft one.

**"How does rate limiting work?"**
> I use atomic MongoDB `$inc` operations on a `usageThisMonth` subdocument on the Workspace. Before processing any meeting, I call `checkRateLimit(workspaceId, 'meetingsProcessed')` which atomically increments and checks in one operation. Two simultaneous requests cannot both read the same count, both pass, and both increment — the atomicity prevents that race condition. Monthly reset happens via a cron endpoint called on the 1st of each month.

**"How do you resolve owner names to real emails?"**
> The LLM returns names as free text — "Sarah" or "Mike from finance". I fuzzy-match these against the Employee collection using case-insensitive regex across both the name and aliases fields. The aliases array specifically handles LLM hallucinations — if the model sometimes writes "Sara" instead of "Sarah", I add "Sara" as an alias. If matched, the action item gets the real email attached, and the reminder fires to a real inbox.

**"How does email mark-as-done work without auth?"**
> Each action item has a UUID `emailToken` generated at creation. The email contains a link to `/api/actions/complete/:token`. The endpoint finds the action item by token, marks it done, and redirects to a confirmation page. No login required — the token IS the proof of identity. This is identical to how password reset links work. I also track `completedViaEmail` as a boolean for analytics.

**"Why AWS EC2 over Vercel?"**
> EC2 gives me full control — Docker, Nginx reverse proxy, SSM for secrets, ECR for images. It demonstrates skills that are actually tested in SDE interviews at product companies: containerisation, service routing, secrets management. Vercel is a great platform but it abstracts away everything that companies like Amazon want to know you understand.

**"What's the biggest scalability bottleneck?"**
> Two bottlenecks. First, Whisper transcription is CPU-bound and blocks the FastAPI worker during processing — at scale this needs a job queue (Celery + Redis) with async polling from the frontend. Second, the MongoDB `$inc` rate limiting is per-instance — if you run multiple FastAPI replicas, you'd need distributed rate limiting (Redis atomic counters) to prevent inconsistency across instances. I kept it simple for this scale but can describe both solutions in detail.

---

## 🗺️ Roadmap

- [ ] Celery + Redis job queue for async Whisper processing
- [ ] Stripe payment integration for plan upgrades
- [ ] Slack webhook — post action items to a team channel
- [ ] Recurring meeting series — link by `seriesId`, show carried-over items
- [ ] Multi-language meeting support (Whisper auto-detects, LLM translates summary)
- [ ] HTTPS via Let's Encrypt (Certbot) on EC2
- [ ] GitHub Actions CI/CD — auto build + push to ECR on `main` merge
- [ ] Company-wide discussion and scheduling (future enterprise feature)

---

<div align="center">
  <p>Built by <strong>Satyam</strong> · BTech Computer Science · Gautam Buddha University</p>
  <p>
    <a href="https://github.com/yourusername">GitHub</a> ·
    <a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
  </p>
</div>