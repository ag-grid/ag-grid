import type { Column, ColumnGroup, GridApi, SortDirection } from 'ag-grid-community';

import { getGridHTMLElement } from '../../gridRows/gridHtmlRows';
import type { GridColumnsErrors } from '../columns-validation/gridColumnsErrors';
import type { GridColumns } from '../gridColumns';

/**
 * Validates the header DOM structure matches the internal column state.
 * This is the column-side equivalent of GridRowsDomValidator.
 */
export class GridColumnsDomValidator {
    public constructor(public readonly errors: GridColumnsErrors) {}

    public validate(gridColumns: GridColumns): void {
        const gridElement = getGridHTMLElement(gridColumns.api);
        if (!gridElement) {
            return; // No DOM — skip (grid may be headless or destroyed)
        }

        const headerRoot = gridElement.querySelector('.ag-header') as HTMLElement | null;
        if (!headerRoot) {
            this.errors.default.add('No .ag-header element found in grid DOM.');
            return;
        }

        // ── Header root checks ──────────────────────────────────────────────
        this.validateHeaderRoot(gridColumns, headerRoot);

        // ── Header row structure ────────────────────────────────────────────
        this.validateHeaderRows(gridColumns, headerRoot);

        // ── Column header cells ─────────────────────────────────────────────
        this.validateColumnHeaders(gridColumns, headerRoot);

        // ── Group header cells ──────────────────────────────────────────────
        if (gridColumns.hasColumnGroups) {
            this.validateGroupHeaders(gridColumns, headerRoot);
        }
    }

    // ── Header root ─────────────────────────────────────────────────────────

    private validateHeaderRoot(gridColumns: GridColumns, headerRoot: HTMLElement): void {
        const { api } = gridColumns;
        const hasPivotModule = (api.isModuleRegistered as (name: string) => boolean)('SharedPivot');

        // Pivot mode classes (only check if PivotModule is registered)
        if (hasPivotModule) {
            const isPivotMode = api.isPivotMode();
            const hasPivotOn = headerRoot.classList.contains('ag-pivot-on');
            const hasPivotOff = headerRoot.classList.contains('ag-pivot-off');

            if (isPivotMode && !hasPivotOn) {
                this.errors.default.add('Grid is in pivot mode but .ag-header is missing ag-pivot-on class.');
            }
            if (!isPivotMode && !hasPivotOff) {
                this.errors.default.add('Grid is NOT in pivot mode but .ag-header is missing ag-pivot-off class.');
            }
            if (hasPivotOn && hasPivotOff) {
                this.errors.default.add('.ag-header has both ag-pivot-on and ag-pivot-off classes simultaneously.');
            }
        }
    }

    // ── Header rows ─────────────────────────────────────────────────────────

    private validateHeaderRows(_gridColumns: GridColumns, headerRoot: HTMLElement): void {
        const headerRows = headerRoot.querySelectorAll('.ag-header-row');

        for (const row of headerRows) {
            // Each header row should have role="row"
            const role = row.getAttribute('role');
            if (role !== 'row') {
                this.errors.default.add(`Header row has role="${role ?? 'null'}", expected "row".`);
            }

            // Each header row should have aria-rowindex
            const ariaRowIndex = row.getAttribute('aria-rowindex');
            if (ariaRowIndex == null) {
                this.errors.default.add('Header row is missing aria-rowindex attribute.');
            }

            // Header row type classes
            const hasColumnType = row.classList.contains('ag-header-row-column');
            const hasGroupType = row.classList.contains('ag-header-row-group');
            const hasFilterType = row.classList.contains('ag-header-row-filter');
            const typeCount = [hasColumnType, hasGroupType, hasFilterType].filter(Boolean).length;
            if (typeCount !== 1) {
                this.errors.default.add(
                    `Header row has ${typeCount} type classes (column=${hasColumnType}, group=${hasGroupType}, filter=${hasFilterType}), expected exactly 1.`
                );
            }

            for (const selector of [
                '.ag-grid-pinned-left-cells',
                '.ag-grid-scrolling-cells',
                '.ag-grid-pinned-right-cells',
            ]) {
                if (!row.querySelector(selector)) {
                    this.errors.default.add(`Header row is missing required cell group "${selector}".`);
                }
            }
        }
    }

    // ── Column headers ──────────────────────────────────────────────────────

    private validateColumnHeaders(gridColumns: GridColumns, headerRoot: HTMLElement): void {
        const { allDisplayedCols, options } = gridColumns;

        const sortContext = buildDisplayedSortContext(gridColumns.api);

        for (const col of allDisplayedCols) {
            const colId = col.getColId();
            const headerCell = this.findHeaderCell(headerRoot, colId);
            if (!headerCell) {
                this.errors.get(col).add(`No .ag-header-cell[col-id="${colId}"] found in DOM.`);
                continue;
            }

            const colErrors = this.errors.get(col);

            // ── Custom validator callback ───────────────────────────────────
            if (options.domColumnValidator) {
                const result = options.domColumnValidator({
                    column: col,
                    headerElement: headerCell,
                    columnErrors: colErrors,
                });
                if (result === false) {
                    continue; // Skip default validation
                }
            }

            // ── role="columnheader" ─────────────────────────────────────────
            const role = headerCell.getAttribute('role');
            if (role !== 'columnheader') {
                colErrors.add(`Header cell role is "${role ?? 'null'}", expected "columnheader".`);
            }

            // ── Width style matches column width ────────────────────────────
            const styleWidth = headerCell.style.width;
            const expectedWidth = col.getActualWidth() + 'px';
            if (styleWidth && styleWidth !== expectedWidth) {
                colErrors.add(`Header cell style.width is "${styleWidth}", expected "${expectedWidth}".`);
            }

            // ── aria-sort attribute ─────────────────────────────────────────
            // The grid sets aria-sort only when the column is sortable (headerCellCtrl.refreshAriaSort).
            // When !sortable, aria-sort is removed from DOM regardless of model sort state.
            // Source of truth is the *displayed* sort, which for auto-display columns mirrors the
            // linked source rowGroup column in coupled-sort mode — see getDisplayedSort below.
            const displayedSort = getDisplayedSort(col, sortContext);
            const isSortable = col.isSortable();
            const ariaSort = headerCell.getAttribute('aria-sort');

            if (isSortable) {
                // Sortable column — aria-sort should reflect the displayed sort.
                if (displayedSort === 'asc' && ariaSort !== 'ascending') {
                    colErrors.add(
                        `Sortable column with displayed sort "asc" has aria-sort="${ariaSort ?? 'null'}", expected "ascending".`
                    );
                } else if (displayedSort === 'desc' && ariaSort !== 'descending') {
                    colErrors.add(
                        `Sortable column with displayed sort "desc" has aria-sort="${ariaSort ?? 'null'}", expected "descending".`
                    );
                } else if (displayedSort === 'mixed' && ariaSort !== 'other') {
                    // Coupled-sort group display column with diverging linked-source sorts.
                    colErrors.add(
                        `Sortable column with mixed displayed sort has aria-sort="${ariaSort ?? 'null'}", expected "other".`
                    );
                } else if (!displayedSort && ariaSort != null && ariaSort !== 'none') {
                    colErrors.add(
                        `Sortable column with no displayed sort has aria-sort="${ariaSort}", expected "none" or absent.`
                    );
                }
            } else if (ariaSort != null && ariaSort !== 'none') {
                // Non-sortable column — aria-sort should be absent or "none"
                // (the grid removes it via _removeAriaSort in refreshAriaSort when !sortable)
                colErrors.add(
                    `Non-sortable column has aria-sort="${ariaSort}", expected absent or "none" (grid removes aria-sort when !sortable).`
                );
            }

            // Note: ag-header-cell-sorted-asc/desc CSS classes depend on the SortIndicatorComp
            // rendering which may not be present in all module configurations, so we rely on
            // aria-sort above as the reliable cross-configuration check.

            // ── ag-header-cell-filtered CSS class ───────────────────────────
            const isFilterActive = col.isFilterActive();
            const hasFilteredClass = headerCell.classList.contains('ag-header-cell-filtered');
            if (isFilterActive && !hasFilteredClass) {
                colErrors.add('Filter is active but ag-header-cell-filtered class is missing.');
            }
            if (!isFilterActive && hasFilteredClass) {
                colErrors.add('Filter is not active but ag-header-cell-filtered class is present.');
            }

            // ── ag-header-cell-sortable CSS class ───────────────────────────
            const hasSortableClass = headerCell.classList.contains('ag-header-cell-sortable');
            if (isSortable && !hasSortableClass) {
                colErrors.add('Column is sortable but ag-header-cell-sortable class is missing.');
            }
            if (!isSortable && hasSortableClass) {
                colErrors.add('Column is not sortable but ag-header-cell-sortable class is present.');
            }

            // ── ag-header-cell-moving CSS class ─────────────────────────────
            const isMoving = col.isMoving();
            const hasMovingClass = headerCell.classList.contains('ag-header-cell-moving');
            if (isMoving && !hasMovingClass) {
                colErrors.add('Column isMoving() but ag-header-cell-moving class is missing.');
            }
            if (!isMoving && hasMovingClass) {
                colErrors.add('Column is not moving but ag-header-cell-moving class is present.');
            }

            // ── ag-header-span-height CSS class ─────────────────────────────
            if (gridColumns.hasColumnGroups) {
                const paddingInfo = col.getColumnGroupPaddingInfo();
                const hasSpanHeightClass = headerCell.classList.contains('ag-header-span-height');
                if (paddingInfo.numberOfParents > 0 && !hasSpanHeightClass) {
                    colErrors.add(
                        `Column has ${paddingInfo.numberOfParents} padding parents but ag-header-span-height class is missing.`
                    );
                }
                // ag-header-span-total
                const hasSpanTotalClass = headerCell.classList.contains('ag-header-span-total');
                if (paddingInfo.isSpanningTotal && !hasSpanTotalClass) {
                    colErrors.add('Column is spanning total but ag-header-span-total class is missing.');
                }
                if (!paddingInfo.isSpanningTotal && hasSpanTotalClass) {
                    colErrors.add('Column is not spanning total but ag-header-span-total class is present.');
                }
            }

            // ── aria-colindex attribute ──────────────────────────────────────
            const ariaColIndex = headerCell.getAttribute('aria-colindex');
            if (ariaColIndex == null) {
                colErrors.add('Header cell is missing aria-colindex attribute.');
            }

            // ── ag-header-cell-wrap-text CSS class ──────────────────────────
            const colDef = col.getColDef();
            const wrapHeaderText = colDef.wrapHeaderText;
            const hasWrapTextClass = headerCell.classList.contains('ag-header-cell-wrap-text');
            if (wrapHeaderText && !hasWrapTextClass) {
                colErrors.add('Column has wrapHeaderText but ag-header-cell-wrap-text class is missing.');
            }
            if (!wrapHeaderText && hasWrapTextClass) {
                colErrors.add('Column does not have wrapHeaderText but ag-header-cell-wrap-text class is present.');
            }

            // ── ag-column-first / ag-column-last position classes ───────────
            const colIndex = gridColumns.allDisplayedCols.indexOf(col);
            const isFirst = colIndex === 0;
            const isLast = colIndex === gridColumns.allDisplayedCols.length - 1;
            this.checkCssClass(colErrors, headerCell, 'ag-column-first', isFirst, 'first column in display');
            this.checkCssClass(colErrors, headerCell, 'ag-column-last', isLast, 'last column in display');

            // ── Structural elements: resize handle ──────────────────────────
            const resizeEl = headerCell.querySelector('.ag-header-cell-resize');
            if (!resizeEl) {
                colErrors.add('Missing .ag-header-cell-resize element in header cell.');
            }

            // ── Structural elements: comp wrapper ───────────────────────────
            const compWrapper = headerCell.querySelector('.ag-header-cell-comp-wrapper');
            if (!compWrapper) {
                colErrors.add('Missing .ag-header-cell-comp-wrapper element in header cell.');
            }

            // ── Header text content ─────────────────────────────────────────
            // Note: the DOM header text may include an aggregation function prefix like "sum(Value)"
            // when the column has an aggFunc, while getDisplayNameForColumn returns just "Value".
            // We accept both the exact match and the agg-prefixed form.
            const headerDisplayName = gridColumns.api.getDisplayNameForColumn(col, 'header') ?? '';
            const textEl = headerCell.querySelector('.ag-header-cell-text');
            if (textEl) {
                const textContent = textEl.textContent?.trim() ?? '';
                if (
                    headerDisplayName &&
                    textContent !== headerDisplayName &&
                    !textContent.includes(headerDisplayName)
                ) {
                    colErrors.add(
                        `Header text is "${textContent}", expected "${headerDisplayName}" or a value containing it.`
                    );
                }
            }

            // ── Filter icon in label area ───────────────────────────────────
            const filterIcon = headerCell.querySelector('.ag-header-label-icon.ag-filter-icon');
            if (filterIcon) {
                // Filter icon visibility should match isFilterActive when enableFilterIcon is implied
                const isFilterIconVisible =
                    !filterIcon.classList.contains('ag-hidden') && (filterIcon as HTMLElement).style.display !== 'none';
                if (isFilterActive && !isFilterIconVisible) {
                    // Only flag if filterIcon element exists but is hidden while filter is active
                    // (if it doesn't exist at all, that's valid — enableFilterIcon may be false)
                }
            }

            // ── ag-column-menu-visible CSS class ────────────────────────────
            const isMenuVisible = col.isMenuVisible();
            this.checkCssClass(colErrors, headerCell, 'ag-column-menu-visible', isMenuVisible, 'menu visible');

            // ── ag-header-cell-auto-height CSS class ────────────────────────
            const isAutoHeaderHeight = col.isAutoHeaderHeight();
            this.checkCssClass(
                colErrors,
                headerCell,
                'ag-header-cell-auto-height',
                isAutoHeaderHeight,
                'auto header height'
            );

            // Note: tabindex is managed dynamically by the header focus service
            // and may not always be present, so we don't validate it.
        }
    }

    // ── Group headers ───────────────────────────────────────────────────────

    private validateGroupHeaders(gridColumns: GridColumns, headerRoot: HTMLElement): void {
        const { options } = gridColumns;

        const allGroups = this.collectGroups([
            ...gridColumns.leftTree,
            ...gridColumns.centerTree,
            ...gridColumns.rightTree,
        ]);

        for (const group of allGroups) {
            if (group.isPadding()) {
                // Padding groups render as ag-header-group-cell-no-group
                this.validatePaddingGroupHeader(group, headerRoot);
                continue;
            }

            const groupId = group.getUniqueId();
            const headerCell = headerRoot.querySelector(
                `.ag-header-group-cell[col-id="${CSS.escape(String(groupId))}"]`
            ) as HTMLElement | null;

            if (!headerCell) {
                this.errors.get(group).add(`No .ag-header-group-cell[col-id="${groupId}"] found in DOM.`);
                continue;
            }

            const groupErrors = this.errors.get(group);

            // ── Custom validator callback ───────────────────────────────────
            if (options.domGroupValidator) {
                const result = options.domGroupValidator({
                    group,
                    headerElement: headerCell,
                    columnErrors: groupErrors,
                });
                if (result === false) {
                    continue;
                }
            }

            // ── role="columnheader" ─────────────────────────────────────────
            const role = headerCell.getAttribute('role');
            if (role !== 'columnheader') {
                groupErrors.add(`Group header cell role is "${role ?? 'null'}", expected "columnheader".`);
            }

            // ── Width style ─────────────────────────────────────────────────
            const styleWidth = headerCell.style.width;
            const expectedWidth = group.getActualWidth() + 'px';
            if (styleWidth && styleWidth !== expectedWidth) {
                groupErrors.add(`Group header cell style.width is "${styleWidth}", expected "${expectedWidth}".`);
            }

            // ── ag-header-group-cell-with-group CSS class ───────────────────
            const hasWithGroupClass = headerCell.classList.contains('ag-header-group-cell-with-group');
            if (!hasWithGroupClass) {
                groupErrors.add('Non-padding group is missing ag-header-group-cell-with-group class.');
            }
            const hasNoGroupClass = headerCell.classList.contains('ag-header-group-cell-no-group');
            if (hasNoGroupClass) {
                groupErrors.add('Non-padding group has ag-header-group-cell-no-group class.');
            }

            // ── aria-expanded on expandable groups ──────────────────────────
            if (group.isExpandable()) {
                const ariaExpanded = headerCell.getAttribute('aria-expanded');
                const expected = group.isExpanded() ? 'true' : 'false';
                if (ariaExpanded !== expected) {
                    groupErrors.add(
                        `aria-expanded expected "${expected}" but got "${ariaExpanded ?? 'null'}" for expandable group.`
                    );
                }
            } else {
                // Non-expandable groups should NOT have aria-expanded
                const ariaExpanded = headerCell.getAttribute('aria-expanded');
                if (ariaExpanded != null) {
                    groupErrors.add(
                        `Non-expandable group has aria-expanded="${ariaExpanded}" but should not have this attribute.`
                    );
                }
            }

            // ── ag-header-cell-moving CSS class ─────────────────────────────
            const isMoving = group.isMoving();
            const hasMovingClass = headerCell.classList.contains('ag-header-cell-moving');
            if (isMoving && !hasMovingClass) {
                groupErrors.add('Group isMoving() but ag-header-cell-moving class is missing.');
            }
            if (!isMoving && hasMovingClass) {
                groupErrors.add('Group is not moving but ag-header-cell-moving class is present.');
            }

            // ── aria-colindex attribute ──────────────────────────────────────
            const ariaColIndex = headerCell.getAttribute('aria-colindex');
            if (ariaColIndex == null) {
                groupErrors.add('Group header cell is missing aria-colindex attribute.');
            }

            // ── ag-header-cell-wrap-text CSS class ──────────────────────────
            const colGroupDef = group.getColGroupDef();
            const wrapHeaderText = colGroupDef?.wrapHeaderText;
            const hasWrapTextClass = headerCell.classList.contains('ag-header-cell-wrap-text');
            if (wrapHeaderText && !hasWrapTextClass) {
                groupErrors.add('Group has wrapHeaderText but ag-header-cell-wrap-text class is missing.');
            }
            if (!wrapHeaderText && hasWrapTextClass) {
                groupErrors.add('Group does not have wrapHeaderText but ag-header-cell-wrap-text class is present.');
            }

            // ── Structural elements: resize handle ──────────────────────────
            const resizeEl = headerCell.querySelector('.ag-header-cell-resize');
            if (!resizeEl) {
                groupErrors.add('Missing .ag-header-cell-resize element in group header cell.');
            }

            // ── Structural elements: comp wrapper ───────────────────────────
            const compWrapper = headerCell.querySelector('.ag-header-cell-comp-wrapper');
            if (!compWrapper) {
                groupErrors.add('Missing .ag-header-cell-comp-wrapper element in group header cell.');
            }

            // ── Expand/collapse icons ───────────────────────────────────────
            const expandedIcon = headerCell.querySelector('.ag-header-expand-icon-expanded');
            const collapsedIcon = headerCell.querySelector('.ag-header-expand-icon-collapsed');

            if (group.isExpandable()) {
                // At least the expand icon elements should exist
                if (!expandedIcon && !collapsedIcon) {
                    groupErrors.add('Expandable group is missing both expand icon elements.');
                }

                if (group.isExpanded()) {
                    // Expanded icon should be visible, collapsed hidden
                    if (expandedIcon && this.isElementHidden(expandedIcon as HTMLElement)) {
                        groupErrors.add('Group is expanded but ag-header-expand-icon-expanded is hidden.');
                    }
                    if (collapsedIcon && !this.isElementHidden(collapsedIcon as HTMLElement)) {
                        groupErrors.add('Group is expanded but ag-header-expand-icon-collapsed is visible.');
                    }
                } else {
                    // Collapsed icon should be visible, expanded hidden
                    if (collapsedIcon && this.isElementHidden(collapsedIcon as HTMLElement)) {
                        groupErrors.add('Group is collapsed but ag-header-expand-icon-collapsed is hidden.');
                    }
                    if (expandedIcon && !this.isElementHidden(expandedIcon as HTMLElement)) {
                        groupErrors.add('Group is collapsed but ag-header-expand-icon-expanded is visible.');
                    }
                }
            } else {
                // Non-expandable groups should have both icons hidden (or absent)
                if (expandedIcon && !this.isElementHidden(expandedIcon as HTMLElement)) {
                    groupErrors.add('Non-expandable group has visible ag-header-expand-icon-expanded.');
                }
                if (collapsedIcon && !this.isElementHidden(collapsedIcon as HTMLElement)) {
                    groupErrors.add('Non-expandable group has visible ag-header-expand-icon-collapsed.');
                }
            }

            // ── Group label text ────────────────────────────────────────────
            const groupDisplayName = gridColumns.api.getDisplayNameForColumnGroup(group, 'header') ?? '';
            const groupTextEl = headerCell.querySelector('.ag-header-group-text');
            if (groupTextEl && groupDisplayName) {
                const textContent = groupTextEl.textContent?.trim() ?? '';
                if (textContent !== groupDisplayName) {
                    groupErrors.add(`Group header text is "${textContent}", expected "${groupDisplayName}".`);
                }
            }
        }
    }

    // ── Padding group header ────────────────────────────────────────────────

    private validatePaddingGroupHeader(group: ColumnGroup, headerRoot: HTMLElement): void {
        const groupId = group.getUniqueId();
        const headerCell = headerRoot.querySelector(
            `.ag-header-group-cell[col-id="${CSS.escape(String(groupId))}"]`
        ) as HTMLElement | null;

        if (!headerCell) {
            return; // Padding groups might not render in all layouts
        }

        const groupErrors = this.errors.get(group);

        // Padding groups should have ag-header-group-cell-no-group class
        const hasNoGroupClass = headerCell.classList.contains('ag-header-group-cell-no-group');
        if (!hasNoGroupClass) {
            groupErrors.add('Padding group is missing ag-header-group-cell-no-group class.');
        }
        const hasWithGroupClass = headerCell.classList.contains('ag-header-group-cell-with-group');
        if (hasWithGroupClass) {
            groupErrors.add('Padding group has ag-header-group-cell-with-group class.');
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Finds the first header cell for a given colId. Searches across all pinned containers. */
    private findHeaderCell(headerRoot: HTMLElement, colId: string): HTMLElement | null {
        return headerRoot.querySelector(`.ag-header-cell[col-id="${CSS.escape(colId)}"]`) as HTMLElement | null;
    }

    /** Checks if an element is hidden via ag-hidden class or display:none. */
    private isElementHidden(el: HTMLElement): boolean {
        return el.classList.contains('ag-hidden') || el.style.display === 'none';
    }

    /** Validates a CSS class is present when expected and absent when not. */
    private checkCssClass(
        errors: { add(msg: string | false | null | undefined): void },
        el: HTMLElement,
        className: string,
        shouldBePresent: boolean,
        description: string
    ): void {
        const hasClass = el.classList.contains(className);
        if (shouldBePresent && !hasClass) {
            errors.add(`${className} class missing (expected for: ${description}).`);
        }
        if (!shouldBePresent && hasClass) {
            errors.add(`${className} class present but should not be (not: ${description}).`);
        }
    }

    private collectGroups(tree: (Column | ColumnGroup)[]): ColumnGroup[] {
        const groups: ColumnGroup[] = [];
        const visit = (items: (Column | ColumnGroup)[]) => {
            for (const item of items) {
                if (!item.isColumn) {
                    const group = item as ColumnGroup;
                    groups.push(group);
                    const children = group.getDisplayedChildren();
                    if (children) {
                        visit(children);
                    }
                }
            }
        };
        visit(tree);
        return groups;
    }
}

/**
 * Grid-wide context for `getDisplayedSort`, computed once per validation pass:
 * - `rowGroupCols`: the current rowGroup columns, or `null` when the SharedRowGrouping module is
 *   not registered (e.g. tree-data-only tests). `getRowGroupColumns` is part of that module.
 * - `isSortingCoupled`: mirrors `_isColumnsSortingCoupledToGroup(gos)` — false when a custom
 *   `autoGroupColumnDef.comparator` or `treeData` is configured.
 */
interface DisplayedSortContext {
    rowGroupCols: Column[] | null;
    isSortingCoupled: boolean;
}

// Mirrors `_isColumnsSortingCoupledToGroup`. INTENTIONAL DUPLICATION (black-box check) — keep in
// sync with the production helper, named here so drift is easier to spot in review.
function isCoupledSortMode(api: GridApi): boolean {
    return !api.getGridOption('autoGroupColumnDef')?.comparator && !api.getGridOption('treeData');
}

function buildDisplayedSortContext(api: GridApi): DisplayedSortContext {
    // `getRowGroupColumns` is gated on the SharedRowGrouping module; when not registered (e.g.
    // tree-data-only tests), the API call would log a warning and return `undefined`. Cast for
    // the internal module name matches the existing pattern in `validateHeaderRoot` above.
    const isModuleRegistered = api.isModuleRegistered as (name: string) => boolean;
    const rowGroupCols = isModuleRegistered('SharedRowGrouping') ? api.getRowGroupColumns() : null;
    return { rowGroupCols, isSortingCoupled: isCoupledSortMode(api) };
}

/**
 * Effective displayed sort direction for a column, or `null` when none. Mirrors
 * `SortService.getDisplaySortForColumn` using public API only, and compares direction only —
 * that's what the validator asserts against `aria-sort` in the DOM.
 *
 * INTENTIONAL DUPLICATION of `getDisplaySortForColumn` / `_isColumnsSortingCoupledToGroup`: the
 * validator is a black-box DOM check, so computing the expected answer from the production
 * helpers would let both agree on the same bug. Keep in sync when those helpers change.
 *
 * Approximation: string `showRowGroup` is resolved against `getRowGroupColumns()` only, not
 * all defined columns; no current test config triggers a divergence.
 */
function getDisplayedSort(col: Column, ctx: DisplayedSortContext): SortDirection | 'mixed' | null {
    const ownSort = col.getSort() ?? null;
    if (ownSort) {
        return ownSort;
    }

    const colDef = col.getColDef();
    const showRowGroup = colDef.showRowGroup;
    if (showRowGroup == null) {
        return null;
    }

    // Coupling OFF → display column shows only its own sort (null at this point).
    if (!ctx.isSortingCoupled || !ctx.rowGroupCols) {
        return null;
    }

    // `=== true` cascades to all rowGroup columns; string resolves to at most one column by colId.
    let linked: Column[];
    if (showRowGroup === true) {
        linked = ctx.rowGroupCols;
    } else {
        const found = ctx.rowGroupCols.find((c) => c.getColId() === showRowGroup);
        if (!found) {
            return null;
        }
        linked = [found];
    }
    if (linked.length === 0) {
        return null;
    }

    // When the display column has own data (field/valueGetter), its own (null) sort joins the
    // mix-check — any non-null linked source then renders as 'mixed'. See `columnHasUniqueData`
    // in `getDisplaySortForColumn`.
    const columnHasUniqueData = colDef.field != null || colDef.valueGetter != null;
    let firstSort: SortDirection | null | undefined = columnHasUniqueData ? null : undefined;
    for (const c of linked) {
        const s = c.getSort() ?? null;
        if (firstSort === undefined) {
            firstSort = s;
        } else if (firstSort !== s) {
            return 'mixed';
        }
    }
    return firstSort ?? null;
}
