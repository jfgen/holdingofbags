# Holding of Bags — TTRPG Loot Manager

## Setup

```bash
cp backend/.env.example backend/.env
npm install
npm run db:up
npm --workspace backend run prisma:migrate
npm run dev
```

Backend: http://localhost:3001 · Frontend: http://localhost:5173
