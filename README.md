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

## Current status (Step 3B-2)

Budget Rules end-to-end for this checkpoint:

- Backend Budget Rules API with exact 100% validation
- React Budget Rules UI with live totals, validation, and persistence
- App shell with Budget Rules as the current primary screen

Not included yet: transactions, Gemini, authentication, or dashboard features.

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

Edit `server/.env` as needed. `PORT` defaults to `5000`. `MONGODB_URI` is required. `GEMINI_API_KEY` remains optional for now.

Do not commit `server/.env`.

### Start the server

```bash
npm run dev:server
```

### Start the client

```bash
npm run dev:client
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so the backend should be running as well.

Run client and server in separate terminals.

### Health check

```
GET http://localhost:5000/api/health
```

```json
{
  "success": true,
  "message": "AI Budget Tracker API is running"
}
```

### Budget Rules API

#### Get current rules

```
GET http://localhost:5000/api/budget-rules
```

If none exist yet:

```json
{
  "success": true,
  "data": {
    "categories": []
  }
}
```

#### Create or replace rules

```
PUT http://localhost:5000/api/budget-rules
Content-Type: application/json
```

```json
{
  "categories": [
    { "name": "Household", "percentage": 30 },
    { "name": "Savings", "percentage": 20 },
    { "name": "Charity", "percentage": 10 },
    { "name": "Entertainment", "percentage": 10 },
    { "name": "Investment", "percentage": 30 }
  ]
}
```

Category percentages must total exactly **100%**. Invalid requests are rejected and do not change any previously saved configuration.
