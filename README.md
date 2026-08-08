# AI Budget Tracker

Internship evaluation project: a personal budget tracking application with a React frontend, Node.js/Express backend, and MongoDB. Gemini API integration is planned for a later step.

## Project structure

```
ai-budget-tracker/
├── client/          # React + Vite frontend (JavaScript)
├── server/          # Node.js + Express backend (ES modules)
├── .gitignore
├── README.md
└── package.json     # Root scripts for the monorepo
```

## Current status (Step 1)

Foundation only. The monorepo layout is in place with:

- A Vite React client scaffold
- A minimal Express server with a health-check endpoint (`GET /api/health`)

Not included yet: MongoDB, Gemini, authentication, business logic, or API routes beyond health.

## Getting started

Install dependencies for both packages:

```bash
npm run install:all
```

Or install each separately:

```bash
npm install --prefix client
npm install --prefix server
```

### Run the client

```bash
npm run dev:client
```

### Run the server

```bash
npm run dev:server
```

Run client and server in separate terminals for now. A combined `dev` script can be added later if needed.

### Verify the server health check

With the server running, open:

```
http://localhost:5000/api/health
```

Expected response:

```json
{ "status": "ok" }
```
