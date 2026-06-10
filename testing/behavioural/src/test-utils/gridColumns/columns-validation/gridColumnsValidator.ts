import type { Column, ColumnGroup, ProvidedColumnGroup } from 'ag-grid-community';

import type { GridColumns } from '../gridColumns';
import type { GridColumnsBugs } from '../gridColumnsOptions';
import type { GridColumnsErrors } from './gridColumnsErrors';

/**
 * Validates internal column model invariants.
 * This is the column-side equivalent of GridRowsValidator.
 */
export class GridColumnsValidator {
    public constructor(
        public readonly errors: GridColumnsErrors,
        public readonly bugs: Readonly<GridColumnsBugs>
    ) {}

    public validate(gridColumns: GridColumns): void {
        const { api, leftCols, centerCols, rightCols, allDisplayedCols, leftTree, centerTree, rightTree } = gridColumns;
        const isRtl = api.getGridOption?.('enableRtl') ?? false;

        // ── Global: allDisplayedColumns matches left + center + right (or right + center + left in RTL) ──
        const expectedAll = isRtl
            ? [...rightCols, ...centerCols, ...leftCols]
            : [...leftCols, ...centerCols, ...rightCols];
        if (allDisplayedCols.length !== expectedAll.length) {
            this.errors.default.add(
                `getAllDisplayedColumns() returned ${allDisplayedCols.length} columns, but left(${leftCols.length}) + center(${centerCols.length}) + right(${rightCols.length}) = ${expectedAll.length}.`
            );
        } else {
            for (let i = 0; i < allDisplayedCols.length; i++) {
                if (allDisplayedCols[i] !== expectedAll[i]) {
                    this.errors.default.add(
                        `getAllDisplayedColumns()[${i}] col "${allDisplayedCols[i].getColId()}" does not match expected "${expectedAll[i].getColId()}" from section arrays.`
                    );
                    break;
                }
            }
        }

        // ── ColId uniqueness ────────────────────────────────────────────────
        const colIdCounts = new Map<string, number>();
        for (const col of allDisplayedCols) {
            const id = col.getColId();
            colIdCounts.set(id, (colIdCounts.get(id) ?? 0) + 1);
        }
        for (const [id, count] of colIdCounts) {
            if (count > 1) {
                this.errors.default.add(`Duplicate colId "${id}" found ${count} times in displayed columns.`);
            }
        }

        // ── Displayed columns subset of all grid columns ────────────────────
        const allGridCols = api.getAllGridColumns?.() ?? [];
        if (allGridCols.length > 0) {
            const gridColSet = new Set(allGridCols);
            for (const col of allDisplayedCols) {
                if (!gridColSet.has(col)) {
                    this.errors.get(col).add('Column is in getAllDisplayedColumns() but NOT in getAllGridColumns().');
                }
            }
        }

        // ── Per-section validation ──────────────────────────────────────────
        const pivotMode = !!api.getGridOption?.('pivotMode');
        this.validateSection(leftCols, 'left', leftTree, isRtl, pivotMode);
        this.validateSection(centerCols, null, centerTree, isRtl, pivotMode);
        this.validateSection(rightCols, 'right', rightTree, isRtl, pivotMode);

        // ── Sort index consistency ──────────────────────────────────────────
        this.validateSortIndices(allDisplayedCols);

        // ── Pinned boundary markers ─────────────────────────────────────────
        this.validatePinnedBoundaryMarkers(leftCols, rightCols, isRtl);

        // ── Row group / pivot / value column list consistency ────────────────
        this.validateFunctionColumns(gridColumns);

        // ── Column state snapshot consistency ────────────────────────────────
        this.validateColumnState(gridColumns);

        // ── isColumn type discriminator ─────────────────────────────────────
        for (const col of allDisplayedCols) {
            if (!col.isColumn) {
                this.errors.get(col).add('isColumn is false on a Column object.');
            }
        }

        // ── Liveness: no destroyed cols/groups reachable from the grid ──────
        this.validateAlive(gridColumns, allGridCols);

        // ── Provided-group id uniqueness in the current state ───────────────
        this.validateProvidedGroupIdUniqueness(gridColumns);

        // ── api.getColumn(colId) lookup consistency ─────────────────────────
        this.validateApiGetColumn(gridColumns);

        // ── api.getDisplayedColAfter / Before navigation chain ──────────────
        this.validateDisplayedColNavigation(gridColumns);

        // ── getAllGridColumns() colId uniqueness ────────────────────────────
        this.validateAllGridColumnsUnique(allGridCols);

        // ── Hidden columns excluded from displayed ──────────────────────────
        this.validateHiddenColumnsExcluded(gridColumns, allGridCols);

        // ── Section disjoint: no column appears in more than one section ────
        this.validateSectionsDisjoint(gridColumns);

        // ── Tree leaves match section flat arrays ───────────────────────────
        this.validateTreeMatchesFlat(gridColumns, isRtl);

        // ── isPinning / isPinningLeft / isPinningRight consistency ──────────
        this.validatePinningFlags(gridColumns);

        // ── getColumnGroupState matches displayed group isExpanded() ────────
        this.validateColumnGroupState(gridColumns);

        // ── getAllDisplayedColumnGroups consistency with section trees ──────
        this.validateAllDisplayedColumnGroups(gridColumns);

        // ── getAllDisplayedVirtualColumns subset of getAllDisplayedColumns ──
        this.validateVirtualColumnsSubset(gridColumns);

        // ── api.getColumnDef(colId) returns each displayed col's colDef ─────
        this.validateApiGetColumnDef(gridColumns);

        // ── api.getColumns() superset of displayed (covers colDefCols) ──────
        this.validateGetColumnsContainsDisplayed(gridColumns);

        // ── api.getColumnGroup / getProvidedColumnGroup lookup ──────────────
        this.validateColumnGroupLookup(gridColumns);

        // ── At-rest UI flags (hover, menu) ──────────────────────────────────
        this.validateAtRestFlags(gridColumns);

        // ── Per-column flex / state consistency ─────────────────────────────
        this.validateFlexConsistency(gridColumns);

        // ── Tree root parents are null in each section ──────────────────────
        this.validateTreeRootsHaveNoParent(gridColumns);

        // ── All cols in column state are reachable via api.getColumn ────────
        this.validateColumnStateColumnsExist(gridColumns);

        // ── colKind ↔ colId convention consistency ──────────────────────────
        this.validateColKindIdConvention(gridColumns);

        // ── Auto-group columns presence/position rules ──────────────────────
        this.validateAutoGroupColumns(gridColumns);

        // ── Pivot mode / pivot result columns presence rules ────────────────
        this.validatePivotResultColumns(gridColumns);

        // ── getRowGroupColumns() order matches column state rowGroupIndex ────
        this.validateRowGroupColumnOrder(gridColumns);

        // ── getPivotColumns() order matches column state pivotIndex ─────────
        this.validatePivotColumnOrder(gridColumns);
    }

    /** `api.getRowGroupColumns()` must be ordered by ascending `rowGroupIndex` in column state. */
    private validateRowGroupColumnOrder(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (!(api.isModuleRegistered as (name: string) => boolean)('SharedRowGrouping')) {
            return;
        }
        const rowGroupCols = api.getRowGroupColumns?.();
        if (!rowGroupCols || rowGroupCols.length === 0) {
            return;
        }
        const stateArr = api.getColumnState?.();
        if (!stateArr) {
            return;
        }
        const indexByColId = new Map<string, number>();
        for (let i = 0, len = stateArr.length; i < len; ++i) {
            const s = stateArr[i];
            if (typeof s.rowGroupIndex === 'number') {
                indexByColId.set(s.colId, s.rowGroupIndex);
            }
        }
        for (let i = 1, len = rowGroupCols.length; i < len; ++i) {
            const prev = indexByColId.get(rowGroupCols[i - 1].getColId());
            const curr = indexByColId.get(rowGroupCols[i].getColId());
            if (prev != null && curr != null && prev > curr) {
                this.errors.default.add(
                    `getRowGroupColumns() order mismatch: "${rowGroupCols[i - 1].getColId()}" (rowGroupIndex=${prev}) appears before "${rowGroupCols[i].getColId()}" (rowGroupIndex=${curr}).`
                );
                break;
            }
        }
    }

    /** `api.getPivotColumns()` must be ordered by ascending `pivotIndex` in column state. */
    private validatePivotColumnOrder(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (!(api.isModuleRegistered as (name: string) => boolean)('SharedPivot')) {
            return;
        }
        const pivotCols = api.getPivotColumns?.();
        if (!pivotCols || pivotCols.length === 0) {
            return;
        }
        const stateArr = api.getColumnState?.();
        if (!stateArr) {
            return;
        }
        const indexByColId = new Map<string, number>();
        for (let i = 0, len = stateArr.length; i < len; ++i) {
            const s = stateArr[i];
            if (typeof s.pivotIndex === 'number') {
                indexByColId.set(s.colId, s.pivotIndex);
            }
        }
        for (let i = 1, len = pivotCols.length; i < len; ++i) {
            const prev = indexByColId.get(pivotCols[i - 1].getColId());
            const curr = indexByColId.get(pivotCols[i].getColId());
            if (prev != null && curr != null && prev > curr) {
                this.errors.default.add(
                    `getPivotColumns() order mismatch: "${pivotCols[i - 1].getColId()}" (pivotIndex=${prev}) appears before "${pivotCols[i].getColId()}" (pivotIndex=${curr}).`
                );
                break;
            }
        }
    }

    /** Service columns must have the expected colId prefix for their `colKind`:
     *  - `ag-Grid-SelectionColumn` ↔ `colKind === 'selection'`
     *  - `ag-Grid-RowNumbersColumn` ↔ `colKind === 'row-number'`
     *  - `ag-Grid-AutoColumn*` ↔ `colKind === 'auto-group'`
     *  Catches cases where a service column is registered with the wrong kind (would route through
     *  the wrong code path in partitionVisibleCols / column state). */
    private validateColKindIdConvention(gridColumns: GridColumns): void {
        const check = (col: Column): void => {
            const colId = col.getColId();
            const colKind = (col as any).colKind as string | undefined;
            if (colKind === undefined) {
                return; // colKind is internal; older code paths may not set it.
            }
            const expectedKind =
                colId === 'ag-Grid-SelectionColumn'
                    ? 'selection'
                    : colId === 'ag-Grid-RowNumbersColumn'
                      ? 'row-number'
                      : colId.startsWith('ag-Grid-AutoColumn')
                        ? 'auto-group'
                        : null;
            if (expectedKind && colKind !== expectedKind) {
                this.errors
                    .get(col)
                    .add(`Column "${colId}" has colKind="${colKind}" but its id prefix implies "${expectedKind}".`);
            }
            // Reverse: if it claims to be a service kind, the id must match.
            if (colKind === 'selection' && colId !== 'ag-Grid-SelectionColumn') {
                this.errors
                    .get(col)
                    .add(`Column has colKind="selection" but colId="${colId}" (expected "ag-Grid-SelectionColumn").`);
            }
            if (colKind === 'row-number' && colId !== 'ag-Grid-RowNumbersColumn') {
                this.errors
                    .get(col)
                    .add(`Column has colKind="row-number" but colId="${colId}" (expected "ag-Grid-RowNumbersColumn").`);
            }
            if (colKind === 'auto-group' && !colId.startsWith('ag-Grid-AutoColumn')) {
                this.errors
                    .get(col)
                    .add(
                        `Column has colKind="auto-group" but colId="${colId}" doesn't start with "ag-Grid-AutoColumn".`
                    );
            }
        };
        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            check(gridColumns.allDisplayedCols[i]);
        }
    }

    /** Auto-group column presence/absence — narrow, high-confidence cases only:
     *  - `groupDisplayType === 'custom'` with active row-groups: no auto-group cols (user provides their own).
     *  - No row-groups AND no auto cols generated: this isn't really a check, but ensure we don't
     *    have leftover auto cols from a previous state.
     *  Doesn't try to predict exact count under modifiers like `groupHideColumnsUntilExpanded` or
     *  `groupHideOpenParents`, which can hide some auto cols. */
    private validateAutoGroupColumns(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (!(api.isModuleRegistered as (name: string) => boolean)('SharedRowGrouping')) {
            return;
        }
        const groupDisplayType = api.getGridOption?.('groupDisplayType') ?? 'singleColumn';
        const treeData = !!api.getGridOption?.('treeData');
        if (treeData) {
            return; // tree data has its own auto-col rules; out of scope.
        }
        const autoCols = gridColumns.allDisplayedCols.filter(
            (c) => (c as any).colKind === 'auto-group' || c.getColId().startsWith('ag-Grid-AutoColumn')
        );
        // 'custom' display type means the user supplies their own group cell renderer cols; no
        // ag-Grid-AutoColumn should be added by the grid.
        if (groupDisplayType === 'custom' && autoCols.length > 0) {
            this.errors.default.add(
                `groupDisplayType="custom" but ${autoCols.length} auto-group column(s) are displayed.`
            );
        }
    }

    /** Pivot result columns (`pivot_*`) may only appear when `pivotMode === true` AND the grid is
     *  showing pivot results. Guarded by `SharedPivot` module — otherwise `getPivotResultColumns`
     *  logs error #200. */
    private validatePivotResultColumns(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (!(api.isModuleRegistered as (name: string) => boolean)('SharedPivot')) {
            return;
        }
        const pivotMode = !!api.getGridOption?.('pivotMode');
        const pivotResultCols = (api as any).getPivotResultColumns?.() as Column[] | null | undefined;
        const pivotResultSet = pivotResultCols ? new Set(pivotResultCols) : null;

        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            const col = gridColumns.allDisplayedCols[i];
            const colId = col.getColId();
            const isPivotResult = (pivotResultSet?.has(col) ?? false) || colId.startsWith('pivot_');
            if (!isPivotResult) {
                continue;
            }
            if (!pivotMode) {
                this.errors.get(col).add(`Pivot result column "${colId}" is displayed but pivotMode is false.`);
            }
        }
    }

    /** Any column in `getAllGridColumns()` with `isVisible()===false` MUST NOT appear in displayed columns. */
    private validateHiddenColumnsExcluded(gridColumns: GridColumns, allGridCols: Column[]): void {
        if (allGridCols.length === 0) {
            return;
        }
        const pivotMode = !!gridColumns.api.getGridOption?.('pivotMode');
        const displayedSet = new Set(gridColumns.allDisplayedCols);
        for (let i = 0, len = allGridCols.length; i < len; ++i) {
            const col = allGridCols[i];
            if (!col.isVisible() && displayedSet.has(col) && !isValueColShownInPivotMode(col, pivotMode)) {
                this.errors.get(col).add('Column has isVisible()=false but appears in displayed columns.');
            }
        }
    }

    /** No column may appear in more than one section (left/center/right). */
    private validateSectionsDisjoint(gridColumns: GridColumns): void {
        const seen = new Map<Column, 'left' | 'center' | 'right'>();
        const check = (cols: Column[], section: 'left' | 'center' | 'right'): void => {
            for (let i = 0, len = cols.length; i < len; ++i) {
                const col = cols[i];
                const prev = seen.get(col);
                if (prev !== undefined && prev !== section) {
                    this.errors
                        .get(col)
                        .add(`Column "${col.getColId()}" appears in both "${prev}" and "${section}" sections.`);
                } else {
                    seen.set(col, section);
                }
            }
        };
        check(gridColumns.leftCols, 'left');
        check(gridColumns.centerCols, 'center');
        check(gridColumns.rightCols, 'right');
    }

    /** Tree leaves (flattened) per section must equal that section's flat column array. */
    private validateTreeMatchesFlat(gridColumns: GridColumns, isRtl: boolean): void {
        if (!gridColumns.hasColumnGroups) {
            return;
        }
        const check = (tree: (Column | ColumnGroup)[], flat: Column[], label: 'left' | 'center' | 'right'): void => {
            const leaves: Column[] = [];
            this.collectLeaves(tree, leaves);
            if (leaves.length !== flat.length) {
                this.errors.default.add(
                    `${label} tree has ${leaves.length} leaf columns but ${label}Cols flat array has ${flat.length}.`
                );
                return;
            }
            for (let i = 0, len = flat.length; i < len; ++i) {
                if (leaves[i] !== flat[i]) {
                    this.errors.default.add(
                        `${label} tree leaf[${i}] "${leaves[i].getColId()}" does not match ${label}Cols[${i}] "${flat[i].getColId()}".`
                    );
                    break;
                }
            }
        };
        // In RTL the right section is rendered first in `allDisplayedColumns`, but each section's tree leaves
        // still correspond positionally to its own flat array.
        check(gridColumns.leftTree, gridColumns.leftCols, 'left');
        check(gridColumns.centerTree, gridColumns.centerCols, 'center');
        check(gridColumns.rightTree, gridColumns.rightCols, 'right');
        // touch isRtl to silence unused (kept in signature for future RTL-specific checks)
        void isRtl;
    }

    private collectLeaves(tree: (Column | ColumnGroup)[], out: Column[]): void {
        for (let i = 0, len = tree.length; i < len; ++i) {
            const node = tree[i];
            if (node.isColumn) {
                out.push(node as Column);
            } else {
                const children = (node as ColumnGroup).getDisplayedChildren();
                if (children) {
                    this.collectLeaves(children, out);
                }
            }
        }
    }

    /** `isPinning()` must be true iff there are any pinned columns. Same for left/right specific. */
    private validatePinningFlags(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        const hasLeft = gridColumns.leftCols.length > 0;
        const hasRight = gridColumns.rightCols.length > 0;
        const expectedPinning = hasLeft || hasRight;
        const isPinning = api.isPinning?.();
        if (isPinning !== undefined && isPinning !== expectedPinning) {
            this.errors.default.add(
                `api.isPinning() is ${isPinning} but leftCols(${gridColumns.leftCols.length}) + rightCols(${gridColumns.rightCols.length}) suggests ${expectedPinning}.`
            );
        }
        const isPinningLeft = api.isPinningLeft?.();
        if (isPinningLeft !== undefined && isPinningLeft !== hasLeft) {
            this.errors.default.add(
                `api.isPinningLeft() is ${isPinningLeft} but leftCols.length is ${gridColumns.leftCols.length}.`
            );
        }
        const isPinningRight = api.isPinningRight?.();
        if (isPinningRight !== undefined && isPinningRight !== hasRight) {
            this.errors.default.add(
                `api.isPinningRight() is ${isPinningRight} but rightCols.length is ${gridColumns.rightCols.length}.`
            );
        }
    }

    /** `api.getColumnGroupState()` entries must match displayed groups' expansion state. */
    private validateColumnGroupState(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        const stateArr = api.getColumnGroupState?.();
        if (!stateArr) {
            return;
        }
        const displayedGroupsById = new Map<string, ColumnGroup>();
        const walk = (tree: (Column | ColumnGroup)[]): void => {
            for (let i = 0, len = tree.length; i < len; ++i) {
                const node = tree[i];
                if (node.isColumn) {
                    continue;
                }
                const group = node as ColumnGroup;
                const provided = group.getProvidedColumnGroup();
                if (provided && !provided.isPadding?.()) {
                    displayedGroupsById.set(provided.getGroupId(), group);
                }
                const children = group.getChildren();
                if (children) {
                    walk(children);
                }
            }
        };
        walk(gridColumns.leftTree);
        walk(gridColumns.centerTree);
        walk(gridColumns.rightTree);

        for (let i = 0, len = stateArr.length; i < len; ++i) {
            const entry = stateArr[i];
            const group = displayedGroupsById.get(entry.groupId);
            if (!group) {
                // Provided groups may be in state but not displayed if their leaf columns are all hidden.
                // Don't error in that case.
                continue;
            }
            const expanded = group.isExpanded();
            if (entry.open !== expanded) {
                this.errors
                    .get(group)
                    .add(
                        `getColumnGroupState() reports open=${entry.open} for "${entry.groupId}" but group.isExpanded()=${expanded}.`
                    );
            }
        }
    }

    /** `api.getAllDisplayedColumnGroups()` must equal the concatenation of left/center/right trees. */
    private validateAllDisplayedColumnGroups(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        const all = api.getAllDisplayedColumnGroups?.();
        if (!all || !gridColumns.hasColumnGroups) {
            return;
        }
        const expected: (Column | ColumnGroup)[] = [
            ...gridColumns.leftTree,
            ...gridColumns.centerTree,
            ...gridColumns.rightTree,
        ];
        if (all.length !== expected.length) {
            this.errors.default.add(
                `getAllDisplayedColumnGroups() returned ${all.length} entries but left/center/right trees total ${expected.length}.`
            );
            return;
        }
        for (let i = 0, len = expected.length; i < len; ++i) {
            if (all[i] !== expected[i]) {
                this.errors.default.add(
                    `getAllDisplayedColumnGroups()[${i}] does not match expected element from concatenated section trees.`
                );
                break;
            }
        }
    }

    /** `api.getAllDisplayedVirtualColumns()` must be a subset of `getAllDisplayedColumns()`. Order is not constrained
     *  (the viewport implementation concatenates `colsWithinViewport + leftCols + rightCols`). Uniqueness IS enforced. */
    private validateVirtualColumnsSubset(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        const virtual = api.getAllDisplayedVirtualColumns?.();
        if (!virtual || virtual.length === 0) {
            return;
        }
        const displayedSet = new Set(gridColumns.allDisplayedCols);
        const seen = new Set<Column>();
        for (let i = 0, len = virtual.length; i < len; ++i) {
            const col = virtual[i];
            if (!displayedSet.has(col)) {
                this.errors
                    .get(col)
                    .add(
                        `getAllDisplayedVirtualColumns() contains "${col.getColId()}" which is NOT in getAllDisplayedColumns().`
                    );
                continue;
            }
            if (seen.has(col)) {
                this.errors.get(col).add(`getAllDisplayedVirtualColumns() contains duplicate "${col.getColId()}".`);
                continue;
            }
            seen.add(col);
        }
    }

    /** `api.getColumnDef(colId)` must return each displayed column's colDef. */
    private validateApiGetColumnDef(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (typeof api.getColumnDef !== 'function') {
            return;
        }
        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            const col = gridColumns.allDisplayedCols[i];
            const colId = col.getColId();
            const apiDef = api.getColumnDef(colId);
            const colDef = col.getColDef();
            if (apiDef !== colDef) {
                this.errors
                    .get(col)
                    .add(`api.getColumnDef("${colId}") returned a different object than col.getColDef().`);
            }
        }
    }

    /** Every displayed *primary* column must be in `api.getColumns()` (colDefList).
     *
     *  Per the column model, displayed cols = `[serviceCols, ...colDefList]` in normal mode, OR pivot-result
     *  cols when `showingPivotResult` is true. So we exclude:
     *    - Service columns (colId starts with `ag-Grid-` — auto-group, selection, row-numbers)
     *    - Pivot result columns (returned by `api.getPivotResultColumns()`)
     *
     *  A primary column that's displayed but missing from `getColumns()` indicates a column-model bug. */
    private validateGetColumnsContainsDisplayed(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        const cols = api.getColumns?.();
        if (!cols) {
            return;
        }
        const colDefSet = new Set(cols);
        const isPivotRegistered = (api.isModuleRegistered as (name: string) => boolean)('SharedPivot');
        const pivotResultCols = isPivotRegistered
            ? ((api as any).getPivotResultColumns?.() as Column[] | null | undefined)
            : null;
        const pivotResultSet = pivotResultCols ? new Set(pivotResultCols) : null;
        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            const col = gridColumns.allDisplayedCols[i];
            if (colDefSet.has(col)) {
                continue;
            }
            const colId = col.getColId();
            if (colId.startsWith('ag-Grid-')) {
                continue; // Service column (auto-group / selection / row-numbers)
            }
            if (pivotResultSet?.has(col)) {
                continue; // Pivot result column
            }
            this.errors
                .get(col)
                .add(
                    `Displayed primary column "${colId}" is NOT in api.getColumns() (colDefList). Not a service col (ag-Grid-*) nor a pivot result col.`
                );
        }
    }

    /** Every displayed (non-padding) column group must be findable via `api.getColumnGroup` and `api.getProvidedColumnGroup`. */
    private validateColumnGroupLookup(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (typeof api.getColumnGroup !== 'function' || typeof api.getProvidedColumnGroup !== 'function') {
            return;
        }
        const walk = (tree: (Column | ColumnGroup)[]): void => {
            for (let i = 0, len = tree.length; i < len; ++i) {
                const node = tree[i];
                if (node.isColumn) {
                    continue;
                }
                const group = node as ColumnGroup;
                if (!group.isPadding()) {
                    const provided = group.getProvidedColumnGroup();
                    if (provided) {
                        const providedId = provided.getGroupId();
                        const foundProvided = api.getProvidedColumnGroup(providedId);
                        if (foundProvided !== provided) {
                            this.errors
                                .get(group)
                                .add(
                                    `api.getProvidedColumnGroup("${providedId}") did not return the provided group of this displayed group.`
                                );
                        }
                    }
                }
                const children = group.getChildren();
                if (children) {
                    walk(children);
                }
            }
        };
        walk(gridColumns.leftTree);
        walk(gridColumns.centerTree);
        walk(gridColumns.rightTree);
    }

    /** At validation time, no displayed column should be hovered. Guarded by `ColumnHoverModule`
     *  registration — otherwise `api.isColumnHovered` logs error #200 for every column. */
    private validateAtRestFlags(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (!(api.isModuleRegistered as (name: string) => boolean)('ColumnHover')) {
            return;
        }
        const isHovered = api.isColumnHovered as ((c: Column) => boolean) | undefined;
        if (typeof isHovered !== 'function') {
            return;
        }
        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            const col = gridColumns.allDisplayedCols[i];
            if (isHovered(col)) {
                this.errors.get(col).add(`api.isColumnHovered() is true at rest for "${col.getColId()}".`);
            }
        }
    }

    /** `getFlex()` is authoritative once a runtime mutation (resize, setGridOption width, etc.)
     *  occurs. `colDef.flex` is the initial config and may stay non-null even after a resize
     *  clears flex. Compare against the live column state instead. */
    private validateFlexConsistency(gridColumns: GridColumns): void {
        const stateById = new Map<string, number | null>();
        for (const state of gridColumns.api.getColumnState() ?? []) {
            if (state.colId != null) {
                stateById.set(state.colId, state.flex ?? null);
            }
        }
        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            const col = gridColumns.allDisplayedCols[i];
            if (!stateById.has(col.getColId())) {
                continue;
            }
            const stateFlex = stateById.get(col.getColId()) ?? null;
            const colFlex = col.getFlex() ?? null;
            if (colFlex !== stateFlex) {
                this.errors
                    .get(col)
                    .add(
                        `column state flex is ${String(stateFlex)} but getFlex() returns ${String(colFlex)} (col.getColDef().flex=${String(col.getColDef().flex)})`
                    );
            }
        }
    }

    /** Top-level entries in each section tree must have `getParent() === null` (they're roots). */
    private validateTreeRootsHaveNoParent(gridColumns: GridColumns): void {
        const check = (tree: (Column | ColumnGroup)[], section: 'left' | 'center' | 'right'): void => {
            for (let i = 0, len = tree.length; i < len; ++i) {
                const node = tree[i];
                const parent = node.getParent();
                if (parent !== null) {
                    const id = node.isColumn ? (node as Column).getColId() : (node as ColumnGroup).getGroupId();
                    this.errors
                        .get(node)
                        .add(
                            `${section} tree root "${id}" has a non-null parent (expected null since it is a tree root).`
                        );
                }
            }
        };
        check(gridColumns.leftTree, 'left');
        check(gridColumns.centerTree, 'center');
        check(gridColumns.rightTree, 'right');
    }

    /** Every colId in `getColumnState()` must be findable via `api.getColumn`. */
    private validateColumnStateColumnsExist(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (typeof api.getColumn !== 'function') {
            return;
        }
        const stateArr = api.getColumnState?.();
        if (!stateArr) {
            return;
        }
        for (let i = 0, len = stateArr.length; i < len; ++i) {
            const colId = stateArr[i].colId;
            const found = api.getColumn(colId);
            if (!found) {
                // Auto-group columns and other generated columns may appear in state without being looked up
                // by id from `getColumn` in some legacy modes — only flag if the column id looks like a regular
                // user-defined column (not ag-Grid-auto- prefix).
                if (!colId.startsWith('ag-Grid-')) {
                    this.errors.default.add(
                        `getColumnState() has entry for colId "${colId}" but api.getColumn("${colId}") returned null.`
                    );
                }
            }
        }
    }

    /** `api.getColumn(colId)` must return the column for every displayed column. */
    private validateApiGetColumn(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        if (typeof api.getColumn !== 'function') {
            return;
        }
        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            const col = gridColumns.allDisplayedCols[i];
            const colId = col.getColId();
            const found = api.getColumn(colId);
            if (found !== col) {
                this.errors
                    .get(col)
                    .add(`api.getColumn("${colId}") returned ${found === null ? 'null' : 'a different column'}.`);
            }
        }
    }

    /** `api.getDisplayedColAfter(cols[i])` must equal `cols[i+1]`, and `getDisplayedColBefore(cols[i+1])` must equal `cols[i]`. */
    private validateDisplayedColNavigation(gridColumns: GridColumns): void {
        const api = gridColumns.api;
        const cols = gridColumns.allDisplayedCols;
        const after = api.getDisplayedColAfter as ((c: Column) => Column | null) | undefined;
        const before = api.getDisplayedColBefore as ((c: Column) => Column | null) | undefined;
        if (typeof after !== 'function' || typeof before !== 'function') {
            return;
        }
        for (let i = 0, len = cols.length; i < len; ++i) {
            const expectedAfter = i < len - 1 ? cols[i + 1] : null;
            const actualAfter = after(cols[i]);
            if (actualAfter !== expectedAfter) {
                this.errors
                    .get(cols[i])
                    .add(
                        `api.getDisplayedColAfter("${cols[i].getColId()}") returned "${actualAfter?.getColId() ?? 'null'}" but expected "${expectedAfter?.getColId() ?? 'null'}".`
                    );
            }
            const expectedBefore = i > 0 ? cols[i - 1] : null;
            const actualBefore = before(cols[i]);
            if (actualBefore !== expectedBefore) {
                this.errors
                    .get(cols[i])
                    .add(
                        `api.getDisplayedColBefore("${cols[i].getColId()}") returned "${actualBefore?.getColId() ?? 'null'}" but expected "${expectedBefore?.getColId() ?? 'null'}".`
                    );
            }
        }
    }

    /** `getAllGridColumns()` must contain unique colIds (catches duplicate / leaked references). */
    private validateAllGridColumnsUnique(allGridCols: Column[]): void {
        if (allGridCols.length === 0) {
            return;
        }
        const counts = new Map<string, number>();
        for (let i = 0, len = allGridCols.length; i < len; ++i) {
            const id = allGridCols[i].getColId();
            counts.set(id, (counts.get(id) ?? 0) + 1);
        }
        counts.forEach((count, id) => {
            if (count > 1) {
                this.errors.default.add(`getAllGridColumns() has duplicate colId "${id}" (${count} times).`);
            }
        });
    }

    /** No two DISTINCT `ProvidedColumnGroup`s may share a `groupId` in the current displayed tree.
     *  (Multiple display instances of the SAME provided group legitimately share an id — they're
     *  the same object.) Catches the reused-padding / fresh-allocation id collision after a refresh. */
    private validateProvidedGroupIdUniqueness(gridColumns: GridColumns): void {
        const byId = new Map<string, ProvidedColumnGroup>();
        const walk = (tree: (Column | ColumnGroup)[]): void => {
            for (let i = 0, len = tree.length; i < len; ++i) {
                const node = tree[i];
                if (node.isColumn) {
                    continue;
                }
                const group = node as ColumnGroup;
                const provided = group.getProvidedColumnGroup();
                const id = provided.getGroupId();
                const existing = byId.get(id);
                if (existing !== undefined && existing !== provided) {
                    this.errors
                        .get(group)
                        .add(
                            `Two distinct ProvidedColumnGroups share groupId "${id}" — id collision in the current state (reused padding vs freshly-allocated id after refresh).`
                        );
                } else {
                    byId.set(id, provided);
                }
                const children = group.getChildren();
                if (children) {
                    walk(children);
                }
            }
        };
        walk(gridColumns.leftTree);
        walk(gridColumns.centerTree);
        walk(gridColumns.rightTree);
    }

    /** Asserts every reachable column and column group is `isAlive()`. Catches leaks where the
     *  grid keeps a reference to a destroyed bean — e.g. service cols, auto-group cols,
     *  hierarchy cols, or column groups that should have been rebuilt during a refresh. */
    private validateAlive(gridColumns: GridColumns, allGridCols: Column[]): void {
        for (let i = 0, len = allGridCols.length; i < len; ++i) {
            const col = allGridCols[i];
            if (!(col as unknown as { isAlive(): boolean }).isAlive()) {
                this.errors.get(col).add('Column is reachable via getAllGridColumns() but isAlive() is false.');
            }
        }
        for (let i = 0, len = gridColumns.allDisplayedCols.length; i < len; ++i) {
            const col = gridColumns.allDisplayedCols[i];
            if (!(col as unknown as { isAlive(): boolean }).isAlive()) {
                this.errors.get(col).add('Displayed column is destroyed (isAlive() is false).');
            }
        }
        this.walkTreeForAlive(gridColumns.leftTree);
        this.walkTreeForAlive(gridColumns.centerTree);
        this.walkTreeForAlive(gridColumns.rightTree);
    }

    private walkTreeForAlive(tree: (Column | ColumnGroup)[]): void {
        for (let i = 0, len = tree.length; i < len; ++i) {
            const node = tree[i];
            if (!(node as unknown as { isAlive(): boolean }).isAlive()) {
                const label = node.isColumn ? 'Column' : 'ColumnGroup';
                this.errors.get(node).add(`${label} is in the displayed tree but isAlive() is false.`);
            }
            if (!node.isColumn) {
                const children = (node as ColumnGroup).getChildren();
                if (children) {
                    this.walkTreeForAlive(children);
                }
            }
        }
    }

    // ── Section-level validation ────────────────────────────────────────────

    private validateSection(
        cols: Column[],
        expectedPinned: 'left' | 'right' | null,
        tree: (Column | ColumnGroup)[],
        isRtl: boolean,
        pivotMode: boolean
    ): void {
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            this.validateColumn(col, expectedPinned, cols, i, pivotMode);
        }

        // Validate tree structure
        this.validateTree(tree, expectedPinned, isRtl);
    }

    // ── Per-column validation ───────────────────────────────────────────────

    private validateColumn(
        col: Column,
        expectedPinned: 'left' | 'right' | null,
        sectionCols: Column[],
        index: number,
        pivotMode: boolean
    ): void {
        const colErrors = this.errors.get(col);

        // ── Pinned state consistency ────────────────────────────────────────
        const pinned = col.getPinned();
        const normalizedPinned = pinned === true ? 'left' : pinned || null;
        if (normalizedPinned !== expectedPinned) {
            colErrors.add(
                `Pinned state is "${String(pinned)}" but column is in ${expectedPinned ?? 'center'} section.`
            );
        }

        // isPinned() consistency with getPinned()
        const isPinned = col.isPinned();
        const expectedIsPinned = normalizedPinned === 'left' || normalizedPinned === 'right';
        if (isPinned !== expectedIsPinned) {
            colErrors.add(`isPinned() returns ${isPinned} but getPinned() is "${String(pinned)}".`);
        }

        // ── Visible consistency ─────────────────────────────────────────────
        // Value columns get displayed unconditionally in pivot mode while no pivot result exists
        // (see `partitionVisibleCols` in `visibleColsService.ts`). Skip the check in that case.
        if (!col.isVisible() && !isValueColShownInPivotMode(col, pivotMode)) {
            colErrors.add('Column is in displayed columns but isVisible() returns false.');
        }

        // ── Width constraints ───────────────────────────────────────────────
        const width = col.getActualWidth();
        if (width <= 0) {
            colErrors.add(`Width is ${width}, expected positive value.`);
        }

        const minWidth = col.getMinWidth();
        if (width < minWidth) {
            colErrors.add(`Width ${width} is less than minWidth ${minWidth}.`);
        }

        const maxWidth = col.getMaxWidth();
        if (maxWidth !== Number.MAX_SAFE_INTEGER && width > maxWidth) {
            colErrors.add(`Width ${width} exceeds maxWidth ${maxWidth}.`);
        }

        if (minWidth > maxWidth && maxWidth !== Number.MAX_SAFE_INTEGER) {
            colErrors.add(`minWidth ${minWidth} exceeds maxWidth ${maxWidth}.`);
        }

        // ── Left position consistency ───────────────────────────────────────
        // Column left values are start-edge offsets in both LTR and RTL, so
        // the section arrays should always increase from 0 by the previous width.
        const left = col.getLeft();
        if (left == null) {
            colErrors.add('Displayed column has null left position.');
        } else if (index === 0) {
            if (left !== 0) {
                colErrors.add(`First column in section has left=${left}, expected 0.`);
            }
        } else {
            const prevCol = sectionCols[index - 1];
            const prevLeft = prevCol.getLeft();
            if (prevLeft != null) {
                const expectedLeft = prevLeft + prevCol.getActualWidth();
                if (left !== expectedLeft) {
                    colErrors.add(
                        `Left position is ${left}, expected ${expectedLeft} (prev.left=${prevLeft} + prev.width=${prevCol.getActualWidth()}).`
                    );
                }
            }
        }

        // ── Sort consistency ────────────────────────────────────────────────
        const sort = col.getSort();
        const sortDef = col.getSortDef?.();
        if (sort != null && sortDef != null) {
            if (sort !== sortDef.direction) {
                colErrors.add(`getSort() returns "${sort}" but getSortDef().direction is "${sortDef.direction}".`);
            }
        }
        if (sort == null && sortDef != null) {
            colErrors.add(`getSort() is null but getSortDef() returns a non-null value.`);
        }

        // ── Aggregation function consistency ────────────────────────────────
        if (col.isValueActive() && col.getAggFunc() == null) {
            colErrors.add('isValueActive() is true but getAggFunc() is null.');
        }

        // ── Filter consistency ──────────────────────────────────────────────
        if (col.isFilterActive() && col.isFilterAllowed?.() === false) {
            colErrors.add('isFilterActive() is true but isFilterAllowed() is false.');
        }

        // ── Parent chain validation ─────────────────────────────────────────
        const parent = col.getParent();
        if (parent) {
            const parentChildren = parent.getChildren();
            const parentDisplayed = parent.getDisplayedChildren();
            if (parentChildren && !parentChildren.some((c) => c === col)) {
                colErrors.add('Column not found in parent.getChildren().');
            }
            if (parentDisplayed && !parentDisplayed.some((c) => c === col)) {
                colErrors.add('Displayed column not found in parent.getDisplayedChildren().');
            }
        }

        // ── isEmptyGroup always false for columns ───────────────────────────
        if (col.isEmptyGroup()) {
            colErrors.add('isEmptyGroup() is true for a leaf column (should always be false).');
        }

        // ── Identity: getId() === getColId() === getUniqueId() ──────────────
        const colId = col.getColId();
        const id = col.getId();
        const uniqueId = col.getUniqueId();
        if (id !== colId) {
            colErrors.add(`getId() "${id}" differs from getColId() "${colId}".`);
        }
        if (String(uniqueId) !== colId) {
            colErrors.add(`getUniqueId() "${String(uniqueId)}" differs from getColId() "${colId}".`);
        }

        // ── getDefinition() === getColDef() ─────────────────────────────────
        if (col.getDefinition() !== col.getColDef()) {
            colErrors.add('getDefinition() is not the same object reference as getColDef().');
        }

        // ── getRight() = getLeft() + getActualWidth() ───────────────────────
        if (left != null) {
            const right = col.getRight();
            const expectedRight = left + width;
            if (right !== expectedRight) {
                colErrors.add(`getRight() is ${right}, expected ${expectedRight} (left=${left} + width=${width}).`);
            }
        }

        // ── isSpanHeaderHeight consistency with colDef ──────────────────────
        const colDef = col.getColDef();
        const spanHeaderHeight = col.isSpanHeaderHeight();
        const suppressSpan = colDef.suppressSpanHeaderHeight;
        if (spanHeaderHeight === !!suppressSpan && suppressSpan !== undefined) {
            colErrors.add(
                `isSpanHeaderHeight() is ${spanHeaderHeight} but suppressSpanHeaderHeight is ${String(suppressSpan)}.`
            );
        }

        // ── getColumnGroupPaddingInfo consistency ───────────────────────────
        const paddingInfo = col.getColumnGroupPaddingInfo();
        if (paddingInfo.numberOfParents < 0) {
            colErrors.add(
                `getColumnGroupPaddingInfo().numberOfParents is ${paddingInfo.numberOfParents}, expected >= 0.`
            );
        }
        if (paddingInfo.numberOfParents === 0 && paddingInfo.isSpanningTotal) {
            colErrors.add('getColumnGroupPaddingInfo().isSpanningTotal is true but numberOfParents is 0.');
        }
        // If numberOfParents > 0, the immediate parent should be a padding group
        if (paddingInfo.numberOfParents > 0 && parent && !parent.isPadding()) {
            colErrors.add(
                `getColumnGroupPaddingInfo().numberOfParents is ${paddingInfo.numberOfParents} but getParent() is not a padding group.`
            );
        }

        // ── isPinnedLeft / isPinnedRight consistency ────────────────────────
        if (col.isPinnedLeft() !== (normalizedPinned === 'left')) {
            colErrors.add(`isPinnedLeft() is ${col.isPinnedLeft()} but pinned is "${String(pinned)}".`);
        }
        if (col.isPinnedRight() !== (normalizedPinned === 'right')) {
            colErrors.add(`isPinnedRight() is ${col.isPinnedRight()} but pinned is "${String(pinned)}".`);
        }

        // ── Permission flags: UI vs API behavior ────────────────────────────
        // isAllowPivot/isAllowRowGroup/isAllowValue control UI drag-and-drop zones.
        // Columns CAN be active via colDef (rowGroup:true) even without enableRowGroup.
        // But if enablePivot/enableRowGroup/enableValue was EXPLICITLY set to true,
        // then the corresponding active flag must be consistent.
        const colDef2 = col.getColDef();
        if (colDef2.enablePivot === true && !col.isAllowPivot()) {
            colErrors.add('colDef.enablePivot is true but isAllowPivot() returns false.');
        }
        if (colDef2.enableRowGroup === true && !col.isAllowRowGroup()) {
            colErrors.add('colDef.enableRowGroup is true but isAllowRowGroup() returns false.');
        }
        if (colDef2.enableValue === true && !col.isAllowValue()) {
            colErrors.add('colDef.enableValue is true but isAllowValue() returns false.');
        }

        // ── getUserProvidedColDef consistency ────────────────────────────────
        // When getUserProvidedColDef() is non-null, the colDef should be a superset of it
        // (merged with defaults). We validate that the reference exists for columns
        // that have explicit field or colId in their colDef.
        const userColDef = col.getUserProvidedColDef();
        if (userColDef) {
            // The merged colDef should have the same field and colId as the user-provided one
            const mergedColDef = col.getColDef();
            if (userColDef.field && mergedColDef.field !== userColDef.field) {
                colErrors.add(
                    `getUserProvidedColDef().field is "${userColDef.field}" but getColDef().field is "${mergedColDef.field}".`
                );
            }
        }

        // ── isSortable consistency with colDef ──────────────────────────────
        // When sortable is explicitly set on colDef, isSortable() should match
        const sortableColDef = col.getColDef().sortable;
        if (sortableColDef === false && col.isSortable()) {
            colErrors.add('colDef.sortable is false but isSortable() returns true.');
        }

        // ── isMoving should be false at rest ────────────────────────────────
        // During tests, columns should not be in moving state unless mid-drag
        if (col.isMoving()) {
            colErrors.add('Column isMoving() is true at validation time (should be false at rest).');
        }

        // ── isAutoHeight consistency ────────────────────────────────────────
        const autoHeight = col.getColDef().autoHeight;
        if (autoHeight === true && !col.isAutoHeight()) {
            colErrors.add('colDef.autoHeight is true but isAutoHeight() returns false.');
        }

        // ── getColumnGroupShow consistency with colDef ──────────────────────
        const cgs = col.getColumnGroupShow();
        const cgsDef = col.getColDef().columnGroupShow;
        if (cgsDef && cgs !== cgsDef) {
            colErrors.add(`colDef.columnGroupShow is "${cgsDef}" but getColumnGroupShow() returns "${cgs}".`);
        }

        // ── isResizable consistency ──────────────────────────────────────────
        const resizableColDef = col.getColDef().resizable;
        if (resizableColDef === false && col.isResizable()) {
            colErrors.add('colDef.resizable is false but isResizable() returns true.');
        }
    }

    // ── Tree structure validation ───────────────────────────────────────────

    private validateTree(
        tree: (Column | ColumnGroup)[],
        expectedPinned: 'left' | 'right' | null,
        isRtl: boolean
    ): void {
        for (const item of tree) {
            if (item.isColumn) {
                continue; // Already validated in per-column checks
            }

            const group = item as ColumnGroup;
            this.validateGroup(group, expectedPinned, isRtl);
        }
    }

    private validateGroup(group: ColumnGroup, expectedPinned: 'left' | 'right' | null, isRtl: boolean): void {
        const groupErrors = this.errors.get(group);

        // ── Type discriminator ──────────────────────────────────────────────
        if (group.isColumn) {
            groupErrors.add('isColumn is true on a ColumnGroup object.');
        }

        // ── Children not null ───────────────────────────────────────────────
        const children = group.getChildren();
        if (!children) {
            groupErrors.add('getChildren() returned null.');
            return;
        }

        // ── DisplayedChildren is a subset of children ───────────────────────
        const displayedChildren = group.getDisplayedChildren();
        if (displayedChildren) {
            const childSet = new Set(children);
            for (const child of displayedChildren) {
                if (!childSet.has(child)) {
                    const id = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(`Displayed child "${id}" is not in getChildren().`);
                }
            }
        }

        // ── Parent back-references ──────────────────────────────────────────
        if (displayedChildren) {
            for (const child of displayedChildren) {
                const parent = child.getParent();
                if (parent !== group) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(`Child "${childId}" parent back-reference does not point to this group.`);
                }
            }
        }

        // ── Group width = sum of displayed children widths ──────────────────
        if (displayedChildren && displayedChildren.length > 0) {
            const expectedWidth = displayedChildren.reduce((sum, c) => sum + c.getActualWidth(), 0);
            const groupWidth = group.getActualWidth();
            if (groupWidth !== expectedWidth) {
                groupErrors.add(
                    `Group width is ${groupWidth}, expected ${expectedWidth} (sum of displayed children widths).`
                );
            }
        }

        // ── Group minWidth = sum of displayed children minWidths ────────────
        if (displayedChildren && displayedChildren.length > 0) {
            const expectedMinWidth = displayedChildren.reduce((sum, c) => sum + c.getMinWidth(), 0);
            const groupMinWidth = group.getMinWidth();
            if (groupMinWidth !== expectedMinWidth) {
                groupErrors.add(
                    `Group minWidth is ${groupMinWidth}, expected ${expectedMinWidth} (sum of displayed children minWidths).`
                );
            }
        }

        // ── isResizable: true if any displayed child is resizable ───────────
        if (displayedChildren && displayedChildren.length > 0) {
            const anyResizable = displayedChildren.some((c) => c.isResizable());
            if (group.isResizable() !== anyResizable) {
                groupErrors.add(
                    `Group isResizable() is ${group.isResizable()}, but ${anyResizable ? 'some' : 'no'} displayed children are resizable.`
                );
            }
        }

        // ── isMoving: true iff any leaf column is moving ────────────────────
        const leafCols = group.getLeafColumns();
        const anyLeafMoving = leafCols.some((c) => c.isMoving());
        if (group.isMoving() !== anyLeafMoving) {
            groupErrors.add(
                `Group isMoving() is ${group.isMoving()}, but ${anyLeafMoving ? 'some' : 'no'} leaf columns are moving.`
            );
        }

        // ── getLeafColumns ⊇ getDisplayedLeafColumns ────────────────────────
        const displayedLeafCols = group.getDisplayedLeafColumns();
        const leafSet = new Set(leafCols);
        for (const displayedLeaf of displayedLeafCols) {
            if (!leafSet.has(displayedLeaf)) {
                groupErrors.add(`Displayed leaf column "${displayedLeaf.getColId()}" is not in getLeafColumns().`);
            }
        }

        // ── columnGroupShow visibility rules ────────────────────────────────
        if (group.isExpandable() && children.length > 0 && displayedChildren) {
            const isExpanded = group.isExpanded();
            const displayedSet = new Set(displayedChildren);

            for (const child of children) {
                const cgs = child.getColumnGroupShow?.();
                const isDisplayed = displayedSet.has(child);

                if (cgs === 'open' && isExpanded && !isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"open" and group is expanded, but is not in displayedChildren.`
                    );
                }
                if (cgs === 'closed' && !isExpanded && !isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"closed" and group is collapsed, but is not in displayedChildren.`
                    );
                }
                if (cgs === 'open' && !isExpanded && isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"open" and group is collapsed, but IS in displayedChildren.`
                    );
                }
                if (cgs === 'closed' && isExpanded && isDisplayed) {
                    const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                    groupErrors.add(
                        `Child "${childId}" has columnGroupShow:"closed" and group is expanded, but IS in displayedChildren.`
                    );
                }
                if (!cgs && !isDisplayed) {
                    // Columns without columnGroupShow should always be displayed, unless:
                    // - The column itself is not visible
                    // - The child is a group whose displayed leaf columns are all empty
                    //   (happens when a padding group's children are all hidden due to columnGroupShow rules)
                    let isChildEffectivelyVisible: boolean;
                    if (child.isColumn) {
                        isChildEffectivelyVisible = child.isVisible();
                    } else {
                        // For groups: check if any displayed leaf columns exist
                        const childGroup = child as ColumnGroup;
                        isChildEffectivelyVisible = childGroup.getDisplayedLeafColumns().length > 0;
                    }
                    if (isChildEffectivelyVisible) {
                        const childId = child.isColumn ? child.getColId() : (child as ColumnGroup).getGroupId();
                        groupErrors.add(
                            `Child "${childId}" has no columnGroupShow and is visible, but is not in displayedChildren.`
                        );
                    }
                }
            }
        }

        // ── Group left position consistency ─────────────────────────────────
        // In LTR: group left = first displayed child's left
        // In RTL: group left = last displayed child's left
        if (displayedChildren && displayedChildren.length > 0) {
            const refChild = isRtl ? displayedChildren[displayedChildren.length - 1] : displayedChildren[0];
            const groupLeft = group.getLeft();
            const refChildLeft = refChild.getLeft();
            if (groupLeft != null && refChildLeft != null && groupLeft !== refChildLeft) {
                const pos = isRtl ? 'last' : 'first';
                groupErrors.add(`Group left is ${groupLeft}, but ${pos} displayed child left is ${refChildLeft}.`);
            }
        }

        // ── getProvidedColumnGroup() must exist ─────────────────────────────
        const provided = group.getProvidedColumnGroup();
        if (!provided) {
            groupErrors.add('getProvidedColumnGroup() returned null.');
        }

        // ── isEmptyGroup consistency ────────────────────────────────────────
        if (displayedChildren) {
            const isEmpty = displayedChildren.length === 0;
            if (group.isEmptyGroup() !== isEmpty) {
                groupErrors.add(
                    `isEmptyGroup() is ${group.isEmptyGroup()} but displayedChildren.length is ${displayedChildren.length}.`
                );
            }
        }

        // ── getUniqueId format: groupId_partId ──────────────────────────────
        const uniqueId = String(group.getUniqueId());
        const groupId = group.getGroupId();
        if (!uniqueId.startsWith(groupId + '_')) {
            groupErrors.add(`getUniqueId() "${uniqueId}" does not start with getGroupId()+"_" ("${groupId}_").`);
        }

        // ── getDefinition() === getColGroupDef() ────────────────────────────
        if (group.getDefinition() !== group.getColGroupDef()) {
            groupErrors.add('getDefinition() is not the same object reference as getColGroupDef().');
        }

        // ── getPaddingLevel consistency ──────────────────────────────────────
        const paddingLevel = group.getPaddingLevel();
        if (paddingLevel < 0) {
            groupErrors.add(`getPaddingLevel() is ${paddingLevel}, expected >= 0.`);
        }
        if (paddingLevel > 0 && !group.isPadding()) {
            groupErrors.add(`getPaddingLevel() is ${paddingLevel} but isPadding() is false.`);
        }

        // ── Pinned consistency for all leaf columns ─────────────────────────
        const groupPinned = group.getPinned();
        for (const leaf of leafCols) {
            const leafPinned = leaf.getPinned();
            const normalizedGroupPinned = groupPinned === true ? 'left' : groupPinned || null;
            const normalizedLeafPinned = leafPinned === true ? 'left' : leafPinned || null;
            if (normalizedGroupPinned !== normalizedLeafPinned) {
                groupErrors.add(
                    `Group pinned is "${String(groupPinned)}" but leaf "${leaf.getColId()}" pinned is "${String(leafPinned)}".`
                );
                break;
            }
        }

        // ── Recurse into displayed children ─────────────────────────────────
        if (displayedChildren) {
            this.validateTree(displayedChildren, expectedPinned, isRtl);
        }
    }

    // ── Sort validation ─────────────────────────────────────────────────────

    private validateSortIndices(cols: Column[]): void {
        const sortedCols = cols.filter((c) => c.getSort() != null);
        if (sortedCols.length <= 1) {
            return;
        }

        // When multiple columns are sorted and have sortIndex, validate they are sequential (0, 1, 2, ...)
        const indices = sortedCols
            .map((c) => c.getSortIndex())
            .filter((idx): idx is number => idx != null && idx >= 0)
            .sort((a, b) => a - b);

        // Only validate if all sorted columns have sortIndex (some APIs apply sort without sortIndex)
        if (indices.length === 0 || indices.length !== sortedCols.length) {
            return;
        }

        for (let i = 0; i < indices.length; i++) {
            if (indices[i] !== i) {
                this.errors.default.add(
                    `Sort indices are not sequential. Expected [0..${indices.length - 1}], got [${indices.join(', ')}].`
                );
                break;
            }
        }

        // Validate uniqueness
        const uniqueIndices = new Set(indices);
        if (uniqueIndices.size !== indices.length) {
            this.errors.default.add(`Duplicate sortIndex values found among sorted columns.`);
        }
    }

    // ── Pinned boundary markers ─────────────────────────────────────────────

    private validatePinnedBoundaryMarkers(leftCols: Column[], rightCols: Column[], isRtl: boolean): void {
        // isLastLeftPinned: at most one column, must be the last col in `leftCols` (the boundary
        // adjacent to the centre body). RTL doesn't change this — `leftCols` is still ordered
        // start-edge-first in both layouts and the boundary is the trailing entry.
        if (leftCols.length > 0) {
            const lastLeftPinnedCols = leftCols.filter((c) => c.isLastLeftPinned());
            if (lastLeftPinnedCols.length > 1) {
                this.errors.default.add(
                    `${lastLeftPinnedCols.length} columns have isLastLeftPinned()=true, expected at most 1.`
                );
            }
            if (lastLeftPinnedCols.length === 1 && lastLeftPinnedCols[0] !== leftCols[leftCols.length - 1]) {
                this.errors.default.add(
                    `isLastLeftPinned() column "${lastLeftPinnedCols[0].getColId()}" is not the last column in leftCols.`
                );
            }
        }

        // isFirstRightPinned: at most one column, must be the boundary adjacent to the centre body.
        // In LTR that's `rightCols[0]`; in RTL the right section is visually mirrored so the boundary
        // is `rightCols[length - 1]`. (See `VisibleColsService.setFirstRightAndLastLeftPinned`.)
        if (rightCols.length > 0) {
            const firstRightPinnedCols = rightCols.filter((c) => c.isFirstRightPinned());
            if (firstRightPinnedCols.length > 1) {
                this.errors.default.add(
                    `${firstRightPinnedCols.length} columns have isFirstRightPinned()=true, expected at most 1.`
                );
            }
            const expectedBoundary = isRtl ? rightCols[rightCols.length - 1] : rightCols[0];
            if (firstRightPinnedCols.length === 1 && firstRightPinnedCols[0] !== expectedBoundary) {
                this.errors.default.add(
                    `isFirstRightPinned() column "${firstRightPinnedCols[0].getColId()}" is not the ${isRtl ? 'last' : 'first'} column in rightCols.`
                );
            }
        }
    }

    // ── Row group / pivot / value column list consistency ───────────────────

    private validateFunctionColumns(gridColumns: GridColumns): void {
        const { api } = gridColumns;
        const isModuleRegistered = api.isModuleRegistered as (name: string) => boolean;

        // Use colId-based comparison since service columns may be from colDefCols
        // while displayed columns are from the working cols collection (different instances).

        // Row group columns: api list ↔ isRowGroupActive()
        if (isModuleRegistered('SharedRowGrouping')) {
            const rowGroupColIds = new Set(api.getRowGroupColumns().map((c: Column) => c.getColId()));
            for (const col of gridColumns.allDisplayedCols) {
                const active = col.isRowGroupActive();
                const inList = rowGroupColIds.has(col.getColId());
                if (active && !inList) {
                    this.errors.get(col).add('isRowGroupActive() is true but column is not in getRowGroupColumns().');
                }
                if (!active && inList) {
                    this.errors.get(col).add('isRowGroupActive() is false but column IS in getRowGroupColumns().');
                }
            }
        }

        // Pivot columns: api list ↔ isPivotActive()
        if (isModuleRegistered('SharedPivot')) {
            const pivotColIds = new Set(api.getPivotColumns().map((c: Column) => c.getColId()));
            for (const col of gridColumns.allDisplayedCols) {
                const active = col.isPivotActive();
                const inList = pivotColIds.has(col.getColId());
                if (active && !inList) {
                    this.errors.get(col).add('isPivotActive() is true but column is not in getPivotColumns().');
                }
                if (!active && inList) {
                    this.errors.get(col).add('isPivotActive() is false but column IS in getPivotColumns().');
                }
            }
        }

        // Value columns: api list → isValueActive() (one-direction only)
        // Note: isValueActive() can be true from colDef.aggFunc without the column being in getValueColumns(),
        // so we only validate that columns IN the list must have isValueActive()=true.
        if (isModuleRegistered('SharedPivot')) {
            const valueColIds = new Set(api.getValueColumns().map((c: Column) => c.getColId()));
            for (const col of gridColumns.allDisplayedCols) {
                const inList = valueColIds.has(col.getColId());
                if (!col.isValueActive() && inList) {
                    this.errors.get(col).add('isValueActive() is false but column IS in getValueColumns().');
                }
            }
        }
    }

    // ── Column state snapshot consistency ───────────────────────────────────

    private validateColumnState(gridColumns: GridColumns): void {
        const { api } = gridColumns;
        const stateArr = api.getColumnState?.();
        if (!stateArr) {
            return;
        }

        const stateMap = new Map<string, any>();
        for (const s of stateArr) {
            stateMap.set(s.colId, s);
        }

        for (const col of gridColumns.allDisplayedCols) {
            const colId = col.getColId();
            const isSpecialColumn =
                colId.startsWith('ag-Grid-SelectionColumn') || colId.startsWith('ag-Grid-RowNumbersColumn');

            const state = stateMap.get(colId);
            if (!state) {
                // Special columns (selection, row numbers) are not included in getColumnState() — that's expected.
                // Auto-group columns ARE included. Regular columns must be present.
                if (!isSpecialColumn) {
                    this.errors.get(col).add(`Column "${colId}" is displayed but not found in getColumnState().`);
                }
                continue;
            }

            const colErrors = this.errors.get(col);

            // hide: state.hide should match !isVisible()
            const stateHide = state.hide ?? false;
            if (stateHide !== !col.isVisible()) {
                colErrors.add(`getColumnState().hide is ${stateHide} but isVisible() is ${col.isVisible()}.`);
            }

            // width: state.width should match getActualWidth()
            if (state.width != null && state.width !== col.getActualWidth()) {
                colErrors.add(
                    `getColumnState().width is ${state.width} but getActualWidth() is ${col.getActualWidth()}.`
                );
            }

            // pinned: state.pinned should match getPinned()
            const statePinned = state.pinned ?? null;
            const colPinned = col.getPinned() || null;
            if (statePinned !== colPinned) {
                colErrors.add(
                    `getColumnState().pinned is "${String(statePinned)}" but getPinned() is "${String(colPinned)}".`
                );
            }

            // sort: state.sort should match getSort()
            const stateSort = state.sort ?? null;
            const colSort = col.getSort() ?? null;
            if (stateSort !== colSort) {
                colErrors.add(`getColumnState().sort is "${String(stateSort)}" but getSort() is "${String(colSort)}".`);
            }

            // sortIndex: state.sortIndex should match getSortIndex()
            const stateSortIndex = state.sortIndex ?? null;
            const colSortIndex = col.getSortIndex() ?? null;
            if (stateSortIndex !== colSortIndex) {
                colErrors.add(
                    `getColumnState().sortIndex is ${String(stateSortIndex)} but getSortIndex() is ${String(colSortIndex)}.`
                );
            }

            // rowGroup: state.rowGroup should match isRowGroupActive()
            const stateRowGroup = state.rowGroup ?? false;
            if (stateRowGroup !== col.isRowGroupActive()) {
                colErrors.add(
                    `getColumnState().rowGroup is ${stateRowGroup} but isRowGroupActive() is ${col.isRowGroupActive()}.`
                );
            }

            // pivot: state.pivot should match isPivotActive()
            const statePivot = state.pivot ?? false;
            if (statePivot !== col.isPivotActive()) {
                colErrors.add(`getColumnState().pivot is ${statePivot} but isPivotActive() is ${col.isPivotActive()}.`);
            }

            // flex: state.flex should match getFlex()
            const stateFlex = state.flex ?? null;
            const colFlex = col.getFlex() ?? null;
            if (stateFlex !== colFlex) {
                colErrors.add(`getColumnState().flex is ${String(stateFlex)} but getFlex() is ${String(colFlex)}.`);
            }
        }
    }
}

/** Value columns get pushed into displayed cols unconditionally when the grid is in pivot mode
 *  but isn't yet showing pivot results (see `partitionVisibleCols` in `visibleColsService.ts`).
 *  Visibility-based invariants need to whitelist this scenario. */
function isValueColShownInPivotMode(col: Column, pivotMode: boolean): boolean {
    return pivotMode && col.isValueActive();
}
