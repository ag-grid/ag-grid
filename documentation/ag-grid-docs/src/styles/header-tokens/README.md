# Header token overrides

This directory is a seam for overriding the shared site-header's tunable breakpoints
(`$nav-collapse`, `$docs-search-inline`, `$switcher-popup-at`, `$search-box-cap-at` —
see `external/ag-website-shared/src/components/site-header/_breakpoints.scss` for what
each one controls) without forking the shared `ag-website-shared` subrepo.

It's listed in `astro.config.mjs`'s Sass `loadPaths`, **ahead of**
`external/ag-website-shared/src`. The shared header does `@use 'site-header-tokens'` /
`@forward 'site-header-tokens'` as a bare module name — Sass resolves that by walking
`loadPaths` in order and stopping at the first match.

To override one or more values for this repo, add a `_site-header-tokens.scss` file
here that `@forward`s the shared defaults file **by relative path** (not the bare
module name — that would just resolve back to this same file) `with (...)`, listing
only the variables you want to change:

```scss
@forward '../../../../../external/ag-website-shared/src/site-header-tokens' with (
    $nav-collapse: 700px
);
```

Any variable you don't list in `with (...)` keeps the shared default — this is a real
per-variable override, not an all-or-nothing file swap, because the shared file
declares its variables `!default` specifically so `with()` can do this. (A bare
`@forward 'site-header-tokens'` with no `with()` — what an earlier version of this file
did — _is_ all-or-nothing: whichever file `loadPaths` finds first replaces the other
entirely, so any variable missing from it would error as undefined. Always go through
`with()`, never write a bare `@forward`/`@use 'site-header-tokens'` here.)

ag-grid currently has no reason to diverge from the shared defaults, so no
`_site-header-tokens.scss` exists here yet — this README exists so the directory (and
the convention) survives in git even while empty of overrides.
