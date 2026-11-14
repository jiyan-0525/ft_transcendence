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

The Week 1 baseline implements account registration, session-based login and logout, and a minimal authenticated text feed. The remaining capabilities are tracked in [Product V1](docs/product-v1.md).

## Technical choices

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript and Vite |
| Backend | Python and FastAPI |
| Database | PostgreSQL |
| ORM and migrations | SQLAlchemy and Alembic |
| Password hashing | Argon2id |
| Local database environment | Docker Compose |
| Continuous integration | GitHub Actions |

## Instructions

Run the frontend and API locally against PostgreSQL, or use the local HTTPS stack.

### Prerequisites

- Git, Make and Node.js 22.
- Python 3.12, including `venv` and `pip`.
- Docker with Docker Compose.
- Available local ports `5432` (database) and `8000` (API), plus `5173` (Vite) or `8443` (HTTPS).

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
- Database readiness: `GET /api/status`
- Interactive API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Keep port 8000 for the default Vite proxy. Press `Ctrl-C` to stop the API and run `make down` to stop the database. Database data is retained between restarts.

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

### Frontend and local HTTPS

Run `make web-install` once. In a separate terminal from `make dev`, run `make web-dev` and open [http://localhost:5173](http://localhost:5173). The development target uses the real API. Run `make web-test` for frontend tests using mock authentication.

For the local HTTPS stack, configure `CONTAINER_DATABASE_URL` in root `.env` and run `make stack-up`. Open [https://localhost:8443](https://localhost:8443). See the [backend handoff](docs/handoff/week-1-backend.md) for the container database URL and local certificate setup. Run `make stack-down` to stop the stack while preserving database data.

## Project documentation

The design documents describe the intended product and distinguish implemented functionality, agreed decisions and questions still under discussion.

| Document | Contents |
|---|---|
| [Product V1](docs/product-v1.md) | Product scope, feature overview and decision list |
| [User flows](docs/user-flows.md) | User journeys and interaction rules |
| [Data model](docs/data-model.md) | Existing schema, proposed models and entity relationships |

Backend code, tests and migrations are in `packages/server/`. The frontend directory is `packages/web/`. CI configuration is in `.github/workflows/`.

See also [Architecture](docs/architecture.md), [API protocol](docs/protocol.md) and the [Week 1 handoff](docs/handoff/week-1-backend.md).

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
