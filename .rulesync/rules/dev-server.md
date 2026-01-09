---
targets: ['*']
description: 'Development server setup and build watch monitoring'
globs: ['documentation/**/*', 'packages/*/src/**/*']
---

# Development Server Guide

This guide covers setting up and using the development server for AG Grid.

## Starting the Dev Server

```bash
yarn nx dev
```

This starts the development server with hot-reload support for:

-   Documentation site
-   Grid source code changes
-   Example updates

## Build Watch Status

Monitor build health via the status file:

```
node_modules/.cache/ag-watch-status.json
```

This file contains:

-   Current build state (building/ready/error)
-   Package build status
-   Error details if any

## Common Tasks

### Viewing Documentation Locally

After starting `yarn nx dev`, visit:

-   `https://localhost:4610` - Documentation site

### Testing Example Changes

1. Modify example files in `_examples/` directories
2. The dev server will hot-reload changes
3. Use the framework switcher to test across React/Angular/Vue

### Debugging Build Issues

If the dev server shows errors:

1. Check `ag-watch-status.json` for specific error messages
2. Run `yarn nx build <package>` to see detailed build output
3. Fix TypeScript/lint errors before continuing

## Performance Tips

-   Keep the dev server running while developing
-   Use `--skip-nx-cache` if you suspect caching issues
-   Run `yarn nx clean` if builds behave unexpectedly after branch switches
