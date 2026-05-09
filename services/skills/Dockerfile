FROM python:3.11-slim

# Architecture-neutral service
WORKDIR /app

COPY requirements.lock .
RUN pip install --no-cache-dir -r requirements.lock

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7201"]
