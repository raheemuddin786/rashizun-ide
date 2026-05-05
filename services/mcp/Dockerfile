FROM node:20-slim

WORKDIR /app

RUN npm install -g @modelcontextprotocol/sdk

COPY . .

# Run the MCP server
# This will likely be a script that starts a Node.js process using the SDK
CMD ["node", "index.js"]
