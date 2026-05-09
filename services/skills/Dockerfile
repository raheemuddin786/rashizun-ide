FROM python:3.11-slim

# Architecture-neutral service
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY requirements.lock .
RUN pip install --no-cache-dir -r requirements.lock

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7201"]
