const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} = require("@modelcontextprotocol/sdk/types.js");
const fs = require("fs");
const path = require("path");

const LEDGER_PATH = process.env.LEDGER_PATH || "./ledger.json";

const server = new Server({
  name: "rashizun-mcp-core",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// List Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_project_summary",
        description: "Returns a high-level summary of the Rashizun project state",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_sdlc_phase",
        description: "Returns the current SDLC phase",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_architectural_decisions",
        description: "Lists all architectural decisions from the ledger",
        inputSchema: { type: "object", properties: {} }
      }
    ]
  };
});

// Call Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!fs.existsSync(LEDGER_PATH)) {
      throw new McpError(ErrorCode.InternalError, `Ledger file not found at ${LEDGER_PATH}`);
    }

    let ledger;
    try {
      ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf-8"));
    } catch (e) {
      throw new McpError(ErrorCode.InternalError, `Failed to parse ledger: ${e.message}`);
    }
    switch (request.params.name) {
      case "get_project_summary": {
        const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
        return {
          content: [{
            type: "text",
            text: `Project: ${ledger.name}\nDescription: ${pkg.description}\nCurrent Phase: ${ledger.sdlc_phase}\nCreated: ${ledger.created_at}`
          }]
        };
      }
      case "get_sdlc_phase":
        return {
          content: [{ type: "text", text: ledger.sdlc_phase }]
        };
      case "get_architectural_decisions": {
        const decisions = ledger.architectural_decisions.map(d => `[${d.id}] ${d.decision} - ${d.status}`).join("\n");
        return {
          content: [{ type: "text", text: decisions }]
        };
      }
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
