# htaccess behavioural harness

Runs the **real** generated `.htaccess` files of all three sites (grid, charts, studio) through
**real Apache** on `localhost`, laid out exactly as the production docroot. It asserts what a client
actually gets: status, exact `Location`, the redirect chain to the final page, and response headers.
It does not touch production. CloudFront 403s a plain `curl` to the live site.

| Layer                      | What it catches                                                 | Command                                                   |
| -------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| Snapshot tests             | any change to the generated rule text                           | `npx vitest run src/utils/htaccess/htaccessRules.test.ts` |
| `redirectsChecker` (build) | a redirect target that doesn't resolve, or shadows a live page  | `yarn nx build ag-grid-docs`                              |
| **This harness**           | **what Apache does with all the files together:**               | `./run.sh`                                                |
|                            | precedence, parent/child `.htaccess` interaction, hops, headers |                                                           |

The rule text alone cannot tell you what Apache does with it:

- `mod_alias` is first match in config order, not longest match.
- A `Redirect` appends the unmatched remainder of the path to its target.
- A child `.htaccess` with `RewriteEngine On` **replaces** its parent's rewrite rules.
- mod_headers directives **merge**, parent first and child second.
- `%{CONTENT_TYPE}` expressions only fire with a real MIME map.

Each of these has caused a production bug that a text-level test passed.

## Architecture

```
run.sh                       thin wrapper (the Nx target calls it) -> harness.mjs
harness.mjs                  orchestrates: Apache -> sources -> emit -> docroot -> serve -> assert -> report
lib/apache.mjs               finds httpd + modules + mime.types, writes httpd.conf, start/stop
lib/sources.mjs              finds the three repos, materialises git refs, emits every .htaccess, runs the in-flight patcher
lib/docroot.mjs              production-shaped docroot + placeholder files
lib/rows.mjs                 expectation-row format and parser
lib/probe.mjs                HTTP client, chain following, assertions
expectations/*.tsv           curated.tsv and edge.tsv (hand-written), generated-*.tsv (generated)
generators/                  regenerate.mjs plus one generator per rule family (see below)
```

### What gets served

**Every `.htaccess` is emitted fresh from source on each run, never read from a build output.**

- Each site's own `getHtaccessContent({ env: 'production' })` is run through `tsx`, with that build's `PUBLIC_BASE_URL`.
- A stale `dist` once let this harness report 7251/0 while the current charts rules had 96 real failures.

| Docroot path             | Emitted from           | Notes                                |
| ------------------------ | ---------------------- | ------------------------------------ |
| `/`                      | grid, base `''`        | release candidates patched in flight |
| `/archive/36.2.0/`       | grid archive build     | released                             |
| `/archive/36.3.0/`       | grid archive build     | in flight                            |
| `/charts/`               | charts, base `/charts` |                                      |
| `/charts/archive/14.2.0` | charts archive build   | released                             |
| `/charts/archive/14.3.0` | charts archive build   | in flight                            |
| `/studio/`               | studio, base `/studio` |                                      |
| `/studio/archive/3.0.0`  | studio archive build   | studio archives are always no-cache  |

**The in-flight state uses the real mechanism.** The emitted root file is patched with the grid
repo's `scripts/uncached-archives.mjs set 36.3.0 14.3.0`, exactly as the release step patches the
deployed one.

**The Apache config mirrors the parts of the production vhost the rules depend on:**

- the system `mime.types` (`/private/etc/apache2/mime.types` on macOS, `/etc/mime.types` on Linux, or `MIME_TYPES=`);
- `DirectoryIndex index.html`;
- `AllowOverride All` on the docroot.

**Placeholder files are tiny, but they have real names and extensions,** so mod_dir, mod_mime and the `-f`/`-d` checks behave as in production:

- a page's `index.html` and its `.md` twin;
- js, svg, png, json, zip and webp assets;
- hashed and unhashed `_astro` files.

**Each `404.html` names itself in its body**, so a row can prove which ErrorDocument answered:

- `grid-root-404`;
- `charts-404`;
- `charts-archive-14.2.0-404`;
- `studio-404`.

### Sources and branches

| Site   | Repo (default)                                                                                                                                    | Ref                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| grid   | this checkout                                                                                                                                     | `GRID_REF=` (or `GRID_REPO=`) |
| charts | `CHARTS_REPO=`, else `../ag-charts` (or `../charts-clean`), searched next to this checkout and next to the main checkout when run from a worktree | `CHARTS_REF=`                 |
| studio | `STUDIO_REPO=`, else `../ag-studio` (or `../studio-clean`), searched the same way                                                                 | `STUDIO_REF=`                 |

**Without a ref, the site's working tree is used as is,** uncommitted changes included. The summary
says so: `working tree (branch @ sha +uncommitted changes)`.

**With a ref**, the site's source is extracted with `git archive`:

- **What it extracts:** the package's `src` without page content, the shared subrepo's `src`, and the manifests and tsconfigs.
- **Where it goes:** into the work dir, with the repo's `node_modules` symlinked in.
- **What it leaves alone:** the repo's working tree, index and worktree list.

So you can test any branch without checking it out.

**A missing sibling repo is an error, not a skip.** Pass `SKIP_CHARTS=1` / `SKIP_STUDIO=1` to run
without it explicitly. The summary then prints `NOT TESTED` for that site, the number of rows
skipped, and a `PARTIAL COVERAGE` warning.

**`--env staging` is grid-only by design.** Staging serves charts and studio from their own hosts,
so their rows are reported as not part of that topology. The redirect targets are mapped to the
staging host from `URL_CONFIG`.

**The only clean skip (exit 0) is when Apache itself is absent.** `HTTPD_REQUIRED=1` turns that into
a failure, and CI sets it.

## Run

```bash
# via Nx (from the repo root)
NX_DAEMON=false yarn nx test:htaccess ag-grid-docs                            # production layout, all three sites
NX_DAEMON=false yarn nx test:htaccess ag-grid-docs --configuration=staging    # grid only, staging host

# directly - against specific branches, without checking them out
cd documentation/ag-grid-docs
CHARTS_REF=origin/charts-subdir-redirect-fixes STUDIO_REF=origin/studio-subdir-redirect-fixes ./testing/htaccess-harness/run.sh
CHARTS_REF=origin/latest STUDIO_REF=origin/latest ./testing/htaccess-harness/run.sh
GRID_REF=origin/latest ./testing/htaccess-harness/run.sh
```

### Options

| Option                                                            | Effect                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT=9100`                                                       | listen port (default 8899, bound to 127.0.0.1)                                                                                             |
| `KEEP_RUNNING=1`                                                  | leave httpd up afterwards to poke with `curl -H 'Host: www.ag-grid.com'`; the summary prints the stop command                              |
| `VERBOSE=1`                                                       | print passing rows too                                                                                                                     |
| `REWRITE_TRACE=1`                                                 | `LogLevel rewrite:trace3`, written to `$HARNESS_WORK/logs/error.log`                                                                       |
| `HARNESS_WORK=/path`                                              | work dir (default `$TMPDIR/ag-htaccess-harness`). It must be outside the repo: Apache would otherwise read real ancestor `.htaccess` files |
| `HTTPD=/path/to/httpd`, `HTTPD_MODULES=/path`, `MIME_TYPES=/path` | override auto-detection                                                                                                                    |

**Exit code is non-zero on any of these:**

- a failing row;
- a known-fail row that unexpectedly passes;
- a file executing fewer rows than its `@min-rows`;
- a category executing no rows.

The summary prints:

- the source and SHA of each site;
- every emitted `.htaccess`;
- the in-flight state;
- per-category pass, fail and known-fail counts;
- how many failures differ only in the form of the `Location` (relative vs absolute www, same page).

### Requirements (macOS + Linux, no Docker)

**Apache 2.4** with these modules:

- `mod_rewrite`, `mod_alias`, `mod_headers`, `mod_mime`, `mod_dir`;
- `mpm_prefork`, `unixd`, `authz_core`, `log_config`.

**On the PATH:** Node and `git`.

**Each repo** needs its `node_modules` installed, for `tsx`.

| Platform      | Install                                              |
| ------------- | ---------------------------------------------------- |
| macOS         | built in (`/usr/sbin/httpd`, `/usr/libexec/apache2`) |
| Debian/Ubuntu | `apt-get install apache2`                            |
| RHEL/Fedora   | `yum install httpd`                                  |

It runs as the invoking user on a high port.

## Expectation rows

**Rows are tab-separated:** `host  path  status  location  [assertion]...`. The full reference is in
`lib/rows.mjs`.

**`host`:** `www`, `apex`, `blog`, `charts`, or any literal hostname (`angulargrid.com`, `localhost`, ...). It is sent as the `Host` header.

**`location`:** compared **exactly**.

- A Location on the harness server itself is normalised to the host-relative `/path`. Its scheme and host there are only the harness's `ServerName`.
- An absolute URL is compared verbatim.

**Assertions:**

| Assertion                                       | Checks                                                    |
| ----------------------------------------------- | --------------------------------------------------------- |
| `accept=html\|md\|none\|<literal>`              | the `Accept` header to send                               |
| `req:<Name>=<value>`                            | a further request header, e.g. `req:If-None-Match=*`      |
| `cc=` / `cc~`                                   | `Cache-Control`                                           |
| `ct=` / `ct~`                                   | `Content-Type`                                            |
| `xrt=`                                          | `X-Robots-Tag` (`=absent` works for all of these)         |
| `h:<Name>=`                                     | any header                                                |
| `vary+Accept` / `vary-Accept`                   | whether `Vary` contains `Accept`                          |
| `link+describedby` / `link-describedby`         | whether the agent `Link` header carries `rel=describedby` |
| `csp=1`                                         | exactly one `Content-Security-Policy` header              |
| `sec+`                                          | `Referrer-Policy` and `Permissions-Policy` are present    |
| `body~<regex>`                                  | which file or ErrorDocument answered                      |
| `hops=N` / `final=<status>` / `final-url=<url>` | the redirect chain                                        |

**How a chain is followed:**

- It is followed locally while the target host is one the docroot serves: `*.ag-grid.com`, `angulargrid.com`.
- An off-site target ends the chain.
- A row expecting `final=200` gets its end page created automatically.

**Other keys:** `page=<path>` creates an extra placeholder file; `twin=no` skips the `.md` twin.

**`known-fail=<ref>`** marks approved desired behaviour that is not implemented yet.

- The row must fail, and it is reported separately with its reference.
- If it unexpectedly passes, the run fails so that the marker gets removed.
- Known-wrong behaviour is never encoded as expected. If the right answer isn't decided, the row is left unasserted.

**Directives:** `# @category <name>` groups the rows that follow it in the summary. `# @min-rows <n>`
guards against a generator silently dropping rows.

### Files

**`curated.tsv`** holds hand-written rows per SE ticket, including the blog-host migration map.

**`edge.tsv`** is hand-written too, and covers the edge behaviour of the whole tree:

- every non-www host × grid, charts, studio and archive pages → **one** hop to the www URL;
- the live regressions from `waf-finding.md` §2/§3;
- the charts landing hubs;
- caching per content class, for live pages, released archives, in-flight archives (grid and charts) and studio archives;
- which ErrorDocument answers;
- `Link`, `Vary`, CSP and security-header scoping;
- scanner paths.

**`generated-*.tsv` are generated and must never be hand-edited:**

| File                                                                                 | Generator                       | Source of the rows                                                                                                                                                              |
| ------------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generated-grid.tsv`, `-grid-archive`                                                | `gen-main-expectations.mjs`     | every `Redirect`/`RedirectMatch` and SE-64 single-hop rewrite in the grid file (an archive's rebased subset too)                                                                |
| `generated-charts.tsv`, `-charts-archive`, `generated-studio.tsv`, `-studio-archive` | `gen-subsite-expectations.mjs`  | every `RewriteRule` redirect and `[G]` in the subsite file, on www, apex and blog                                                                                               |
| `generated-markdown.tsv`                                                             | `gen-markdown-expectations.mjs` | each site's `*_MARKDOWN_PAGE_GROUPS` registry: `.md` negotiation, plus the HTML headers of each content class, live and archive; every archive `.md` is `X-Robots-Tag: noindex` |

**The generators predict each row from the rule's own semantics**, not by asking Apache:

- first match;
- prefix append;
- the add-slash rule;
- per-dir pattern context.

Running the rows against Apache cross-checks those predictions.

**Every generated redirect row also asserts `Cache-Control: no-cache`**, the root's always-table
rule for 3xx except 304 (see `Rows.add` in `generators/lib.mjs`). `edge.tsv` checks that a 304 keeps
the long cache of the copy it revalidates.

**Where Apache will do something the rule's author did not intend, the generator asserts the
intended target and marks the row `known-fail`:**

- a doubled slash from a prefix append;
- a rule shadowed by an earlier, broader one.

### Regenerating

Regenerate only after an **intentional** rule change, then review the diff like a snapshot update.
Regenerating to make a failure go away would re-predict the regression as the expectation.

```bash
CHARTS_REF=origin/<branch> STUDIO_REF=origin/<branch> node documentation/ag-grid-docs/testing/htaccess-harness/generators/regenerate.mjs
```

## Known failures

Each one is listed in the run summary under `KNOWN FAILURES`, with its reference.

**The charts archive 404 is cached for a year** (`waf-finding.md` §4).

- Charts archive builds serve their own `404.html` below the archive path, so the root's archive cache rule matches it.
- Approved fix: gate the archive cache on `REQUEST_STATUS == 200`.

The grid redirect findings this harness first reported - rules shadowed by a broader `Redirect`
(`/{fw}-grid/server-side-*` in 2 hops, archive `themes-*` pages on a 404), the unreachable
`/documentation/<fw>/charts*` rules (AG-17152) and the `framework-data-flow` double slash - are
fixed, and their rows now pass as ordinary expectations.
