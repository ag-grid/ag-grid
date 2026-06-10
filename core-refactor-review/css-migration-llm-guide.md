## Breaking change record BC0001: single container refactor

Summary: Previously the header, body and pinned columns were placed in different containers with scrolling synchronised using JavaScript. Now there is single scrolling container, and sticky is positioning used to anchor headers and pinned rows in the correct place. This leads to smoother native scrolling especially when scrolling horizontally.

Impact: there has been significant change in the containers that hold rows and cells and handle scrolling and column pinning. If your application only styles grid components - cells, buttons, filters and so forth, there is likely no change. If your application styles containers, or uses containers to select specific cells to style, it is likely to need an update.

Detection: search the codebase for the following class names, either in CSS code or in JS APIs like `document.querySelector('...')`:

- ag-body
- ag-body-viewport
- ag-center-cols-container
- ag-center-cols-viewport
- ag-viewport
- ag-horizontal-left-spacer
- ag-horizontal-right-spacer
- ag-scroller-corner
- ag-pinned-left-cols-container
- ag-pinned-right-cols-container
- ag-pinned-left-header
- ag-pinned-right-header
- ag-header-container
- ag-header-viewport
- ag-header-root
- ag-floating-top
- ag-floating-bottom
- DONE ag-pinned-left-floating-top
- DONE ag-pinned-right-floating-top
- DONE ag-pinned-left-floating-bottom
- DONE ag-pinned-right-floating-bottom
- DONE ag-sticky-top
- DONE ag-sticky-bottom
- DONE ag-full-width-container
- DONE ag-center-cols-spanned-cells-container
- DONE ag-floating-top-spanned-cells-container
- DONE ag-floating-bottom-spanned-cells-container

Mitigation:

1. Classes with available replacements

ag-floating-top-container or ag-floating-top-viewport -> ag-grid-pinned-top-rows-container

ag-floating-bottom-container or ag-floating-bottom-viewport -> ag-grid-pinned-bottom-rows-container

ag-sticky-top -> ag-grid-sticky-top-rows-container
ag-sticky-bottom -> ag-grid-sticky-bottom-rows-container

ag-center-cols-spanned-cells-container -> ag-grid-scrolling-spanned-cells-container
ag-floating-top-spanned-cells-container -> ag-grid-pinned-top-rows-spanned-cells-container
ag-floating-bottom-spanned-cells-container -> ag-grid-pinned-bottom-rows-spanned-cells-container

2. Classes with alternate selectors

These elements have no direct replacement, but if using them to select components you can replace them with a descendent selector combining two class names. For example `.ag-pinned-left-sticky-top .ag-icon { ... }` could be replace with `.ag-grid-sticky-top-rows-container .ag-grid-pinned-left-cells .ag-icon { ... }`

- ag-pinned-left-sticky-top -> `.ag-grid-sticky-top-rows-container .ag-grid-pinned-left-cells`
- ag-pinned-right-sticky-top -> `.ag-grid-sticky-top-rows-container .ag-grid-pinned-right-cells`
- ag-pinned-left-sticky-bottom -> `.ag-grid-sticky-bottom-rows-container .ag-grid-pinned-left-cells`
- ag-pinned-right-sticky-bottom -> `.ag-grid-sticky-bottom-rows-container .ag-grid-pinned-right-cells`
- ag-full-width-container -> `.ag-full-width-row`

# AG Grid core DOM refactor — CSS/selector migration guide (LLM-readable)

This file is designed to be pasted into an LLM **together with your project's stylesheets,
end-to-end/component test files, and any custom JavaScript that queries the grid DOM**. It
lets the LLM decide whether you are affected by AG Grid's core container refactor and, where
safe, perform the upgrade automatically.

## Instructions for the LLM

You are migrating a customer's code across AG Grid's core DOM refactor. The grid's internal
layout DOM was restructured: several CSS class names were renamed, removed, or changed role.

**This change affects ONLY these three things. Nothing else.**

1. Custom CSS/SCSS that targets AG Grid layout classes (selectors containing the tokens in
   the affected-class-tokens list below).
2. Test/automation code that selects grid DOM by those classes
   (`document.querySelector`, Cypress `cy.get`, Playwright `page.locator`, etc.).
3. Custom JS that walks the grid DOM (screenshotting, measuring, DOM traversal) using those classes.

It does **NOT** affect grid options, column definitions, the grid API, cell renderers, event
handlers, or any JavaScript that uses `api.*` / `columnApi.*`. Do not change those.

### Step 1 — Quick affected/not-affected test (do this first)

Search the supplied files for any token in the affected-class-tokens list. Search as a substring
(these appear inside CSS selectors and string literals). **If there are zero matches, the
customer is not affected by this change — report that and stop.** Most customers match nothing.

### Step 2 — Classify each match

For each matched token, find its entry below (the changes are grouped by grid feature). The
**Action** tells you what to do:

- **rename** — safe automatic find-and-replace. Replace the old name with the new one everywhere
  it appears in a selector or class string. Behaviour is preserved.
- **rename with caveat** — replace the old name with the new one, but the element's role or
  position changed; re-read the **Caveat** and verify the result, because a textual replace may
  resolve to a different-sized/positioned element.
- **manual** — **do not auto-replace.** The old element no longer exists as a single block; the
  styling intent has to be reworked by a human. Surface this to the customer with the **Reason**
  and **Mitigation**; do not silently rewrite.
- **remove** — the element is gone with no equivalent. The rule is dead; advise removing it (or
  reworking per the **Mitigation**).

### Step 3 — Ordering rule for find-and-replace

Some old names are substrings of others (`ag-floating-top` is inside `ag-floating-top-container`).
When replacing, **process the longest old names first** so you don't corrupt longer names.

### Step 4 — Report

For each match, output: file + line, the token, the action taken (or recommended), and the
**Verify** step the customer should perform. Group **manual** items at the top — those need human eyes.

---

## Affected class tokens (Step-1 grep list)

Every token a customer might have styled:

- `ag-body`
- `ag-body-viewport`
- `ag-center-cols-container`
- `ag-center-cols-viewport`
- `ag-viewport`
- `ag-horizontal-left-spacer`
- `ag-horizontal-right-spacer`
- `ag-scroller-corner`
- `ag-pinned-left-cols-container`
- `ag-pinned-right-cols-container`
- `ag-pinned-left-header`
- `ag-pinned-right-header`
- `ag-header-container`
- `ag-header-viewport`
- `ag-header-root`
- `ag-floating-top`
- `ag-floating-bottom`
- `ag-pinned-left-floating-top`
- `ag-pinned-right-floating-top`
- `ag-pinned-left-floating-bottom`
- `ag-pinned-right-floating-bottom`
- `ag-sticky-top`
- `ag-sticky-bottom`
- `ag-pinned-left-sticky-top`
- `ag-pinned-right-sticky-top`
- `ag-pinned-left-sticky-bottom`
- `ag-pinned-right-sticky-bottom`
- `ag-full-width-container`
- `spanned-cells-container` (matches all nine old per-section spanning containers)

---

## Base container chain

**Breaking — body/viewport collapse.** The intermediate body wrappers and the centre clipper/viewport are gone; the grid now has a single scroll container.

### `ag-center-cols-container` → `ag-grid-scrolling-container`

- **Action:** rename — safe auto-replace; behaviour preserved.
- **Why:** Direct rename; same element/role (the centre, horizontally-scrolling rows container).
- **Verify:** Selector resolves to exactly one element; scrolling-area rules look unchanged.

### `ag-body-viewport` → `ag-grid-viewport`

- **Action:** rename with caveat.
- **Caveat:** The replacement element's role widened. `ag-body-viewport` was the scrollable centre body only; `ag-grid-viewport` is now the single scroll container for the whole grid and also encloses the (sticky) header band. Rules that added padding/background/borders to "the data area" will now also affect the header, and any width/height/scroll measurements taken from it will differ.
- **Mitigation:** For "just the scrolling rows", retarget `.ag-grid-scrolling-rows` or `.ag-grid-scrolling-container` instead of the viewport.
- **Verify:** Header is not unexpectedly padded/bordered; scroll/measure logic still correct.

### `ag-body` — removed

- **Action:** remove.
- **Reason:** Intermediate body wrapper removed; replaced by `ag-grid-viewport` → `ag-grid-scrollable-area`.
- **Mitigation:** Remove the rule, or move intent to `.ag-grid-scrollable-area` (whole sticky area) / `.ag-grid-scrolling-rows` (data rows).
- **Verify:** No visual regression after removing the rule.

### `ag-center-cols-viewport` — removed

- **Action:** remove.
- **Reason:** Centre clipper/viewport removed (sticky positioning makes it unnecessary).
- **Mitigation:** Remove; if it clipped/scrolled the centre area, that is now handled by `.ag-grid-viewport`.
- **Verify:** No visual regression.

### `ag-viewport` — removed

- **Action:** remove.
- **Reason:** Generic wrapper that appeared on the 5 sub-viewports (centre body, floating-top/bottom, sticky-top/bottom). All consolidated into the single `.ag-grid-viewport`.
- **Mitigation:** Remove; retarget `.ag-grid-viewport` if you needed the scroll container.
- **Verify:** No visual regression.

---

## Row structure (single row, 3 sticky sections)

**Breaking — three row instances become one.** A logical row used to render as three separate `.ag-row` elements (one per pinned section, all sharing a `row-index`); it is now a single `.ag-row` with three sticky-positioned cell sections inside it: `.ag-grid-pinned-left-cells`, `.ag-grid-scrolling-cells`, `.ag-grid-pinned-right-cells`.

No class is renamed by this change alone, but it underlies the column-pinning, header, and pinned/sticky-row changes below. Custom JS that walked "all rows" and expected three DOM subtrees per logical row, or that counted `.ag-row` elements, must be updated. The per-section classes themselves are covered under **Column pinning**.

---

## Scrollbars, spacers, scroll corner

**Breaking — spacers renamed, corner removed.** Rarely styled by customers.

### `ag-horizontal-left-spacer` → `ag-body-vertical-scroll-start-spacer`

- **Action:** rename with caveat.
- **Caveat:** Functional replacement only — the scrollbar-gutter spacers were reworked and moved. Placement differs; a positional CSS rule may need adjusting.
- **Verify:** Scrollbar gutter looks correct at the grid corners.

### `ag-horizontal-right-spacer` → `ag-body-horizontal-scroll-end-spacer`

- **Action:** rename with caveat.
- **Caveat:** Functional replacement only; placement differs.
- **Verify:** Scrollbar gutter looks correct.

### `ag-scroller-corner` — removed

- **Action:** remove.
- **Reason:** The scrollbar corner element is removed; the corner is handled by the new scroll spacers.
- **Mitigation:** Remove the rule.
- **Verify:** Scrollbar corner still looks acceptable.

---

## Column pinning (left / right)

**Breaking — cols containers removed.** The single blocks holding all left-/right-pinned cells no longer exist; pinned cells are now a sticky-positioned section repeated inside every row.

### `ag-pinned-left-cols-container` → `ag-grid-pinned-left-cells`

- **Action:** manual.
- **Reason:** The single block holding all left-pinned cells no longer exists. Left-pinned cells are now a section repeated inside every row, sticky-positioned. There is no element spanning the pinned column block.
- **Mitigation:** Per-cell styling (background, colour, text) is safe to retarget to `.ag-grid-pinned-left-cells .ag-cell`. Block-level styling (a single right-edge shadow/border, or a background spanning the whole pinned area) cannot be reproduced by a rename — it must be reworked, because the effect now tiles once per row. Options: apply the per-row-section border and accept the seam, or use the new `.ag-has-left-pinned-cols` root state class plus a separately positioned overlay/pseudo-element.
- **Verify:** Pinned columns render; intended divider/shadow/background appears once, not duplicated per row with seams.

### `ag-pinned-right-cols-container` → `ag-grid-pinned-right-cells`

- **Action:** manual.
- **Reason:** Mirror of `ag-pinned-left-cols-container` on the right side.
- **Mitigation:** As `ag-pinned-left-cols-container`, using `.ag-grid-pinned-right-cells` and `.ag-has-right-pinned-cols`.
- **Verify:** As `ag-pinned-left-cols-container`.

---

## Column headers & column groups

**Breaking — pinned/centre header containers removed.** Header cells now use the same per-row section classes as data rows.

### `ag-header-container` → `ag-grid-scrolling-cells`

- **Action:** rename with caveat.
- **Caveat:** Centre header cells now live in `.ag-grid-scrolling-cells` — but that class also appears on every data row. A bare `.ag-grid-scrolling-cells` rule will hit data rows too. Scope it to the header: `.ag-header-row .ag-grid-scrolling-cells`.
- **Verify:** Only header cells are affected, not body cells.

### `ag-pinned-left-header` → `ag-grid-pinned-left-cells`

- **Action:** manual.
- **Reason:** The dedicated left-pinned header sub-container is gone. Pinned header cells now sit in the same `.ag-grid-pinned-left-cells` section used by data rows.
- **Mitigation:** To style only the pinned header (not pinned data cells), scope through the header row: `.ag-header-row .ag-grid-pinned-left-cells`. Block-level styling of the pinned-header region has the same "no single spanning element" limitation as column pinning.
- **Verify:** Only pinned header cells affected; pinned data cells unaffected.

### `ag-pinned-right-header` → `ag-grid-pinned-right-cells`

- **Action:** manual.
- **Reason:** Mirror of `ag-pinned-left-header`.
- **Mitigation:** Scope via `.ag-header-row .ag-grid-pinned-right-cells`.
- **Verify:** As `ag-pinned-left-header`.

### `ag-header-viewport` — removed

- **Action:** remove.
- **Reason:** Separate centre-header viewport removed; header cells are in row sections now.
- **Mitigation:** Remove; for centre header cells use `.ag-header-row .ag-grid-scrolling-cells`.
- **Verify:** No visual regression.

### `ag-header-root` — removed

- **Action:** remove.
- **Reason:** Removed in the header rebuild.
- **Mitigation:** Remove; the header root is now `.ag-header` inside `.ag-grid-pinned-top-rows`.
- **Verify:** No visual regression.

---

## Floating filters

**Breaking — inherits the header restructure (see Column headers & column groups).** Floating filters have no class renames of their own; they are affected only through the header changes above.

---

## Row pinning (manual top / bottom)

**Breaking — floating bands collapsed.** The floating-top/bottom bands lost their per-section sub-containers and inner viewports.

### `ag-floating-top-container` → `ag-grid-pinned-top-rows-container`

- **Action:** rename.
- **Why:** The container holding pinned-top (floating-top) rows. Renamed, same role.
- **Verify:** Pinned-top rows styled as before.

### `ag-floating-bottom-container` → `ag-grid-pinned-bottom-rows-container`

- **Action:** rename.
- **Why:** Container holding pinned-bottom rows. Renamed, same role.
- **Verify:** Pinned-bottom rows styled as before.

### `ag-floating-top` → `ag-grid-pinned-top-rows-container`

- **Action:** manual.
- **Reason:** `ag-floating-top` was the pinned-top band wrapper. The new band wrapper (`.ag-grid-pinned-top-rows`) is sticky-positioned and now also contains the header, so it is not a like-for-like target. The closest element for "the pinned-top rows" is `.ag-grid-pinned-top-rows-container`.
- **Mitigation:** If you targeted the pinned-top rows, use `.ag-grid-pinned-top-rows-container`. If you targeted the whole band (background/border), note the band now includes the header — decide whether that is intended before applying to `.ag-grid-pinned-top-rows`.
- **Verify:** Pinned-top rows styled as intended; header not unintentionally affected.

### `ag-floating-bottom` → `ag-grid-pinned-bottom-rows-container`

- **Action:** manual.
- **Reason:** Pinned-bottom band wrapper; same situation as `ag-floating-top` (minus the header).
- **Mitigation:** Use `.ag-grid-pinned-bottom-rows-container` for the rows, or `.ag-grid-pinned-bottom-rows` for the band.
- **Verify:** Pinned-bottom rows styled as intended.

### `ag-pinned-left-floating-top` → `ag-grid-pinned-left-cells`

_Also applies to `ag-pinned-right-floating-top`, `ag-pinned-left-floating-bottom`, `ag-pinned-right-floating-bottom`._

- **Action:** manual.
- **Reason:** Per-pinned-section sub-containers inside the floating (pinned) row bands are removed. Pinned cells in pinned rows now use the shared per-row `.ag-grid-pinned-{left,right}-cells` sections.
- **Mitigation:** Scope to the band + section, e.g. `.ag-grid-pinned-top-rows .ag-grid-pinned-left-cells`. No single spanning element (as column pinning).
- **Verify:** Pinned cells in pinned rows styled correctly.

### `ag-floating-top-viewport` — removed

_Also applies to `-bottom-viewport`, `-sticky-top/bottom-viewport`._

- **Action:** remove.
- **Reason:** The floating/sticky bands no longer have a separate inner viewport element.
- **Mitigation:** Remove; target the band's rows container instead.
- **Verify:** No visual regression.

### `ag-floating-top-full-width-container` — removed

_Also applies to `-bottom`, and the sticky-top/bottom variants._

- **Action:** remove.
- **Reason:** Per-band full-width sub-containers removed; full-width pinned rows render inline.
- **Mitigation:** Remove; style full-width pinned rows via `.ag-full-width-row`.
- **Verify:** No visual regression.

---

## Total / grand-total rows

**Breaking — inherits the row-pinning renames (see Row pinning).** Total and grand-total rows render in the pinned-top/bottom bands, so they are affected through the row-pinning changes above; they have no class renames of their own.

---

## Sticky rows (group + total)

**Breaking — sticky bands collapsed.** The dedicated outer sticky wrappers and per-section sub-containers are removed.

### `ag-sticky-top-container` → `ag-grid-sticky-top-rows-container`

- **Action:** rename.
- **Why:** Inner container holding sticky (e.g. group) top rows. Renamed, same role.
- **Verify:** Sticky top rows styled as before.

### `ag-sticky-bottom-container` → `ag-grid-sticky-bottom-rows-container`

- **Action:** rename.
- **Why:** Inner container holding sticky bottom rows. Renamed, same role.
- **Verify:** Sticky bottom rows styled as before.

### `ag-sticky-top` — removed

- **Action:** manual.
- **Reason:** The dedicated outer sticky-top wrapper is removed. Sticky rows now live in `.ag-grid-sticky-top-rows-container` inside the pinned-top band; there is no outer wrapper.
- **Mitigation:** Retarget `.ag-grid-sticky-top-rows-container`.
- **Verify:** Sticky top rows styled as intended.

### `ag-sticky-bottom` — removed

- **Action:** manual.
- **Reason:** Mirror of `ag-sticky-top`.
- **Mitigation:** Retarget `.ag-grid-sticky-bottom-rows-container`.
- **Verify:** Sticky bottom rows styled as intended.

### `ag-pinned-left-sticky-top` → `ag-grid-pinned-left-cells`

_Also applies to `ag-pinned-right-sticky-top`, `ag-pinned-left-sticky-bottom`, `ag-pinned-right-sticky-bottom`._

- **Action:** manual.
- **Reason:** Per-pinned-section sub-containers inside the sticky row bands are removed; same as the floating variants.
- **Mitigation:** Scope via the sticky container + section. No single spanning element.
- **Verify:** Pinned cells in sticky rows styled correctly.

---

## Full-width rows (simple)

**Breaking — full-width container removed.** Full-width rows render inline among normal rows.

### `ag-full-width-container` — removed

- **Action:** manual.
- **Reason:** The separate overlay layer that held all full-width rows (and master/detail detail rows) is removed. Full-width rows now render inline among normal rows, each wrapped by `.ag-full-width-anchor`.
- **Mitigation:** Per-row full-width styling: retarget `.ag-full-width-row` (or `.ag-embedded-full-width-row` for the embedded variant; `.ag-details-row` for master/detail). There is no longer a single wrapping layer, so container-level effects (shared background/overlay, z-index stacking on the layer) must be reworked per row.
- **Verify:** Full-width / detail rows render and are styled correctly; no reliance on a wrapping layer.

---

## Full-width rows (embedded)

**Breaking — inherits column-pinning handling; adds a new marker class.** Embedded full-width rows have no class renames of their own. They are affected through the column-pinning changes (their pinned sections use `.ag-grid-pinned-{left,right}-cells`), and they gain a new modifier class, `.ag-embedded-full-width-row`, for the embedded variant.

---

## Master / detail

**Breaking — inherits the full-width-rows change (see Full-width rows (simple)).** Detail rows previously lived in the full-width overlay layer and now render inline; target `.ag-details-row`. No class renames of their own.

---

## Row spanning

**Breaking — spanned-cells containers reduced from nine to three.** The three band-level containers (centre/top/bottom) are renamed and map cleanly; the per-pinned-section containers are removed.

### `ag-center-cols-spanned-cells-container` → `ag-grid-scrolling-spanned-cells-container`

- **Action:** rename.
- **Why:** Spanned-cell overlay container for the centre band. Renamed, same role.
- **Verify:** Spanned cells in the main body render and are styled as before.

### `ag-floating-top-spanned-cells-container` → `ag-grid-pinned-top-rows-spanned-cells-container`

- **Action:** rename.
- **Why:** Spanned-cell overlay container for the pinned-top band. Renamed.
- **Verify:** Spanned cells in pinned-top rows render as before.

### `ag-floating-bottom-spanned-cells-container` → `ag-grid-pinned-bottom-rows-spanned-cells-container`

- **Action:** rename.
- **Why:** Spanned-cell overlay container for the pinned-bottom band. Renamed.
- **Verify:** Spanned cells in pinned-bottom rows render as before.

### `ag-pinned-left-cols-spanned-cells-container` — removed

_Also applies to `-right-cols`, and all the per-section floating variants._

- **Action:** manual.
- **Reason:** The per-pinned-section row-spanning containers (left/right, and the per-section floating variants) are removed — only the three band-level containers remain (centre/top/bottom, see the rename entries above). There is no per-pinned-section spanning container now.
- **Mitigation:** Target the band-level `.ag-grid-*-spanned-cells-container` and scope to a pinned section if needed.
- **Verify:** Spanned cells across pinned sections render correctly.

---

## RTL

**No class changes** — the change is to the positioning mechanism only. RTL grids are not affected at the selector level.

---

## Overlays

**No change.** Overlay classes are unaffected by this refactor.

---

## Column spanning / Aligned grids

**No change.** Neither column spanning nor aligned grids are affected by this refactor.
