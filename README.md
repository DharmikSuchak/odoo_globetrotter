# GlobeTrotter

> AI-assisted personalized travel planning web app — Hackathon MVP

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS     |
| Backend   | Node.js + Express                  |
| Database  | PostgreSQL 15 + Prisma ORM         |
| Cache     | Redis 7                            |
| Infra     | Docker + Docker Compose            |
| AI        | Google Gemini API (coming next)    |

---

## Quick Start

### 1. Clone & Configure

```bash
git clone <repo-url>
cd odoo_hackathon
cp .env.example .env
# Edit .env and fill in GEMINI_API_KEY and JWT_SECRET
```

### 2. Start All Services

```bash
docker-compose up --build
```

This starts:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **Express API** on port `5000`
- **React Client** on port `5173`

### 3. Run Database Migrations + Seed

In a separate terminal (after containers are healthy):

```bash
# Run Prisma migrations
docker exec globetrotter_server npx prisma migrate dev --name init

# Seed the database (cities catalog + activities catalog)
docker exec globetrotter_server node prisma/seed.js
```

### 4. Verify Everything Works

```bash
# Check API health
curl http://localhost:5000/api/health
# Expected: {"success":true,"message":"GlobeTrotter API is running"}

# Open frontend
open http://localhost:5173
```

---

## Stop Services

```bash
# Stop without removing data
docker-compose down

# Stop AND remove volumes (wipes DB)
docker-compose down -v
```

---

## Development

### Server (Express API)

```bash
cd server
npm install
npm run dev   # nodemon hot-reload on port 5000
```

### Client (Vite + React)

```bash
cd client
npm install
npm run dev   # Vite HMR on port 5173
```

### Prisma Studio (DB GUI)

```bash
docker exec -it globetrotter_server npx prisma studio
# Opens at http://localhost:5555
```

---

## Database Schema

```
User → Trip (1:many)
Trip → Stop (1:many)
Stop → City (many:1)
Stop → Activity (1:many)
City   — standalone catalog
Activity — nullable stopId for catalog items
```

---

## Project Structure

```
odoo_hackathon/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   └── index.js
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
└── client/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        └── pages/
            └── LandingPage.jsx
```
