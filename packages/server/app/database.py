from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass

# read url, user and password from .env and connect to the database using SQLAlchemy
engine = create_engine(
    settings.database_url.get_secret_value(),
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)

# create a database session factory
SessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
)


# serve a database session to each API endpoint
def get_db() -> Iterator[Session]:
    with SessionLocal() as db:
        try:
            yield db
        except Exception:
            db.rollback()
            raise
