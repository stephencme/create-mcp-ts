#!/usr/bin/env node

import { spawn } from "child_process";
import { join } from "path";

// Define commands
const commands = {
  start: "tsup src/index.ts --dts --watch",
  build: "tsup src/index.ts --dts --clean",
  setup: `node ${join(__dirname, "setup.js")}`,
};

// Execute a command
function executeCommand(command: string) {
  const [cmd, ...args] = command.split(" ");
  const child = spawn(cmd, args, {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });

  child.on("error", (error) => {
    console.error("Error executing command:", error.message);
    process.exit(1);
  });

  child.on("close", (code) => {
    process.exit(code || 0);
  });
}

// Get the command name from arguments
const command = process.argv[2];

// Output usage information
if (!command || !(command in commands) || command === "help") {
  console.error("Usage: mcp-scripts <command>");
  console.error("Available commands:");
  console.error("  start  build MCP server AND watch for changes");
  console.error("  build  build MCP server");
  console.error("  setup  setup MCP clients: Cursor, Windsurf, Claude Desktop");
  console.error("  help   output usage information");
  process.exit(1);
}

executeCommand(commands[command as keyof typeof commands]);
