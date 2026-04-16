---
targets: ['*']
name: dev-server
description: >-
  Development server setup and build watch monitoring. Use when starting dev
  work, checking build status, or troubleshooting the dev server. Also use when
  asking about localhost URLs, dev server ports, build errors or failures, the
  watch script, staging/production URLs, or how to preview docs pages locally.
---

# Development Server Guide

## Starting the Dev Server

Run `yarn nx dev` from the repo root. This starts both the Astro dev server and the watch script that incrementally rebuilds packages on file changes.

Browser automation (claude-in-chrome): you may need to manually accept the self-signed certificate once at the local dev URL before automation works.

## Per-Product Reference

|                    | AG Charts                     | AG Grid                       | AG Studio                     |
|--------------------|-------------------------------|-------------------------------|-------------------------------|
| **Dev port**       | 4600                          | 4610                          | 4620                          |
| **Local URL**      | `https://localhost:4600/`     | `https://localhost:4610/`     | `https://localhost:4620/`     |
| **Docs URL pattern** | `/charts/javascript/${pageName}/` | `/${framework}-data-grid/${pageName}/` | `/${framework}/${pageName}/` |
| **Docs content**   | `packages/ag-charts-website/src/content/docs/` | `documentation/ag-grid-docs/src/content/docs/` | `packages/ag-studio-docs/src/content/docs/` |
| **Nav config**     | `…/ag-charts-website/src/content/docs-nav/nav.json` | `…/ag-grid-docs/src/content/docs-nav/nav.json` | `…/ag-studio-docs/src/content/docs-nav/nav.json` |
| **Gallery metadata** | `…/ag-charts-website/src/content/gallery/data.json` | — | — |
| **Staging URL**    | `https://charts-staging.ag-grid.com/` | `https://grid-staging.ag-grid.com/` | `https://studio-staging.ag-grid.com/` |
| **Production URL** | `https://www.ag-grid.com/charts/` | `https://www.ag-grid.com/` | `https://www.ag-grid.com/studio/` |

**Staging note:** Staging sites do not use the production path prefix (e.g. no `/charts` prefix on `charts-staging.ag-grid.com`).

## Build Watch Status Monitoring

The watch script (`external/ag-shared/scripts/watch/watch.js`) writes status to `node_modules/.cache/ag-watch-status.json`. Check this file to confirm builds have finished before running tests, committing, or starting browser automation.

**Key fields:**

-   `status`: `STARTING` | `RUNNING` | `BUILDING` | `IDLE` | `STOPPED`
-   `currentBuild`: active build targets and projects (only when `BUILDING`)
-   `recentBuilds`: last 10 builds with status, duration, and errors
-   `targetHistory`: per-target success/failure counts

```bash
# Wait for idle before operations
while [ "$(jq -r '.status' node_modules/.cache/ag-watch-status.json 2>/dev/null)" = "BUILDING" ]; do
  sleep 2
done
```

## Troubleshooting

**Build failures:** Check `recentBuilds` in the status file for error details. Failed builds do not block the watch loop — subsequent file changes will trigger new builds.

**Nx daemon disabled:** The watch script requires the Nx daemon. If it reports "Nx daemon has been disabled", run:

```bash
yarn nx reset && yarn
```

**Repeated respawn errors:** If you see "Repeated respawn detected", the Nx daemon is likely in a bad state:

```bash
yarn nx daemon --stop
yarn
```

Check `.nx/cache/d/daemon.log` for details.

**Git operations pausing builds:** The watch script automatically pauses builds while git operations are in progress (detects `index.lock`, `rebase-merge`, `rebase-apply`, `MERGE_MSG`). Builds resume automatically once the git operation completes.
