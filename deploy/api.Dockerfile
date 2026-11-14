FROM python:3.12-slim
WORKDIR /app/packages/server
COPY packages/server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY packages/server/app ./app
COPY packages/server/alembic.ini .
COPY packages/server/migrations ./migrations
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
