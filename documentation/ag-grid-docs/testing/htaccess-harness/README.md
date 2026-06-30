# htaccess behavioural harness

Runs the **real** generated `.htaccess` rules through **real Apache** (the system `httpd`) on
`localhost`, so you can verify redirect behaviour — status codes, `Location` targets, single-hop
collapsing, 410s, and the main-docroot ⇄ `/charts`-subdirectory interaction — **without hitting
production** (CloudFront 403s any `curl` to the live site).

This complements the offline checks:

| Layer                      | What it catches                                                           | Command                                                   |
| -------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| Snapshot tests             | any change to generated rules (incl. existing ones)                       | `npx vitest run src/utils/htaccess/htaccessRules.test.ts` |
| `redirectsChecker` (build) | redirect target that doesn't resolve / shadows a live page                | `yarn nx build ag-grid-docs`                              |
| **This harness**           | **actual Apache behaviour: precedence, hops, 410s, host-swap, no-shadow** | `./run.sh`                                                |

The harness exists because `mod_alias` is **first-match (config order)**, not longest-match — a
subtlety an offline simulator gets wrong. It found two real bugs during development (a leaked
landing rule, and SE-64 chains that were 2-hop in reality).

## Run

```bash
# via Nx (from the repo root) — defaults to the production host
NX_DAEMON=false yarn nx test:htaccess ag-grid-docs
# pick the env explicitly (host comes from URL_CONFIG in src/constants.ts):
NX_DAEMON=false yarn nx test:htaccess ag-grid-docs --configuration=staging
NX_DAEMON=false yarn nx test:htaccess ag-grid-docs --configuration=production

# or directly (default production; or `--env staging`)
cd documentation/ag-grid-docs/testing/htaccess-harness && ./run.sh
```

**Host is not hardcoded.** The redirect targets resolve to the host for the chosen env, read from
`URL_CONFIG` (`src/constants.ts`): `production` → `www.ag-grid.com`, `staging` →
`grid-staging.ag-grid.com`. Local/no config defaults to **production**. The generated rules always
target production; for `--env staging` the harness rewrites that host in both the served `.htaccess`
and the expectations (scope B — it tests the prod redirect _structure_ against the staging host; it
does not change what staging deploys).

**Charts coverage is optional.** The main-site rules are always tested. The `/charts/*` rows need the
charts `.htaccess`; if it isn't available (e.g. main-repo CI), those rows are **skipped** with a
warning and the run still passes. For full coverage, build the charts repo first
(`cd ../charts-clean && npx nx build ag-charts-website`) or pass `CHARTS_HTACCESS=/path/to/.htaccess`.

It will:

1. Emit the production `.htaccess` from this repo → docroot, and copy the charts `.htaccess` from the
   charts repo's **build output** (`dist/packages/ag-charts-website/.htaccess`) → a `charts/`
   subdirectory — mirroring the real deploy topology (charts is a subdir of `/var/www/html` with its
   own `mod_alias`-only `.htaccess`). Build it first with `npx nx build ag-charts-website`, or pass a
   path via `CHARTS_HTACCESS=…` (a bare `vitest` in the charts repo can't load its base URL).
2. Start system `httpd` on `localhost:8899`.
3. Assert every row in `expectations.tsv` **and** `expectations.generated.tsv` (status + `Location`
   substring), then stop `httpd`.

Exit code is non-zero if any expectation fails.

### Options

- `PORT=9100 ./run.sh` — different port.
- `CHARTS_REPO=/path/to/charts-clean ./run.sh` — charts repo location (default: `../charts-clean`).
- `CHARTS_HTACCESS=/path/to/.htaccess ./run.sh` — use a specific charts `.htaccess` (otherwise the
  charts build output is used).
- `KEEP_RUNNING=1 ./run.sh` — leave `httpd` up afterwards to poke manually with `curl`.
- `--env staging|production` (or `HTACCESS_ENV=…`) — pick the redirect-target host via `URL_CONFIG`; default production.
- `HTTPD=/path/to/httpd HTTPD_MODULES=/path/to/modules ./run.sh` — override Apache auto-detection.

### Requirements (macOS + Linux, no Docker)

Needs a system Apache with `mod_rewrite` / `mod_alias` / `mod_headers` (plus `mpm_prefork`, `unixd`,
`authz_core`, `log_config`, `mime`, `dir`), and `curl`, `bash`, and Node (for the `.htaccess` emit).
The harness **auto-detects** the binary and module dir:

- **macOS** — built in (`/usr/sbin/httpd`, modules in `/usr/libexec/apache2`); nothing to install.
- **Debian/Ubuntu** — `apt-get install apache2` (binary `/usr/sbin/apache2`, modules
  `/usr/lib/apache2/modules`).
- **RHEL/Fedora** — `yum install httpd` (modules `/usr/lib64/httpd/modules`).

It runs as the invoking user on a high port (no root) and writes everything to `$TMPDIR`, so it needs
no distro Apache config / `APACHE_*` envvars. If detection misses your layout, set `HTTPD=` and
`HTTPD_MODULES=`.

**Skips cleanly when Apache is absent.** If no Apache binary or a required module is missing, the
harness prints a `SKIP` line and **exits 0** — so it doesn't fail `nx test:e2e` (which it's wired into)
on machines/CI without Apache. Set `HTTPD_REQUIRED=1` to turn those skips into hard failures (e.g. an
environment where Apache is expected). Note a genuine `httpd` _start_ failure (bad config / malformed
generated `.htaccess`) is still a hard failure — that's a real bug worth catching.

## The two expectation files

Both are tab-separated: `host  path  expect_status  expect_location_substring`.

- `host`: `www` (default) or `apex` (sends `Host: ag-grid.com` to exercise the non-www→www
  single-hop rules).
- Assertions are on the **single** response, so we never follow a redirect out to production. A
  single response whose `Location` is already the final target _is_ the single-hop proof.

**`expectations.tsv`** — hand-curated rows: representative checks across every ticket (SE-30/60/61/64/66),
regression cases, and "no-shadow" negatives (live pages that must return 200, proving the broad
catch-alls don't swallow them). Edit this by hand.

**`expectations.generated.tsv`** — ~6.9k rows covering **every** redirect rule in both repos (each rule
× trailing-slash and no-slash variants) plus the genuinely-Done SE board items (SE-16/17/54/56). This is
a **behavioural regression snapshot**: it freezes the expected resolution of each rule, so if a rule
change alters a destination the row fails. Do **not** hand-edit it.

### Regenerating `expectations.generated.tsv`

After an _intentional_ rule change, regenerate and review the diff (like a snapshot update):

```bash
# main rules — from the freshly-emitted production .htaccess
node generators/gen-main-expectations.mjs <emitted-main.htaccess> > main.tsv
# charts rules — from the rendered /charts redirect block (PUBLIC_BASE_URL=/charts)
node generators/gen-charts-expectations.mjs <charts.htaccess> > charts.tsv
# then merge (main authoritative for non-/charts, charts for /charts/*) and review the diff
```

The generators encode the verified Apache behaviours (first-match `mod_alias`, the trailing-slash hop,
`.php` exemption, SE single-hops running first). Regenerate-then-assert would _mask_ regressions (it
re-predicts the new behaviour), which is why the generated rows are committed as a frozen snapshot.

## Findings

`findings/` captures what the rule sweep surfaced. **`main-rules.md`: the broad `/{framework}-grid/`
prefix rule (first-match `mod_alias`) shadows the 752 specific `/{framework}-grid/<subpage>/` rules
that follow it.** Resolved as follows:

- **610** already resolved in one hop via the broad prefix (the specific was redundant) — left as-is.
- **128** chained to the correct page in 2 hops, and **14** landed on the _wrong_ page (a 404 — e.g.
  `/javascript-grid/themes-customising/` → `…/themes-customising/` instead of `…/themes/`). These
  **142 are now converted to single-hop `mod_rewrite` rules** in `SITE_SINGLE_HOP_REWRITES` (they run
  before `mod_alias`, so each lands on its final page in one hop; the 14 are genuine bug fixes).

`jira-done-items.md` also notes SE-30/60/61/64/66 are not marked Done on the board (only their code is
on `latest`); the genuinely-Done redirect items are SE-16/17/54/56.

## Notes

- A slash-less, dot-less path (e.g. `/charts/privacy`) first takes a harmless `301` to add a trailing
  slash (the parent trailing-slash rule, which governs `/charts/*` because the charts `.htaccess` has
  no `mod_rewrite`), then resolves. Indexed URLs are typically trailing-slashed and resolve directly.
- The work dir (emitted `.htaccess`, `httpd.conf`, logs) is created under `$TMPDIR` — **outside** the
  repo on purpose. If the docroot were inside the project, Apache would walk up and read real ancestor
  `.htaccess` files (which contain `<IfModule>`, invalid in that context) and 500. Override with
  `HARNESS_WORK=…`; it's regenerated each run and safe to delete.
