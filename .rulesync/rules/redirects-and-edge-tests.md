---
targets: ['*']
description: 'Redirect, caching and header changes to the docs .htaccess: keep the production edge tests in ag-devops in step'
globs:
    [
        'documentation/ag-grid-docs/src/utils/htaccess/**/*',
        'documentation/ag-grid-docs/plugins/agHtaccessGen.ts',
        'documentation/ag-grid-docs/testing/htaccess-harness/**/*',
        'documentation/ag-grid-docs/src/pages/robots.txt.ts',
        'documentation/ag-grid-docs/src/utils/robotsTxt*.ts',
    ]
---

# Redirects and the production edge tests

This repo's htaccess tests (the snapshot tests and the real-Apache harness in
`documentation/ag-grid-docs/testing/htaccess-harness/`) prove the `.htaccess` the build generates.
What www.ag-grid.com actually serves is verified by the edge tests in the `ag-grid/ag-devops` repo
(`edge-tests/`, usually checked out next to this repo; its README is the reference). When a change
here alters what production returns, update the edge tests as part of the same work, open the
ag-devops PR alongside this one and link it from this PR's body.

## What to update in `ag-devops/edge-tests/src/`

| Change in this repo | Edge-test update |
| --- | --- |
| A redirect added for a ticket (an `SE-` ticket's list of addresses, or a fix someone will check on production) | One row per address in `expected/redirects.ts`, in a section named after the ticket, each with `pending:` set to an entry in `PENDING` (`expected/lifecycle.ts`) that names this PR and the release branch it deploys with |
| A redirect changed or removed | Search `expected/redirects.ts` for the address and update or remove its rows |
| A ticket the edge tests don't cite yet | Add it to `expected/tickets.ts`, and to the area's ticket list in the overview comment at the top of `main.ts` (`main.test.ts` keeps the two equal) |
| `Cache-Control`, `s-maxage` or another caching rule for pages or redirects | Check `expected/headers.ts` and `expected/caching.ts`. Also check that CloudFront's cache key (`expected/edge.ts`, `terraform/www/cache-policies.tf`) still tells apart the responses that differ: the key leaves query strings out, so a cacheable response that depends on the query string is served to requests it doesn't belong to |
| Other response headers, or `robots.txt` | `expected/headers.ts`, `expected/robots.ts` |

No update is needed for the redirect sweep (`redirect-sweep`): it reads every rule from the deployed
release branch, through this repo's `testing/htaccess-harness/lib/liveRedirects.mjs`. So a bulk
rename that no ticket names needs harness rows here but no edge-test rows.

## Checking

From `ag-devops/edge-tests`:

- `npm run check`: type check, lint and the offline tests.
- `npx tsx src/main.ts --pending --only <areas>`: the live checks for every area the change touches
  (GET/HEAD only). Run it before the release, when new rows show `PENDING`, and again once it is
  live, when they show `NOW LIVE`. A `FAIL` is a regression.

| Change | Areas |
| --- | --- |
| Redirects | `redirects` |
| Caching rules for pages or redirects | `caching,headers` |
| Other response headers | `headers` |
| `robots.txt` | `crawler-policy` |

Without the `ddos-report-readonly` AWS profile, checks that need an AWS read report `SKIP`, among
them the markdown cache checks and the WAF side of `crawler-policy`. A CloudFront cache-key change
also needs the `cloudfront` area, which does need the profile. The edge-tests README describes each
area.

Say in the PR body which edge-test areas you ran.

## After the release deploys

`--pending` then reports the new rows `NOW LIVE`. Remove their `pending` markers and the `PENDING`
entry in an ag-devops PR, so the rows guard the deployed state.
