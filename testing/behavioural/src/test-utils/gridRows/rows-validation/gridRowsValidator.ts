import { RowNode } from 'ag-grid-community';
import type { IRowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';
import type { GridRowErrors } from './gridRowErrors';
import type { GridRowsErrors } from './gridRowsErrors';
import { GridRowsValidationState } from './gridRowsValidationState';

type RowChildrenField =
    | 'childrenAfterGroup'
    | 'childrenAfterFilter'
    | 'childrenAfterAggFilter'
    | 'childrenAfterSort'
    | 'allLeafChildren';

interface RowAllLeafs {
    row: RowNode;
    leafs: RowNode[];
    count: number | null;
    allLeafChildren: Set<RowNode>;
}

export class GridRowsValidator {
    public validatedRows = new Set<IRowNode>();
    #allLeafsMap = new Map<IRowNode, RowAllLeafs>();

    public constructor(public readonly errors: GridRowsErrors) {}

    public validate(gridRows: GridRows): this {
        const state = new GridRowsValidationState(gridRows);

        if (gridRows.rootRowNodes.length > 1) {
            this.errors.default.add(
                'Found ' +
                    (gridRows.rootRowNodes.length - 1) +
                    ' more root nodes: ' +
                    gridRows.rootRowNodes
                        .slice(1)
                        .map((n) => rowIdAndIndexToString(n))
                        .join(', ')
            );
        }
        if (gridRows.rootRowNode) {
            this.validateRootNode(state, gridRows.rootRowNode);
            this.validateRow(state, gridRows.rootRowNode);
        }
        this.validateRowNodes(state);
        this.validateDisplayedRows(state);
        this.validatePinnedRows(state);
        this.validateSelectedRows(state);
        this.validateDisplayedRowCounts(state);
        return this;
    }

    private validateRootNode({ csrm, gridRows }: GridRowsValidationState, root: RowNode): void {
        const rowErrors = this.errors.get(root);
        rowErrors.expectValueEqual('id', root.id, csrm ? 'ROOT_NODE_ID' : undefined);
        rowErrors.expectValueEqual('level', root.level, -1);
        rowErrors.expectValueEqual('expanded', root.expanded, undefined);
        rowErrors.add(!!root.key && 'Root node has key ' + root.key);
        rowErrors.add(root.destroyed && 'Root node is destroyed');
        rowErrors.add(root.rowIndex !== null && 'Root node has rowIndex ' + root.rowIndex);
        rowErrors.add(csrm && !Array.isArray(root.allLeafChildren) && 'Root node has no allLeafChildren');
        rowErrors.add(gridRows.isRowDisplayed(root) && 'Root node is displayed');
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
        const { csrm, gridRows } = state;
        const displayedRows = gridRows.displayedRows;
        for (let index = 0; index < displayedRows.length; ++index) {
            const row = displayedRows[index];
            if (!(row instanceof RowNode)) {
                this.errors.default.add(`displayedRows[${index}] is not a RowNode`);
                continue;
            }
            const rowErrors = this.errors.get(row);

            rowErrors.add(
                !row.detail &&
                    !row.footer &&
                    !gridRows.isInRowNodes(row) &&
                    `displayedRows[${index}] is not in rowNodes`
            );

            rowErrors.expectValueEqual('rowIndex', row.rowIndex, index);

            const uiLevel = row.uiLevel;
            if (csrm || !row.detail || uiLevel !== undefined) {
                rowErrors.expectValueEqual('uiLevel', uiLevel, this.computeUiLevel(state, row));
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

        if (gridRows.isInRowNodes(row) && row.rowIndex !== null) {
            rowErrors.add(!gridRows.isRowDisplayed(row) && `Not displayed row has rowIndex=${row.rowIndex}`);
        }

        rowErrors.add(
            !!parent &&
                parent !== gridRows.rootRowNode &&
                !gridRows.isInRowNodes(parent) &&
                !gridRows.isDuplicateIdRow(row) &&
                `Parent ${rowIdAndIndexToString(parent)} is not in rowNodes`
        );

        if (row === gridRows.rootRowNode) {
            rowErrors.expectValueEqual('childIndex', row.childIndex, undefined);
        }

        // displayed property should be consistent with rowIndex
        rowErrors.add(
            (row.rowIndex !== null) !== row.displayed &&
                `displayed=${row.displayed} is inconsistent with rowIndex=${row.rowIndex}`
        );

        // Level consistency: row.level should equal parent.level + 1
        if (level >= 0 && parent && parent.level >= -1) {
            rowErrors.expectValueEqual('level', level, parent.level + 1);
        }

        // Group and detail are mutually exclusive
        rowErrors.add(!!row.group && !!row.detail && 'Row is both group and detail');

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
            this.verifyLeafs(gridRows, row);
            if (row.allChildrenCount !== undefined) {
                this.validateAllChildrenCount(state, rowErrors, row);
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
            this.verifyAllLeafChildrenWithChildrenAfterGroup(gridRows, row);
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

    private validateChildren(
        state: GridRowsValidationState,
        parentRow: RowNode,
        name: RowChildrenField,
        superset: (ReadonlySet<IRowNode> & { readonly name?: string }) | null
    ): Set<IRowNode> & { name: string } {
        const { gridRows } = state;
        const set = new Set<IRowNode>();
        (set as any).name = name;
        let children = parentRow[name];
        if (children && !Array.isArray(children)) {
            this.errors.add(parentRow, `${name} is not an array`);
            children = [];
        }

        if (!children) {
            if (gridRows.treeData) {
                if (!gridRows.isDuplicateIdRow(parentRow) && name !== 'allLeafChildren') {
                    if (!parentRow.detail) {
                        this.errors.add(parentRow, `${name} is missing`);
                    }
                }
            } else if (parentRow.group && (name === 'childrenAfterGroup' || name === 'allLeafChildren')) {
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
                    !superset.has(child) &&
                    `${name}[${index}] ${rowIdAndIndexToString(child)} is not in ${superset?.name}`
            );
            parentErrors.add(
                !gridRows.isInRowNodes(child) &&
                    !gridRows.isRowDisplayed(child) &&
                    gridRows.getById(child.id) === child &&
                    `${name}[${index}] ${rowIdAndIndexToString(child)} is not in rowNodes`
            );
            if (name === 'childrenAfterSort') {
                const childErrors = this.errors.get(child);
                childErrors.expectValueEqual('childIndex', child.childIndex, child.footer ? undefined : index);
                childErrors.expectValueEqual('firstChild', child.firstChild, index === 0);
                if (duplicatesCount === 0) {
                    childErrors.expectValueEqual('lastChild', child.lastChild, index === children.length - 1);
                }
            }
            this.validateRow(state, child);
        }
        parentErrors.add(duplicatesCount > 0 && `${name} has ${duplicatesCount} duplicates.`);

        return set as any;
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
            const rowErrors = this.errors.get(row);
            const selected = !!row.isSelected();
            rowErrors.add(selected && !row.selectable && 'Non-selectable node is selected');
            const selectedRowSetHasRow = selectedRowsSet.has(row);
            if (selected === selectedRowSetHasRow) {
                continue;
            }
            // Group rows are not part of the selection state when `groupSelects: 'descendants'` or `groupSelects: 'filteredDescendants'`
            // So we ignore the case where we have a missing group row in this case.
            if (!selectedRowSetHasRow && row.group && state.groupSelectsDescendants) {
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

    private computeUiLevel(state: GridRowsValidationState, row: RowNode): number {
        if (state.ssrm) {
            return this.computeSsrmUiLevel(state, row);
        }

        let level = -1;
        let parent = row.parent;
        while (parent) {
            if (parent.footer) {
                ++level;
            }

            // Check if this parent should be counted based on grouping options
            let shouldCountParent = true;

            if (!parent.master) {
                if (state.groupHideOpenParents && parent.expanded) {
                    shouldCountParent = false;
                } else if (
                    state.groupHideParentOfSingleChild &&
                    parent.group &&
                    parent.childrenAfterGroup?.length === 1
                ) {
                    if (
                        state.groupHideParentOfSingleChild === true ||
                        (state.groupHideParentOfSingleChild === 'leafGroupsOnly' && parent.leafGroup)
                    ) {
                        shouldCountParent = false;
                    }
                }
            }

            parent = parent.parent;
            if (shouldCountParent) {
                ++level;
            }
        }
        if (row.footer) {
            ++level;
        } else if (row.detail) {
            --level;
        }
        if (level <= 0) {
            return 0;
        }
        return level;
    }

    private computeSsrmUiLevel(state: GridRowsValidationState, row: RowNode): number {
        if (row.level == null || row.level < 0) {
            return 0;
        }

        if (row.detail && row.parent) {
            return this.computeSsrmUiLevel(state, row.parent);
        }

        let expected = row.level + (row.footer ? 1 : 0);
        expected -= this.countUnbalancedAncestors(state, row);

        if (expected < 0) {
            expected = 0;
        }

        return expected;
    }

    private countUnbalancedAncestors(state: GridRowsValidationState, row: RowNode): number {
        if (!state.groupAllowUnbalanced) {
            return 0;
        }

        let count = 0;
        let current: RowNode | null | undefined = row;
        const visited = new Set<RowNode>();

        while (current && current.parent) {
            current = current.parent;
            if (!current || visited.has(current)) {
                break;
            }
            visited.add(current);

            if (current.level == null || current.level < 0) {
                break;
            }

            if (current.footer) {
                continue;
            }

            if (current.group && current.key === '') {
                ++count;
            }
        }

        return count;
    }

    private verifyLeafs(gridRows: GridRows, row: RowNode): RowAllLeafs {
        let result = this.#allLeafsMap.get(row);
        if (result !== undefined) {
            return result;
        }

        let count = 0;
        let duplicates = 0;
        const allChildrenSet = new Set<RowNode>();
        const allLeafChildrenSet = new Set<RowNode>();

        const array = Array.isArray(row.childrenAfterAggFilter) ? row.childrenAfterAggFilter : [];
        const length = array.length;
        const treeData = gridRows.treeData;
        for (let i = 0; i < length; ++i) {
            const child = array[i];
            if (!(child instanceof RowNode)) {
                continue;
            }
            if (child === row) {
                this.errors.add(row, 'Found self in allChildren');
                continue;
            }
            const childAllChildren = this.verifyLeafs(gridRows, array[i]);
            for (const leaf of childAllChildren.leafs) {
                if (allChildrenSet.has(leaf)) {
                    ++duplicates;
                } else {
                    allChildrenSet.add(leaf);
                }
            }

            if (treeData || !child.group) {
                ++count;
            }

            count += childAllChildren.count ?? 0;
        }

        this.errors.add(row, allChildrenSet.has(row) && 'Found self building allChildren');
        this.errors.add(row, duplicates > 0 && 'Found ' + duplicates + ' duplicates building allChildren');

        let allLeafChildrenDuplicates = 0;
        for (const child of Array.isArray(row.allLeafChildren) ? row.allLeafChildren : []) {
            if (!(child instanceof RowNode)) {
                continue;
            }
            if (allLeafChildrenSet.has(child)) {
                ++allLeafChildrenDuplicates;
            } else {
                allLeafChildrenSet.add(child);
            }
        }

        this.errors.add(row, allLeafChildrenSet.has(row) && 'Found self building allLeafChildren');
        this.errors.add(
            row,
            allLeafChildrenDuplicates > 0 &&
                'Found ' + allLeafChildrenDuplicates + ' duplicates building allLeafChildren'
        );

        const allLeafChildren = new Set(Array.isArray(row.allLeafChildren) ? row.allLeafChildren : []);
        for (const child of allLeafChildren) {
            if (!allLeafChildrenSet.has(child)) {
                this.errors.add(row, 'Missing ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
            }
        }
        for (const child of allLeafChildrenSet) {
            if (!allLeafChildren.has(child)) {
                this.errors.add(row, 'Extra ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
            }
        }

        result = {
            row,
            leafs: Array.from(allChildrenSet),
            count: count === 0 && row.level >= 0 ? null : count,
            allLeafChildren: allChildrenSet,
        };
        this.#allLeafsMap.set(row, result);
        return result;
    }

    private verifyAllLeafChildrenWithChildrenAfterGroup(gridRows: GridRows<any>, row: RowNode<any>) {
        const allLeafsSet = new Set<RowNode>();
        const processed = new Set<RowNode>();

        const traverse = (node: RowNode<any>) => {
            if (!(node instanceof RowNode)) {
                this.errors.add(row, 'Invalid child in childrenAfterGroup');
                return;
            }
            if (processed.has(node)) {
                this.errors.add(row, 'Circular reference in childrenAfterGroup ' + node.id);
                return;
            }
            processed.add(node);
            if (node.data) {
                allLeafsSet.add(node); // Not a group, not a filler node
            }
            const nodeChildren = node.childrenAfterGroup;
            if (nodeChildren) {
                for (const child of nodeChildren) {
                    traverse(child);
                }
            }
        };

        const childrenAfterGroup = row.childrenAfterGroup;
        if (childrenAfterGroup) {
            for (const child of childrenAfterGroup) {
                traverse(child);
            }
        }

        const allLeafChildren = row.allLeafChildren;
        const allLeafChildrenSet = new Set(allLeafChildren);

        this.errors.add(
            row,
            allLeafChildrenSet.size !== allLeafsSet.size &&
                'allLeafChildren does not match. ' +
                    allLeafChildrenSet.size +
                    '!==' +
                    allLeafsSet.size +
                    ' : [' +
                    Array.from(allLeafChildrenSet)
                        .map((n) => n.id)
                        .join(', ') +
                    '] !== [' +
                    Array.from(allLeafsSet)
                        .map((n) => n.id)
                        .join(', ') +
                    ']'
        );

        for (const child of allLeafChildrenSet) {
            if (!allLeafsSet.has(child)) {
                this.errors.add(row, 'allLeafChildren does not match childrenAfterGroup');
                break;
            }
        }

        for (const child of allLeafsSet) {
            if (!allLeafChildrenSet.has(child)) {
                this.errors.add(row, 'allLeafChildren does not match childrenAfterGroup');
                break;
            }
        }

        this.errors.add(
            row,
            row.level >= 0 && allLeafChildren?.length === 0 && 'allLeafChildren should not be zero, should be null'
        );
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

    /**
     * Validates `allChildrenCount` by recomputing the expected value from `childrenAfterAggFilter`,
     * mirroring the enterprise FilterAggregatesStage logic:
     * - Grid grouping: counts only leaf descendants (groups are not counted, only their leaf children).
     * - Tree data: counts all descendants (groups + leaves) recursively; null when no children at level >= 0.
     */
    private validateAllChildrenCount(state: GridRowsValidationState, rowErrors: GridRowErrors, row: RowNode): void {
        const expected = this.computeExpectedAllChildrenCount(state, row);
        rowErrors.add(
            row.allChildrenCount !== expected &&
                `allChildrenCount=${row.allChildrenCount} but expected ${expected} (computed from childrenAfterAggFilter)`
        );
    }

    private computeExpectedAllChildrenCount(state: GridRowsValidationState, row: RowNode): number | null {
        if (!row.hasChildren()) {
            return null;
        }
        if (state.gridRows.treeData) {
            return this.computeExpectedAllChildrenCountTreeData(row);
        }
        return this.computeExpectedAllChildrenCountGridGrouping(row);
    }

    /** Tree data: count all descendants (groups + leaves) from childrenAfterAggFilter recursively. */
    private computeExpectedAllChildrenCountTreeData(row: RowNode): number | null {
        const childrenAfterAggFilter = row.childrenAfterAggFilter;
        if (!childrenAfterAggFilter) {
            return row.level >= 0 ? null : 0;
        }
        let count = childrenAfterAggFilter.length;
        for (const child of childrenAfterAggFilter) {
            count += child.allChildrenCount ?? 0;
        }
        // Historical behaviour: null for non-root rows with no children, 0 for root
        return count === 0 && row.level >= 0 ? null : count;
    }

    /** Grid grouping: count only leaf descendants from childrenAfterAggFilter recursively. */
    private computeExpectedAllChildrenCountGridGrouping(row: RowNode): number | null {
        const childrenAfterAggFilter = row.childrenAfterAggFilter;
        if (!childrenAfterAggFilter) {
            return null;
        }
        let count = 0;
        for (const child of childrenAfterAggFilter) {
            if (child.group) {
                count += child.allChildrenCount as number;
            } else {
                count++;
            }
        }
        return count;
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
}
