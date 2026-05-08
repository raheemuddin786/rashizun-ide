FROM python:3.11-slim

# Architecture-neutral service
ARG TARGETARCH

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    lancedb \
    tantivy \
    ollama \
    fastapi \
    uvicorn \
    sentence-transformers

COPY . .

# Start the RAG API server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7200"]
