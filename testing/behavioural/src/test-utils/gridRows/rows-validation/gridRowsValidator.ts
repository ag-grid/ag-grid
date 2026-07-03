import { RowNode } from 'ag-grid-community';
import type { AgColumn, IRowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';
import type { GridRowErrors } from './gridRowErrors';
import type { GridRowsErrors } from './gridRowsErrors';
import { GridRowsValidationState } from './gridRowsValidationState';
import { computeUiLevel, validateAllChildrenCount } from './validator-computed';
import type { RowAllLeafs } from './validator-leafs';
import { verifyAllLeafChildrenWithChildrenAfterGroup, verifyLeafs } from './validator-leafs';

type RowChildrenField =
    | 'childrenAfterGroup'
    | 'childrenAfterFilter'
    | 'childrenAfterAggFilter'
    | 'childrenAfterSort'
    | 'allLeafChildren';

interface NamedRowSet {
    readonly name: RowChildrenField;
    readonly set: ReadonlySet<IRowNode>;
}

export class GridRowsValidator {
    public validatedRows = new Set<IRowNode>();
    #allLeafsMap = new Map<RowNode, RowAllLeafs>();

    public constructor(public readonly errors: GridRowsErrors) {}

    public validate(gridRows: GridRows): void {
        const state = new GridRowsValidationState(gridRows);

        if (gridRows.rootRowNode) {
            this.validateRootNode(state, gridRows.rootRowNode);
        }
        this.validateRowNodes(state);
        this.validateDisplayedRows(state);
        this.validatePinnedRows(state);
        this.validateSelectedRows(state);
        this.validateDisplayedRowCounts(state);
        this.validateNoAggDataWithoutGrouping(state);
        this.validateApiGetDisplayedRowAtIndex(state);
        this.validatePinnedRowCounts(state);
        this.validateFooterIds(state);
        this.validateGroupExpansion(state);
        this.validateGroupData(state);
        this.validateStubRows(state);
        this.validateMasterDetailReferences(state);
    }

    /** Children of an expanded group must follow the group in displayedRows. Skipped when grouping
     *  options that change parent/child visibility relationships are active. */
    private validateGroupExpansion(state: GridRowsValidationState): void {
        const { csrm, gridRows, groupHideOpenParents, groupHideParentOfSingleChild } = state;
        if (!csrm || gridRows.treeData || groupHideOpenParents || groupHideParentOfSingleChild || state.pivotMode) {
            return;
        }
        for (const row of gridRows.displayedRows) {
            if (!row.group || row.footer) {
                continue;
            }
            const childrenAfterSort = row.childrenAfterSort;
            if (!childrenAfterSort || childrenAfterSort.length === 0) {
                continue;
            }
            const firstChild = childrenAfterSort[0];
            const expanded = !!row.expanded;
            const firstChildDisplayed = gridRows.isRowDisplayed(firstChild);
            // A child can be deliberately hidden by the grid (e.g. a formulas/calculated-column
            // aggregation that flattens leaves into group rows) — `row.displayed===false` is the
            // grid's authoritative signal that it's not meant to appear, so don't flag it.
            if (expanded && !firstChildDisplayed && firstChild.displayed !== false) {
                this.errors
                    .get(row)
                    .add(
                        `Group is expanded but first child ${rowIdAndIndexToString(firstChild)} is not in displayedRows.`
                    );
            } else if (!expanded) {
                // When collapsed, NO descendant should appear in displayedRows.
                for (let i = 0, len = childrenAfterSort.length; i < len; ++i) {
                    const child = childrenAfterSort[i];
                    if (gridRows.isRowDisplayed(child)) {
                        this.errors
                            .get(row)
                            .add(`Group is collapsed but child ${rowIdAndIndexToString(child)} is in displayedRows.`);
                        break;
                    }
                }
            }
        }
    }

    /** A group row's `groupData` must have an entry keyed by the auto-group / show-row-group
     *  columns it represents — otherwise the group cell renderer can't read its display value. */
    private validateGroupData(state: GridRowsValidationState): void {
        if (!state.csrm || state.pivotMode) {
            return;
        }
        const showRowGroupColumns = state.showRowGroupColumns;
        if (showRowGroupColumns.length === 0) {
            return;
        }
        for (const row of this.validatedRows) {
            const node = row as RowNode;
            if (!node.group || node.footer || node.level < 0) {
                continue;
            }
            const groupData = node.groupData;
            if (groupData == null) {
                // Some rows (root group, intermediate paddings) may legitimately have no groupData.
                continue;
            }
            // The group row must have ≥1 groupData entry — multipleColumns mode uses per-level cols.
            const keys = Object.keys(groupData);
            if (keys.length === 0) {
                this.errors
                    .get(node)
                    .add(
                        `Group row has groupData={} but ${showRowGroupColumns.length} show-row-group columns are active.`
                    );
            }
        }
    }

    /** Stub rows are loading-placeholders; they must have no data. In SSRM a stub may legitimately
     *  be marked as a group (the group node exists before its children load), but in that case no
     *  children should be present yet. In other row models a stub must never be a group. */
    private validateStubRows({ gridRows }: GridRowsValidationState): void {
        const isSsrm = gridRows.api.getGridOption?.('rowModelType') === 'serverSide';
        for (const row of gridRows.rowNodes) {
            if (!row.stub) {
                continue;
            }
            const rowErrors = this.errors.get(row);
            if (row.data != null) {
                rowErrors.add('Stub row has data — stubs should be placeholders with no payload.');
            }
            if (row.group) {
                if (!isSsrm) {
                    rowErrors.add('Stub row should not be marked as group.');
                } else if (row.childrenAfterGroup?.length) {
                    rowErrors.add(
                        `SSRM stub group row has ${row.childrenAfterGroup.length} loaded children — stubs should be pending.`
                    );
                }
            }
        }
    }

    /** Detail rows must reference their master via `parent.master === true`. When a master is
     *  expanded and the detail row is displayed, the detail row sits immediately after the master. */
    private validateMasterDetailReferences({ gridRows }: GridRowsValidationState): void {
        for (const row of this.validatedRows) {
            const node = row as RowNode;
            if (node.master) {
                const detailNode = node.detailNode;
                if (node.expanded && detailNode && gridRows.isRowDisplayed(detailNode)) {
                    const masterIdx = node.rowIndex;
                    const detailIdx = detailNode.rowIndex;
                    if (masterIdx != null && detailIdx != null && detailIdx !== masterIdx + 1) {
                        this.errors
                            .get(node)
                            .add(
                                `Master at index ${masterIdx} is expanded but its detail row is at index ${detailIdx} (expected ${masterIdx + 1}).`
                            );
                    }
                }
            }
            if (node.detail && node.parent && !node.parent.master) {
                this.errors
                    .get(node)
                    .add(`Detail row's parent ${rowIdAndIndexToString(node.parent)} has master=false.`);
            }
        }
    }

    /** `api.getDisplayedRowAtIndex(i)` must return `displayedRows[i]` for every displayed row. */
    private validateApiGetDisplayedRowAtIndex({ gridRows }: GridRowsValidationState): void {
        const api = gridRows.api;
        if (typeof api.getDisplayedRowAtIndex !== 'function') {
            return;
        }
        const displayedRows = gridRows.displayedRows;
        for (let i = 0, len = displayedRows.length; i < len; ++i) {
            const expected = displayedRows[i];
            const actual = api.getDisplayedRowAtIndex(i);
            if (actual !== expected) {
                this.errors.add(
                    expected,
                    `api.getDisplayedRowAtIndex(${i}) returned ${rowIdAndIndexToString(actual ?? undefined)} but displayedRows[${i}] is ${rowIdAndIndexToString(expected)}`
                );
            }
        }
    }

    /** `api.getPinnedTopRowCount()` / `getPinnedBottomRowCount()` must match pinned arrays.
     *  Only checked when the PinnedRowModule is registered — otherwise the calls log a module-missing warning. */
    private validatePinnedRowCounts({ gridRows }: GridRowsValidationState): void {
        const api = gridRows.api;
        if (!(api.isModuleRegistered as (name: string) => boolean)('PinnedRowModule')) {
            return;
        }
        const topCount = api.getPinnedTopRowCount?.();
        if (topCount !== undefined && topCount !== gridRows.pinnedTopRows.length) {
            this.errors.default.add(
                `getPinnedTopRowCount()=${topCount} but ${gridRows.pinnedTopRows.length} pinned top rows were collected`
            );
        }
        const bottomCount = api.getPinnedBottomRowCount?.();
        if (bottomCount !== undefined && bottomCount !== gridRows.pinnedBottomRows.length) {
            this.errors.default.add(
                `getPinnedBottomRowCount()=${bottomCount} but ${gridRows.pinnedBottomRows.length} pinned bottom rows were collected`
            );
        }
    }

    /** Footer rows must have ids of the form `rowGroupFooter_${parentId}` where parent is the group they footer. */
    private validateFooterIds(_state: GridRowsValidationState): void {
        for (const row of this.validatedRows) {
            if (!row.footer || typeof row.id !== 'string' || !row.id.startsWith('rowGroupFooter_')) {
                continue;
            }
            const sibling = row.sibling;
            if (!sibling || sibling.footer) {
                continue;
            }
            // The non-footer sibling represents the group; its id should be the suffix after `rowGroupFooter_`.
            const expectedSuffix = sibling.id;
            if (expectedSuffix !== undefined && row.id !== `rowGroupFooter_${expectedSuffix}`) {
                this.errors.add(
                    row,
                    `Footer id "${row.id}" does not match sibling id "rowGroupFooter_${expectedSuffix}"`
                );
            }
        }
    }

    private validateRootNode({ csrm, gridRows, pivotMode }: GridRowsValidationState, root: RowNode): void {
        const rowErrors = this.errors.get(root);
        rowErrors.expectValueEqual('id', root.id, csrm ? 'ROOT_NODE_ID' : undefined);
        rowErrors.expectValueEqual('level', root.level, -1);
        rowErrors.add(!!root.key && 'Root node has key ' + root.key);
        rowErrors.add(root.destroyed && 'Root node is destroyed');
        // In pivot mode without row grouping the root is the grand-totals row at rowIndex 0.
        // Exempt ONLY that exact shape — any other rowIndex on root is still a real bug.
        const pivotNoRowGroup = pivotMode && (gridRows.api.getRowGroupColumns?.()?.length ?? 0) === 0;
        const isPivotGrandTotalsRoot = pivotNoRowGroup && root.rowIndex === 0;
        rowErrors.add(!isPivotGrandTotalsRoot && root.rowIndex !== null && 'Root node has rowIndex ' + root.rowIndex);
        rowErrors.add(csrm && !Array.isArray(root.allLeafChildren) && 'Root node has no allLeafChildren');
        rowErrors.add(!isPivotGrandTotalsRoot && gridRows.isRowDisplayed(root) && 'Root node is displayed');
        rowErrors.expectValueEqual('childIndex', root.childIndex, undefined);
        if (gridRows.treeData) {
            rowErrors.expectValueEqual('group', root.group, true);
        }
    }

    private validateRowNodes(state: GridRowsValidationState): void {
        const { csrm, gridRows } = state;
        const rowNodes = gridRows.rowNodes;
        for (let index = 0; index < rowNodes.length; ++index) {
            const row = rowNodes[index];
            if (!(row instanceof RowNode)) {
                this.errors.default.add(`rowNodes[${index}] is not a RowNode`);
                continue;
            }
            const rowErrors = this.errors.get(row);
            const foundIndex = gridRows.getIndexInRowNodes(row);
            rowErrors.add(foundIndex !== index && `rowNodes[${index}] is a duplicate of rowNodes[${foundIndex}]`);
            rowErrors.add(!!row.footer && `rowNodes[${index}] is a footer node`);
            rowErrors.add(!!row.detail && `rowNodes[${index}] is a detail node`);
            rowErrors.add(!!row.rowPinned && `rowNodes[${index}] is pinned (${row.rowPinned})`);
            this.validateRow(state, row);
        }

        if (csrm) {
            const rootAllLeafChildren = gridRows.rootAllLeafChildren;
            const rootAllLeafChildrenMap = new Map<RowNode, number>();
            for (let index = 0; index < rootAllLeafChildren.length; ++index) {
                const row = rootAllLeafChildren[index];
                if (!(row instanceof RowNode)) {
                    this.errors.default.add(`root.allLeafChildren[${index}] is not a RowNode`);
                    continue;
                }
                const rowErrors = this.errors.get(row);
                const duplicateIndex = rootAllLeafChildrenMap.get(row);
                if (duplicateIndex !== undefined) {
                    rowErrors.add(
                        `root.allLeafChildren[${index}] has duplicate ${rowIdAndIndexToString(row)} with original index ${duplicateIndex}`
                    );
                    continue;
                }
                rootAllLeafChildrenMap.set(row, index);
                rowErrors.expectValueEqual('sourceRowIndex', row.sourceRowIndex, index);
                rowErrors.add(!!row.footer && `root.allLeafChildren[${index}] is a footer node`);
                rowErrors.add(!!row.detail && `root.allLeafChildren[${index}] is a detail node`);
                this.validateRow(state, row);
            }
        }
    }

    private validateDisplayedRows(state: GridRowsValidationState): void {
        const { csrm, gridRows, pivotMode } = state;
        const displayedRows = gridRows.displayedRows;
        // In pivot mode without row grouping the root node is displayed as the grand-totals row
        // even though it isn't part of rowNodes. Allow this exemption.
        const pivotNoRowGroup = pivotMode && (gridRows.api.getRowGroupColumns?.()?.length ?? 0) === 0;
        for (let index = 0; index < displayedRows.length; ++index) {
            const row = displayedRows[index];
            if (!(row instanceof RowNode)) {
                this.errors.default.add(`displayedRows[${index}] is not a RowNode`);
                continue;
            }
            const rowErrors = this.errors.get(row);
            const isPivotRootTotals = pivotNoRowGroup && row === gridRows.rootRowNode;

            const isSsrmFiller = row.stub === true;
            rowErrors.add(
                !row.detail &&
                    !row.footer &&
                    !isPivotRootTotals &&
                    !isSsrmFiller &&
                    !gridRows.isInRowNodes(row) &&
                    `displayedRows[${index}] is not in rowNodes`
            );

            rowErrors.expectValueEqual('rowIndex', row.rowIndex, index);

            const uiLevel = row.uiLevel;
            if (csrm || !row.detail || uiLevel !== undefined) {
                // When groupDisplayType='multipleColumns' in CSRM, enterprise flattenStage always sets
                // uiLevel=0 for all displayed rows. SSRM uses its own uiLevel calculation instead.
                const expectedUiLevel = csrm && state.isGroupMultiAutoColumn ? 0 : computeUiLevel(state, row);
                rowErrors.expectValueEqual('uiLevel', uiLevel, expectedUiLevel);
            }

            this.validateRow(state, row);
        }
    }

    private validateRow(state: GridRowsValidationState, row: RowNode): void {
        const { csrm, gridRows } = state;
        if (this.validatedRows.has(row)) {
            return;
        }
        this.validatedRows.add(row);

        const rowErrors = this.errors.get(row);
        const parent = row.parent;
        const level = row.level;

        rowErrors.add(row.destroyed && 'Row ' + rowIdAndIndexToString(row) + ' is destroyed');

        // SSRM virtualises and pagination keeps off-page rows out of displayedRows even though
        // they retain their absolute rowIndex. Only enforce the rowIndex⇄displayed pairing on CSRM
        // without pagination.
        const isSsrm = gridRows.api.getGridOption?.('rowModelType') === 'serverSide';
        const isPaginated = !!gridRows.api.getGridOption?.('pagination');
        if (gridRows.isInRowNodes(row) && row.rowIndex !== null && !isSsrm && !isPaginated) {
            rowErrors.add(!gridRows.isRowDisplayed(row) && `Not displayed row has rowIndex=${row.rowIndex}`);
        }

        rowErrors.add(
            !!parent &&
                parent !== gridRows.rootRowNode &&
                !gridRows.isInRowNodes(parent) &&
                !gridRows.isDuplicateIdRow(row) &&
                `Parent ${rowIdAndIndexToString(parent)} is not in rowNodes`
        );

        // displayed property should be consistent with rowIndex
        rowErrors.add(
            (row.rowIndex !== null) !== row.displayed &&
                `displayed=${row.displayed} is inconsistent with rowIndex=${row.rowIndex}`
        );

        // Level consistency: row.level should equal parent.level + 1.
        // Skip for rows only reachable via allLeafChildren in a transitional/uninitialized state
        // (i.e. rowData was set but the group stage hasn't run yet, so parent = ROOT but level > 0).
        if (
            level >= 0 &&
            parent &&
            parent.level >= -1 &&
            (gridRows.isInRowNodes(row) || gridRows.isRowDisplayed(row))
        ) {
            rowErrors.expectValueEqual('level', level, parent.level + 1);
        }

        // Group and detail are mutually exclusive
        rowErrors.add(!!row.group && !!row.detail && 'Row is both group and detail');

        // Non-group rows should not have aggData — it must be cleared during group demotion
        rowErrors.add(!row.group && row.aggData != null && 'Non-group row should not have aggData');

        // Master/detail bidirectional consistency
        const detailNode = row.detailNode;
        if (row.master && detailNode) {
            rowErrors.add(!detailNode.detail && 'Master row detailNode is not a detail row');
            rowErrors.add(
                detailNode.parent !== row &&
                    'Master row detailNode.parent is ' + rowIdAndIndexToString(detailNode.parent ?? undefined)
            );
        }
        rowErrors.add(!!row.detail && !!parent && !parent.master && 'Detail row parent is not a master row');

        // Parent chain cycle detection
        {
            const visited = new Set<RowNode>();
            visited.add(row);
            let current: RowNode | null = row.parent;
            while (current) {
                if (visited.has(current)) {
                    rowErrors.add('Circular parent chain at ' + rowIdAndIndexToString(current));
                    break;
                }
                visited.add(current);
                current = current.parent;
            }
        }

        rowErrors.add(
            !!row.footer &&
                (typeof row.id !== 'string' || !row.id?.startsWith('rowGroupFooter_')) &&
                'Footer node must have an id starting with "rowGroupFooter_" but got ' + JSON.stringify(row.id)
        );

        this.validateSibling(rowErrors, row);
        this.validatePinnedSibling(rowErrors, row);

        if (csrm) {
            const childrenAfterGroupSet = this.validateChildren(state, row, 'childrenAfterGroup', null);
            const childrenAfterFilterSet = this.validateChildren(
                state,
                row,
                'childrenAfterFilter',
                childrenAfterGroupSet
            );
            const childrenAfterAggFilterSet = this.validateChildren(
                state,
                row,
                'childrenAfterAggFilter',
                childrenAfterFilterSet
            );
            this.validateChildren(state, row, 'childrenAfterSort', childrenAfterAggFilterSet);
            this.validateChildren(state, row, 'allLeafChildren', null);
        }

        if (level >= 0 && csrm) {
            rowErrors.expectValueEqual('group', row.group, row.detail ? undefined : !!row.childrenAfterGroup?.length);
        }

        if (csrm && !row.footer && level >= 0 && row.group && row.sourceRowIndex < 0) {
            const apiNode = gridRows.api.getRowNode(row.id!);
            if (apiNode !== row) {
                rowErrors.add(
                    `api.getRowNode(${JSON.stringify(row.id)}) should return this group row, but got ${rowIdAndIndexToString(apiNode ?? undefined)}`
                );
            }
            verifyLeafs(this.errors, this.#allLeafsMap, gridRows, row);
            if (row.allChildrenCount != null) {
                validateAllChildrenCount(state, rowErrors, row);
            }
        }

        // For leaf rows, api.getRowNode(id) must return this exact row or another row with the same id.
        // Skip this check for rows that are themselves duplicates (non-canonical instances),
        // or for rows where getRowId is not configured (auto-generated ids).
        if (
            !row.footer &&
            !row.group &&
            !row.detail &&
            !row.stub &&
            level >= 0 &&
            row.id !== undefined &&
            !gridRows.isDuplicateIdRow(row)
        ) {
            const apiNode = gridRows.api.getRowNode(row.id!);
            if (apiNode !== undefined && apiNode !== row && apiNode.id !== row.id) {
                rowErrors.add(
                    `api.getRowNode(${JSON.stringify(row.id)}) should return this leaf row, but got ${rowIdAndIndexToString(apiNode)}`
                );
            }
        }

        if (level >= 0 && csrm) {
            verifyAllLeafChildrenWithChildrenAfterGroup(this.errors, row);
        }

        // Validate leaf groups (using ag-Grid's built-in leafGroup property)
        if (row.leafGroup) {
            this.validateLeafGroup(state, row);
        }

        // Validate that non-group rows in pivot mode have proper structure
        if (state.pivotMode && !row.group && row.level >= 0 && row.data) {
            this.validatePivotLeafRow(state, row);
        }

        if (row.detail && gridRows.isRowDisplayed(row)) {
            rowErrors.add(!row.detailGridInfo && 'detail row is missing detailGridInfo');
        }

        const detailGrid = gridRows.getDetailGridRows(row);
        if (detailGrid) {
            this.validate(detailGrid);
        }
    }

    private validateSibling(rowErrors: GridRowErrors, row: RowNode<any>) {
        const sibling = row.sibling;
        if (!sibling) {
            return;
        }
        rowErrors.add(sibling === row && 'Row references itself as a sibling');
        rowErrors.add(sibling.sibling !== row && 'Sibling does not reference back to the original row');
        rowErrors.add(sibling.key !== row.key && 'Sibling key is different');
        rowErrors.add(sibling.parent !== row.parent && 'Sibling parent is different');
        rowErrors.add(sibling.level !== row.level && 'Sibling level is different');
        rowErrors.add(!!sibling.detail && 'Sibling is a detail row');
        rowErrors.add(!!row.footer === !!sibling.footer && 'Sibling footer state should be opposite');
        rowErrors.add(
            !!row.footer &&
                (!row.id || !row.id.startsWith('rowGroupFooter_')) &&
                'Footer row must have id starting with "rowGroupFooter_"'
        );
        rowErrors.add(
            !!sibling.footer &&
                (!sibling.id || !sibling.id.startsWith('rowGroupFooter_')) &&
                'Sibling footer row must have id starting with "rowGroupFooter_"'
        );
        rowErrors.add(sibling.groupData !== row.groupData && 'Sibling groupData is different');
        rowErrors.add(
            sibling.childrenAfterGroup !== row.childrenAfterGroup && 'Sibling childrenAfterGroup is different'
        );
        rowErrors.add(
            sibling.childrenAfterFilter !== row.childrenAfterFilter && 'Sibling childrenAfterFilter is different'
        );
        rowErrors.add(
            sibling.childrenAfterAggFilter !== row.childrenAfterAggFilter &&
                'Sibling childrenAfterAggFilter is different'
        );
        rowErrors.add(sibling.childrenAfterSort !== row.childrenAfterSort && 'Sibling childrenAfterSort is different');
        rowErrors.add(sibling.allLeafChildren !== row.allLeafChildren && 'Sibling allLeafChildren is different');
    }

    private validatePinnedSibling(rowErrors: GridRowErrors, row: RowNode<any>) {
        const pinnedSibling = row.pinnedSibling;
        if (!pinnedSibling) {
            return;
        }
        rowErrors.add(pinnedSibling === row && 'Row references itself as pinnedSibling');
        rowErrors.add(
            pinnedSibling.pinnedSibling !== row && 'PinnedSibling does not reference back to the original row'
        );
        rowErrors.add(pinnedSibling.group !== row.group && 'PinnedSibling group is different');
        rowErrors.add(pinnedSibling.hasChildren() !== row.hasChildren() && 'PinnedSibling hasChildren() is different');
        rowErrors.add(
            pinnedSibling.allChildrenCount !== row.allChildrenCount && 'PinnedSibling allChildrenCount is different'
        );
    }

    private validateChildren(
        state: GridRowsValidationState,
        parentRow: RowNode,
        name: RowChildrenField,
        superset: NamedRowSet | null
    ): NamedRowSet {
        const { gridRows } = state;
        const set = new Set<IRowNode>();
        let children = parentRow[name];
        if (children && !Array.isArray(children)) {
            this.errors.add(parentRow, `${name} is not an array`);
            children = [];
        }

        if (children) {
            if (name === 'childrenAfterGroup' && children.length === 0 && parentRow.level !== -1) {
                this.errors.add(parentRow, `${name} is an empty array`);
            }
        } else if (parentRow.group && !parentRow.detail && !gridRows.isDuplicateIdRow(parentRow)) {
            const required = gridRows.treeData
                ? name !== 'allLeafChildren'
                : name === 'childrenAfterGroup' || name === 'allLeafChildren';
            if (required) {
                this.errors.add(parentRow, `${name} is missing`);
            }
        }
        children ??= [];
        const parentErrors = this.errors.get(parentRow);
        let duplicatesCount = 0;
        for (let index = 0; index < children.length; ++index) {
            const child = children[index];
            if (!(child instanceof RowNode)) {
                parentErrors.add(`${name}[${index}] is not a RowNode`);
                continue;
            }
            if (set.has(child)) {
                ++duplicatesCount;
                continue;
            }
            if (child === parentRow) {
                parentErrors.add(`${name}[${index}] found self`);
                continue;
            }
            set.add(child);
            parentErrors.add(
                !parentRow.footer &&
                    !child.detail &&
                    child.parent !== parentRow &&
                    name !== 'allLeafChildren' &&
                    `${name}[${index}] parent is ${rowIdAndIndexToString(child.parent)}`
            );
            parentErrors.add(
                !!superset &&
                    !superset.set.has(child) &&
                    `${name}[${index}] ${rowIdAndIndexToString(child)} is not in ${superset.name}`
            );
            parentErrors.add(
                !gridRows.isInRowNodes(child) &&
                    !gridRows.isRowDisplayed(child) &&
                    gridRows.getById(child.id) === child &&
                    `${name}[${index}] ${rowIdAndIndexToString(child)} is not in rowNodes`
            );
            if (name === 'childrenAfterSort') {
                const childErrors = this.errors.get(child);
                if (!state.hasPostSortRows) {
                    // Strict: flags must match the displayed array position.
                    childErrors.expectValueEqual('childIndex', child.childIndex, child.footer ? undefined : index);
                    childErrors.expectValueEqual('firstChild', child.firstChild, index === 0);
                    if (duplicatesCount === 0) {
                        childErrors.expectValueEqual('lastChild', child.lastChild, index === children.length - 1);
                    }
                } else if (typeof child.childIndex === 'number') {
                    // Loose (AG-309): `_updateRowNodeAfterSort` runs BEFORE `postSortRows`
                    childErrors.expectValueEqual('firstChild', child.firstChild, child.childIndex === 0);
                    if (duplicatesCount === 0) {
                        childErrors.expectValueEqual(
                            'lastChild',
                            child.lastChild,
                            child.childIndex === children.length - 1
                        );
                    }
                }
            }
            this.validateRow(state, child);
        }
        parentErrors.add(duplicatesCount > 0 && `${name} has ${duplicatesCount} duplicates.`);

        return { name, set };
    }

    private validatePinnedRows(state: GridRowsValidationState): void {
        const { gridRows } = state;
        const validate = (rows: RowNode[], expectedPinned: 'top' | 'bottom') => {
            for (let i = 0; i < rows.length; ++i) {
                const row = rows[i];
                const rowErrors = this.errors.get(row);
                rowErrors.expectValueEqual('rowPinned', row.rowPinned, expectedPinned);
                rowErrors.add(row.destroyed && `Pinned ${expectedPinned} row is destroyed`);
            }
        };
        validate(gridRows.pinnedTopRows, 'top');
        validate(gridRows.pinnedBottomRows, 'bottom');
    }

    private validateSelectedRows(state: GridRowsValidationState): void {
        const gridRows = state.gridRows;
        if (!gridRows.api.isModuleRegistered('RowSelectionModule')) {
            return;
        }
        const selectedRows = gridRows.api.getSelectedNodes();
        const selectedRowsSet = new Set();
        let duplicates = 0;
        for (const row of selectedRows) {
            const rowErrors = this.errors.get(row);
            rowErrors.add(row.destroyed && 'Destroyed node is in getSelectedNodes()');
            rowErrors.add(
                !gridRows.isInRowNodes(row) && !gridRows.isRowDisplayed(row) && 'Selected node does not exist'
            );
            if (selectedRowsSet.has(row)) {
                ++duplicates;
            } else {
                selectedRowsSet.add(row);
            }
        }
        if (duplicates > 0) {
            this.errors.default.add(
                'Selected nodes has ' +
                    duplicates +
                    ' duplicates: ' +
                    selectedRows
                        .filter((row) => selectedRowsSet.has(row))
                        .map(rowIdAndIndexToString)
                        .join(', ')
            );
        }

        for (const row of this.validatedRows) {
            if (!gridRows.isInRowNodes(row)) {
                continue;
            }
            const rowErrors = this.errors.get(row);
            const selected = !!row.isSelected();
            rowErrors.add(selected && !row.selectable && 'Non-selectable node is selected');
            const selectedRowSetHasRow = selectedRowsSet.has(row);
            if (selected === selectedRowSetHasRow) {
                continue;
            }
            if (!selectedRowSetHasRow && row.group && state.groupSelectsDescendants) {
                continue;
            }
            if (!selectedRowSetHasRow && row.footer && row.sibling?.isSelected() === selected) {
                continue;
            }
            if (row.detail) {
                continue;
            }
            rowErrors.add(
                selectedRowsSet.has(row)
                    ? 'Selected node is not in getSelectedNodes()'
                    : 'Unselected node is in getSelectedNodes()'
            );
        }
    }

    /** Validates getDisplayedRowCount() matches the number of collected displayed rows. */
    private validateDisplayedRowCounts({ gridRows }: GridRowsValidationState): void {
        const displayedRows = gridRows.displayedRows;
        const apiCount = gridRows.api.getDisplayedRowCount?.();
        if (apiCount !== undefined && apiCount !== displayedRows.length) {
            this.errors.default.add(
                `getDisplayedRowCount()=${apiCount} but ${displayedRows.length} displayed rows were collected`
            );
        }
    }

    private validateLeafGroup(state: GridRowsValidationState, row: RowNode): void {
        if (!state.csrm) {
            return;
        }

        const rowErrors = this.errors.get(row);

        rowErrors.add(
            state.pivotMode && row.aggData === undefined && 'Leaf group in pivot mode should have aggregation data'
        );

        // Validate allLeafChildren for leaf groups in all grouping modes except tree data
        const allLeafChildren = row.allLeafChildren;
        if (!allLeafChildren?.length) {
            rowErrors.add('Leaf group should have allLeafChildren representing the data it aggregates');
        } else {
            for (const child of allLeafChildren) {
                rowErrors.add(
                    !!child.group && 'allLeafChildren contains a group node: ' + rowIdAndIndexToString(child)
                );
                rowErrors.add(child === row && 'allLeafChildren contains the group node itself');
            }
        }
    }

    private validatePivotLeafRow({ gridRows }: GridRowsValidationState, row: RowNode): void {
        if (!gridRows.api.isModuleRegistered('RowGroupingModule') && !gridRows.api.isModuleRegistered('PivotModule')) {
            return;
        }
        this.errors.add(
            row,
            gridRows.isRowDisplayed(row) &&
                (gridRows.api.getRowGroupColumns().length > 0 || gridRows.api.getPivotColumns().length > 0) &&
                row.level === 0 &&
                'Leaf data row displayed in pivot mode with active grouping/pivoting'
        );
    }

    /** When grouping/treeData/pivot are not active, no node should have aggData. */
    private validateNoAggDataWithoutGrouping(state: GridRowsValidationState): void {
        if (!state.csrm || state.pivotMode) {
            return;
        }
        const { api, treeData } = state.gridRows;
        if (treeData) {
            return;
        }
        // Check if any grouping is active
        if (api.isModuleRegistered('RowGroupingModule') && api.getRowGroupColumns().length > 0) {
            return;
        }
        if (
            api.getGridOption('getGroupRowAgg') ||
            api.getGridOption('alwaysAggregateAtRootLevel') ||
            api.getGridOption('grandTotalRow')
        ) {
            return;
        }
        // No grouping/treeData/pivot — no leaf node should have aggData (true even with showValuesAs).
        for (const row of state.gridRows.rowNodes) {
            this.errors.add(row, row.aggData != null && 'Row has aggData but grouping/treeData/pivot are not active');
        }
        const hasShowValuesAs = api.getColumns()?.some((col) => (col as AgColumn).showValuesAs != null);
        const root = state.gridRows.rootRowNode;
        if (root && !hasShowValuesAs) {
            this.errors.add(
                root,
                root.aggData != null && 'Root node has aggData but grouping/treeData/pivot are not active'
            );
        }
    }
}
