import { RowNode } from 'ag-grid-community';
import type { AgColumn, IRowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';
import type { GridRowsErrors } from '../gridRowsErrors';

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

interface ValidationState {
    gridRows: GridRows;
    csrm: boolean;
    ssrm: boolean;
    pivotMode: boolean;
    groupHideOpenParents: boolean;
    groupHideParentOfSingleChild: string | boolean;
    groupAllowUnbalanced: boolean;
    showRowGroupColumns: AgColumn[];
}

export class GridRowsValidator {
    public validatedRows = new Set<IRowNode>();
    #allLeafsMap = new Map<IRowNode, RowAllLeafs>();

    public constructor(public readonly errors: GridRowsErrors) {}

    public validate(gridRows: GridRows): this {
        const api = gridRows.api;
        const rowModelType = api.getGridOption('rowModelType');
        const csrm = rowModelType === 'clientSide';
        const ssrm = rowModelType === 'serverSide';

        const state: ValidationState = {
            gridRows,
            csrm,
            ssrm,
            pivotMode: !!api.getGridOption('pivotMode'),
            groupHideOpenParents: !!api.getGridOption('groupHideOpenParents'),
            groupHideParentOfSingleChild: api.getGridOption('groupHideParentOfSingleChild') ?? false,
            groupAllowUnbalanced: !!api.getGridOption('groupAllowUnbalanced'),
            showRowGroupColumns: this.collectShowRowGroupColumns(api),
        };

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
        if (gridRows.options.checkSelectedNodes ?? true) {
            this.validateSelectedRows(gridRows);
        }
        return this;
    }

    private validateRootNode({ csrm, gridRows }: ValidationState, root: RowNode): void {
        const rowErrors = this.errors.get(root);
        rowErrors.expectValueEqual('id', root.id, csrm ? 'ROOT_NODE_ID' : undefined);
        rowErrors.expectValueEqual('level', root.level, -1);
        rowErrors.expectValueEqual('expanded', root.expanded, undefined);
        if (root.key) {
            rowErrors.add('Root node has key ' + root.key);
        }
        if (root.destroyed) {
            rowErrors.add('Root node is destroyed');
        }
        if (root.rowIndex !== null) {
            rowErrors.add('Root node has rowIndex ' + root.rowIndex);
        }
        if (csrm) {
            if (!Array.isArray(root.allLeafChildren)) {
                rowErrors.add('Root node has no allLeafChildren');
            }
        }
        if (gridRows.isRowDisplayed(root)) {
            rowErrors.add('Root node is displayed');
        }
        if (gridRows.treeData) {
            rowErrors.expectValueEqual('group', root.group, true);
        }
    }

    private validateRowNodes(state: ValidationState): void {
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
            if (foundIndex !== index) {
                rowErrors.add(`rowNodes[${index}] is a duplicate of rowNodes[${foundIndex}]`);
            }
            if (row.footer) {
                rowErrors.add(`rowNodes[${index}] is a footer node`);
            }
            if (row.detail) {
                rowErrors.add(`rowNodes[${index}] is a detail node`);
            }
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
                if (row.footer) {
                    rowErrors.add(`root.allLeafChildren[${index}] is a footer node`);
                }
                if (row.detail) {
                    rowErrors.add(`root.allLeafChildren[${index}] is a detail node`);
                }
                this.validateRow(state, row);
            }
        }
    }

    private validateDisplayedRows(state: ValidationState): void {
        const { csrm, gridRows } = state;
        const displayedRows = gridRows.displayedRows;
        for (let index = 0; index < displayedRows.length; ++index) {
            const row = displayedRows[index];
            if (!(row instanceof RowNode)) {
                this.errors.default.add(`displayedRows[${index}] is not a RowNode`);
                continue;
            }
            const rowErrors = this.errors.get(row);

            if (!row.detail && !row.footer && !gridRows.isInRowNodes(row)) {
                rowErrors.add(`displayedRows[${index}] is not in rowNodes`);
            }

            rowErrors.expectValueEqual('rowIndex', row.rowIndex, index);

            const uiLevel = row.uiLevel;
            if (csrm || !row.detail || uiLevel !== undefined) {
                rowErrors.expectValueEqual('uiLevel', uiLevel, this.computeUiLevel(state, row));
            }

            this.validateRow(state, row);
        }
    }

    private validateRow(state: ValidationState, row: RowNode): void {
        const { csrm, gridRows } = state;
        if (this.validatedRows.has(row)) {
            return;
        }
        this.validatedRows.add(row);

        const rowErrors = this.errors.get(row);

        if (row.destroyed) {
            rowErrors.add('Row ' + rowIdAndIndexToString(row) + ' is destroyed');
        }

        if (gridRows.isInRowNodes(row)) {
            if (row.rowIndex !== null && !gridRows.isRowDisplayed(row)) {
                rowErrors.add(`Not displayed row has rowIndex=${row.rowIndex}`);
            }
        }

        if (
            row.parent &&
            row.parent !== gridRows.rootRowNode &&
            !gridRows.isInRowNodes(row.parent) &&
            !gridRows.isDuplicateIdRow(row)
        ) {
            rowErrors.add(`Parent ${rowIdAndIndexToString(row.parent)} is not in rowNodes`);
        }

        if (row === gridRows.rootRowNode) {
            rowErrors.expectValueEqual('childIndex', row.childIndex, undefined);
        }

        if (row.footer && (typeof row.id !== 'string' || !row.id?.startsWith('rowGroupFooter_'))) {
            rowErrors.add(
                'Footer node must have an id starting with "rowGroupFooter_" but got ' + JSON.stringify(row.id)
            );
        }

        this.validateSibling(row);

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
            rowErrors.expectValueEqual(
                'group',
                row.group,
                // seems that group is undefined for detail rows
                row.detail && (csrm || row.detail) ? undefined : !!row.childrenAfterGroup?.length
            );
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
            const detailGridInfo = row.detailGridInfo;
            if (!detailGridInfo) {
                rowErrors.add('detail row is missing detailGridInfo');
            }
        }

        const detailGrid = gridRows.getDetailGridRows(row);
        if (detailGrid) {
            this.validate(detailGrid);
        }
    }
    private collectShowRowGroupColumns(api: GridRows['api']): AgColumn[] {
        const columns = api.getColumns() ?? [];
        const displayedColumns = api.getAllDisplayedColumns?.() ?? [];
        const displayedSet = new Set(displayedColumns as AgColumn[]);
        const showRowGroupColumns: AgColumn[] = [];
        for (let i = 0; i < columns.length; ++i) {
            const column = columns[i] as AgColumn;
            if (!displayedSet.has(column)) {
                continue;
            }
            const showRowGroup = column.getColDef().showRowGroup;
            if (showRowGroup === undefined || showRowGroup === null || showRowGroup === false) {
                continue;
            }
            showRowGroupColumns.push(column);
        }
        return showRowGroupColumns;
    }

    private validateSibling(row: RowNode<any>) {
        const sibling = row.sibling;
        if (!sibling) {
            return;
        }
        if (sibling === row) {
            this.errors.get(row).add('Row references itself as a sibling');
        }
        if (sibling.sibling !== row) {
            this.errors.get(row).add('Sibling does not reference back to the original row');
        }
        if (sibling.key !== row.key) {
            this.errors.get(row).add('Sibling key is different');
        }
        if (sibling.parent !== row.parent) {
            this.errors.get(row).add('Sibling parent is different');
        }
        if (sibling.level !== row.level) {
            this.errors.get(row).add('Sibling level is different');
        }
        if (sibling.detail) {
            this.errors.get(row).add('Sibling is a detail row');
        }
        if (row.footer === sibling.footer) {
            this.errors.get(row).add('Sibling footer state should be opposite');
        }
        if (row.footer && (!row.id || !row.id.startsWith('rowGroupFooter_'))) {
            this.errors.get(row).add('Footer row must have id starting with "rowGroupFooter_"');
        }
        if (sibling.footer && (!sibling.id || !sibling.id.startsWith('rowGroupFooter_'))) {
            this.errors.get(row).add('Sibling footer row must have id starting with "rowGroupFooter_"');
        }
        if (sibling.groupData !== row.groupData) {
            this.errors.get(row).add('Sibling groupData is different');
        }
        if (sibling.childrenAfterGroup !== row.childrenAfterGroup) {
            this.errors.get(row).add('Sibling childrenAfterGroup is different');
        }
        if (sibling.childrenAfterFilter !== row.childrenAfterFilter) {
            this.errors.get(row).add('Sibling childrenAfterFilter is different');
        }
        if (sibling.childrenAfterAggFilter !== row.childrenAfterAggFilter) {
            this.errors.get(row).add('Sibling childrenAfterAggFilter is different');
        }
        if (sibling.childrenAfterSort !== row.childrenAfterSort) {
            this.errors.get(row).add('Sibling childrenAfterSort is different');
        }
        if (sibling.allLeafChildren !== row.allLeafChildren) {
            this.errors.get(row).add('Sibling allLeafChildren is different');
        }
    }

    private validateChildren(
        state: ValidationState,
        parentRow: RowNode,
        name: RowChildrenField,
        superset: (ReadonlySet<IRowNode> & { readonly name?: string }) | null
    ): Set<IRowNode> & { name: string } {
        const { gridRows } = state;
        const set = new Set<IRowNode>();
        (set as any).name = name;
        let children = parentRow[name];
        if (children && !Array.isArray(children)) {
            this.errors.get(parentRow).add(`${name} is not an array`);
            children = [];
        }

        if (!children) {
            if (gridRows.treeData) {
                if (!gridRows.isDuplicateIdRow(parentRow) && name !== 'allLeafChildren') {
                    if (!parentRow.detail) {
                        this.errors.get(parentRow).add(`${name} is missing`);
                    }
                }
            } else if (parentRow.group && (name === 'childrenAfterGroup' || name === 'allLeafChildren')) {
                this.errors.get(parentRow).add(`${name} is missing`);
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
            if (!parentRow.footer && !child.detail && child.parent !== parentRow && name !== 'allLeafChildren') {
                parentErrors.add(`${name}[${index}] parent is ${rowIdAndIndexToString(child.parent)}`);
            }
            if (superset && !superset.has(child)) {
                parentErrors.add(`${name}[${index}] ${rowIdAndIndexToString(child)} is not in ${superset.name}`);
            }
            if (!gridRows.isInRowNodes(child) && !gridRows.isRowDisplayed(child)) {
                if (gridRows.getById(child.id) === child) {
                    parentErrors.add(`${name}[${index}] ${rowIdAndIndexToString(child)} is not in rowNodes`);
                }
            }
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
        if (duplicatesCount > 0) {
            parentErrors.add(`${name} has ${duplicatesCount} duplicates.`);
        }

        return set as any;
    }

    private validateSelectedRows(gridRows: GridRows): void {
        const selectedRows = gridRows.api.getSelectedNodes();
        const selectedRowsSet = new Set();
        let duplicates = 0;
        for (const row of selectedRows) {
            const rowErrors = this.errors.get(row);
            if (!gridRows.isInRowNodes(row) && !gridRows.isRowDisplayed(row)) {
                rowErrors.add('Selected node does not exist');
            }
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
            if (selected && !row.selectable) {
                rowErrors.add('Non-selectable node is selected');
            }
            if (selected !== selectedRowsSet.has(row)) {
                rowErrors.add(
                    selectedRowsSet.has(row)
                        ? 'Selected node is not in getSelectedNodes()'
                        : 'Unselected node is in getSelectedNodes()'
                );
            }
        }
    }

    private computeUiLevel(state: ValidationState, row: RowNode): number {
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

    private computeSsrmUiLevel(state: ValidationState, row: RowNode): number {
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

    private countUnbalancedAncestors(state: ValidationState, row: RowNode): number {
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
                this.errors.get(row).add('Found self in allChildren');
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

        if (allChildrenSet.has(row)) {
            this.errors.get(row).add('Found self building allChildren');
        }
        if (duplicates > 0) {
            this.errors.get(row).add('Found ' + duplicates + ' duplicates building allChildren');
        }

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

        if (allLeafChildrenSet.has(row)) {
            this.errors.get(row).add('Found self building allLeafChildren');
        }
        if (allLeafChildrenDuplicates > 0) {
            this.errors.get(row).add('Found ' + allLeafChildrenDuplicates + ' duplicates building allLeafChildren');
        }

        const allLeafChildren = new Set(Array.isArray(row.allLeafChildren) ? row.allLeafChildren : []);
        for (const child of allLeafChildren) {
            if (!allLeafChildrenSet.has(child)) {
                this.errors.get(row).add('Missing ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
            }
        }
        for (const child of allLeafChildrenSet) {
            if (!allLeafChildren.has(child)) {
                this.errors.get(row).add('Extra ' + rowIdAndIndexToString(child) + ' in allLeafChildren');
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
                this.errors.get(row).add('Invalid child in childrenAfterGroup');
                return;
            }
            if (processed.has(node)) {
                this.errors.get(row).add('Circular reference in childrenAfterGroup ' + node.id);
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

        if (allLeafChildrenSet.size !== allLeafsSet.size) {
            this.errors.get(row).add(
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
        }

        for (const child of allLeafChildrenSet) {
            if (!allLeafsSet.has(child)) {
                this.errors.get(row).add('allLeafChildren does not match childrenAfterGroup');
                break;
            }
        }

        for (const child of allLeafsSet) {
            if (!allLeafChildrenSet.has(child)) {
                this.errors.get(row).add('allLeafChildren does not match childrenAfterGroup');
                break;
            }
        }

        if (row.level >= 0 && row.allLeafChildren?.length === 0) {
            this.errors.get(row).add('allLeafChildren should not be zero, should be null');
        }
    }

    private validateLeafGroup(state: ValidationState, row: RowNode): void {
        if (!state.csrm) {
            return;
        }

        const rowErrors = this.errors.get(row);

        // Leaf groups should have aggregation data in pivot mode
        if (state.pivotMode && row.aggData === undefined) {
            rowErrors.add('Leaf group in pivot mode should have aggregation data');
        }

        // Validate allLeafChildren for leaf groups in all grouping modes except tree data
        const allLeafChildren = row.allLeafChildren;
        if (!allLeafChildren?.length) {
            rowErrors.add('Leaf group should have allLeafChildren representing the data it aggregates');
        } else {
            for (const child of allLeafChildren) {
                if (child.group) {
                    rowErrors.add('allLeafChildren contains a group node: ' + rowIdAndIndexToString(child));
                }
                if (child === row) {
                    rowErrors.add('allLeafChildren contains the group node itself');
                }
            }
        }
    }

    private validatePivotLeafRow({ gridRows }: ValidationState, row: RowNode): void {
        // In pivot mode, leaf rows should typically not be displayed directly
        // They should be aggregated into group rows
        if (gridRows.isRowDisplayed(row)) {
            // This might be valid in some pivot configurations, so just a warning-level check
            // Only flag as error if we have strong indicators this shouldn't happen
            const hasGroupingOrPivoting =
                gridRows.api.getRowGroupColumns().length > 0 || gridRows.api.getPivotColumns().length > 0;
            if (hasGroupingOrPivoting && row.level === 0) {
                const rowErrors = this.errors.get(row);
                rowErrors.add('Leaf data row displayed in pivot mode with active grouping/pivoting');
            }
        }
    }
}
