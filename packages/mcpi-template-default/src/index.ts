import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create a new MCP server
const server = new McpServer({
  name: "hello-world-mcp",
  version: "1.0.0",
});

// Implement the say_hello tool
server.tool("say_hello", { name: z.string().optional() }, async (params) => {
  const name = params?.name || "World";
  return {
    greeting: `Hello, ${name}! Welcome to the Model Context Protocol.`,
  };
});

// Use stdio for communication
const transport = new StdioServerTransport();

// Start the server
async function run() {
  try {
    await server.connect(transport);
    console.error("MCP server connected via stdio"); // Error stream used for logging
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

run();
