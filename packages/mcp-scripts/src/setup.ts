#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// MCP config JSON interface
interface MCPConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
    };
  };
}

// Construct config paths for popular MCP clients
const configPaths = {
  cursor: join(homedir(), ".cursor", "mcp.json"),
  windsurf: join(homedir(), ".codeium", "windsurf", "mcp_config.json"),
  claude: join(
    homedir(),
    "Library",
    "Application Support",
    "Claude",
    "claude_desktop_config.json"
  ),
};

// Read MCP config file
function readConfig(path: string): MCPConfig {
  if (!existsSync(path)) {
    return { mcpServers: {} };
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

// Write MCP config file
function writeConfig(path: string, config: MCPConfig) {
  writeFileSync(path, JSON.stringify(config, null, 2));
}

// Add MCP config to MCP clients
function addMCPConfig(serverName: string, projectPath: string) {
  const newConfig = {
    command: process.execPath,
    args: [join(projectPath, "dist", "index.js")],
  };

  for (const [client, configPath] of Object.entries(configPaths)) {
    const config = readConfig(configPath);

    if (config.mcpServers[serverName]) {
      console.log(
        `MCP server "${serverName}" already exists in ${client} config. Skipping...`
      );
      continue;
    }

    config.mcpServers[serverName] = newConfig;
    writeConfig(configPath, config);
    console.log(`Added "${serverName}" to ${client} config.`);
  }
}

// Infer server name from project path
const projectPath = process.cwd();
const serverName = projectPath.split("/").pop();

if (!serverName) {
  console.error("Could not infer MCP server name from current directory");
  process.exit(1);
}

addMCPConfig(serverName, projectPath);
