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
```
