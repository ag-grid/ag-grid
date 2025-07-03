# AG-Grid MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with AG-Grid specific tools and knowledge to help developers integrate AG-Grid into their applications.

## Features

- **Framework-aware**: Supports React, Angular, Vue, and Vanilla JavaScript
- **Version-aware**: Provides version-specific documentation and examples
- **Code generation**: Generates framework-specific code snippets
- **Documentation access**: Fetches current and archived AG-Grid documentation
- **Feature assistance**: Helps implement common and complex AG-Grid features

## Tools

### Grid Configuration
- `generate-grid-config` - Generate basic AG-Grid configuration
- `create-column-definitions` - Create column definitions with proper types
- `setup-data-binding` - Generate data binding code snippets

### Feature Implementation
- `add-grid-feature` - Add specific AG-Grid features (sorting, filtering, etc.)
- `troubleshoot-grid-issue` - Help diagnose common problems

## Resources

- `ag-grid-docs` - Access to version-specific documentation
- `grid-examples` - Framework-specific code examples
- `feature-guides` - Step-by-step guides for complex features
- `migration-guides` - Version migration assistance

## Prompts

- `quick-start` - Get started with AG-Grid in any framework
- `advanced-feature` - Implement complex features like Master-Detail
- `performance-optimization` - Optimize grid performance
- `troubleshooting` - Debug common issues

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the server:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

The server will run on stdio transport by default, suitable for integration with MCP clients.

## Configuration

The server can be configured via environment variables:

- `AG_GRID_VERSION` - Target AG-Grid version (defaults to latest)
- `DEFAULT_FRAMEWORK` - Default framework when not specified (defaults to 'react')

## Development

Run in development mode:
```bash
npm run dev
```

Run tests:
```bash
npm test
```