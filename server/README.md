# Warehouse Bloom Backend

TypeScript + Express + Prisma + PostgreSQL + Redis scaffold.

## Quickstart

1. Copy envs

```bash
cp .env.example .env
```

2. Install deps and generate Prisma client

```bash
npm install
npm run prisma:generate
```

3. Run locally

```bash
npm run dev
```

4. Docker (db, redis, server)

```bash
docker-compose up --build
```

## Env Vars

- PORT
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- CLIENT_ORIGIN

## Project Structure

- `src/controllers`: Express controllers (request handling)
- `src/services`: Business logic layer
- `src/routes`: Route definitions
- `src/middlewares`: Middlewares (auth, errors, rate limit)
- `src/utils`: Utilities (logger, prisma, redis, jwt, password)
- `prisma/schema.prisma`: Database schema

## API Routes

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/items`
- POST `/api/items`
- GET `/api/items/:id`
- PUT `/api/items/:id`
- DELETE `/api/items/:id`

## Notes

This scaffold includes function signatures and comments only. Fill in zod validation, Prisma queries, JWT signing, and business logic as needed. The `report.pdf` contains ERD and DFD references for aligning the schema and flows.
