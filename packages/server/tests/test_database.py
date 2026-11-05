from sqlalchemy import text

from app.database import engine

# Test database connection with a check query
def main():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar_one()
            print(f"Database connection successful: {result}")
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()