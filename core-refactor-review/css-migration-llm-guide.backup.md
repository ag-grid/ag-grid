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
   `affected_class_tokens` below).
2. Test/automation code that selects grid DOM by those classes
   (`document.querySelector`, Cypress `cy.get`, Playwright `page.locator`, etc.).
3. Custom JS that walks the grid DOM (screenshotting, measuring, DOM traversal) using those classes.

It does **NOT** affect grid options, column definitions, the grid API, cell renderers, event
handlers, or any JavaScript that uses `api.*` / `columnApi.*`. Do not change those.

### Step 1 — Quick affected/not-affected test (do this first)

Search the supplied files for any token in `affected_class_tokens`. Search as a substring
(these appear inside CSS selectors and string literals). **If there are zero matches, the
customer is not affected by this change — report that and stop.** Most customers match nothing.

### Step 2 — Classify each match

For each matched token, find its entry in `changes`. The `action` field tells you what to do:

- `action: rename` — safe automatic find-and-replace. Replace `old` with `new` everywhere it
  appears in a selector or class string. Behaviour is preserved.
- `action: rename_with_caveat` — replace `old` with `new`, but the element's role or position
  changed; re-read `caveat` and verify the result, because a textual replace may resolve to a
  different-sized/positioned element.
- `action: manual` — **do not auto-replace.** The old element no longer exists as a single
  block; the styling intent has to be reworked by a human. Surface this to the customer with
  the `reason` and `mitigation`, do not silently rewrite.
- `action: remove` — the element is gone with no equivalent. The rule is dead; advise removing
  it (or reworking per `mitigation`).

### Step 3 — Ordering rule for find-and-replace

Some old names are substrings of others (`ag-floating-top` is inside `ag-floating-top-container`).
When replacing, **process the longest `old` values first** so you don't corrupt longer names.

### Step 4 — Report

For each match, output: file + line, the token, the `action` taken (or recommended), and the
`verify` step the customer should perform. Group `manual` items at the top — those need human eyes.

---

```yaml
# Every token a customer might have styled. Step-1 grep list.
affected_class_tokens:
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
    - ag-pinned-left-floating-top
    - ag-pinned-right-floating-top
    - ag-pinned-left-floating-bottom
    - ag-pinned-right-floating-bottom
    - ag-sticky-top
    - ag-sticky-bottom
    - ag-pinned-left-sticky-top
    - ag-pinned-right-sticky-top
    - ag-pinned-left-sticky-bottom
    - ag-pinned-right-sticky-bottom
    - ag-full-width-container
    - spanned-cells-container # matches all nine old per-section spanning containers

changes:
    # ───────────────────────── SAFE RENAMES (auto) ─────────────────────────
    REJECT
    - old: ag-center-cols-container
      new: ag-grid-scrolling-container
      action: rename
      feature: F1
      reason: Direct rename; same element/role (the centre, horizontally-scrolling rows container).
      verify: Selector resolves to exactly one element; scrolling-area rules look unchanged.

    REJECT
    - old: ag-floating-top-container
      new: ag-grid-pinned-top-rows-container
      action: rename
      feature: F7
      reason: The container holding pinned-top (floating-top) rows. Renamed, same role.
      verify: Pinned-top rows styled as before.

    REJECT
    - old: ag-floating-bottom-container
      new: ag-grid-pinned-bottom-rows-container
      action: rename
      feature: F7
      reason: Container holding pinned-bottom rows. Renamed, same role.
      verify: Pinned-bottom rows styled as before.

    - old: ag-sticky-top-container
      new: ag-grid-sticky-top-rows-container
      action: rename
      feature: F9
      reason: Inner container holding sticky (e.g. group) top rows. Renamed, same role.
      verify: Sticky top rows styled as before.

    - old: ag-sticky-bottom-container
      new: ag-grid-sticky-bottom-rows-container
      action: rename
      feature: F9
      reason: Inner container holding sticky bottom rows. Renamed, same role.
      verify: Sticky bottom rows styled as before.

    # per-section row-spanning containers: 9 old → 3 band-level. Centre/floating map cleanly.
    - old: ag-center-cols-spanned-cells-container
      new: ag-grid-scrolling-spanned-cells-container
      action: rename
      feature: F13
      reason: Spanned-cell overlay container for the centre band. Renamed, same role.
      verify: Spanned cells in the main body render and are styled as before.

    - old: ag-floating-top-spanned-cells-container
      new: ag-grid-pinned-top-rows-spanned-cells-container
      action: rename
      feature: F13
      reason: Spanned-cell overlay container for the pinned-top band. Renamed.
      verify: Spanned cells in pinned-top rows render as before.

    - old: ag-floating-bottom-spanned-cells-container
      new: ag-grid-pinned-bottom-rows-spanned-cells-container
      action: rename
      feature: F13
      reason: Spanned-cell overlay container for the pinned-bottom band. Renamed.
      verify: Spanned cells in pinned-bottom rows render as before.

    # ───────────────────── RENAMES WITH CAVEAT (auto, then verify) ─────────────────────
    - old: ag-body-viewport
      new: ag-grid-viewport
      action: rename_with_caveat
      feature: F1
      caveat: >
          The replacement element's ROLE WIDENED. ag-body-viewport was the scrollable centre
          body only; ag-grid-viewport is now the single scroll container for the WHOLE grid and
          also encloses the (sticky) header band. Rules that added padding/background/borders to
          "the data area" will now also affect the header, and any width/height/scroll
          measurements taken from it will differ.
      mitigation: >
          For "just the scrolling rows", retarget .ag-grid-scrolling-rows or
          .ag-grid-scrolling-container instead of the viewport.
      verify: Header is not unexpectedly padded/bordered; scroll/measure logic still correct.

    - old: ag-horizontal-left-spacer
      new: ag-body-vertical-scroll-start-spacer
      action: rename_with_caveat
      feature: F3
      caveat: >
          Functional replacement only — the scrollbar-gutter spacers were reworked and moved.
          Placement differs; a positional CSS rule may need adjusting. Rarely styled by customers.
      verify: Scrollbar gutter looks correct at the grid corners.

    - old: ag-horizontal-right-spacer
      new: ag-body-horizontal-scroll-end-spacer
      action: rename_with_caveat
      feature: F3
      caveat: Functional replacement only; placement differs. Rarely styled.
      verify: Scrollbar gutter looks correct.

    - old: ag-header-container
      new: ag-grid-scrolling-cells
      action: rename_with_caveat
      feature: F5
      caveat: >
          Centre header cells now live in .ag-grid-scrolling-cells — but that class ALSO appears
          on every data row. A bare .ag-grid-scrolling-cells rule will hit data rows too. Scope it
          to the header: .ag-header-row .ag-grid-scrolling-cells.
      verify: Only header cells are affected, not body cells.

    # ───────────────────── MANUAL — structural, needs human rework ─────────────────────
    - old: ag-pinned-left-cols-container
      new: ag-grid-pinned-left-cells
      action: manual
      feature: F4
      reason: >
          The single block holding all left-pinned cells no longer exists. Left-pinned cells are
          now a section repeated inside EVERY row, sticky-positioned. There is no element spanning
          the pinned column block.
      mitigation: >
          Per-cell styling (background, colour, text): safe to retarget
          .ag-grid-pinned-left-cells .ag-cell.
          Block-level styling (a single right-edge shadow/border, or a background spanning the
          whole pinned area): cannot be reproduced by a rename — it must be reworked, because the
          effect now tiles once per row. Options: apply the per-row-section border and accept the
          seam, or use the new .ag-has-left-pinned-cols root state class plus a separately
          positioned overlay/pseudo-element.
      verify: Pinned columns render; intended divider/shadow/background appears once, not duplicated per row with seams.

    - old: ag-pinned-right-cols-container
      new: ag-grid-pinned-right-cells
      action: manual
      feature: F4
      reason: Mirror of ag-pinned-left-cols-container on the right side.
      mitigation: As ag-pinned-left-cols-container, using .ag-grid-pinned-right-cells and .ag-has-right-pinned-cols.
      verify: As ag-pinned-left-cols-container.

    - old: ag-pinned-left-header
      new: ag-grid-pinned-left-cells
      action: manual
      feature: F5
      reason: >
          The dedicated left-pinned header sub-container is gone. Pinned header cells now sit in
          the same .ag-grid-pinned-left-cells section used by data rows.
      mitigation: >
          To style ONLY the pinned header (not pinned data cells), scope through the header row:
          .ag-header-row .ag-grid-pinned-left-cells. Block-level styling of the pinned-header
          region has the same "no single spanning element" limitation as F4.
      verify: Only pinned header cells affected; pinned data cells unaffected.

    - old: ag-pinned-right-header
      new: ag-grid-pinned-right-cells
      action: manual
      feature: F5
      reason: Mirror of ag-pinned-left-header.
      mitigation: Scope via .ag-header-row .ag-grid-pinned-right-cells.
      verify: As ag-pinned-left-header.

    - old: ag-full-width-container
      new: null
      action: manual
      feature: F10
      reason: >
          The separate overlay layer that held all full-width rows (and master/detail detail rows)
          is removed. Full-width rows now render inline among normal rows, each wrapped by
          .ag-full-width-anchor.
      mitigation: >
          Per-row full-width styling: retarget .ag-full-width-row (or .ag-embedded-full-width-row
          for the embedded variant; .ag-details-row for master/detail). There is no longer a single
          wrapping layer, so container-level effects (shared background/overlay, z-index stacking
          on the layer) must be reworked per row.
      verify: Full-width / detail rows render and are styled correctly; no reliance on a wrapping layer.

    - old: ag-floating-top
      new: ag-grid-pinned-top-rows-container
      action: manual
      feature: F7
      reason: >
          ag-floating-top was the pinned-top BAND WRAPPER. The new band wrapper
          (.ag-grid-pinned-top-rows) is sticky-positioned AND now also contains the header, so it
          is not a like-for-like target. The closest element for "the pinned-top rows" is
          .ag-grid-pinned-top-rows-container.
      mitigation: >
          If you targeted the pinned-top ROWS, use .ag-grid-pinned-top-rows-container. If you
          targeted the whole band (background/border), note the band now includes the header —
          decide whether that is intended before applying to .ag-grid-pinned-top-rows.
      verify: Pinned-top rows styled as intended; header not unintentionally affected.

    - old: ag-floating-bottom
      new: ag-grid-pinned-bottom-rows-container
      action: manual
      feature: F7
      reason: Pinned-bottom band wrapper; same situation as ag-floating-top (minus the header).
      mitigation: Use .ag-grid-pinned-bottom-rows-container for the rows, or .ag-grid-pinned-bottom-rows for the band.
      verify: Pinned-bottom rows styled as intended.

    - old: ag-sticky-top
      new: null
      action: manual
      feature: F9
      reason: >
          The dedicated outer sticky-top wrapper is removed. Sticky rows now live in
          .ag-grid-sticky-top-rows-container inside the pinned-top band; there is no outer wrapper.
      mitigation: Retarget .ag-grid-sticky-top-rows-container.
      verify: Sticky top rows styled as intended.

    - old: ag-sticky-bottom
      new: null
      action: manual
      feature: F9
      reason: Mirror of ag-sticky-top.
      mitigation: Retarget .ag-grid-sticky-bottom-rows-container.
      verify: Sticky bottom rows styled as intended.

    - old: ag-pinned-left-floating-top # + -right-floating-top, -left/-right-floating-bottom
      new: ag-grid-pinned-left-cells
      action: manual
      feature: F7
      reason: >
          Per-pinned-section sub-containers inside the floating (pinned) row bands are removed.
          Pinned cells in pinned rows now use the shared per-row .ag-grid-pinned-{left,right}-cells
          sections. Applies equally to -right-floating-top and the -floating-bottom pair.
      mitigation: Scope to the band + section, e.g. .ag-grid-pinned-top-rows .ag-grid-pinned-left-cells. No single spanning element (as F4).
      verify: Pinned cells in pinned rows styled correctly.

    - old: ag-pinned-left-sticky-top # + -right-sticky-top, -left/-right-sticky-bottom
      new: ag-grid-pinned-left-cells
      action: manual
      feature: F9
      reason: Per-pinned-section sub-containers inside the sticky row bands are removed; same as the floating variants.
      mitigation: Scope via the sticky container + section. No single spanning element.
      verify: Pinned cells in sticky rows styled correctly.

    - old: ag-pinned-left-cols-spanned-cells-container # + -right-cols, + all -floating- variants
      new: null
      action: manual
      feature: F13
      reason: >
          The per-PINNED-SECTION row-spanning containers (left/right, and the per-section floating
          variants) are removed — only the three band-level containers remain (centre/top/bottom,
          see the rename entries). There is no per-pinned-section spanning container now.
      mitigation: Target the band-level .ag-grid-*-spanned-cells-container and scope to a pinned section if needed.
      verify: Spanned cells across pinned sections render correctly.

    # ───────────────────── REMOVED — no equivalent, dead rules ─────────────────────
    - old: ag-body
      new: null
      action: remove
      feature: F1
      reason: Intermediate body wrapper removed; replaced by ag-grid-viewport → ag-grid-scrollable-area.
      mitigation: Remove the rule, or move intent to .ag-grid-scrollable-area (whole sticky area) / .ag-grid-scrolling-rows (data rows).
      verify: No visual regression after removing the rule.

    - old: ag-center-cols-viewport
      new: null
      action: remove
      feature: F1
      reason: Centre clipper/viewport removed (sticky positioning makes it unnecessary).
      mitigation: Remove; if it clipped/scrolled the centre area, that is now handled by .ag-grid-viewport.
      verify: No visual regression.

    - old: ag-viewport
      new: null
      action: remove
      feature: F1
      reason: >
          Generic wrapper that appeared on the 5 sub-viewports (centre body, floating-top/bottom,
          sticky-top/bottom). All consolidated into the single .ag-grid-viewport.
      mitigation: Remove; retarget .ag-grid-viewport if you needed the scroll container.
      verify: No visual regression.

    - old: ag-header-viewport
      new: null
      action: remove
      feature: F5
      reason: Separate centre-header viewport removed; header cells are in row sections now.
      mitigation: Remove; for centre header cells use .ag-header-row .ag-grid-scrolling-cells.
      verify: No visual regression.

    - old: ag-header-root
      new: null
      action: remove
      feature: F5
      reason: Removed in the header rebuild.
      mitigation: Remove; the header root is now .ag-header inside .ag-grid-pinned-top-rows.
      verify: No visual regression.

    - old: ag-floating-top-viewport # + -bottom-viewport, -sticky-top/bottom-viewport
      new: null
      action: remove
      feature: F7
      reason: The floating/sticky bands no longer have a separate inner viewport element.
      mitigation: Remove; target the band's rows container instead.
      verify: No visual regression.

    - old: ag-floating-top-full-width-container # + -bottom, + sticky-top/bottom variants
      new: null
      action: remove
      feature: F7
      reason: Per-band full-width sub-containers removed; full-width pinned rows render inline.
      mitigation: Remove; style full-width pinned rows via .ag-full-width-row.
      verify: No visual regression.

    - old: ag-scroller-corner
      new: null
      action: remove
      feature: F3
      reason: The scrollbar corner element is removed; the corner is handled by the new scroll spacers.
      mitigation: Remove the rule.
      verify: Scrollbar corner still looks acceptable.
```
