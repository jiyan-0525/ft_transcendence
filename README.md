*This project has been created as part of the 42 curriculum by xhuang, jiyawang, jpflegha, julcalde, wedu.

# ft_transcendence



## Description

**ft_transcendence** is a community platform that brings social interaction, content sharing and local activities together. Its goal is to give users one place to connect with others, share information, organise events and discover second-hand items.

The planned experience includes:

- User accounts and profiles.
- Posts, articles, comments and Likes.
- Friendships, one-to-one messaging and notifications.
- Communities and community content.
- Events and participation.
- Marketplace listings and seller contact.

The project is under active development. The current backend foundation includes a health endpoint, database models and migrations for users and sessions, password hashing, validation schemas and backend CI. A React + TypeScript frontend scaffold and its CI job also exist. The user-facing features listed above are planned; they are not yet available as a complete application.

## Technical choices

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript and Vite (foundation scaffolded) |
| Backend | Python and FastAPI |
| Database | PostgreSQL |
| ORM and migrations | SQLAlchemy and Alembic |
| Password hashing | Argon2id |
| Local database environment | Docker Compose |
| Continuous integration | GitHub Actions |

## Instructions

These instructions run the current backend locally. The React application shell exists; application routes and production deployment are still under development.

### Prerequisites

- Git and Make.
- Python 3.12, including `venv` and `pip`.
- Docker with Docker Compose.
- Available local ports `5432` (database) and `8000` (API).

The commands below assume a macOS or Linux shell and must be run from the repository root.

### Installation

```bash
git clone https://github.com/jiyan-0525/ft_transcendence.git
cd ft_transcendence
make setup PYTHON=python3.12
```

`make setup` creates `.venv` and copies `.env.example` to `.env` if they do not exist, then installs the backend dependencies and pytest. If your default `python3` is Python 3.12, you can simply use `make setup`.

Edit `.env` to configure the database credentials and application settings. The credentials in `DATABASE_URL` must match `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB`. Keep `.env` out of version control.

### Execution

```bash
make up
make migrate
make dev
```

These commands start PostgreSQL, apply the database migrations and run FastAPI with automatic reload.

- Health endpoint: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Interactive API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Use `make dev PORT=8001` to select a different API port. Press `Ctrl-C` to stop the API and run `make down` to stop the database. Database data is retained between restarts.

### Tests and useful commands

With the database running and migrations applied, run:

```bash
make test
```

This checks database connectivity and model/migration consistency, then runs the backend tests. It uses the database configured in your environment.

| Command | Purpose |
|---|---|
| `make help` | List available commands |
| `make setup` | Prepare the local environment and dependencies |
| `make up` | Start PostgreSQL |
| `make down` | Stop PostgreSQL while retaining data |
| `make db` | Open the PostgreSQL shell |
| `make migrate` | Apply pending database migrations |
| `make dev` | Start the backend development server |
| `make test` | Run backend checks and tests |
| `make logs` | Follow database logs |

### Frontend

The React + TypeScript app lives in `packages/web` and requires Node 22.

```bash
cd packages/web
npm install
npm run dev
```

The Vite dev server runs on [http://localhost:5173](http://localhost:5173) and
proxies `/api` and `/ws` to `http://127.0.0.1:8000`. Start FastAPI with
`make dev` for live requests. While the auth routes are still being built, set
`VITE_USE_MOCKS=true` in `packages/web/.env.local`.

The frontend includes a reconnecting WebSocket client skeleton in
`packages/web/src/lib/ws.ts` (typed frames, heartbeat, exponential backoff with
jitter, close on logout). It does not connect until the user is authenticated.

| Command | Purpose |
|---|---|
| `make web-install` | Install frontend dependencies |
| `make web-dev` | Start the Vite dev server |
| `make web-lint` | Lint the frontend |
| `make web-typecheck` | Type-check the frontend |
| `make web-test` | Run frontend tests |
| `make web-build` | Build the frontend |

## Project documentation

The design documents describe the intended product and distinguish implemented functionality, agreed decisions and questions still under discussion.

| Document | Contents |
|---|---|
| [Product V1](docs/product-v1.md) | Product scope, feature overview and decision list |
| [User flows](docs/user-flows.md) | User journeys and interaction rules |
| [Data model](docs/data-model.md) | Existing schema, proposed models and entity relationships |

Backend code, tests and migrations are in `packages/server/`. The frontend directory is `packages/web/`. CI configuration is in `.github/workflows/`.

## Resources

- [React documentation](https://react.dev/learn) — components and user interface development.
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — types and language fundamentals.
- [FastAPI documentation](https://fastapi.tiangolo.com/) — API development, validation and dependencies.
- [PostgreSQL documentation](https://www.postgresql.org/docs/) — relational databases, queries and constraints.
- [SQLAlchemy documentation](https://docs.sqlalchemy.org/) and [Alembic documentation](https://alembic.sqlalchemy.org/) — database mapping and schema migrations.
- [argon2-cffi documentation](https://argon2-cffi.readthedocs.io/) — password hashing and verification.
- [Docker Compose documentation](https://docs.docker.com/compose/) — local service configuration and execution.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — authentication, session management and application security guidance.

### Use of AI

AI assistance has been used during development for:

- **Product and design documentation:** drafting and revising the Product V1, user flows and data model documents, and identifying decisions requiring team discussion.
- **Backend development guidance:** explaining and reviewing configuration, SQLAlchemy models, Alembic migrations, password hashing and testing approaches.
- **Development tooling:** assisting with GitHub Actions troubleshooting, drafting the Makefile and updating this README.

These uses describe the work covered by the current development discussions. The team must review suggestions, validate code and commands, and keep this record aligned with its actual use of AI as the project evolves. Proposed designs and generated drafts do not establish that a feature has been implemented or tested.
