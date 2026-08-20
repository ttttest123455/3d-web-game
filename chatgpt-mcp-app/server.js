import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

const mcp = new McpServer({ name: "3D Web Game Assistant", version: "1.0.0" });

mcp.tool(
  "game_status",
  "Return a small status summary for the 3D web game project.",
  {},
  async () => ({
    content: [{
      type: "text",
      text: JSON.stringify({
        project: "ttttest123455/3d-web-game",
        status: "ready",
        purpose: "Demo ChatGPT custom MCP app"
      }, null, 2)
    }]
  })
);

mcp.tool(
  "echo",
  "Echo text back to verify the ChatGPT app connection.",
  { text: z.string() },
  async ({ text }) => ({ content: [{ type: "text", text }] })
);

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.type("text/plain").send("3D Web Game Assistant MCP server is running.");
});

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => transport.close());
  await mcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server listening on :${port}`));
