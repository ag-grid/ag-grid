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

| Flag                 | Effect                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `--only <list>`      | Comma-separated areas (below) or check-id prefixes, e.g. `--only redirects,headers.markdown`  |
| `--pending`          | Also evaluate expectations that are not deployed yet. They never fail the run                 |
| `--strict`           | Known issues and warnings also fail the run                                                   |
| `--list`             | List the selected checks (with their lifecycle marker) without running anything               |
| `--verbose`          | Show detail for passing checks, and log every HTTP request                                    |
| `--full-links`       | Check every llms.txt index link (~850, slow and over the default cap: raise `--max-requests`) |
| `--days <n>`         | CloudTrail window for the edge-write summary (default 7)                                      |
| `--max-requests <n>` | HTTP request cap (default 400)                                                                |
| `--concurrency <n>`  | Requests in flight (default 4, max 8)                                                         |
| `--delay <ms>`       | Minimum gap between request starts (default 120)                                              |
| `--user-agent <ua>`  | Override the default browser User-Agent                                                       |
| `--json <file>`      | Also write the results and the request log as JSON (redacted)                                 |

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

The report ends with a per-area summary table, the request count against the cap, the markdown
guard's source (live config, or the declared fallback that refuses every markdown probe), any IAM actions the profile was denied, and the
SE tickets with no check citing them.

## Safety guarantees

These are enforced in code, not by convention:

- **AWS is read-only.** Every call goes through `core/aws.ts`, which runs the AWS CLI with
  `--profile ddos-report-readonly` and refuses, before executing anything, any operation that is
  not `get-*`, `list-*`, `describe-*` or `lookup-*`, and any `--profile`, `--endpoint-url` or
  `--no-sign-request` argument. Credential environment variables are stripped.
- **HTTP is GET/HEAD only**, under a hard request cap (400 per run by default), at most 4 requests
  in flight and at least 120 ms between request starts, with a current desktop Chrome User-Agent by
  default. Responses are memoised, and a document asked for by HEAD is fetched once as a GET that
  every check reading that URL shares; only the cache probes that must see a new response bypass it.
- **The markdown guard.** A request with `Accept: text/markdown` is refused unless the live
  distribution config shows the path's behaviour either does not cache, or keys its cache on
  `x-ag-accept-markdown`, runs the `archive-markdown-cache-key` viewer-request function, and that
  function's LIVE code (read with `cloudfront:GetFunction`) sets `x-ag-accept-markdown` from a
  `text/markdown` test of the Accept header. If the live config cannot be read, every markdown
  probe is refused, whatever the declared behaviours say; if the function code cannot be read (the
  profile lacks `cloudfront:GetFunction` today) or does not pass that static check, every probe on a
  caching behaviour is refused. This is what prevents a repeat of the 2026-09 `/example/` markdown
  cache poisoning.
- **Secrets never print.** WAF verify-header values and the origin custom header are registered with
  the redactor as soon as they are parsed, and every printed line and the JSON output pass through
  it. Checks compare secrets in memory and describe them by header name and length only.
- **Offline self-test** of the CloudFront pattern matcher, the robots.txt evaluator, the WAF
  transforms and the markdown-twin mapping runs before any request.

## What it covers

Areas, in report order (the `--only` names). Counts are checks per area (pending / known issue).

| Area             | Checks       | What it verifies                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudfront`     | 31 (5 / 0)   | Distribution settings, the single ALB origin, every cache behaviour in order, cache and origin request policies, real-time log fields (SE-116/117), that markdown-negotiated pages never land on a caching behaviour without a key split, and the archive cache behaviours and function (pending `add-archive-cache-behaviors.sh`) |
| `waf-config`     | 27 (6 / 3)   | Rule order, actions and metric names on both web ACLs, the shared-secret Allow rules, the `build-server` IP set, Bot Control, AntiDDoS, the credential-scanner regex (SE-185), the non-browser rule and its allowlists (SE-78/184), rate rules, logging, redaction and retention                                                   |
| `infra`          | 19 (1 / 1)   | Alarms and their SNS wiring, the viewer certificate, Shield Advanced, the ALB security group and attributes, recent CloudTrail edge writes, 24h 5xx rate, origin share and healthy hosts                                                                                                                                           |
| `redirects`      | 137 (3 / 18) | First status, Location (query string included) and hop count for every host alias and legacy URL in the SE ticket QA tables                                                                                                                                                                                                        |
| `headers`        | 46 (15 / 1)  | Response headers per content class: Link, security headers sent once, Cache-Control, Vary, X-Robots-Tag, markdown content types, 304 revalidation, internal hosts                                                                                                                                                                  |
| `caching`        | 25 (3 / 0)   | A repeat request is a hit on every caching behaviour, never-cached pages never hit, Host in the cache key, and HTML-markdown-HTML poisoning probes                                                                                                                                                                                 |
| `waf-behaviour`  | 24 (0 / 2)   | WAF decisions from this machine: the agent 403 guidance, safe paths, scanner blocks, AI crawler UAs and the automated-browser challenge                                                                                                                                                                                            |
| `crawler-policy` | 40 (2 / 5)   | robots.txt groups, the AI group mirroring `*`, a URL verdict matrix for search and AI crawlers, and agreement with the live WAF UA allowlist                                                                                                                                                                                       |
| `agent-files`    | 18 (0 / 2)   | llms.txt, AGENTS.md, advertised `.md` twins and links, the MCP server card                                                                                                                                                                                                                                                         |
| `seo-content`    | 26 (1 / 5)   | H1s, empty headings, JSON-LD graph, Organization, offers, canonicals, footer headings, social images, landmarks, viewport, links to redirecting URLs                                                                                                                                                                               |
| `blog`           | 9 (0 / 0)    | The /blog/ migration: headers, posts, tag noindex, pagination, RSS and sitemaps                                                                                                                                                                                                                                                    |

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

| Concern                                        | Checks                                                                                                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Behaviour order and policies                   | `cloudfront.behaviours.order`, `cloudfront.behaviour.*`, `cloudfront.cache-policy.*`                                                                      |
| Markdown cache poisoning (2026-09 `/example/`) | `cloudfront.behaviours.negotiated-pages-uncached`, `caching.markdown-does-not-poison.*`, `caching.never-hit.*`, the markdown guard                        |
| Archive caching and the markdown key split     | `cloudfront.behaviour./archive/*`, `cloudfront.function.archive-markdown-cache-key`, `caching.archive-markdown-split`, `caching.hit./archive/*` (pending) |
| Redirects and live markdown never cached       | `headers.redirect.no-cache.*`, `headers.markdown.*-no-cache` (pending grid c0eadabc4e3), `headers.not-modified-keeps-cache`                               |
| Archived markdown noindexed                    | `headers.markdown.archive-noindex.*` (pending)                                                                                                            |
| Revalidation (304s) on gzip and across hosts   | `headers.revalidate-gzip.*` (pending grid a5ea9272023), `headers.archive-validators-agree` (pending grid d1087c3088f and a re-extract)                    |
| Origin bypass                                  | `waf-config.alb.*`, `infra.alb.security-group`                                                                                                            |
| Secrets in WAF logs                            | `waf-config.*.logging.redaction`, `waf-config.*.log-retention`, `waf-config.cf.verify-secrets-distinct`                                                   |
| Bot and agent policy                           | `waf-config.cf.nonbrowser-rule*`, `waf-config.cf.bot-control*`, `waf-behaviour.*`, `crawler-policy.robots-vs-waf*`                                        |

## Updating the expected state

The expected state lives in `src/expected/`, one file per concern; the checks in `src/checks/` read
it and should rarely need to change.

- **An intentional infra change** (one of the repo-root `*.sh` scripts, a console change, a new
  alarm): edit the matching declaration in `expected/edge.ts` in the same change, so the suite
  keeps catching unreviewed drift. A hand change with no matching edit shows up as a `FAIL`, and
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
