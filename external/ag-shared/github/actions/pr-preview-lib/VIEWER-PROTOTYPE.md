# Raw-artefact viewer — prototype findings

Status: **adopted.** `viewer.html` and `report-frame.html` are published to `gh-pages` under
`snapshot-viewer/` by `.github/workflows/gh-pages-snapshot-viewer.yml`, and `ci.yml`'s
`snapshot_review` job pushes report payloads to the `snapshot-review` branch and links to them
through the viewer. Kept as the record of why it is built this way — the constraints below are not
obvious from the two files, and several of them look like arbitrary complexity until you know what
was tried first.

## The problem this attacks

A snapshot-review report becomes visible to a reviewer only after GitHub Pages rebuilds and
redeploys the **whole** site. On this repo that was measured at 163–706s, and Pages branch builds
are single-flight — a later push cancels the in-flight build, so a report can be delayed well past
that or miss its CI run entirely. That is what produced the false "Report publish failed" comments.

Pages latency is a function of total site size, which is why the prune and the janitor were worth
doing on their own. But even a small site pays a whole-site rebuild per push.

## The idea

Push report payloads to a **plain git branch** — no Pages build at all — and serve one tiny static
page from Pages that fetches a payload and renders it.

## What was measured

Against a live artefact already on `gh-pages`
(`pr-7764/snapshot-regenerated.html`, 788,439 bytes, at gh-pages commit `7695c942`).

### The fetch works, with no proxy and no credential

`raw.githubusercontent.com` answers cross-origin requests with `access-control-allow-origin: *`.
It also sends `content-type: text/plain` with `x-content-type-options: nosniff`, which is precisely
why a viewer page is needed: linking a reviewer straight at a report shows them HTML source.

GitHub Actions **artifacts** were ruled out for this earlier — anonymous download returns 401 even
on a public repo, so a static page would need a credential.

### Push → visible: under half a second

Three runs, pushing a realistic 788 KB payload to a scratch branch and polling raw by commit SHA:

| run | push | push → raw 200 | total |
| --- | ---- | -------------- | ----- |
| 1   | 2.90s | 0.32s | 3.22s |
| 2   | 2.89s | 0.42s | 3.31s |
| 3   | 3.42s | 0.45s | 3.87s |

Against 163–706s for the Pages path, and with no cancellation failure mode.

### The payload cannot be passed into the frame from outside

This forced the architecture. At 788 KB, on Chrome 141:

| Route | Result |
| ----- | ------ |
| `srcdoc` | Silently loads nothing — no parse, no error, blank frame. Small payloads work, so the failure is size, not content |
| `blob:` URL | Blocked — a sandbox without `allow-same-origin` gives the frame an opaque origin, and an opaque origin may not read a blob owned by ours |
| `data:` URL | Renders only on a **second** identical assignment. Reproducible, and far too fragile to ship |

So `report-frame.html` performs the fetch from **inside** its own sandbox and `document.write`s the
result into itself. The payload never travels through a URL or an attribute, and the size ceiling
disappears. Fetching still works from the opaque origin: the request carries `Origin: null`, which
`access-control-allow-origin: *` allows.

### The report is sandbox-compatible

`sandbox="allow-scripts"` **without** `allow-same-origin` — the report's scripts run, but the
document cannot touch the viewer's DOM, storage or cookies. Granting `allow-same-origin` would hand
fetched HTML the `ag-grid.github.io` origin, which is shared with every PR preview; that is not an
acceptable trade and the prototype should be abandoned before it is made.

The report needs nothing an opaque origin denies: no `localStorage`, no `sessionStorage`, no
cookies, no `indexedDB`. The one exception is the Export-decisions **Copy** button, which uses
`navigator.clipboard` with an `execCommand` fallback; clipboard write may be denied by permissions
policy in the sandbox. Both paths are already wrapped and fail soft — the "copied" tick simply does
not appear. **Not yet verified either way.**

Rendering and the onion / swipe / side-by-side panes were confirmed by hand in a real browser.
Automated verification was not possible: synthetic input does not cross into a cross-origin frame,
confirmed with a control (the same report at top level takes clicks and scrolls normally).

## Design notes

- **Address by commit SHA, never a branch name.** raw serves `cache-control: max-age=300`, so a
  branch URL can be five minutes stale, and its content can change under a link already shared. A
  SHA names one immutable blob. `viewer.html` rejects anything that is not 40 hex characters.
- **Validate hard, fail closed.** An unvalidated viewer renders arbitrary HTML from any repo under
  our own origin's URL bar, which is a convincing place to host a phishing page. The owner is
  allowlisted and every parameter is pattern-checked, in both files — `report-frame.html` is
  directly fetchable and cannot assume a caller.
- **The frame posts its content height out** so the outer page owns a single scrollbar; otherwise
  the report scrolls inside a viewport-height frame and its own sticky header hides behind the
  viewer's.

## Open questions, and how they were settled

1. **Unauthenticated raw rate limits.** Measured rather than guessed, because GitHub publishes no
   number for raw and raw returns no `x-ratelimit-*` headers at all. 1275 requests at a peak of
   342 req/s produced zero 429s. That is a burst figure, not a sustained hourly one, but review
   traffic is a handful of report opens per PR — orders of magnitude below anything that was
   reachable in the probe. Not a real risk.
2. **Non-Chrome browsers.** Still Chrome-only verification. The delivery-size cliffs that shaped
   this design are Chrome's; the design avoids all of them by never putting the payload in a URL,
   so it should not be near any other engine's limits either.
3. **Export-decisions Copy** in the sandbox — a sandboxed frame without `allow-same-origin` has no
   clipboard write permission. Unresolved; the report's other controls are unaffected.
4. **Retention.** Settled: `preview-branch-janitor.yml` sweeps `snapshot-review` alongside
   `gh-pages`, and `pr-cleanup.yml` removes `pr-<N>/` from it on PR close.

## What adoption changed in CI

`snapshot_review` in `ci.yml` lost the `Wait for published reports` and `Check for in-flight Pages
deploys` steps entirely, along with the per-commit deploy marker they were gated on and the
three-state pending/live/failed link logic they fed. A push to a plain branch triggers no build, so
a successful push *is* the live state: two states remain, live and failed.
