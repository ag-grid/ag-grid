# Header token overrides

Seam for overriding the shared site-header's tunable breakpoints (`$nav-collapse`,
`$docs-search-inline`, `$switcher-popup-at`, `$search-box-cap-at` — see
`external/ag-website-shared/src/components/site-header/_breakpoints.scss`) without
forking the shared `ag-website-shared` subrepo.

`_site-header-tokens.scss` in this directory is a real, working example — currently a
no-op, since ag-grid has no reason to diverge from the shared defaults yet. To override
a value, replace its `@forward` with the commented example below it and set your own
value in `with (...)`. Any token you don't list there keeps the shared default; this
works because the shared file declares its variables `!default` specifically so
`with()` can configure some and default the rest.

This directory is listed in `astro.config.mjs`'s Sass `loadPaths` ahead of the shared
package's own paths, which is what makes the override take effect.
