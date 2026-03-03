# Snyk Vulnerability Viewer

An interactive local web app for reviewing and resolving Snyk vulnerabilities in a monorepo.
It reads a Snyk JSON output file, serves a browser UI, and provides one-click actions to
apply fixes directly to the repository's source files.

## Quick Start

```bash
yarn nx snyk:view
# or directly:
node index.mjs <snyk-output.json> [--port 3456] [--open]
```

The `--open` flag opens the browser automatically. The server binds to `127.0.0.1` only.

---

## File Structure

| File | Purpose |
|------|---------|
| `index.mjs` | HTTP server — all routes, file mutation helpers, Snyk data loading |
| `ui.html` | HTML skeleton — loads CSS/JS, bootstraps both tabs |
| `ui-styles.css` | All CSS — dark theme, component styles |
| `ui-browse.js` | Browse All tab + shared utilities (`window.SnykUtils`, `window.initBrowseAll`) |
| `ui-review.js` | Review Queue tab (`window.initReviewQueue`) |

The server serves `.css` and `.js` files statically from the same directory as `ui.html`.
No build step. No bundler.

---

## Data Model

Snyk's JSON output is an array of **project** objects (one per `package.json` scanned).
Each project has a `vulnerabilities` array where each entry represents one vulnerability
found via one specific dependency path (`vuln.from` array). The same vulnerability ID can
appear multiple times across different projects and different dep paths.

Key fields on each `vuln`:
- `vuln.id` — Snyk vulnerability ID (e.g. `SNYK-JS-ANSIREGEX-1211`)
- `vuln.severity` — `critical` | `high` | `medium` | `low`
- `vuln.title` — human-readable name
- `vuln.from` — dependency path array: `[rootPkg, topLevelDep@ver, ..., vulnerablePkg@ver]`
- `vuln.name` / `vuln.packageName` — the vulnerable package name
- `vuln.fixedIn` — array of versions that fix the vuln (may be empty)
- `vuln.isUpgradable` — Snyk believes the top-level dep can be upgraded to fix it
- `project.displayTargetFile` — relative path to the scanned `package.json`

A **dep path** is `vuln.from.slice(1).join(' > ')` — the chain from the top-level dep to
the vulnerable package, excluding the root.

---

## Header Summary Bar

Always visible at the top:

- **Severity pills** — Critical / High / Medium / Low counts (unique vuln IDs)
- **N projects scanned ▾** — count of scanned `package.json` files; click for a popover
  listing all project names
- **N dep paths found** — total `(vuln × dep-path)` tuples across all projects
- **N vulnerabilities ▾** — count of unique vuln IDs; click for a popover listing every
  vuln with severity badge, Snyk link, and title; sorted critical → high → medium → low
- **↻ Re-run Snyk scan** — runs `yarn nx snyk:test:json`, streams output to a log panel,
  then reloads the in-memory data without a page refresh; optional "Backup old results"
  checkbox renames the existing JSON file with a timestamp before overwriting

---

## Tab: Browse All

A filterable/searchable list of all vulnerabilities with full details.

**Controls:**
- Free-text search (package name, vuln ID, CVE)
- Severity filter chips (All / Critical / High / Medium / Low)
- Group by: Vulnerability | Package | Project
- Show ignored toggle — reveals vulnerabilities in `.snyk` ignore lists

**Each vulnerability card shows:**
- Severity badge, vuln ID (linked to `security.snyk.io`), title, CVE links
- Dependency path(s) breadcrumb
- Affected project(s)
- Near-ignored indicator if the dep path has changed since the `.snyk` rule was written

---

## Tab: Review Queue

A structured workflow for triaging every unresolved vulnerability. The tab has a
progress bar (`reviewed / total`), a badge with the pending count, and a "Reset
review state" button.

Review decisions are persisted to `tmp/snyk-review-state.json` (keyed by vuln ID,
statuses: `resolved` / `skipped` / `reopened`). This file is local and not committed.
Resolved/skipped vulns move to a collapsible "Reviewed" accordion at the bottom.

The queue is divided into **three always-visible sections**, each collapsible via
`<details>`. A vuln can appear in multiple sections simultaneously.

### Section 1 — Dependency Upgrades

Groups all vulns by their **top-level dependency** (`vuln.from[1]`). Each card shows:

- The dep name and all affected vuln IDs (with severity badges, linked to Snyk)
- One row per `package.json` file that declares the dep, with current version
- Per-file actions:
  - **Check versions ▾** — fetches `npm view <pkg> versions` and displays a dropdown
  - **Update package.json** — writes the selected version into the file
  - **Remove dep** — deletes the entry from `dependencies` / `devDependencies` etc.

### Section 2 — Yarn Resolutions

Groups vulns where a **same-major fix version** exists (`vuln.fixedIn` has a version
matching the current major of the vulnerable package). Each card shows:

- The vulnerable package and the lowest fix version across all instances
- Steps: check available versions, copy/apply the `resolutions` key to root `package.json`
- **Apply to package.json** — writes `"**/pkg": "version"` into root `package.json resolutions`
- Mark as Resolved button

### Section 3 — Snyk Ignores

#### Near-ignored panel (top, collapsible, amber-tinted)

Shows vulns that already have a `.snyk` ignore rule but the dep path has changed
(version bumped). Grouped by `.snyk` file. Each item shows the old path vs. the
active path with changed versions highlighted. Actions:

- **Update .snyk** — replaces the old path in that specific entry
- **Update All in This File** — batch-updates all stale paths in one file
- **Update All .snyk Files** — batch-updates all stale paths across all files

After any update action the panel dims (`opacity: 0.5`, `pointer-events: none`) while
the `/data` refresh is in flight, then re-renders with the updated state.

#### Shared expiry field

A single expiry date input (pre-filled from the first expiry found in any `.snyk` file)
shared across all per-file ignore operations in this section.

#### Per-vuln cards (one per unique vuln ID, collapsible)

Click the header to collapse/expand. Header shows:
- Severity badge, vuln ID (linked to Snyk), title
- Path/dep count badge (`N paths · M deps`)
- **Via:** dep tags — click a tag to hide all dep groups for that dep (skip-by-dep)
- **Skip ✕** — greys out the card and excludes it from "Mark All" operations

Card body is sub-grouped by **top-level dep** (e.g. `lodash`, `webpack`). Each dep group shows:
- Dep name (monospace, accent colour) and path count
- **✓ In .snyk** badge if all paths in that dep are already ignored
- **Reason input** — a single text field shared across all paths for that dep
- **Preset dropdown** — preset reason strings; selecting one fills the reason input
- One checkbox row per dep path (each row shows the `.snyk` file badge and the dep chain)
- **Add N path(s) to .snyk** — validates reason and expiry, then calls `/add-snyk-ignore`
  for each checked path in sequence. Paths may span multiple `.snyk` files; the button
  fans out across all of them automatically. On success, all added rows convert to
  already-ignored display and the reason row / button are removed from the DOM.

#### Global actions

- **✓ Add All to .snyk** — adds all checked paths across all non-skipped cards
- **✓ Mark All as Resolved** — marks all non-skipped vulns as resolved

---

## Server API

All mutation endpoints are `POST` with `Content-Type: application/json`. All responses
are `{ ok: true, ... }` or `{ ok: false, error: "..." }`.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/data` | Vuln projects array + ignore patterns + shared expiry + root package name |
| `GET` | `/review-state` | `tmp/snyk-review-state.json` contents |
| `POST` | `/review-state` | Merge decisions `{ vulnId: { status, resolution?, note? } }` |
| `POST` | `/reset-review-state` | Delete `tmp/snyk-review-state.json` |
| `GET` | `/npm-versions?pkg=` | `npm view <pkg> versions --json`, newest-first, 15 s timeout |
| `GET` | `/dep-field?pkg=&file=` | Which dep field (`dependencies`, `devDependencies`, etc.) a package lives in |
| `POST` | `/update-dep-version` | Edit a dep version in a `package.json` (`packageJsonPath`, `dep`, `version`, `field?`) |
| `POST` | `/remove-dep` | Delete a dep entry from a `package.json` (`packageJsonPath`, `dep`, `field?`) |
| `POST` | `/apply-resolution` | Write a `resolutions` entry to root `package.json` (`key`, `version`) |
| `POST` | `/add-snyk-ignore` | Add or update an ignore entry in a `.snyk` file (`snykFile`, `vulnId`, `path`, `reason`, `expires`) |
| `POST` | `/update-snyk` | Update stale dep-path keys in `.snyk` files (`updates: [{snykFile, vulnId, oldPath, newPath}]`) |
| `GET` | `/run-snyk` | SSE stream — runs `yarn nx snyk:test:json`, emits stdout/stderr, reloads data on success |
| `GET` | `/*.css`, `/*.js` | Static UI files served from the same directory |

### `/add-snyk-ignore` update behaviour

If a `(vulnId, depPath)` entry already exists under the vuln ID block in the `.snyk`
file, the entry is **replaced in-place** — the `reason` and `expires` values are updated
and a new `created` timestamp is written. A new duplicate entry is never inserted.

### Review state

`tmp/snyk-review-state.json` schema:

```json
{
  "decisions": {
    "SNYK-JS-FOO-123": {
      "status": "resolved",
      "resolution": "snyk-ignore",
      "note": "Added 3 path(s) to .snyk",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

Statuses: `resolved` | `skipped` | `reopened`. A `resolved` vuln that reappears in the
active scan data is automatically marked `reopened` on next render.

---

## `.snyk` File Format

Snyk's policy file uses a specific indentation style that this tool matches exactly:

```yaml
ignore:
    SNYK-JS-ANSIREGEX-1211:
        - 'stylelint@15 > ansi-regex@3.0.0':
              reason: >-
                  Test/lint dependency - not included in final production build
              expires: 2026-06-08T00:00:00.000Z
              created: 2024-01-01T00:00:00.000Z
patch: {}
```

- Vuln IDs: 4-space indent
- Path list items: 8-space indent (`        - `)
- Properties (`reason`, `expires`, `created`): 14-space indent
- Reason block scalar content: 18-space indent
- Keys with special characters (e.g. starting with `@`) are single-quoted by `js-yaml`

---

## Code Conventions

- **No build step** — plain ES2020 JS in the browser; no TypeScript, no bundler
- **IIFE modules** — `ui-browse.js` and `ui-review.js` are IIFEs; shared utilities are
  exposed via `window.SnykUtils`; entry points via `window.initBrowseAll` /
  `window.initReviewQueue`
- **Delegated events** — a single `click` listener on `#rq-content` is attached once
  at init (`attachEvents()`) and dispatches by `data-action` attribute; avoids
  per-element listeners and prevents duplicate handlers accumulating across re-renders
- **Collapsible elements** — use native `<details>`/`<summary>`; `refreshIgnorePatterns`
  snapshots which `.tool-section` elements are open before re-rendering and restores
  them after, so the user's expanded/collapsed state survives a data refresh
- **`skipState`** — module-level `{ vulns: Set, deps: Set }` persists across re-renders
  so skip selections survive review state updates
- **Global path index** — each dep-path row in Section 3 still gets a unique `globalIdx`
  (stored on the path object) for future use, though current DOM reading uses element
  content directly rather than index-based IDs
- **CSS variables** — `--c-bg`, `--c-surface`, `--c-border`, `--c-accent`, `--c-text`,
  `--c-text-muted`, `--c-fix`, `--c-critical`, `--c-warn` etc. defined in `:root`
