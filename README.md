# create-mcp-ts ![NPM Version](https://img.shields.io/npm/v/create-mcp-ts)

Create a new MCP server in TypeScript, batteries included.

## Getting started

```shell
npm init mcp-ts your-mcp-server
cd your-mcp-server
npm run setup
npm run dev
```

`create-mcp-ts` requires **zero build configuration** - it will automatically install everything you need to develop, build, and set up your MCP server.

### Set up your MCP server in Cursor, Windsurf, and Claude Desktop

`create-mcp-ts` can automatically configure your MCP server in Cursor, Windsurf, and Claude Desktop:

```shell
npm run setup
```

This script checks if `your-mcp-server` already exists in each client's respective MCP configuration file. If not, it adds an entry pointing to the server script (`dist/index.js`):

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

For more details on how to set up MCP servers in Cursor, Windsurf, and Claude Desktop, see:

- [MCP docs for Cursor](https://docs.cursor.com/integrations/mcp)
- [MCP docs for Windsurf](https://docs.windsurf.com/windsurf/mcp)
- [MCP docs for Claude Desktop](https://modelcontextprotocol.io/quickstart/user)

### Custom templates

If you'd like to use a custom template, you can do so by passing the template npm package name or file path to the `npx create-mcp-ts` command:

```shell
npx create-mcp-ts your-mcp-server --template=mcp-ts-template-default
npx create-mcp-ts your-mcp-server --template=file:/path/to/mcp-ts-template
```

### Publishing your MCP server

If you plan to share your MCP server, you can publish it to npm:

1.  Set `"version"` in `package.json` and ensure `"private"` is set to `false`.
2.  Run `npm install`.
3.  Run `npm run build`.
4.  Run `npm login` (if needed).
5.  Run `npm publish`.

## Ejecting from `mcp-scripts`

The `mcp-scripts` package contains build tools for `create-mcp-ts` projects - everything you'll need to develop, build, and set up an MCP server **without any additional configuration**.

Under the hood `mcp-scripts` uses [tsup](https://github.com/egoist/tsup) and [esbuild](https://github.com/evanw/esbuild), lightweight, battle-tested utilities that are well-suited for production-grade TypeScript projects.

If you'd like to eject from `mcp-scripts`, run the following command:

```shell
npm run eject
```

This will remove the `mcp-scripts` dependency and replace any related commands from your project's `package.json` file.

## Troubleshooting your MCP server

### Confirm you have Node.js installed

If you experience issues running your MCP server, the first thing to check is that you have Node.js installed globally. You can check this by running:

```shell
node --version
```

If you don't have Node.js installed, you can install it by following the instructions [here](https://nodejs.org/en/download/).

### Usage with Node.js version managers

Some MCP client environments may not have access to the full system PATH, which can cause issues when using Node.js version managers like `nodenv` or `nvm`. In these cases, you'll need to specify the full path to the Node.js binary in your MCP config:

```json
{
  "mcpConfig": {
    "your-mcp-server": {
      "command": "/absolute/path/to/node",
      "args": ["/path/to/your-mcp-server/dist/index.js"]
    }
  }
}
```

To find the absolute path to your Node.js binary, you can run:

```shell
which node
```

Make sure to update your MCP config in each client (Cursor, Windsurf, or Claude Desktop) with the correct absolute path to the Node.js binary you want to use.

For any other issues, please [open an issue here](https://github.com/stephencme/create-mcp-ts/issues/new).

## Philosophy

`create-mcp-ts` is designed to be a batteries-included, "it just works" experience for MCP server developers.

- **Batteries included**: there is only one build dependency, `mcp-scripts`. It uses tsup, esbuild, and other amazing open source projects, but provides a curated experience on top of them.
- **Zero configuration**: you don't need to configure anything. A reasonably good configuration is handled for you so you can focus on writing code.
- **No lock-in**: you can "eject" to a custom setup at any time. Run a single command, and all the configuration and build dependencies will be moved directly into your project, so you can pick up right where you left off.

This project is inspired by [create-react-app](https://github.com/facebook/create-react-app).

## Packages

- **[packages/create-mcp-ts](./packages/create-mcp-ts)**: Create a new MCP server in TypeScript, batteries included.
- **[packages/mcp-scripts](./packages/mcp-scripts)**: The build tools that power `create-mcp-ts` projects.
- **[packages/mcp-ts-template-default](./packages/mcp-ts-template-default)**: Default project template for `create-mcp-ts`.
