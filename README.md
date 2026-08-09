# AI Budget Tracker

Internship evaluation project: a personal budget tracking application with a React frontend, Node.js/Express backend, MongoDB, and Gemini-assisted transaction parsing.

## Project structure

```
ai-budget-tracker/
├── client/          # React + Vite frontend (JavaScript)
├── server/          # Node.js + Express backend (ES modules)
├── .gitignore
├── README.md
└── package.json     # Root scripts for the monorepo
```

## Current status (Step 4B)

Implemented so far:

- Budget Rules backend + frontend with exact 100% validation
- Gemini transaction parsing API (`POST /api/ai/parse-transaction`)
- Main Transactions UI with natural-language input and AI confirmation card
- Category review/change against configured Budget Rules

Not included yet: transaction persistence, dashboard, history, or authentication.

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

Edit `server/.env`:

- `PORT` defaults to `5000`
- `MONGODB_URI` is required
- `GEMINI_API_KEY` is required
- `GEMINI_MODEL` defaults to `gemini-3.6-flash`

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

### Health check

```
GET http://localhost:5000/api/health
```

### Budget Rules API

```
GET /api/budget-rules
PUT /api/budget-rules
```

Category percentages must total exactly **100%**.

### Gemini transaction parsing

Parses a natural-language sentence into structured transaction data. Does **not** save transactions.

```
POST /api/ai/parse-transaction
Content-Type: application/json
```

Request:

```json
{
  "text": "Received 50,000 from web client"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "amount": 50000,
    "direction": "income",
    "category": "Income",
    "date": "2026-08-09"
  }
}
```

Expense categories come from saved Budget Rules. Ambiguous expenses may return `"category": null`. Income always uses `"Income"`.

### Transactions UI

The Transactions screen accepts natural-language input such as “Spent 4,000 on groceries”, calls the parse API, and shows an AI confirmation card for review.

Confirming a transaction in this step reviews the parsed result in the UI only. Transactions are not saved to MongoDB yet.