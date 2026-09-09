/**
 * Known grid bugs that prevent automated validations from running.
 * Each property gates a validation that is currently disabled because the grid has a bug.
 * When a bug is fixed, set the property to true and eventually remove it.
 *
 * Tests can override individual flags via `GridRowsOptions.bugs` to enable or disable
 * validations on a per-test basis.
 */
export const gridRowsBugs = {
    /**
     * BUG: aria-expanded attribute is not correctly updated after tree structure changes.
     * 1. In `baseExpansionService.ts#updateExpandedCss`, `_setAriaExpanded(gui.element, expandable && expanded)`
     *    sets `aria-expanded="false"` instead of removing the attribute when `expandable` becomes false.
     *    Should call `_removeAriaExpanded(gui.element)` when not expandable.
     * 2. After transactions that change tree structure (move/re-parent nodes), `aria-expanded` is not
     *    refreshed for nodes that remain expanded, leaving stale `aria-expanded="false"` on expanded rows.
     */
    ariaExpanded: false,

    /**
     * BUG: ag-row-group-expanded / ag-row-group-contracted CSS classes are not correctly updated
     * after tree structure changes (same root cause as ariaExpanded above).
     * After transactions that re-parent nodes, expanded rows may retain `ag-row-group-contracted` class.
     */
    expandedContractedClasses: false,

    /**
     * BUG: ag-row-inline-editing / ag-row-not-inline-editing CSS classes are not cleaned up on
     * pinned sibling rows when editing stops via the source row. The RowEditStyleFeature only
     * removes the classes from the row that triggered stopEditing, leaving stale classes on
     * the pinnedSibling.
     */
    pinnedSiblingEditCssClass: false,
} as const;

/** The type of the known bugs configuration object. */
export type GridRowsBugs = { -readonly [K in keyof typeof gridRowsBugs]: boolean };
