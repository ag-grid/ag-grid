# Edge verification

Post-deploy verification of **production** www.ag-grid.com: the SEO tickets, the AI-crawler policy,
CloudFront caching and the WAF. It reads the AWS edge configuration (read-only) and checks live HTTP
behaviour (GET/HEAD only, low volume), then compares both with a declarative expected state.

It is a plain `tsx` script with its own Nx project (`ag-grid-edge-verification`). It is **not** part
of the Vitest workspace, `./behave.sh` or CI: it talks to production, so it only runs when someone
runs it.

## Running

```sh
yarn nx run ag-grid-edge-verification:test:edge-live
yarn nx run ag-grid-edge-verification:test:edge-live -- --pending
npx tsx testing/edge-verification/src/main.ts --only redirects,headers --verbose
```

Prerequisites: the AWS CLI on `PATH` with a working `ddos-report-readonly` profile, and a
machine outside a datacenter IP range (the WAF behaviour rows assume Bot Control does not label the
caller as a datacenter). A full run takes a few minutes and makes about 300-400 HTTP requests.

| Flag                   | Effect                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--only <list>`        | Comma-separated areas (below) or check-id prefixes, e.g. `--only redirects,headers.markdown`; an entry ending in `$` is one exact id |
| `--pending`            | Also evaluate expectations that are not deployed yet. They never fail the run                                                        |
| `--strict`             | Known issues and warnings also fail the run                                                                                          |
| `--list`               | List the selected checks (with their lifecycle marker) without running anything                                                      |
| `--verbose`            | Show detail for passing checks, and log every HTTP request                                                                           |
| `--full-links`         | Check every llms.txt index link (~850, slow and over the default cap: raise `--max-requests`)                                        |
| `--days <n>`           | CloudTrail window for the edge-write summary (default 7)                                                                             |
| `--max-requests <n>`   | HTTP request cap (default 400)                                                                                                       |
| `--concurrency <n>`    | Requests in flight (default 4, max 8)                                                                                                |
| `--delay <ms>`         | Minimum gap between request starts (default 120)                                                                                     |
| `--user-agent <ua>`    | Override the default browser User-Agent                                                                                              |
| `--json <file>`        | Also write the results and the request log as JSON (redacted)                                                                        |
| `--bot-window <dur>`   | `bot-outcomes`: WAF log window, e.g. `30m` or `2h` (default 2h)                                                                      |
| `--bot-threshold <%>`  | `bot-outcomes`: highest acceptable non-ALLOW share, in percent (default 1)                                                           |
| `--bot-min-volume <n>` | `bot-outcomes`: smaller populations are reported, not judged (default 20)                                                            |
| `--bot-max-gb <n>`     | `bot-outcomes`: refuse the query when its estimated scan is larger (default 4)                                                       |

Exit code: 0 when nothing failed, 1 on any failure (with `--strict`, also on a known issue or a
warning), 2 when the run aborted.

## Statuses

Every expectation is deployed, `pending` or a `knownIssue`; the report shows one of:

| Status          | Meaning                                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PASS` / `FAIL` | A deployed expectation held, or did not. Any `FAIL` fails the run                                                                                                                                                                                                                                                                                                        |
| `PENDING`       | An approved change that is not live yet (the marker names the PR or script that deploys it). Not run without `--pending`; with it, a failure is still only `PENDING`                                                                                                                                                                                                     |
| `NOW LIVE`      | A pending expectation passed: the change is live, so remove its `pending` marker                                                                                                                                                                                                                                                                                         |
| `KNOWN`         | A verified current defect (`knownIssue`, citing waf-finding.md or this suite's first run). Always run, reported separately, fails only with `--strict`                                                                                                                                                                                                                   |
| `FIXED?`        | A known issue passed: if the fix is intended, remove the `knownIssue` marker                                                                                                                                                                                                                                                                                             |
| `WARN`          | A health signal (5xx rate, origin share, healthy hosts) outside its threshold                                                                                                                                                                                                                                                                                            |
| `INFO`          | Informational output (CloudTrail writes, shadowed behaviours, browser-only tickets)                                                                                                                                                                                                                                                                                      |
| `SKIP`          | Could not be verified: an IAM action is missing ("unverifiable - needs IAM action X"), AWS credentials are unusable, AWS throttled or could not be reached, the request cap was reached, or the markdown guard refused the probe. A declared resource AWS reports missing (`NoSuch*`, `*NotFound`, `WAFNonexistentItemException`) is a `FAIL`, as is any other AWS error |

A check that loops over many URLs and has already found failures when the request cap is reached
reports them as a `FAIL`, noting that the rest went untested; only one that found nothing is a `SKIP`.

The report ends with a per-area summary table, the request count against the cap, the markdown
guard's source (live config, or the declared fallback that refuses every markdown probe), any IAM actions the profile was denied, and the
SE tickets with no check citing them.

## Safety guarantees

These are enforced in code, not by convention:

- **AWS is read-only.** Every call goes through `core/aws.ts`, which runs the AWS CLI with
  `--profile ddos-report-readonly` and refuses, before executing anything, any operation that is
  not `get-*`, `list-*`, `describe-*` or `lookup-*`, and any `--profile`, `--endpoint-url` or
  `--no-sign-request` argument. The one exception is `logs start-query` (a Logs Insights query reads
  log events; its results come back through `get-query-results`), allowed for the `logs` service only.
  Credential environment variables are stripped.
- **WAF log queries are capped.** `bot-outcomes` runs one Logs Insights query per run over
  `aws-waf-logs-cloudfront` (default window 2h). Before starting it, the suite reads the group's
  `IncomingBytes` for the window (doubled: Insights scanned twice what was ingested on 2026-10-01)
  and refuses the query if that is over `--bot-max-gb`. The query filters on the UA tokens before it
  parses (a parse over the whole group silently under-counts), matches the user agent inside
  `@message` rather than by header index, and the report prints the bytes actually scanned.
  `logs:StopQuery` is not granted, so a query that has started always runs to completion.
- **HTTP is GET/HEAD only**, under a hard request cap (400 per run by default), at most 4 requests
  in flight and at least 120 ms between request starts, with a current desktop Chrome User-Agent by
  default. Responses are memoised, and a document asked for by HEAD is fetched once as a GET that
  every check reading that URL shares; only the cache probes that must see a new response bypass it.
- **The markdown guard.** A request with `Accept: text/markdown` is refused unless the live
  distribution config shows the path's behaviour either does not cache, or keys its cache on
  `x-ag-accept-markdown`, runs the `archive-markdown-cache-key` viewer-request function, and that
  function's LIVE code (read with `cloudfront:GetFunction`) sets `x-ag-accept-markdown` from a
  `text/markdown` test of the Accept header. The guard reads the distribution's status and config
  from one `cloudfront:GetDistribution` snapshot before anything is authorised: unless it is
  `Deployed`, every markdown probe is refused, because the config is control-plane state the edges
  may not serve yet. Two separate reads could pair a Deployed status with a newer config. If the live config cannot
  be read, every markdown
  probe is refused, whatever the declared behaviours say; if the function code cannot be read (the
  profile lacks `cloudfront:GetFunction` today) or does not pass that static check, every probe on a
  caching behaviour is refused. This is what prevents a repeat of the 2026-09 `/example/` markdown
  cache poisoning.
- **Secrets never print.** WAF verify-header values and the origin custom header are registered with
  the redactor as soon as they are parsed, and every printed line and the JSON output pass through
  it. Checks compare secrets in memory and describe them by header name and length only.
- **Offline self-test** of the CloudFront pattern matcher, the robots.txt evaluator, the WAF
  transforms and the markdown-twin mapping runs before any request.

## Offline tests

The guard, the AWS error classification, the WAF structure checks (including the rules two scripts
insert after p11, in either order) and the WAF log query (its text, result parsing, thresholds and
byte cap), and the HTTP checks most exposed to a wrong verdict (the archive cache split, the archive
validator agreement, and the link checks under the request cap) have offline tests that use
a fake AWS client, a fake HTTP transport behind the real client, and no network (`src/**/*.test.ts`, fixtures in `src/testing/fakes.ts`). They are
not part of the repo's Vitest workspace or `./behave.sh`; run them with:

```bash
NX_DAEMON=false yarn nx run ag-grid-edge-verification:test:offline
# or, from testing/edge-verification:
node --import tsx --test "src/**/*.test.ts"
```

## What it covers

Areas, in report order (the `--only` names). Counts are checks per area (pending / known issue).

| Area             | Checks        | What it verifies                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudfront`     | 31 (5 / 0)    | Every field of the distribution settings, the single ALB origin, each cache behaviour (in order) and the cache and origin request policies they use, the real-time log configuration (SE-116/117), that markdown-negotiated pages never land on a caching behaviour without a key split, and the archive cache behaviours and function (pending `add-archive-cache-behaviors.sh`)   |
| `waf-config`     | 32 (9 / 3)    | Rule order and every field of every rule on both web ACLs (each managed group's complete override set included), both ACLs' settings, the shared-secret Allow rules, the `build-server` and `salience-bot` IP sets, Bot Control, AntiDDoS, the credential-scanner regex (SE-185), the non-browser rule and its allowlists (SE-78/184), rate rules, logging, redaction and retention |
| `infra`          | 20 (1 / 1)    | Every field of each alarm (metric, dimensions, statistic, threshold, actions), the viewer certificate, Shield Advanced, the ALB, its security group and attributes, recent CloudTrail edge writes, 24h 5xx rate, origin share and healthy hosts                                                                                                                                     |
| `redirects`      | 170 (32 / 17) | First status, Location (query string included) and hop count for every host alias and legacy URL in the SE ticket QA tables                                                                                                                                                                                                                                                         |
| `migration`      | 27 (21 / 0)   | The grid#15430 archive `.htaccess` migration: alias hosts one hop to the same archive URL on www (slash-less directory URLs too, pending grid#15434/#15435), the grid rules that left the archive, markdown negotiation on 36.1.0/36.2.0, backups never served. Samples the lowest and highest version per site; `--only migration` checks all 16 (71 checks)                       |
| `headers`        | 50 (18 / 2)   | Response headers per content class: Link, security headers sent once, Cache-Control, Vary, X-Robots-Tag, markdown content types, 304 revalidation, internal hosts                                                                                                                                                                                                                   |
| `caching`        | 25 (3 / 0)    | A repeat request is a hit on every caching behaviour, never-cached pages never hit, Host in the cache key, and HTML-markdown-HTML poisoning probes                                                                                                                                                                                                                                  |
| `waf-behaviour`  | 24 (0 / 2)    | WAF decisions from this machine: the agent 403 guidance, safe paths, scanner blocks, AI crawler UAs and the automated-browser challenge                                                                                                                                                                                                                                             |
| `crawler-policy` | 46 (3 / 8)    | robots.txt groups, the AI group mirroring `*`, a URL verdict matrix for search and AI crawlers, and agreement with the live WAF UA allowlist                                                                                                                                                                                                                                        |
| `agent-files`    | 21 (3 / 2)    | llms.txt, AGENTS.md, advertised `.md` twins and links, the MCP server card                                                                                                                                                                                                                                                                                                          |
| `seo-content`    | 28 (1 / 7)    | H1s, empty headings, JSON-LD graph, Organization, offers, canonicals, footer headings, social images, landmarks, viewport, links to redirecting URLs                                                                                                                                                                                                                                |
| `blog`           | 9 (0 / 0)     | The /blog/ migration: headers, posts, tag noindex, pagination, RSS and sitemaps                                                                                                                                                                                                                                                                                                     |
| `bot-outcomes`   | 61 (18 / 1)   | From the WAF logs (no HTTP): per crawler and agent family, whether Bot Control-verified requests were allowed, and whether families the live p11 allowlist admits were (payload-rule blocks excluded), above a 1% share and a 20-request floor                                                                                                                                      |

### SE tickets

Every ticket in `expected/tickets.ts` is cited by at least one check; the report's coverage line
says so on every run (parents SE-8 and SE-181 are covered through their children).

| Ticket                                                                          | Checked in                                                     |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| SE-4 (apex and host canonicalisation)                                           | redirects, headers, caching, crawler-policy, cloudfront        |
| SE-8 (SEO audit parent: SE-41 to SE-50)                                         | seo-content                                                    |
| SE-24, SE-29 (charts host, archives noindex)                                    | redirects, headers                                             |
| SE-26 (legacy grid hosts)                                                       | redirects, cloudfront                                          |
| SE-28, SE-30, SE-60, SE-61, SE-64, SE-66 (redirect chains and legacy URLs)      | redirects                                                      |
| SE-38, SE-81 (Link header and security headers)                                 | headers                                                        |
| SE-40, SE-93 (one CSP, blog headers)                                            | headers, blog, redirects                                       |
| SE-41, SE-42, SE-43, SE-44, SE-45, SE-46, SE-47, SE-48, SE-49, SE-50            | seo-content (SE-44 and SE-46 need a browser: reported as INFO) |
| SE-63, SE-71, SE-162 (structured data, offers)                                  | seo-content                                                    |
| SE-77, SE-79 (llms.txt, AGENTS.md, server card)                                 | agent-files, waf-behaviour, waf-config                         |
| SE-78, SE-184 (AI crawler policy vs WAF)                                        | crawler-policy, waf-behaviour, waf-config                      |
| SE-80 (markdown negotiation)                                                    | headers, caching, cloudfront, waf-behaviour                    |
| SE-85, SE-87, SE-88, SE-89, SE-90, SE-91, SE-94, SE-113, SE-188 (the blog move) | blog, redirects, crawler-policy, seo-content                   |
| SE-116, SE-117 (real-time logs)                                                 | cloudfront                                                     |
| SE-164, SE-166 (internal links to redirects)                                    | redirects, seo-content, headers                                |
| SE-181 (parent: SE-182 to SE-191)                                               | through its children                                           |
| SE-182, SE-183, SE-191 (robots.txt)                                             | crawler-policy, redirects                                      |
| SE-185 (credential scanners)                                                    | waf-config, waf-behaviour, headers                             |
| SE-186, SE-189, SE-190 (sitemaps, favicon, asset caching)                       | headers, redirects, cloudfront                                 |
| SE-187 (internal hosts noindexed)                                               | headers, cloudfront                                            |

### Caching and WAF

| Concern                                        | Checks                                                                                                                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Behaviour order and policies                   | `cloudfront.behaviours.order`, `cloudfront.behaviour.*`, `cloudfront.cache-policy.*`                                                                                        |
| Markdown cache poisoning (2026-09 `/example/`) | `cloudfront.behaviours.negotiated-pages-uncached`, `caching.markdown-does-not-poison.*`, `caching.never-hit.*`, the markdown guard                                          |
| Archive caching and the markdown key split     | `cloudfront.behaviour./archive/*`, `cloudfront.function.archive-markdown-cache-key`, `caching.archive-markdown-split`, `caching.hit./archive/*` (pending)                   |
| Redirects and live markdown never cached       | `headers.redirect.no-cache.*`, `headers.markdown.*-no-cache` (pending grid c0eadabc4e3), `headers.not-modified-keeps-cache`                                                 |
| Archived markdown noindexed                    | `headers.markdown.archive-noindex.*` (pending)                                                                                                                              |
| Revalidation (304s) on gzip and across hosts   | `headers.revalidate-gzip.*` (pending grid a5ea9272023), `headers.archive-validators-agree` (pending grid d1087c3088f and a re-extract; agreement is SKIP: no host evidence) |
| Origin bypass                                  | `waf-config.alb.*`, `infra.alb.security-group`                                                                                                                              |
| Secrets in WAF logs                            | `waf-config.*.logging.redaction`, `waf-config.*.log-retention`, `waf-config.cf.verify-secrets-distinct`                                                                     |
| Bot and agent policy                           | `waf-config.cf.nonbrowser-rule*`, `waf-config.cf.bot-control*`, `waf-behaviour.*`, `crawler-policy.robots-vs-waf*`                                                          |
| What real bots and agents received             | `bot-outcomes.*` (WAF logs, the last `--bot-window`)                                                                                                                        |

## Post-deploy runbook

Run these from the repo root after each deploy step, on a machine outside a datacenter range. Each
command evaluates the pending expectations of the areas that step touches, so it stays well under
the request cap; the full default run (`yarn nx run ag-grid-edge-verification:test:edge-live`)
afterwards must still show no `FAIL`.

What passing looks like is the same for every step: the step's own `PENDING` rows turn `NOW LIVE`
and its known issues turn `FIXED?`, while nothing else changes. Then, in the same change, delete those
`pending` markers (and the `knownIssue` markers that show `FIXED?`) so the expectations start
guarding the deployed state. A `PENDING` row that cites the step but still fails is the step not
working; a `FAIL` anywhere is a regression. On either, keep the output (`--json <file>`), and roll
the step back as it says below before investigating.

```sh
EV="npx tsx testing/edge-verification/src/main.ts"
```

### grid#15424 (the docs release that carries seo-edge-unit-tests-v2)

```sh
$EV --pending --only redirects,crawler-policy,agent-files,seo-content
```

- `NOW LIVE`: the ACME rows (`/.well-known/acme-challenge/...` answered 404 on www and the apex,
  never add-slashed), the slash-less `/react-data-grid/getting-started` rows on each alias host, the
  server-side and `/documentation/<fw>/charts*` samples, `crawler-policy.robots.md-twins`,
  `crawler-policy.robots.md-twins-query` (2ed1049f81e adds a `<page>.md?` rule beside each
  `<page>.md$`, so a query string no longer reopens a twin), `crawler-policy.robots.url./archive/`
  and `./charts/archive/`, `agent-files.link.grid-data-grid`. Delete each of these rows' `pending`
  markers once they show `NOW LIVE`, `PENDING.gridRobotsTwinsQuery` included.
- `FIXED?`: `redirects.www.ag-grid.com/javascript-grid/` and the `.md` twin rows of
  `crawler-policy.robots.url.*`.
- The `angulargrid.com` and `www.angulargrid.com` rows `SKIP` while those hosts are not in DNS.
- On failure: the release's `.htaccess` and `robots.txt` come from the docs build; redeploy the
  previous docs release (`switchReleaseRemote.sh`) if a deployed row fails.

### ag-charts#8422 / #8432 (charts release), ag-studio#3084 / #3087 (studio release)

```sh
$EV --pending --only redirects,seo-content,agent-files,crawler-policy
```

- Charts: `NOW LIVE` on the `/charts/...` alias-host and legacy-prefix rows (renamed slugs in one hop,
  `index.html` and `.md` files keeping their path) and `agent-files.link.charts-options.*`;
  `FIXED?` on `seo-content.h1.charts-home`, `.landmark.main-charts`, `.social-images.absolute-charts`,
  `agent-files.known./charts/javascript/options/` and the charts rows citing waf-finding.md §2.
- Studio: `NOW LIVE` on the `/studio/...` alias-host rows and `seo-content.json-ld.studio-no-offers`;
  `FIXED?` on `.landmark.main-studio`, `.social-images.absolute-studio`, `.viewport-studio`.
- On failure: redeploy the previous charts or studio release.

### grid#15430 archive migration (`migrateDeployedArchiveHtaccess.sh`, once per web host)

Both web hosts serve every archive and CloudFront spreads requests across them, so do not verify
after the first host: the results would be a mix of migrated and unmigrated responses.

```sh
# after --apply on the SECOND host
$EV --pending --only migration
$EV --pending --only redirects.ag-grid.com/archive,redirects.blog.ag-grid.com/archive
```

- `NOW LIVE` on every `migration.*.alias-host`, `.leaks` and `.markdown` row (all 14 versions);
  `migration.*.backup-not-served` passes (403) before and after, or `SKIP`s as inconclusive on a 404. `FIXED?` on the apex 36.2.0 redirect row.
- `migration.grid.*.markdown` `SKIP`s (with the twin's status) if the markdown guard refuses the
  probe, which it does once `add-archive-cache-behaviors.sh` caches archives without a verified key split.
- If `add-archive-cache-behaviors.sh` has already run, a cached pre-migration response can show the
  old behaviour until it expires: invalidate `/archive/*`, `/charts/archive/*` and
  `/studio/archive/*` or wait before judging.
- On failure: the script printed one `cp -p <dir>/.htaccess.bak-<ts> <dir>/.htaccess` restore
  command per file it changed; run them on both hosts.

### AWS scripts (repo root)

Take `./backup-waf-acl.sh` before any WAF script; `./restore-waf-acl.sh` undoes one.

| Script                                            | Then run                                                                      | Passing                                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add-archive-cache-behaviors.sh`                  | `$EV --pending --only cloudfront,caching,headers`                             | `NOW LIVE` on `cloudfront.behaviour./archive/*`, `/charts/archive/*`, the function and `caching.hit./archive/*`; no `caching.markdown-does-not-poison` failure |
| `redact-waf-log-secrets.sh`                       | `$EV --pending --only waf-config`                                             | `NOW LIVE` on `waf-config.*.logging.redaction`                                                                                                                 |
| `move-datacenter-block-after-agent-exemptions.sh` | `$EV --pending --only waf-config,waf-behaviour`                               | `NOW LIVE` on `waf-config.cf.rule.block-datacenter-except-agent-paths` and the SignalKnownBotDataCenter Count override                                         |
| `extend-p11-agent-allowlist.sh`                   | `$EV --pending --only waf-config,crawler-policy`                              | `NOW LIVE` on `waf-config.cf.nonbrowser-rule.agent-allowlist` and `waf-config.cf.rule.count-allowlisted-agents-rate`; `FIXED?` on the Perplexity-User rows     |
| either WAF script, 2h+ later                      | `$EV --pending --only bot-outcomes --bot-window <time since apply minus 10m>` | `NOW LIVE` on the `bot-outcomes.*.all` / `.unverified` rows citing the script, and no family `FAIL`                                                            |

The two WAF scripts each insert one rule straight after p11; the checks accept either order. When
both are live and their markers are removed, list the two rules in `CF_ACL.rules` in their live order.
The `bot-outcomes` window must cover only traffic after the change, or old blocks dilute the result.
On failure, restore the snapshot with `./restore-waf-acl.sh` and re-run the same command to confirm.

## Updating the expected state

The expected state lives in `src/expected/`, one file per concern; the checks in `src/checks/` read
it and should rarely need to change.

- **An intentional infra change** (one of the repo-root `*.sh` scripts, a console change, a new
  alarm): edit the matching declaration in `expected/edge.ts` in the same change, so the suite
  keeps catching unreviewed drift. The AWS checks compare every field of each object they read
  with a projection built from those declarations (`expected/wafRules.ts`,
  `expected/distribution.ts`), so a field nobody declared fails too: declare it, or add it to
  that check's unpinned list with the reason. A hand change with no matching edit shows up as a `FAIL`, and
  `infra.cloudtrail.recent-writes` lists who made it.
- **An approved change that is not deployed yet:** add the expectation with
  `pending: PENDING.<name>` (`expected/lifecycle.ts` names each PR or script once, so every
  expectation that depends on it cites it identically). Check it with `--pending`.
- **When `NOW LIVE` appears:** the change is deployed; delete the `pending` marker so it becomes a
  normal expectation that can fail the run. A behaviour, rule or cache policy that was pending is
  then also compared as part of the ordered lists.
- **A verified defect nobody is fixing yet:** add `knownIssue` citing the waf-finding.md section
  (`finding(n)`) or `NEW_FINDING(...)` for one this suite found, and `fixedBy` if a fix exists.
  When it shows `FIXED?`, delete the marker.
- **A decision to accept something** (not a defect, not checked): remove the expectation; for an
  advertised link, add it to `IGNORED_LINKS` in `expected/agentFiles.ts` with the reason.

Check ids are stable (`<area>.<topic>...`) and must be unique; the suite refuses to start on a
duplicate. Run `--list` after editing to see the selected checks and their markers, and keep the
full run under the request cap (the summary prints the count).
