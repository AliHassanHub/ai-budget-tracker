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

## Current status (Step 2)

Backend and environment foundation:

- Modular Express app (`app.js` + `index.js`)
- CORS, JSON body parsing, health-check, 404, and centralized error handling
- Zod-validated environment configuration
- MongoDB config module prepared (connection not established yet)

Not included yet: database models, budget rules, transactions, Gemini, authentication, or dashboard features.

## Development Setup

### Requirements

- Node.js 18 or newer
- npm

### Install dependencies

From the repository root:

```bash
npm run install:all
```

Or install each package separately:

```bash
npm install --prefix client
npm install --prefix server
```

### Configure the server environment

```bash
cp server/.env.example server/.env
```

On Windows (PowerShell):

```powershell
Copy-Item server/.env.example server/.env
```

Edit `server/.env` as needed. `PORT` defaults to `5000`. `MONGODB_URI` and `GEMINI_API_KEY` are optional for now and can remain empty.

Do not commit `server/.env`.

### Start the server

```bash
npm run dev:server
```

### Start the client

```bash
npm run dev:client
```

Run client and server in separate terminals.

### Health check

With the server running:

```
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "AI Budget Tracker API is running"
}
```
