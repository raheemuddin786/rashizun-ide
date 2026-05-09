const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} = require("@modelcontextprotocol/sdk/types.js");
const fs = require("fs");
const path = require("path");
const express = require("express");

// Twelve-Factor Config
const LEDGER_PATH = process.env.LEDGER_PATH || path.join(__dirname, "../../.rashizun/ledger.json");
const ROOT_PACKAGE_PATH = path.join(__dirname, "../../package.json");
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://rag-engine:7200";
const SKILLS_SERVICE_URL = process.env.SKILLS_SERVICE_URL || "http://skill-registry:7201";
const PORT = process.env.PORT || 7100;

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
      },
      {
        name: "shadow_build",
        description: "Runs a background shadow build to verify project integrity",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "index_knowledge",
        description: "Indexes workspace knowledge into the RAG engine",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Content to index" },
            metadata: { type: "object", description: "Metadata for the document" }
          },
          required: ["content"]
        }
      },
      {
        name: "search_knowledge",
        description: "Searches the RAG engine for relevant knowledge",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" }
          },
          required: ["query"]
        }
      },
      {
        name: "health_check",
        description: "Performs a system health check across all microservices",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "list_skills",
        description: "Lists all available automation skills from the registry",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "run_skill",
        description: "Executes a specific automation skill",
        inputSchema: {
          type: "object",
          properties: {
            skill_name: { type: "string", description: "Name of the skill to execute" },
            args: { type: "object", description: "Arguments for the skill" }
          },
          required: ["skill_name"]
        }
      }
    ]
  };
});

// Call Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const safeReadJson = (filePath) => {
      if (!fs.existsSync(filePath)) {
        throw new McpError(ErrorCode.InternalError, `File not found at ${filePath}`);
      }
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        throw new McpError(ErrorCode.InternalError, `Failed to parse ${filePath}: ${e.message}`);
      }
    };

    switch (request.params.name) {
      case "get_project_summary": {
        const ledger = safeReadJson(LEDGER_PATH);
        const pkg = safeReadJson(ROOT_PACKAGE_PATH);
        
        const provenance = ledger.architectural_provenance || {};
        const adaptations = (provenance.adaptations || []).map(a => `- [${a.type}] ${a.details}`).join('\n');
        
        return {
          content: [{
            type: "text",
            text: `Project: ${ledger.name}\n` +
                  `Description: ${pkg.description}\n` +
                  `Current Phase: ${ledger.sdlc_phase}\n` +
                  `Created: ${ledger.created_at}\n` +
                  `--- Architectural Memory (Protocol 2.2) ---\n` +
                  `Initial Fork: ${provenance.initial_fork?.source || 'N/A'}\n` +
                  `Adaptations:\n${adaptations || 'No historical logs found.'}\n` +
                  `Adaptation Deltas: ${ledger.adaptation_deltas || 'None recorded.'}\n` +
                  `Prompt History: ${ledger.prompt_history?.length || 0} interactions stored.`
          }]
        };
      }
      case "get_sdlc_phase": {
        const ledger = safeReadJson(LEDGER_PATH);
        return {
          content: [{ type: "text", text: ledger.sdlc_phase }]
        };
      }
      case "get_architectural_decisions": {
        const ledger = safeReadJson(LEDGER_PATH);
        const decisions = ledger.architectural_decisions.map(d => `[${d.id}] ${d.decision} - ${d.status}`).join("\n");
        return {
          content: [{ type: "text", text: decisions }]
        };
      }
      case "shadow_build": {
        const { execSync } = require("child_process");
        const scriptPath = path.join(__dirname, "../../scripts/shadow-build.sh");
        try {
          const output = execSync(scriptPath, { encoding: "utf8" });
          return {
            content: [{ type: "text", text: output }]
          };
        } catch (e) {
          return {
            content: [{ type: "text", text: `❌ Shadow Build Failed:\n${e.stdout || e.message}` }],
            isError: true
          };
        }
      }
      case "index_knowledge": {
        const { content, metadata } = request.params.arguments;
        
        // Security Guardrail: Validate inputs
        if (!content || typeof content !== 'string' || content.length < 5) {
            throw new McpError(ErrorCode.InvalidParams, "Content must be a non-empty string (min 5 chars)");
        }
        if (metadata && typeof metadata !== 'object') {
            throw new McpError(ErrorCode.InvalidParams, "Metadata must be a JSON object");
        }

        const response = await fetch(`${RAG_SERVICE_URL}/index`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, metadata: metadata || {} })
        });
        const result = await response.json();
        return {
          content: [{ type: "text", text: `RAG Service: ${result.message || "Indexed"}. Preview: ${result.content_preview || ""}` }]
        };
      }
      case "search_knowledge": {
        const { query } = request.params.arguments;
        const response = await fetch(`${RAG_SERVICE_URL}/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();
        return {
          content: [{ 
            type: "text", 
            text: `RAG Service: Found ${result.results?.length || 0} relevant snippets for "${query}".`
          }]
        };
      }
      case "list_skills": {
        const response = await fetch(`${SKILLS_SERVICE_URL}/skills`);
        const result = await response.json();
        return {
          content: [{ type: "text", text: `Available Skills: ${result.skills?.join(", ") || "None"}` }]
        };
      }
      case "run_skill": {
        const { skill_name, args } = request.params.arguments;
        const response = await fetch(`${SKILLS_SERVICE_URL}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill: skill_name, arguments: args })
        });
        const result = await response.json();
        return {
          content: [{ type: "text", text: `Skill Result [${skill_name}]: ${result.output || "Completed"}` }]
        };
      }
      case "health_check": {
        const services = [
            { name: "RAG Engine", url: `${RAG_SERVICE_URL}/healthz` },
            { name: "Skill Registry", url: `${SKILLS_SERVICE_URL}/healthz` }
        ];
        
        const results = await Promise.all(services.map(async s => {
            try {
                const res = await fetch(s.url, { signal: AbortSignal.timeout(2000) });
                return { name: s.name, status: res.ok ? "Healthy" : "Unhealthy" };
            } catch (e) {
                return { name: s.name, status: "Offline" };
            }
        }));

        const summary = results.map(r => `${r.name}: ${r.status}`).join("\n");
        const allHealthy = results.every(r => r.status === "Healthy");

        return {
          content: [{ type: "text", text: summary }],
          status: allHealthy ? "healthy" : "unhealthy"
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

const app = express();
app.use(express.json());
let transport;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "rashizun-mcp-core" });
});

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  await transport.handlePostMessage(req, res);
});

// REST Bridge for IDE Extension
app.post("/call", async (req, res) => {
    const { name, arguments: args } = req.body;
    try {
        const result = await server.executeTool({ name, arguments: args });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
  console.log(`MCP SSE Server listening on port ${PORT}`);
});

