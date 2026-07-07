# Backfill plan — temporary working doc, delete when backfill complete

Goal: convert all historical upgrade pages into changelog files in this directory (one per release, format per `@ag-website-shared/changes/change-types.ts`), so the pages can be generated from the database and the compiled output consumed by the `ag-update` skill.

This file is the orchestration plan: it describes the flow and the **version agent**'s job. The rules for researching and writing individual records live in `tmp_authoring-guide.md`, read by **change agents** only — the version agent does not need it.

## Sources

- `documentation/ag-grid-docs/src/content/docs/upgrading-to-ag-grid-*/index.mdoc` — every major/minor/patch page, v26 through v36.
- `theming-v32-upgrading-to-v28{,-css,-sass}` — yields ~8 records (Legacy CSS/Sass deprecations, Sass API breaking changes); step-by-step prose stays as linked guides, not records.

## Status

- Done: `36.ts` (reviewed); `34.ts`, `34.1.ts`, `34.2.ts`, `34.3.ts`, `35.ts`, `35.1.ts`, `35.2.ts`, `35.3.ts` (drafted, awaiting human review).
- Remaining: v26 through v33.x pages, plus the theming-v32 trio.

## File format

- One file per release in this directory, named by version key: `35.ts`, `34.1.ts` ('34.1' means version 34.1.0). Files are auto-discovered by glob (in the `/update-change-records.json` endpoint) — there is no registry to update.
- Each file has EXACTLY ONE export: `export const v{name} = {...} satisfies VersionChangelog`, where `{name}` is the file name with dots replaced by underscores (`34.1.ts` exports `v34_1`). No default export. Use `satisfies`, not a `: VersionChangelog` annotation — an annotation widens `deprecations` to `Record<string, TransitionFacts>`, breaking `v34.deprecations.myDepId` references from later files. The endpoint validates the export name, count and type at build.
- Deprecation records are plain (non-exported) consts referenced from the `deprecations` object; a later release removes one by importing the changelog and referencing through it: `removalsAfterDeprecation: [v34.deprecations.myDepId]`.
- Validation runs at build via the endpoint (compilation throws on invalid records). To check records while authoring, request `/update-change-records.json` from the dev server or run the docs build.

## Flow

One **version agent** per release page. It builds the file template, delegates one **change agent** per change topic, collates the returned records, and verifies the result. Change agents are the only readers of `tmp_authoring-guide.md`; they return record text and never edit the file (this is also what allows them to run concurrently). A human reviews the finished file last.

## Version agent brief

1. **Partition the page into topics.** A topic is a page section or bullet group describing one change (a change agent may later split a topic into several records — that decision is not the version agent's). Not topics: Codemod sections, "What's New" marketing, LTS/support-policy notes. Cross-product AG Charts changes (Integrated Charts affected by an AG Charts major) are NOT grid records — they belong to the charts changes database; until the cross-product flow has test cases, leave a commented-out draft in the version file (see `36.ts`).
2. **Build the template.** Correct file name and export per File format. Prefix every line of the source page with `// ` and distribute the comments through the file: each comment block sits directly above where its topic's records will go. Content relating to no topic (frontmatter, What's New, empty sections, changelog tags) forms a preamble at the start of the file. The ENTIRE source page must be present VERBATIM as comments (including blank lines as `//`). Comment blocks may be moved out of source order ONLY where the authoring format's grouping requires it (e.g. all behaviourChanges in one array). Pages with no changes produce an empty changelog (`export const vX_Y = {} satisfies VersionChangelog;`) with the full page as preamble — no change agents needed.
3. **Delegate one change agent per topic**, in parallel, giving each: its topic's verbatim source excerpt; the release version and release window (dates from `git log -1 --format=%ci <tag>` for this tag and the previous release's tag); and the instruction to follow `tmp_authoring-guide.md` in this directory. Investigations are potentially deep and unbounded — one agent per change, never per version.
4. **Collate.** Insert each returned record under its topic's comment block, in the section the change agent targeted (a topic may return multiple records for different sections). Add any imports the change agents request (`removalsAfterDeprecation` identity references to earlier version files). Preserve the agents' comments (rationale, `// REVIEW:`, `// FIXME:`) verbatim.
5. **Verify.** Run the scripted line-completeness check (every source-page line present as a comment). Build the docs site or fetch `/update-change-records.json` from the dev server so compilation validates the records. Fix mechanical errors (imports, syntax); do not alter record content — content problems go back to the responsible change agent.

## Human review workflow

Comment kinds (full definitions in `tmp_authoring-guide.md`):

- **Source comments** (the verbatim page lines): the reviewer deletes each block as its records are verified against it; a fully reviewed file has no source comments left.
- **Rationale comments** (the why behind each judgement-carrying property): usually deleted during review, kept where the reviewer judges them useful long-term (e.g. non-obvious detectWords choices, null justifications).
- **`// REVIEW:`**: uncertainty or a judgement call about the record itself; the reviewer resolves and deletes it.
- **`// FIXME:`**: a defect discovered elsewhere (a docs page or grid source); survives review until the upstream fix is made or ticketed.

Steps:

1. A lower-cost model verifies that every line of the source page is present as a comment in the version file.
2. The reviewer works through each comment block: verify the records against the source excerpt and the cited evidence, check each rationale comment holds, resolve `// REVIEW:` items, then delete the block.
3. After all releases are done: a cross-version pass confirming every removal of a deprecated API references its deprecation record, and that mitigation advice is current (see the chained-advice rule in the authoring guide).
