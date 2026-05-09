FROM node:20-slim

# Architecture-neutral service

WORKDIR /app

# Install dependencies
COPY package.json .
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN npm install

# Copy source
COPY . .

# Set environment variables
ENV LEDGER_PATH=/app/ledger.json

# Run the MCP server
CMD ["node", "index.js"]
