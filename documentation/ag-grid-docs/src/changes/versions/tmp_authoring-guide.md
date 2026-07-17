# Change record authoring guide — temporary working doc, delete when backfill complete

Read by the **change agent**: one agent per change topic, spawned by the version agent (flow in `tmp_backfill-plan.md`). The format authority is the JSDoc in `@ag-website-shared/changes/change-types.ts` — read it first; this guide covers how to research and write the records, not the schema.

## Your task and output

You are given: a verbatim excerpt of the upgrade page describing one change topic, the release version, and the release window (dates of this and the previous release tag). Research the change and return **text** — do not edit any files:

- One or more record object literals (see Granularity for when a topic splits into several records), each tagged with its target section: `deprecations` (with a proposed stable camelCase key), `removalsWithoutDeprecation`, `removalsAfterDeprecation` (with the import the version agent must add), `newRequirements`, `behaviourChanges`, `styleChanges` or `dependencyChanges`.
- If the evidence suggests the topic is drafted in the wrong section (e.g. a behaviour change presented under styling, or a "removal" that is actually a deprecation), target the section the evidence supports and add a `// REVIEW:` comment explaining why you think the page's classification is wrong, citing the evidence.
- Comments embedded in the records per the Comments section below.

## Evidence rules

**The source page identifies THAT a change exists and gives you search terms. It is NOT a source of truth for any property value.** Page prose is sloppy: it misnames API surfaces, mislabels versions, and describes pre-release states that never shipped. Every property value must be derived from ground truth; reuse the page's wording only after verifying it against source. Where page and source disagree, source wins — record the discrepancy as a `// FIXME:` comment citing the evidence.

Ground truth, in order of authority:

1. **The implementing commit** — its diff, message, and PR description (motivation and options the page omitted).
2. **Declarations and runtime code** in `packages/*/src`, read _as of the relevant version_ (see below), since HEAD may be several majors past the change.
3. **Current docs pages** for the affected feature (for checking that mitigation advice is still current).

How to research:

- **Find the implementing commit**: `git log -S '<identifier>'` and `git log --grep` with terms from the page, restricted to likely paths. Sanity-check the commit date against the release window — a commit outside it is probably a different change. Follow `AG-xxxxx` in the message to the PR (`gh pr list --search`).
- **Read historical code**: `git show v34.0.0:packages/ag-grid-community/src/...` to see a file as of a release; `git log -p --follow -- <path>` to trace a declaration through renames. Essential for older pages where the touched code no longer exists at HEAD.
- **Hunt for escape hatches**: undocumented opt-outs are usually added in the same commit as the change — look for new params, grid options or theme parameters in the diff (v36 examples: `filterParams.includeTime`, `pickerButtonBorderRadius`, `valueIndex`). Only after this hunt, and after reasoning about whether existing grid APIs can restore the old behaviour, is `mitigation: null` justified.
- **Verify each claim by its type**: an API name → find its declaration; a type change → read the type before and after; a default change → read the default value in both versions; a behaviour claim → read the code path; a version claim → check the tag dates.

## Comments

Three kinds of comment go in your output:

- **Rationale comments** — every judgement-carrying property (`detectWords`, `mitigation`, `oldApi`/`newApi`, and every null) carries a brief `//` comment above it stating the reasoning, citing the commit hash where relevant. Title/description need one only where verification changed them from the page's claim. These support the human review and are usually deleted then.
- **`// REVIEW:`** — a judgement call or uncertainty about the record itself (including suspected misclassification), addressed to the human reviewer, who resolves and deletes it. Brief, citing the commit hash. If you discovered an inaccuracy in the excerpt of the upgrade page and corrected it, that should always have a REVIEW comment.
- **`// FIXME:`** — a defect discovered elsewhere: a stale statement on a docs page, or a suspected bug in grid source. Names the file and cites the evidence. Survives review until the upstream fix is made or ticketed. Example: `// FIXME: row-pagination/index.mdoc still claims the panel height defaults to the row height`.

## Record properties

### `oldApi` / `newApi` (transitions)

- `oldApi` reads in "As of v30, $oldApi is deprecated"; `newApi` is required and reads in "Instead, use $newApi".
- **Name the actual API surface, verified against the pre-change declaration — not the page's phrasing.** Worked example: the v35 page said `cellDataType` was "removed from the `columnTypes` type", but `columnTypes` is a grid option; the removal was from `ColTypeDef`, the type of its entries (`colDef.ts`). Right: ``'`cellDataType` in `ColTypeDef` (the type of `columnTypes` entries)'``.
- For removals with no true replacement, `mitigation` says why deletion is safe, or `oldDescription` says why the API was inert (e.g. "never had any effect").

### `title` / `description` (simple changes)

- `title` is a full clause stating what changed, standing alone as a summary. Balance accuracy with not needlessly changing the wording of the original document. If changes are required, make them. If the original title is accurate and does not mess important details, keep it. If the title is slightly wrong, make a small adjustment. If the title is completely wrong, it is acceptable to wholesale rewrite it, but leave a comment explaining why.
- `description` describes the change only — actions go in `mitigation`.

### `detectWords`

- Contract: no match anywhere in an app ⇒ app guaranteed unaffected. False positives cheap; false negatives forbidden. When no sound words exist, set `null` with a rationale comment — do not write plausible-but-leaky words.
- **The affected-app test**: if you were to construct the minimal application affected by this change; which identifiers _must_ appear in its source? Those are the candidate words. An app can only set a property, call a method or import a module by spelling its name somewhere — but check for routes that need no spelling (below).
- **Minimality**: every entry must be the sole detector for some affected app — an entry is justified only if an app could be affected while containing none of the other entries. Entries that only widen are dropped. Example: for a change affecting `cellDataType` in the `columnTypes` object, `['cellDataType']` suffices. Do not also add `columnTypes`.
- Enumerate finite identifier families in full; if a change affects `fooFramework` and `barFramework` they must both match, `Framework` matches neither.
- Features that activate without configuration defeat option-name detection: inferred cell data types, UMD bundles auto-registering `All*Module`, changed theme/style defaults, default context-menu items. Check source for inference and default values before trusting an option name as a detector.
- Harvest words from the change's entire surface — mitigation content, class-name mapping tables — not just the page's headline list.
- An unavoidable import/dependency is often the only sound net for module/package changes. Prefer explicitly listing the package names (`'ag-charts-enterprise', 'ag-charts-community'`) over a prefix entry (`'ag-charts-'`) — prefixes over-match unrelated content such as CSS class names in HTML.
- Any entry whose relationship to the change is not obvious from the record's title/description carries a rationale comment, especially entries covering a non-obvious usage route, e.g.:
    ```ts
    // The package names are the load-bearing entries: apps can use charts via
    // AllEnterpriseModule + programmatic APIs without any of the other words, but
    // cannot avoid depending on 'ag-charts-enterprise' or 'ag-charts-community'.
    // They also match standalone AG Charts apps — an acceptable false positive.
    detectWords: ['IntegratedChartsModule', /* ... */ 'ag-charts-enterprise', 'ag-charts-community'],
    ```
- **Old-version compatibility** - A big potential risk of false negatives is detecting a word that only applies to the current version. If `IntegratedChartsModule` is added in v33, searching for it won't flag use of integrated charts from v32. Check git history. If older APIs exist, include them with a comment explaining why. If you are uncertain about old version compatibility, leave a comment detailing the uncertainty.
- **Widen before using null** - if there is genuinely no way to detect if a feature is in use, null is acceptable, but bear in mind that this means "match every app" with even more false positives than a poor search word. Only use null when there is literally no search term that will safely reduce the number of apps matched. For example you can't check if the date filter is in use because filter type auto-selects based on inferred data type, but you can search for 'filter' which will match ANY app using column filters, but still better than nothing.

### `mitigation`

- The most straightforward way to restore the behaviour the application had before the change. For removals, the new API to use; for behaviour changes, the APIs that restore the old behaviour.
- If the advice the page gave has itself been deprecated or changed by a later version, write the _current_ correct advice — old pages re-rendering with updated advice is intended behaviour. (Chained-deprecation example: `serverSideStoreType`'s replacement advice changed mid-flight; use the final replacement.)
- `null` only after the escape-hatch hunt (Evidence rules) concludes the change is accept-only, with a rationale comment saying why.
- Remember, the grid is a very flexible product, if you think there's no mitigation, it's more likely you just haven't found it. Mostly the only time we really have no mitigation is when we fix bugs and the old behaviour is deemed undesirable for everybody.
- Mitigations long enough to need newlines or structure move to a sibling file `v{ver}-{slug}.md`, referenced `(await import('./v36-x.md?raw')).default`.
- **Per-framework advice.** `mitigation` is `string | MitigationAdvice[] | null`. A plain string is shorthand for one entry that applies to every framework. Use the `{ frameworks?, content }[]` array form only when the advice genuinely differs by framework — the docs page's `isFramework(...)` blocks are the signal. Rules:
    - `frameworks` omitted ⇒ applies to all frameworks (including vanilla `'javascript'`); otherwise list the exact frameworks (`'react' | 'angular' | 'vue' | 'javascript'`).
    - Entries are **additive**: a reader on framework X sees every entry whose `frameworks` includes X, plus every unscoped entry. Put shared advice in one unscoped entry and framework-specific extras in their own entries — do not repeat the shared text in each.
    - Frameworks include **vanilla JavaScript**, and a framework app can use the vanilla `createGrid` API / vanilla components. So advice about the class-style (`IFilterComp`-type) contract typically scopes to `['javascript', 'angular', 'vue']`, while React (hook/prop-based) advice scopes to `['react']`; anything common stays unscoped.
    - `null` = accept-only, no action (unchanged).

### `framework`

- `framework` only when the change exists solely in one framework wrapper (`'react' | 'angular' | 'vue'`); absent means all frameworks. There is no `'javascript'` scope: a vanilla-core change reaches React/Angular/Vue apps too, so "affects everyone" is expressed by omitting the field, not by `framework: 'javascript'`. (For advice that merely _differs_ by framework, keep the record cross-framework and use the `mitigation` array form above — `mitigation` entries _can_ scope to `'javascript'`.)

### `dependency` / `minVersion` / `reason` (dependency changes)

- Only raised minimum versions of the supported dependencies. A newly required dependency or a dropped environment is a `newRequirements` record instead.
- `reason: null` needs a rationale comment like any other null.

## Deprecations → removal joins

- When a removal names a previously deprecated API, locate the deprecation on an earlier upgrade page / version file and reference the deprecation object by identity: `removalsAfterDeprecation: [v31.deprecations.columnApi]` (tell the version agent which import to add). Deprecation-to-removal gaps of several majors are normal.
- If the deprecation predates the backfill range (earliest page is v26 — e.g. Set Filter params deprecated in v22, removed in v27), record it as `removalsWithoutDeprecation` with a comment naming the real deprecation version.
- Expect **chained deprecations**: the recommended replacement itself changed between deprecation and removal. Always write the final, current advice (see `mitigation`).
- Expect **de-deprecations**: an API deprecated and later reinstated (e.g. `dndSource`, deprecated v31.2, reinstated v32). No record survives — delete/omit the deprecation and flag with `// REVIEW:` so the reviewer knows why the page's entry has no record.

## Soft deprecations

Occasionally we introduce a new API but do not officially deprecate the old one. This will be mentioned in the upgrade docs page as a new feature, not a deprecation. The telltales are: 1) a new API is introduced that does the same thing as an old api, and 2) the docs pages clearly prefer the new API, either not mentioning it or recommending against it. In these cases, put the change in `deprecations` and set `isSoft: true`

## Source-page defect classes

Known classes of error in the upgrade pages — check for each, resolve against source, and flag findings with `// FIXME:` (page defects) or `// REVIEW:` (uncertainty about the resolution):

- **Wrong version labels** — e.g. the v30 page labels a TypeScript minimum "for AG Grid v29".
- **Misclassified entries** — e.g. the v30 "Removal of Deprecated APIs" section contains entries that are actually deprecations ("deprecated and the behavior made default").
- **The same API documented as removed on two pages** — e.g. `groupMultiAutoColumn`, `groupUseEntireRow`, `stopEditingWhenGridLosesFocus` appear on both the v29 and v30 pages; resolve against source and record the removal once.
- **Pre-release values that never shipped** — e.g. the v35 page says indicator lines went "1px to 3px"; 3px was reduced to 2px before release.
- **Loose scope claims** — e.g. "via the UI" when API calls also trigger the behaviour; "chart option" for what is actually a range-chart param.
- **Instructions that do nothing** — e.g. the v31.2 page's CRA "replace scripts" block is a no-op.

## Granularity

- One record per (audience, mitigation). Related APIs with identical advice = one record (Column API's ~30 methods). Advice forking on what the reader previously did = one record per fork (e.g. `spanHeaderHeight`: mandatory option removal + separate new-default behaviour change) — this is why a single topic may return several records.

## Prose

- Titles should state behaviour or change without using time language, e.g. "`fooBar` grid option removed" not "The `foobar` grid option is no longer present" or "From v30, `foobar` is not available"
- No status language in transition facts or mitigation ("is deprecated", "has been removed") — the renderer generates it from record position.
- Do not break strong literals up; have one long literal. Avoid newlines in strings. Long paragraphs are fine.
- UK/British English in prose; US English for API names.
