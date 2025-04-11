#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create a new MCP server
const server = new McpServer(
  {
    name: "test-mcp",
    version: "0.1.0",
  },
  {
    instructions:
      "Use these tools to test your ability to communicate with Model Context Protocol (MCP) servers.",
  }
);

// Implement the ping_pong tool
server.tool(
  "ping_pong",
  "Ping the server and receive a pong back",
  {},
  async () => {
    return {
      content: [{ type: "text", text: "pong" }],
    };
  }
);

// Implement the echo tool
server.tool(
  "echo",
  "Send a message to the server and receive the message back",
  { message: z.string() },
  async (params) => {
    return {
      content: [{ type: "text", text: params.message }],
    };
  }
);

// Start the server
async function run() {
  try {
    // Use stdio for transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Since stdout is used for MCP messages, use stderr for logging
    console.error("MCP server connected via stdio");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

run();
