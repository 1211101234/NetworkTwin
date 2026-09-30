# Network Digital Twin

A standalone, synthetic-first telecom network twin for spatial awareness, live-event simulation, impact analysis, and scenario planning.

**Project tracking:** open [`ROADMAP.md`](ROADMAP.md) in VS Code for the current completion
dashboard, active work, and links to detailed evidence.

## Repository layout

- `frontend/` — Angular, PrimeNG, NgRx, MapLibre, and deck.gl client
- `backend/` — Django REST Framework API and OpenAPI schema
- `simulation/` — deterministic network and event generation (Phase 1 onward)
- `docs/` — architecture, decisions, API contract, and dependency records

## Prerequisites

- Node.js 24 and npm 11
- Python 3.14
- [uv](https://docs.astral.sh/uv/)

## Run locally

Start the API:

```bash
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`. API documentation is available at `http://localhost:8000/api/docs/`.

## Verify

```bash
cd backend
uv run ruff check .
uv run pytest

cd ../frontend
npm test -- --watch=false
npm run build
```

The default SQLite database is for local development only. No operational or customer data belongs in this repository.
