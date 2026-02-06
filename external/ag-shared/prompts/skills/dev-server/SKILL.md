---
targets: ['*']
name: dev-server
description: 'Development server setup and build watch monitoring. Use when starting dev work, checking build status, or troubleshooting the dev server.'
---

# Development Server Guide

This guide covers working with the local development server and build watch monitoring.

## Astro Dev Server Checklist

-   Prefer the shared HTTPS server on port 4600 when available.
-   When using browser automation tools (claude-in-chrome), you may need to manually accept the self-signed certificate in Chrome once before automation will work. Navigate to `https://localhost:4600` in the browser and accept the security warning.
-   Start a local watcher with `yarn nx dev` whenever you need live rebuilds across packages and the website.
-   `packages/ag-charts-website/src/content/gallery/data.json` owns gallery example metadata.
-   `packages/ag-charts-website/src/content/docs-nav/nav.json` owns docs navigation structure.
-   Docs map from `packages/ag-charts-website/src/content/docs/${pageName}/index.mdoc` to `/charts/javascript/${pageName}/`.

## Build Watch Status Monitoring

The `yarn nx dev` watch script (`external/ag-shared/scripts/watch/watch.js`) maintains a status file at `node_modules/.cache/ag-watch-status.json` for monitoring build state.

**Check this file to**:

-   Ensure no builds are in progress before starting operations (status != `BUILDING`)
-   Monitor build health via `recentBuilds` array and `targetHistory` stats
-   Track build progress after file changes

**Key fields**:

-   `status`: `STARTING` | `RUNNING` | `BUILDING` | `IDLE` | `STOPPED`
-   `currentBuild`: Active build details (only when `BUILDING`)
-   `recentBuilds`: Last 10 builds with status/duration/errors
-   `targetHistory`: Per-target success/failure counts

**Usage**:

```bash
# Wait for idle before operations
while [ "$(jq -r '.status' node_modules/.cache/ag-watch-status.json 2>/dev/null)" = "BUILDING" ]; do
  sleep 2
done

# Start watch if needed
node external/ag-shared/scripts/watch/watch.js charts &
```

## Production URLs

-   The production base URLs for the Astro site is https://www.ag-grid.com/

## Staging URLs

-   The staging base URLs for the Astro site is https://charts-staging.ag-grid.com/
    -   NOTE: That the `/charts` path prefix is not used for paths on the staging site.
