import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Request, Response, Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const transports = new Map<string, SSEServerTransport>();

export function setupSSEEndpoint(app: Express, server: McpServer) {
  app.get("/sse", async (_: Request, res: Response) => {
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);

    res.on("close", () => {
      transports.delete(transport.sessionId);
    });

    await server.connect(transport);

  });
}

export function setupMessageEndpoint(app: Express) {
  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (transport) {
      try {
        await transport.handlePostMessage(req, res);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(400).send("No transport found for sessionId");
    }
  });
}
