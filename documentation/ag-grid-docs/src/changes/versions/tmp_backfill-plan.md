# Backfill plan — temporary working doc, delete when backfill complete

Goal: convert all historical upgrade pages into changelog files in this directory (one per release, format per `@ag-website-shared/changes/change-types.ts`), so the pages can be generated from the database and the compiled output consumed by the `ag-update` skill.

## Sources

- `documentation/ag-grid-docs/src/content/docs/upgrading-to-ag-grid-*/index.mdoc` — every major/minor/patch page, v26 through v36 (v36 already done: `36.ts`).
- `theming-v32-upgrading-to-v28{,-css,-sass}` — yields ~8 records (Legacy CSS/Sass deprecations, Sass API breaking changes); step-by-step prose stays as linked guides, not records.
- Verify technical claims against grid source (`packages/*/src`); page prose contains known errors (below).

## File format

- One file per release in this directory, named by version key: `35.ts`, `34.1.ts` ('34.1' means version 34.1.0). Files are auto-discovered by glob (in the `/update-change-records.json` endpoint) — there is no registry to update.
- Each file has EXACTLY ONE export: `export const v{name}: VersionChangelog`, where `{name}` is the file name with dots replaced by underscores (`34.1.ts` exports `v34_1`). No default export. The endpoint validates the export name, count and type at build.
- Deprecation records are plain (non-exported) consts referenced from the `deprecations` object; a later release removes one by importing the changelog and referencing through it: `removalsAfterDeprecation: [v34.deprecations.myDepId]`.
- Validation runs at build via the endpoint (compilation throws on invalid records) — there is no test file. To check records while authoring, request `/update-change-records.json` from the dev server or run the docs build.

## Process

- One agent per release page drafts records. Source-page prose is sloppy and ambiguous, so each drafted change record then gets its own dedicated investigation agent — one agent per change, not per version, because investigations are potentially deep and unbounded:
    1. Find the commit that introduced the change (`git log -S`/`--grep` with terms from the record). Sanity-check its date against the version's release window, and read the PR description for motivation and options the docs omitted.
    2. Look for an explicit escape hatch — usually added in the same commit but not documented (new params/options/theme parameters in the diff: v36 examples are `filterParams.includeTime`, `pickerButtonBorderRadius`, `valueIndex`). If none, reason carefully about whether grid APIs can restore the old behaviour; only then is `mitigation: null` justified.
    3. Verify the audience: enumerate every API surface through which the changed data/behaviour is reachable, and gate detectWords on the surfaces where apps _interpret_ it — surfaces that merely carry it opaquely (e.g. round-tripped state blobs) don't make an app affected.
    4. Add BRIEF `// REVIEW:` comments for anything problematic, confusing, or uncertain, citing the commit hash — these are for the human reviewer and are deleted during review.
- After all releases: cross-version pass joining deprecations to removals by id, and checking mitigation advice is current (not what the old page said — see chained-advice rule).

## Human review workflow

1. Prefix every line of the source page with `// ` and distribute the comments through the version file: each comment block sits directly above the record(s) derived from it. Content relating to no specific record (frontmatter, What's New, sections with no changes, changelog tags) forms a preamble at the start of the file. The ENTIRE source file must be present VERBATIM as comments (including blank lines as `//`). Comments may be moved out of source order ONLY where the authoring format's grouping requires it (e.g. all behaviourChanges in one array). Reviewers delete comments as they verify each record; a fully reviewed file has no source comments left.
2. A lower-cost model verifies that every line of the source file is present as a comment in the output file.
3. Every null field (`detectWords`, `mitigation`, `reason`) carries a comment explaining why no value applies — e.g. for `mitigation: null`, why the change is accept-only.

## Granularity

- One record per (audience, mitigation). Related APIs with identical advice = one record (Column API's ~30 methods). Advice forking on what the reader previously did = split into one record per fork (e.g. `spanHeaderHeight`: mandatory option removal + separate new-default behaviour change).
- Not records: Codemod sections, "What's New" marketing, LTS/support-policy notes.
- Cross-product AG Charts changes (Integrated Charts affected by an AG Charts major) are NOT grid records — they belong to the charts changes database. Needs test cases for the cross-product flow; until that exists, leave the draft commented out in the version file (see `36.ts`).

## Prose

- Titles are full clauses that stand alone.
- Do not break strong literals up, have one long literal. Avoid newlines in strings. Long paragraphs are fine.
- No temporal deixis ("now", "new", "will", "as of this release"); anchor facts to explicit versions ("From v31, ...").
- No status language in transition facts or mitigation ("is deprecated", "has been removed") — the renderer generates it from record position.
- `description` describes the change only; actions go in `mitigation`. Mitigation = most straightforward way to restore pre-change behaviour.
- `newApi` is required and must read in "Instead, use $newApi". For removals with no true replacement, mitigation says why deletion is safe, or `oldDescription` why the API was inert (e.g. "never had any effect").
- If a record's mitigation recommends an API that a later version deprecated/changed, write the _current_ correct advice — old pages re-rendering with updated advice is intended behaviour.
- De-deprecation (e.g. `dndSource` deprecated v31.2, reinstated v32): no record survives; delete/omit the deprecation.
- Sometimes the mitigration will be long enough to require newlines or structure. If so, move it to a sibling file `v{ver}-{slug}.md`, referenced `(await import('./v36-x.md?raw')).default`.

## detectWords

- Contract: no match anywhere in an app ⇒ app guaranteed unaffected. False positives cheap; false negatives forbidden. When no sound words exist, set `null` (with the justification comment per Human review workflow) — do not write plausible-but-leaky words.
- Enumerate finite identifier families in full; the boundary rule means `Framework` does not match inside `cellRendererFramework`.
- Features that activate without configuration defeat option-name detection: inferred cell data types, UMD bundles auto-registering `All*Module`, changed theme/style defaults. Check source for inference and default values before trusting an option name as detector.
- Harvest words from the change's entire surface — mitigation content, class-name mapping tables — not just the page's headline list.
- An unavoidable import/dependency is often the only sound net for module/package changes. Prefer explicitly listing the package names (`'ag-charts-enterprise', 'ag-charts-community'`) over a prefix entry (`'ag-charts-'`) — prefixes over-match unrelated content such as CSS class names in HTML.
- Any detectWords entry whose relationship to the change is not obvious from the record's title/description carries a comment explaining the choice, especially entries covering a non-obvious usage route, e.g.:

    ```ts
    // The package names are the load-bearing entries: apps can use charts via
    // AllEnterpriseModule + programmatic APIs without any of the other words, but
    // cannot avoid depending on 'ag-charts-enterprise' or 'ag-charts-community'.
    // They also match standalone AG Charts apps — an acceptable false positive.
    detectWords: ['IntegratedChartsModule', /* ... */ 'ag-charts-enterprise', 'ag-charts-community'],
    ```

## Known source-data issues

- v30 page: TypeScript minimum labelled "for AG Grid v29".
- v31.2 page: CRA "replace scripts" block is a no-op.
- v30 "Removal of Deprecated APIs" contains entries that are actually deprecations ("deprecated and the behavior made default").
- `groupMultiAutoColumn`, `groupUseEntireRow`, `stopEditingWhenGridLosesFocus` documented as removed on both v29 and v30 pages — resolve against source.
- 3 lineages changed replacement advice mid-flight (chained deprecations): `serverSideStoreType`, `serverSideFilteringAlwaysResets`, `defaultGroupSortComparator` — use the final replacement.
- v35 page: indicator lines say "1px to 3px" but the shipped default is 2px (reduced pre-release in ea6d0ecf79a); "Exporting" overlay says "via the UI" but API exports also trigger it; `useGroupColumnAsCategory` is a range-chart param, not a "chart option"; pivot only disables the drag handle with `refreshAfterGroupEdit`.
- v36 page: overlay "moved to be a sibling of the viewport" claim unsupported by source (class and position unchanged in 19f51ff664e); `row-pagination` doc page still says panel height defaults to row height.

## Known cross-page lineages (deprecation → removal joins)

`pinnedRowCellRenderer*` 26→29 · grouping options (`groupMultiAutoColumn` etc.) 26→29/30 · `*Framework` props + `frameworkComponents` 27→29/30 · Set Filter params 22→27 · SSRM Secondary→PivotResult renames + `serverSideStoreType` 28→31 · Column API 31→32 · ~90 `setX` methods 31→32 · `new Grid()` 31→33 · v31.1 method renames 31.1→33 · `reactiveCustomComponents` imperative components 31.1→(default flip 32) · `checkboxSelection`/`rowSelection` family 32.2→(pending) · Legacy Themes 33→(pending, `theme: 'legacy'` opt-back).
