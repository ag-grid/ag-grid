# Handoff — AG Grid forced-colors (high contrast) support

**Generated**: 2026-09-07T10:50:00Z

## Git state

- **Branch**: `latest` (behind origin/latest by 50 — **no topic branch created yet**)
- **Repo**: `/Users/berniesumption/Documents/GitHub/ag-grid-1`
- **Working tree**: 17 modified, 0 untracked (all CSS under `packages/`)

## PR

No PR yet.

## Previous conversation

For full detail of what happened before, read these JSONL transcripts (newest first; the first is the source session itself):

- `/Users/berniesumption/.claude/projects/-Users-berniesumption-Documents-GitHub-ag-grid-1/fc614051-edcc-44a6-9253-abbc995dd952.jsonl` — 2026-09-07T10:49 *(this session)*

## Intent

Make AG Grid usable in Windows / CSS forced-colors (high contrast) mode — JIRA AG-16839 (regression: focus & UI indicators invisible), AG-6163, AG-16777, AG-5922. Phase 1 (research + prototype) is done; Phase 2 (the real fix in the grid's CSS) is **implemented and passing both gates**, uncommitted.

## Decisions

- **No `forced-color-adjust: none`** — user constraint. Every fix maps the design onto the system palette instead. `preserve-parent-color` was evaluated and **rejected** (MDN: behaves identically to `none` whenever `color` is set explicitly, which it always was; also Not Baseline).
- **Co-located `@media (forced-colors: active)` guards**, one per rule that breaks — not a token remap. A prototype proved a token-only fix is insufficient and the theming layer can't express it.
- **`@media` inside a part's CSS works.** The user believed it did not; verified empirically (probe returned `outlineStyle: dashed`, `outlineColor: rgb(255,255,0)`). Part CSS is wrapped as `:where(.ag-theme-part-N) { … }` and nested `@media` passes through PostCSS untouched. So styled checkboxes were kept — no browser-default fallback.
- **`SelectedItem` for both row selection and cell ranges** (user's explicit call); range borders + fill handle use `Highlight` to stay distinguishable.
- **Focus = `outline: revert`** (let the UA draw it), per user instruction — everywhere except the focused cell, see Open questions.
- **Chrome text backplate rule**: text on a non-Canvas fill must stay `CanvasText` (the browser paints a Canvas plate behind it); only glyphs, which get no plate, take the paired `SelectedItemText`. Setting `color: SelectedItemText` renders as an unreadable black bar — this bug was made and fixed in `menu.css`.
- Green (`rgb(63,242,63)` = `GrayText`) floating-filter borders are **not a bug** — those inputs are genuinely `disabled: true`.

## Key files

All 17 changed files are CSS, each carrying one or more `@media (forced-colors: active)` blocks:

- `packages/ag-stack/src/theming/shared/css/_icons.css` — `currentcolor` → `CanvasText`; **the AG-16839 root cause** (icons are `mask-image` painted via `background-color`)
- `packages/ag-stack/src/theming/shared/css/_reset.css` — `outline: revert` for grid-focusable divs/spans/labels
- `packages/ag-stack/src/theming/shared/css/_popup.css` — `1px solid CanvasText` boundary (box-shadow is deleted in forced colors)
- `packages/ag-grid-community/src/theming/core/css/_grid-layout.css` — focused cell outline; selected-row overlay + icon colour; hover-over-selected
- `packages/ag-grid-community/src/theming/parts/checkbox-style/checkbox-style-default.css` — checkbox/radio states; note the indeterminate block is **restated** in a second media block to beat source-order specificity
- `packages/ag-grid-enterprise/src/rangeSelection/rangeSelection.css` — grouped media block (the `-1..-4` variants escalate specificity deliberately)
- `packages/ag-grid-enterprise/src/widgets/menu.css` — active option; icon rule is top-level `:where(...)` to satisfy `selector-max-specificity`
- Also: `input-style-base`, `button-style-base`, `tab-style-base`, `agList`, `agContentEditableField`, `pageNumbersComp` (community); `agSideBar`, `agToolbar`, `agRichSelect`, `agAutocomplete` (enterprise)
- `testing/manual/forced-colors/` — manual repro app (React-only). `src/config.ts` = one grid with every feature enabled; `src/react/App.tsx` = the grid plus a 35-item bulleted list of elements that must be visible/usable. **No custom CSS** — the app tests the shipped grid CSS.
- `tmp/fc-*.mjs` — gitignored Playwright probes. `fc-verify.mjs <dark|light>` (focus/selection/range computed styles), `fc-surfaces.mjs <dark|light>` (menu/sidebar/paging screenshots), `fc-palette.mjs` (dumps the emulated system-colour palette). Screenshots land in the session scratchpad `shots/`. They must live under the repo root so `import 'playwright'` resolves.

## Skills to load

- `/ag-product:jira` — the four tickets; needed to write them up or update them
- `/ag-eng:git-conventions` — branch name (`ag-16839/...`), commit and PR conventions; nothing has been committed yet
- `/manual-test` — only if the repro app needs extending

## Next steps

### Committed
- [ ] Create a topic branch off `latest` and commit the 17 CSS files (nothing is committed; `latest` is 50 behind origin, so rebase/pull first).
- [ ] Manually verify the **rich select dropdown** — the only listed element never seen rendered; its editor wouldn't open on dblclick in the Playwright harness. Rules are in place and follow the same path as the other lists.
- [ ] Write the PR body disclosing the two deviations below.

### Undecided
- **Legacy themes** (`community-modules/styles/`, Sass) — untouched per the user's "no need to do legacy themes". `.claude/rules/grid-styling.md` makes a Theming-API-only change a **P1** review finding. Options: do them now | ship with an explicit PR note | separate ticket.

### Deferred
- **Cross-browser verification** (Firefox, Edge, real Windows HC) — user said "we can ignore other browsers until we're happy with the direction/solution". Only Chromium with `forcedColors: 'active'` emulation has been tested.
- Hover-only affordances left flat, deliberately: icon-button hover spread (a `box-shadow`-painted background), moving-column header tint, advanced-filter row hovers. Elements stay visible; only hover feedback is lost.

## Open questions

- **Focused cell uses an explicit `2px solid Highlight` outline, not `revert`** — a deviation from the user's "let the browser do its thing" instruction. `revert` alone resolves to `outline-style: none` there: a mouse click on a `tabindex` div doesn't match `:focus-visible`, and `_grid-layout.css` sets `outline: initial` at higher specificity. Since every border collapses to `CanvasText`, the focus border would otherwise be indistinguishable from ordinary cell borders. Needs the user's sign-off.

## Verification state

Both gates green on the current working tree (run backgrounded, never in the foreground):

- `./behave.sh` — exit 0
- `./checks.sh` — exit 0 (it caught one real `selector-max-specificity` failure in `menu.css`, since fixed)
- Manual app dev server: `http://localhost:5199/src/react/` (`cd testing/manual/forced-colors && yarn dev --port 5199 --strictPort`). Enable DevTools → Rendering → *Emulate CSS media feature forced-colors*.
