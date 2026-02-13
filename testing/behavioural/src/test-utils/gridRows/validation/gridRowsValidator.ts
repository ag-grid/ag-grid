import { RowNode } from 'ag-grid-community';
import type { IRowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';
import type { GridRowErrors, GridRowsErrors } from '../gridRowsErrors';
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
        return this;
    }

    private validateRootNode({ csrm, gridRows }: GridRowsValidationState, root: RowNode): void {
        const rowErrors = this.errors.get(root);
        rowErrors.expectValueEqual('id', root.id, csrm ? 'ROOT_NODE_ID' : undefined);
        rowErrors.expectValueEqual('level', root.level, -1);
        rowErrors.expectValueEqual('expanded', root.expanded, undefined);
        rowErrors.add('Root node has key ' + root.key, !!root.key);
        rowErrors.add('Root node is destroyed', root.destroyed);
        rowErrors.add('Root node has rowIndex ' + root.rowIndex, root.rowIndex !== null);
        rowErrors.add('Root node has no allLeafChildren', csrm && !Array.isArray(root.allLeafChildren));
        rowErrors.add('Root node is displayed', gridRows.isRowDisplayed(root));
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
            rowErrors.add(`rowNodes[${index}] is a duplicate of rowNodes[${foundIndex}]`, foundIndex !== index);
            rowErrors.add(`rowNodes[${index}] is a footer node`, !!row.footer);
            rowErrors.add(`rowNodes[${index}] is a detail node`, !!row.detail);
            rowErrors.add(`rowNodes[${index}] is pinned (${row.rowPinned})`, !!row.rowPinned);
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
                rowErrors.add(`root.allLeafChildren[${index}] is a footer node`, !!row.footer);
                rowErrors.add(`root.allLeafChildren[${index}] is a detail node`, !!row.detail);
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
                `displayedRows[${index}] is not in rowNodes`,
                !row.detail && !row.footer && !gridRows.isInRowNodes(row)
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

        rowErrors.add('Row ' + rowIdAndIndexToString(row) + ' is destroyed', row.destroyed);

        if (gridRows.isInRowNodes(row) && row.rowIndex !== null) {
            rowErrors.add(`Not displayed row has rowIndex=${row.rowIndex}`, !gridRows.isRowDisplayed(row));
        }

        rowErrors.add(
            `Parent ${rowIdAndIndexToString(row.parent)} is not in rowNodes`,
            !!row.parent &&
                row.parent !== gridRows.rootRowNode &&
                !gridRows.isInRowNodes(row.parent) &&
                !gridRows.isDuplicateIdRow(row)
        );

        if (row === gridRows.rootRowNode) {
            rowErrors.expectValueEqual('childIndex', row.childIndex, undefined);
        }

        // displayed property should be consistent with rowIndex
        rowErrors.add(
            `displayed=${row.displayed} is inconsistent with rowIndex=${row.rowIndex}`,
            (row.rowIndex !== null) !== row.displayed
        );

        // Level consistency: row.level should equal parent.level + 1
        if (row.level >= 0 && row.parent && row.parent.level >= -1) {
            rowErrors.expectValueEqual('level', row.level, row.parent.level + 1);
        }

        // Group and detail are mutually exclusive
        rowErrors.add('Row is both group and detail', !!row.group && !!row.detail);

        // Master/detail bidirectional consistency
        if (row.master && row.detailNode) {
            rowErrors.add('Master row detailNode is not a detail row', !row.detailNode.detail);
            rowErrors.add(
                'Master row detailNode.parent is ' + rowIdAndIndexToString(row.detailNode.parent ?? undefined),
                row.detailNode.parent !== row
            );
        }
        rowErrors.add('Detail row parent is not a master row', !!row.detail && !!row.parent && !row.parent.master);

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
            'Footer node must have an id starting with "rowGroupFooter_" but got ' + JSON.stringify(row.id),
            !!row.footer && (typeof row.id !== 'string' || !row.id?.startsWith('rowGroupFooter_'))
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

        if (row.level >= 0 && state.csrm) {
            rowErrors.expectValueEqual('group', row.group, row.detail ? undefined : !!row.childrenAfterGroup?.length);
        }

        if (csrm && !row.footer && row.level >= 0 && row.group && row.sourceRowIndex < 0) {
            const apiNode = state.gridRows.api.getRowNode(row.id!);
            if (apiNode !== row) {
                rowErrors.add(
                    `api.getRowNode(${JSON.stringify(row.id)}) should return this group row, but got ${rowIdAndIndexToString(apiNode ?? undefined)}`
                );
            }
            this.verifyLeafs(gridRows, row);
        }

        if (row.level >= 0 && csrm) {
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
            rowErrors.add('detail row is missing detailGridInfo', !row.detailGridInfo);
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
        rowErrors.add('Row references itself as a sibling', sibling === row);
        rowErrors.add('Sibling does not reference back to the original row', sibling.sibling !== row);
        rowErrors.add('Sibling key is different', sibling.key !== row.key);
        rowErrors.add('Sibling parent is different', sibling.parent !== row.parent);
        rowErrors.add('Sibling level is different', sibling.level !== row.level);
        rowErrors.add('Sibling is a detail row', !!sibling.detail);
        rowErrors.add('Sibling footer state should be opposite', !!row.footer === !!sibling.footer);
        rowErrors.add(
            'Footer row must have id starting with "rowGroupFooter_"',
            !!row.footer && (!row.id || !row.id.startsWith('rowGroupFooter_'))
        );
        rowErrors.add(
            'Sibling footer row must have id starting with "rowGroupFooter_"',
            !!sibling.footer && (!sibling.id || !sibling.id.startsWith('rowGroupFooter_'))
        );
        rowErrors.add('Sibling groupData is different', sibling.groupData !== row.groupData);
        rowErrors.add('Sibling childrenAfterGroup is different', sibling.childrenAfterGroup !== row.childrenAfterGroup);
        rowErrors.add(
            'Sibling childrenAfterFilter is different',
            sibling.childrenAfterFilter !== row.childrenAfterFilter
        );
        rowErrors.add(
            'Sibling childrenAfterAggFilter is different',
            sibling.childrenAfterAggFilter !== row.childrenAfterAggFilter
        );
        rowErrors.add('Sibling childrenAfterSort is different', sibling.childrenAfterSort !== row.childrenAfterSort);
        rowErrors.add('Sibling allLeafChildren is different', sibling.allLeafChildren !== row.allLeafChildren);
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
            this.errors.addRowError(parentRow, `${name} is not an array`);
            children = [];
        }

        if (!children) {
            if (gridRows.treeData) {
                if (!gridRows.isDuplicateIdRow(parentRow) && name !== 'allLeafChildren') {
                    if (!parentRow.detail) {
                        this.errors.addRowError(parentRow, `${name} is missing`);
                    }
                }
            } else if (parentRow.group && (name === 'childrenAfterGroup' || name === 'allLeafChildren')) {
                this.errors.addRowError(parentRow, `${name} is missing`);
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
                `${name}[${index}] parent is ${rowIdAndIndexToString(child.parent)}`,
                !parentRow.footer && !child.detail && child.parent !== parentRow && name !== 'allLeafChildren'
            );
            parentErrors.add(
                `${name}[${index}] ${rowIdAndIndexToString(child)} is not in ${superset?.name}`,
                !!superset && !superset.has(child)
            );
            parentErrors.add(
                `${name}[${index}] ${rowIdAndIndexToString(child)} is not in rowNodes`,
                !gridRows.isInRowNodes(child) && !gridRows.isRowDisplayed(child) && gridRows.getById(child.id) === child
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
        parentErrors.add(`${name} has ${duplicatesCount} duplicates.`, duplicatesCount > 0);

        return set as any;
    }

    private validatePinnedRows(state: GridRowsValidationState): void {
        const { gridRows } = state;
        const validate = (rows: RowNode[], expectedPinned: 'top' | 'bottom') => {
            for (let i = 0; i < rows.length; ++i) {
                const row = rows[i];
                const rowErrors = this.errors.get(row);
                rowErrors.expectValueEqual('rowPinned', row.rowPinned, expectedPinned);
                rowErrors.add(`Pinned ${expectedPinned} row is destroyed`, row.destroyed);
            }
        };
        validate(gridRows.pinnedTopRows, 'top');
        validate(gridRows.pinnedBottomRows, 'bottom');
    }

    private validateSelectedRows(state: GridRowsValidationState): void {
        const gridRows = state.gridRows;
        const selectedRows = gridRows.api.getSelectedNodes();
        const selectedRowsSet = new Set();
        let duplicates = 0;
        for (const row of selectedRows) {
            const rowErrors = this.errors.get(row);
            rowErrors.add('Selected node does not exist', !gridRows.isInRowNodes(row) && !gridRows.isRowDisplayed(row));
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
            rowErrors.add('Non-selectable node is selected', selected && !row.selectable);
            const selectedRowSetHasRow = selectedRowsSet.has(row);
            if (selected !== selectedRowSetHasRow) {
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
                if (state.groupHideOpenParents) {
                    const isHiddenOpenParent = parent.expanded && !parent.master;
                    if (isHiddenOpenParent) {
                        shouldCountParent = false;
                    }
                }

                if (state.groupHideParentOfSingleChild && parent.group && parent.childrenAfterGroup?.length === 1) {
                    if (state.groupHideParentOfSingleChild === true) {
                        shouldCountParent = false;
                    } else if (state.groupHideParentOfSingleChild === 'leafGroupsOnly' && parent.leafGroup) {
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
                this.errors.addRowError(row, 'Found self in allChildren');
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

        this.errors.addRowError(row, 'Found self building allChildren', allChildrenSet.has(row));
        this.errors.addRowError(row, 'Found ' + duplicates + ' duplicates building allChildren', duplicates > 0);

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

        this.errors.addRowError(row, 'Found self building allLeafChildren', allLeafChildrenSet.has(row));
        this.errors.addRowError(
            row,
            'Found ' + allLeafChildrenDuplicates + ' duplicates building allLeafChildren',
            allLeafChildrenDuplicates > 0
        );

        const allLeafChildren = new Set(Array.isArray(row.allLeafChildren) ? row.allLeafChildren : []);
        for (const child of allLeafChildren) {
            if (!allLeafChildrenSet.has(child)) {
                this.errors.addRowError(row, 'Missing ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
            }
        }
        for (const child of allLeafChildrenSet) {
            if (!allLeafChildren.has(child)) {
                this.errors.addRowError(row, 'Extra ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
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
                this.errors.addRowError(row, 'Invalid child in childrenAfterGroup');
                return;
            }
            if (processed.has(node)) {
                this.errors.addRowError(row, 'Circular reference in childrenAfterGroup ' + node.id);
                return;
            }
            processed.add(node);
            if (node.data) {
                allLeafsSet.add(node); // Not a group, not a filler node
            }
            if (node.childrenAfterGroup) {
                for (const child of node.childrenAfterGroup) {
                    traverse(child);
                }
            }
        };

        if (row.childrenAfterGroup) {
            for (const child of row.childrenAfterGroup) {
                traverse(child);
            }
        }

        const allLeafChildrenSet = new Set(row.allLeafChildren);

        this.errors.addRowError(
            row,
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
                ']',
            allLeafChildrenSet.size !== allLeafsSet.size
        );

        for (const child of allLeafChildrenSet) {
            if (!allLeafsSet.has(child)) {
                this.errors.addRowError(row, 'allLeafChildren does not match childrenAfterGroup');
                break;
            }
        }

        for (const child of allLeafsSet) {
            if (!allLeafChildrenSet.has(child)) {
                this.errors.addRowError(row, 'allLeafChildren does not match childrenAfterGroup');
                break;
            }
        }

        this.errors.addRowError(
            row,
            'allLeafChildren should not be zero, should be null',
            row.level >= 0 && row.allLeafChildren?.length === 0
        );
    }

    private validateLeafGroup(state: GridRowsValidationState, row: RowNode): void {
        if (!state.csrm) {
            return;
        }

        const rowErrors = this.errors.get(row);

        rowErrors.add(
            'Leaf group in pivot mode should have aggregation data',
            state.pivotMode && row.aggData === undefined
        );

        // Validate allLeafChildren for leaf groups in all grouping modes except tree data
        const allLeafChildren = row.allLeafChildren;
        if (!allLeafChildren?.length) {
            rowErrors.add('Leaf group should have allLeafChildren representing the data it aggregates');
        } else {
            for (const child of allLeafChildren) {
                rowErrors.add('allLeafChildren contains a group node: ' + rowIdAndIndexToString(child), !!child.group);
                rowErrors.add('allLeafChildren contains the group node itself', child === row);
            }
        }
    }

    private validatePivotLeafRow({ gridRows }: GridRowsValidationState, row: RowNode): void {
        this.errors.addRowError(
            row,
            'Leaf data row displayed in pivot mode with active grouping/pivoting',
            gridRows.isRowDisplayed(row) &&
                (gridRows.api.getRowGroupColumns().length > 0 || gridRows.api.getPivotColumns().length > 0) &&
                row.level === 0
        );
    }
}
