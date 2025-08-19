import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./modules/tools";
import { setupSSEEndpoint, setupMessageEndpoint } from "./modules/transports";


const server = new McpServer({
  name: "spaceship-mcp-server",
  version: "1.0.0",
});

registerTools(server);

const app = express();

// Setup endpoints
setupSSEEndpoint(app, server);
setupMessageEndpoint(app);

const port = parseInt(process.env.PORT || "7000", 10);
app.listen(port, () => {
  console.log(`MCP server is running on port ${port}`);
});