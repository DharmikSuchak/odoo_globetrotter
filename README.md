# 🌍 GlobeTrotter

**An AI-assisted, multi-city travel planner with real-time budget tracking and smart itinerary optimization.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white&style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white&style=flat-square)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google&logoColor=white&style=flat-square)

---

**Overview:**

Planning a multi-city trip involves juggling destinations, daily schedules, activity budgets, and travel balance — all at once. GlobeTrotter brings that under one roof.

Users build day-by-day itineraries across multiple cities, let Google Gemini AI generate a balanced initial schedule grounded in a real activity catalog, and then track spending in real time with a live budget breakdown. A computed **Trip Health Score** monitors itinerary balance and budget efficiency, while AI Optimize can suggest specific adjustments when something's off. Trips can be shared publicly via a link — and copied by other users into their own accounts.

---

**Key Features:**

- **Secure Authentication:** Signup and login with JWT-based sessions. Passwords hashed with bcrypt. In-memory token storage prevents XSS exposure.
- **Multi-city Trip Builder:** Add as many stops as needed across the supported city catalog. Activities are organized per stop, per day.
- **AI Itinerary Generation:** One click generates a complete, day-by-day itinerary using Google Gemini. The AI is constrained to the real seeded catalog — it can only assign activities that are valid for each stop's city. No hallucinated places.
- **AI Itinerary Optimization:** After reviewing computed Trip Health warnings, a second AI call produces a specific, actionable suggestion (e.g. "Move X from Day 2 to Day 3") which can be applied in one click.
- **Trip Health Score:** A backend-computed 0–100 composite score weighing itinerary coverage, daily activity balance, and budget utilization. Displayed with color-coded status and plain-English recommendations.
- **Live Budget Tracking:** Real-time breakdown of total budget vs. spent, organized by activity category and by day. Includes a progress bar and pie chart visualization.
- **Public Trip Sharing:** Toggle any trip to public to generate a unique, shareable link. The public view is read-only and exposes zero private user data.
- **Copy-to-Account:** Logged-in users viewing a public trip can clone the full itinerary into their own account with one click.
- **Profile Management:** Update display name and upload a profile photo. All users get an auto-generated initials avatar by default.
- **Admin Analytics Dashboard:** Role-gated admin panel showing platform-wide stats, charts for popular cities and activity categories, and a full registered user directory.
- **Rate Limiting:** Redis-backed sliding-window rate limits on login (5 req/min) and signup (10 req/min) endpoints to prevent brute force.

---

**Tech Stack:**

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR in development; lean production build |
| Styling | Tailwind CSS | Utility-first keeps component styles co-located and consistent |
| Routing | React Router v6 | Nested routes map cleanly to the dashboard layout pattern |
| Backend | Node.js + Express | Lightweight; straightforward REST conventions |
| ORM | Prisma | Type-safe queries, automatic migrations, schema-first model |
| Database | PostgreSQL | Chosen over NoSQL because trip → stop → activity → budget data is inherently relational and benefits from foreign-key constraints and cascading deletes |
| Cache / Rate Limiting | Redis | Fast in-memory store purpose-built for sliding-window counters |
| AI | Google Gemini API | Structured JSON output mode makes generation reliable without post-processing fragility |
| Infrastructure | Docker + Docker Compose | Four-service setup runs identically on any machine |

---

**Architecture:**

Four Docker services talk to each other on an internal bridge network:

```
┌─────────────────────────────────────────────────────────┐
│                     docker-compose                       │
│                                                          │
│  ┌──────────┐   HTTP    ┌──────────────────────────┐    │
│  │  client  │ ────────► │         server           │    │
│  │ React    │  :5173    │   Node / Express         │    │
│  │ + Vite   │           │                          │    │
│  └──────────┘           │  routes / middleware /   │    │
│                         │  validators              │    │
│                         └────────┬─────────┬───────┘    │
│                                  │         │             │
│                         Prisma   │         │  ioredis    │
│                                  ▼         ▼             │
│                         ┌──────────┐  ┌────────┐        │
│                         │ postgres │  │ redis  │        │
│                         │  :5432   │  │  :6379 │        │
│                         └──────────┘  └────────┘        │
└─────────────────────────────────────────────────────────┘
```

The React client proxies all `/api/*` requests to the Express server via Vite's dev proxy. The Gemini API is called from the server only — the API key never reaches the client.

---

**Getting Started:**

Prerequisites: [Docker](https://docs.docker.com/get-docker/) and a [Google AI Studio](https://aistudio.google.com/) API key.

**1. Clone the repository:**

```bash
git clone https://github.com/DharmikSuchak/odoo_globetrotter.git
cd odoo_globetrotter
```

**2. Configure environment variables:**

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key from AI Studio |
| `JWT_SECRET` | Any long random string (e.g. `openssl rand -hex 32`) |
| `DATABASE_URL` | Pre-filled for Docker; change only if using an external DB |

**3. Start all services:**

```bash
docker compose up --build
```

**4. Seed the database:**

```bash
docker compose run --rm server node prisma/seed.js
```

The seed output prints the admin credentials — note them.

**5. Open the app:**

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API health check | http://localhost:5000/api/health |

---

**Project Structure:**

```
odoo_globetrotter/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Shared components (ProtectedRoute)
│       ├── context/         # AuthContext — JWT + user state management
│       ├── layouts/         # DashboardLayout — sidebar + outlet
│       └── pages/           # One file per route
│
├── server/                  # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database model definitions
│   │   └── seed.js          # City + activity catalog seeder + admin account
│   └── src/
│       ├── lib/             # Prisma client, Redis client singletons
│       ├── middleware/       # requireAuth (JWT), rateLimiter (Redis)
│       ├── routes/          # auth, trips, stops, activities, cities, public, profile, admin
│       └── validators/      # Input validation for auth routes
│
├── docker-compose.yml
└── .env.example
```

---

**Security Highlights:**

Security was treated as a first-class requirement, not an afterthought:

- **Password hashing:** bcrypt with 12 salt rounds. Plaintext passwords are never stored or logged.
- **JWT authentication:** Tokens are signed with `JWT_SECRET` from environment variables. Stored in memory (never `localStorage`) to prevent XSS extraction.
- **Rate limiting:** Redis sliding-window counters on `/api/auth/login` (5 req/min per IP) and `/api/auth/signup` (10 req/min per IP).
- **Ownership enforcement:** Every trip, stop, and activity mutation verifies that the requesting user owns the resource. A valid JWT is not sufficient alone.
- **Role-based access control:** Admin endpoints apply a `requireAdmin` middleware server-side. UI hiding is a courtesy only; the API enforces it independently.
- **Public endpoint data isolation:** The public trip share endpoint explicitly selects only safe fields. Owner email, password hash, and budget details are never included in the response.
- **Input validation:** All POST/PUT routes validate and sanitize inputs server-side. Prisma's parameterized queries prevent SQL injection by design.
- **No committed secrets:** `.env` is in `.gitignore`. All secrets are loaded from environment variables only.

---

**AI Integration:**

GlobeTrotter uses Google Gemini in two distinct, structured ways — neither is a freeform chatbot.

*Itinerary Generation (`POST /api/trips/:id/ai-generate`):* When a user has added stops but no activities, they can trigger AI generation. Before calling Gemini, the server fetches the trip structure, queries the activity catalog filtered strictly to the stop cities, and passes this constrained data along with a strict JSON schema to Gemini. The AI can only suggest real, pre-validated activities that are geographically appropriate to each stop.

*Itinerary Optimization (`POST /api/trips/:id/ai-optimize`):* The server computes a Trip Health Score by analyzing activity distribution and budget utilization. Health warnings are passed to Gemini alongside the current itinerary. Gemini returns a single, specific, structured suggestion (e.g. moving one activity to a lighter day) which the user can apply or dismiss in one click.

Both integrations produce deterministic database writes from structured outputs.

---

**Future Scope:**

The following are deliberate scoping decisions for the hackathon timeline:

- **Account recovery:** Forgot password via email (Resend or SendGrid)
- **Flight and hotel integration:** Real booking options via Amadeus or Skyscanner
- **Real-time collaboration:** Socket.io for multi-user trip editing with presence indicators
- **Community feed:** Public trip discovery, filterable by destination or category
- **Scalable photo storage:** S3 or Cloudinary replacing the current base64-in-database approach
- **Mobile / PWA:** Offline caching for use in low-signal travel environments
- **Expanded catalog:** Live travel data API replacing the hand-curated seed catalog
- **Admin actions:** Promote/demote users and delete content (currently read-only analytics)
- **Notifications:** Budget alerts and trip reminders via push or email

---

**Team & Credits:**

Built by **Dharmik Suchak**

Submitted to the **odoo Hackathon:** GlobeTrotter problem statement.
