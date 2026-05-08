FROM python:3.11-slim

# Architecture-neutral service
ARG TARGETARCH

WORKDIR /app

RUN pip install --no-cache-dir fastapi uvicorn

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7201"]
