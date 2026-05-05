FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

# Copy source
COPY . .

# Set environment variables
ENV LEDGER_PATH=/app/ledger.json

# Run the MCP server
CMD ["node", "index.js"]
