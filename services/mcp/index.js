const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");

const server = new Server({
  name: "rashizun-mcp-core",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {},
    tools: {},
    prompts: {}
  }
});

// Example tool: Get SDLC Phase
server.tool("get_sdlc_phase", "Returns the current SDLC phase of the project", {}, async () => {
  return {
    content: [{ type: "text", text: "Development" }]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Rashizun MCP Server running on stdio");
}

main().catch(console.error);
