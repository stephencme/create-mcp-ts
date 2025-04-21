# Getting started with your MCP server

This project was bootstrapped with [create-mcp-ts](https://github.com/stephencme/create-mcp-ts).

It provides a basic template for building an MCP (Model Context Protocol) server using TypeScript.

## Quick start

```shell
npm run setup
npm run dev
```

## Available scripts

In the project directory, you can run:

### `npm run dev`

Builds the MCP server to the `dist` folder and watches source files for changes.\
Changes will trigger a rebuild of the server.

### `npm run build`

Builds the MCP server to the `dist` folder.\
It bundles your code for production use e.g. publishing to npm.

### `npm run setup`

This script helps configure your MCP server in Cursor, Windsurf, and Claude Desktop.\
It checks the respective configuration files (`.json`) and adds an entry for your server if it doesn't exist, pointing to the server script (`dist/index.js`).

```json
{
  "mcpConfig": {
    "your-mcp-server": {
      "command": "node",
      "args": ["/path/to/your-mcp-server/dist/index.js"]
    }
  }
}
```

**Note**: You might need to adjust the `"command"` if your Node.js installation is not in the default system PATH, especially when using version managers like `nvm` or `nodenv`. See the [Troubleshooting](#troubleshooting-your-mcp-server-configuration) section in the `create-mcp-ts` README for details.

### `npm run eject`

**This is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the included build tools (`mcp-scripts`), you can `eject` at any time. This command will remove the `mcp-scripts` dependency from your project.

Instead, it will copy any configuration files and the transitive dependencies right into your project so you have full control over them. All commands except `eject` will still work, but they will point to the copied configurations. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for many deployments. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Publishing your MCP server

If you plan to share your MCP server, you can publish it to npm:

1.  Set `"version"` in `package.json` and ensure `"private"` is set to `false`.
2.  Run `npm install`.
3.  Run `npm run build`.
4.  Run `npm login` (if needed).
5.  Run `npm publish`.

## Troubleshooting

See the [Troubleshooting](https://github.com/stephencme/create-mcp-ts#troubleshooting-your-mcp-server) section in the `create-mcp-ts` README for common issues.

## Learn more

- **Model Context Protocol (MCP)**: Learn more about the protocol at [modelcontextprotocol.io](https://modelcontextprotocol.io/).
- **create-mcp-ts**: Check out the tool that created this template [here](https://github.com/stephencme/create-mcp-ts).
- **TypeScript**: Learn more about TypeScript [here](https://www.typescriptlang.org/).
