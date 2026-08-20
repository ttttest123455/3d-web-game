# ChatGPT MCP App

A minimal Model Context Protocol server for the `ttttest123455/3d-web-game` project.

## Tools

- `game_status` — returns project status.
- `echo` — verifies that ChatGPT can call the server.

## Run locally

```bash
cd chatgpt-mcp-app
npm install
npm start
```

The MCP endpoint is `http://localhost:3000/mcp`.

## Connect to ChatGPT

ChatGPT needs a publicly reachable HTTPS MCP endpoint. GitHub Pages alone cannot host this server because the MCP endpoint requires a running HTTP server. Deploy this folder to a service that can run Node.js (for example a container/Node hosting service), then add the resulting HTTPS `/mcp` URL as a custom MCP app/connector in a ChatGPT workspace that has custom MCP enabled.

This repository contains the server code; installing a custom MCP app into the user's ChatGPT account requires the account/workspace's custom MCP capability and cannot be performed by the GitHub connector itself.
