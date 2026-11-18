# TMS Linen: Automatic Linen Calculation

**Demo video:** https://www.loom.com/share/755e9e22774447e884dca69c8ae13a1a

- **`backend/`:** Node.js + Express + Prisma + MySQL. It receives reservation events and keeps the linen of open cleaning tasks up to date.
- **`app/`:** React + TypeScript (Vite). A task list, and a task page with the linen and its change history.
- **Seed data:** `listings.json`, `reservations.json`, `tasks.json` and `events.json`, in the project root.

## Requirements

- Node.js **20.19+** (Prisma 7 and Vite 7 need it)
- Yarn 1.x
- MySQL 8: either Docker, or MySQL installed locally

## 1. Start MySQL

Choose **one** option.

### Option A: with Docker

```bash
cd backend
```

```bash
docker compose up -d
```

This starts MySQL 8.4 on `localhost:3306` with user `root` and password `root`, and creates the database `tms_linen`. Wait until the container is healthy:

```bash
docker compose ps
```

### Option B: without Docker (local MySQL)

Install MySQL 8 for your OS from https://dev.mysql.com/downloads/mysql/, or with your package manager. Then make sure it is running on `localhost:3306`.

You don't need to create the database: step 2 (`yarn db:migrate`) creates it. Note the MySQL user and password you set during the installation; you need them in step 2.

## 2. Backend

```bash
cd backend
```

```bash
yarn install
```

```bash
cp .env.example .env
```

**Without Docker,** edit `DATABASE_URL` in `backend/.env` to use your MySQL user and password:

```
DATABASE_URL="mysql://<user>:<password>@localhost:3306/tms_linen"
```

With Docker, the default value already works.

Generate the Prisma client, create the tables, and load the seed data:

```bash
yarn db:generate
```

```bash
yarn db:migrate
```

```bash
yarn db:seed
```

The seed loads the 4 JSON files and calculates the linen of all Main Cleaning tasks. The expected output is `Seed completed {"listings":21,"reservations":41,"tasks":28,"task_linen":26}`.

Start the API on http://localhost:4000:

```bash
yarn dev
```

To check that it works:

```bash
curl localhost:4000/health
```

## 3. Front end

In a second terminal:

```bash
cd app
```

```bash
yarn install
```

```bash
cp .env.example .env
```

```bash
yarn dev
```

Open http://localhost:5173.

## 4. Send events

The backend must be running. Use a third terminal.

### Send one event

For example, `E-chain-guests`:

```bash
curl -s -X POST localhost:4000/events/reservation -H 'Content-Type: application/json' -d '{"event_id":"E-chain-guests","aggregate_id":"WSABFEUA-1","event_type":"Reservation.Updated","created_at":"2026-03-09T08:01:00Z","changes":[{"field":"guests_count","old":1,"new":5}]}'
```

Refresh the task page in the app to see the new linen and the change history.

### Send all events

```bash
cd backend
```

```bash
yarn replay-events
```

This sends every event from `events.json` to `POST /events/reservation`, in file order. Then it runs the date-change scenario: `PATCH /tasks/T-date-change-A` with `planned_start` 2026-03-12 10:00.

### Reset

To go back to the initial data, including the history and the processed events:

```bash
cd backend && yarn db:seed
```

## Assumptions

The implementation follows the task requirements. The task is large, and some parts of the spec can be read in more than one way, so while working on it I made a few assumptions. Here they are.

1. Every recalculation that a trigger causes is written to the history, even if the values stay the same.
2. The recalculation triggers are followed exactly as written. For example, a status change to `Canceled` or `NoShow` does not trigger a recalculation by itself; only a check-in (`InHouse`) or check-out (`CheckedOut`) does.
3. When a reservation moves to another apartment, the previous cleaning is recalculated on the new apartment only, as described in the spec.
4. Each event is saved with a unique `event_id` in the same transaction as the changes, so the same event is never applied twice. An event for an unknown reservation is rejected and can be sent again later.
5. The `old` values in `changes` are not checked; the `new` values are applied. A field whose `new` value equals the stored value is ignored, so it doesn't trigger a recalculation.
6. Only the next reservation is considered, skipping `Canceled` and `NoShow` ones. It counts if it arrives at or after `planned_start` and less than 72 hours after it. Otherwise the default amount is used.
