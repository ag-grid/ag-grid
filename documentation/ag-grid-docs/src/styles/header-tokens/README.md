# Header token overrides

This directory is a seam for overriding the shared site-header's tunable breakpoints
(`$docs-search-inline`, `$switcher-popup-at`, `$search-box-cap-at` — see
`external/ag-website-shared/src/components/site-header/_breakpoints.scss` for what each
one controls) without forking the shared `ag-website-shared` subrepo.

It's listed in `astro.config.mjs`'s Sass `loadPaths`, **ahead of**
`external/ag-website-shared/src`. The shared header does `@use 'site-header-tokens'` /
`@forward 'site-header-tokens'` as a bare module name — Sass resolves that by walking
`loadPaths` in order and stopping at the first match. To override a value for this repo,
add a `_site-header-tokens.scss` file here defining just the variables you want to
change:

```scss
$docs-search-inline: 1300px;
```

Any variable you don't redeclare falls back to the shared package's own default
(`external/ag-website-shared/src/_site-header-tokens.scss`) — but note Sass module
resolution isn't a per-variable merge: if this file exists, it fully replaces the shared
default file, so redeclare every variable the shared default file defines, not just the
one you're changing.

ag-grid currently has no reason to diverge from the shared defaults, so no
`_site-header-tokens.scss` exists here yet — this README exists so the directory (and
the convention) survives in git even while empty of overrides.

Do **not** use this for `$nav-collapse` (hamburger/full-nav threshold) — that one still
aliases the sitewide `$breakpoint-site-header-small` token, which other unrelated
components (e.g. `AnnouncementBanner`) also depend on. Overriding it here would only
affect variables sourced from this seam, not that shared token — see the note in
`_breakpoints.scss` for why nav-collapse hasn't been decoupled the same way.
