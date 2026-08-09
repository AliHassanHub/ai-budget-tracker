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

## Current status (Step 4G)

Implemented so far:

- Budget Rules, Gemini parsing, transaction review/confirm, and persistence with income allocation snapshots
- Current-month dashboard summary API and Dashboard UI
- Read-only transaction history API and History UI
- After a successful confirm, Dashboard and History invalidate and refetch from the backend (no page refresh)

Not included yet: filtering/search, or authentication.

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
```

### Transactions UI

The Transactions screen accepts natural-language input, calls the parse API, shows an AI confirmation card, and on **Confirm transaction** persists via `POST /api/transactions`.

The backend remains the source of truth for income allocations. Dashboard and Transaction History UIs are not implemented yet.

### Transaction persistence

Creates a transaction document in MongoDB. The backend recalculates income allocations from the current Budget Rules and stores an immutable snapshot. Expense transactions save with an empty `allocations` array.

```
POST /api/transactions
Content-Type: application/json
```

Income request:

```json
{
  "originalSentence": "Received 50,000 from web client",
  "amount": 50000,
  "direction": "income",
  "category": "Income",
  "date": "2026-08-09"
}
```

Example income response:

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "...",
      "originalSentence": "Received 50,000 from web client",
      "amount": 50000,
      "direction": "income",
      "category": "Income",
      "date": "2026-08-09",
      "allocations": [
        { "category": "Needs", "percentage": 40, "amount": 20000 },
        { "category": "Wants", "percentage": 30, "amount": 15000 },
        { "category": "Savings", "percentage": 20, "amount": 10000 },
        { "category": "Investment", "percentage": 10, "amount": 5000 }
      ]
    }
  }
}
```

Expense request:

```json
{
  "originalSentence": "Spent 4,000 on groceries",
  "amount": 4000,
  "direction": "expense",
  "category": "Needs",
  "date": "2026-08-09"
}
```

Expense transactions store `"allocations": []`.

### Dashboard summary API

```
GET /api/dashboard
```

Returns the **current-month** budget summary for categories from the current Budget Rules.

- `summary.totalIncome` is the sum of current-month income transaction amounts
- `summary.totalSpent` is the sum of current-month expense transaction amounts
- `summary.available = totalIncome - totalSpent`
- `allocated` comes from saved income allocation snapshots in the current month
- `used` comes from current-month expense amounts
- `remaining = allocated - used` (may be negative when overspent)

The Dashboard shows a compact three-metric summary (Total Income, Total Spent, Available) above dynamic category cards with status badges (`Healthy` / `Watch` / `Over budget`).

### Dashboard UI

The Dashboard is the default home screen. It loads `GET /api/dashboard` and renders one card per Budget Rules category with allocated, used, remaining, and usage status (`healthy` / `warning` / `over`).

### Transaction history API

```
GET /api/transactions
```

Read-only list of saved transactions, newest first (`createdAt` descending).

Each item includes:

- `id`
- `originalSentence`
- `amount`
- `direction`
- `category`
- `date`
- `createdAt`

The History screen loads this endpoint and shows original sentence, amount, direction, category, and date. Filtering and search are not implemented.

### Live Dashboard and History updates

After `POST /api/transactions` succeeds, the app increments a client-side transaction revision. Dashboard and History treat their data as stale and refetch:

- `GET /api/dashboard`
- `GET /api/transactions`

No browser refresh is required. This is client-side invalidation/refetch, not WebSockets or server push.
