import { RowNode } from '@ag-grid-community/core';
import type { IRowNode } from '@ag-grid-community/core';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';

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
    public readonly errors = this.gridRows.errors;
    public validatedRows = new Set<IRowNode>();
    #allLeafsMap = new Map<IRowNode, RowAllLeafs>();

    public constructor(public readonly gridRows: GridRows) {}

    public validate(): this {
        if (this.gridRows.rootRowNodes.length > 1) {
            this.errors.default.add(
                'Found ' +
                    (this.gridRows.rootRowNodes.length - 1) +
                    ' more root nodes: ' +
                    this.gridRows.rootRowNodes
                        .slice(1)
                        .map((n) => rowIdAndIndexToString(n))
                        .join(', ')
            );
        }
        if (this.gridRows.rootRowNode) {
            this.validateRootNode(this.gridRows.rootRowNode);
            this.validateRow(this.gridRows.rootRowNode);
        }
        this.validateRowNodes();
        this.validateDisplayedRows();
        if (this.gridRows.options.checkSelectedNodes ?? true) {
            this.validateSelectedRows();
        }

        return this;
    }

    private validateRootNode(root: RowNode): void {
        const rowErrors = this.errors.get(root);
        rowErrors.expectValueEqual('id', root.id, 'ROOT_NODE_ID');
        rowErrors.expectValueEqual('level', root.level, -1);
        rowErrors.expectValueEqual('expanded', root.expanded, undefined);
        if (root.key) rowErrors.add('Root node has key ' + root.key);
        if (root.rowIndex !== null) rowErrors.add('Root node has rowIndex ' + root.rowIndex);
        if (!Array.isArray(root.allLeafChildren)) rowErrors.add('Root node has no allLeafChildren');
        if (this.gridRows.isRowDisplayed(root)) rowErrors.add('Root node is displayed');
        if (this.gridRows.treeData) rowErrors.expectValueEqual('group', root.group, true);
    }

    private validateRowNodes(): void {
        const rowNodes = this.gridRows.rowNodes;
        for (let index = 0; index < rowNodes.length; ++index) {
            const row = rowNodes[index];
            if (!(row instanceof RowNode)) {
                this.errors.default.add(`rowNodes[${index}] is not a RowNode`);
                continue;
            }
            const rowErrors = this.errors.get(row);
            const foundIndex = this.gridRows.getIndexInRowNodes(row);
            if (foundIndex !== index) rowErrors.add(`rowNodes[${index}] is a duplicate of rowNodes[${foundIndex}]`);
            if (row.footer) rowErrors.add(`rowNodes[${index}] is a footer node`);
            if (row.detail) rowErrors.add(`rowNodes[${index}] is a detail node`);
            this.validateRow(row);
        }

        const rootAllLeafChildren = this.gridRows.rootAllLeafChildren;
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
            if (row.footer) rowErrors.add(`root.allLeafChildren[${index}] is a footer node`);
            if (row.detail) rowErrors.add(`root.allLeafChildren[${index}] is a detail node`);
            this.validateRow(row);
        }
    }

    private validateDisplayedRows() {
        const displayedRows = this.gridRows.displayedRows;
        for (let index = 0; index < displayedRows.length; ++index) {
            const row = displayedRows[index];
            if (!(row instanceof RowNode)) {
                this.errors.default.add(`displayedRows[${index}] is not a RowNode`);
                continue;
            }
            const rowErrors = this.errors.get(row);

            if (!row.detail && !row.footer && !this.gridRows.isInRowNodes(row)) {
                rowErrors.add(`displayedRows[${index}] is not in rowNodes`);
            }

            rowErrors.expectValueEqual('rowIndex', row.rowIndex, index);

            rowErrors.expectValueEqual('uiLevel', row.uiLevel, this.computeUiLevel(row));

            this.validateRow(row);
        }
    }

    private validateRow(row: RowNode): void {
        if (this.validatedRows.has(row)) {
            return;
        }
        this.validatedRows.add(row);

        const rowErrors = this.errors.get(row);

        if (this.gridRows.isInRowNodes(row)) {
            if (row.rowIndex !== null && !this.gridRows.isRowDisplayed(row)) {
                rowErrors.add(`Not displayed row has rowIndex=${row.rowIndex}`);
            }
        }

        if (
            row.parent &&
            row.parent !== this.gridRows.rootRowNode &&
            !this.gridRows.isInRowNodes(row.parent) &&
            !this.gridRows.isDuplicateIdRow(row)
        ) {
            rowErrors.add(`Parent ${rowIdAndIndexToString(row.parent)} is not in rowNodes`);
        }

        if (row === this.gridRows.rootRowNode) {
            rowErrors.expectValueEqual('childIndex', row.childIndex, undefined);
        }

        if (row.footer && (typeof row.id !== 'string' || !row.id?.startsWith('rowGroupFooter_'))) {
            rowErrors.add(
                'Footer node must have an id starting with "rowGroupFooter_" but got ' + JSON.stringify(row.id)
            );
        }

        const childrenAfterGroupSet = this.validateChildren(row, 'childrenAfterGroup', null);
        const childrenAfterFilterSet = this.validateChildren(row, 'childrenAfterFilter', childrenAfterGroupSet);
        const childrenAfterAggFilterSet = this.validateChildren(row, 'childrenAfterAggFilter', childrenAfterFilterSet);
        this.validateChildren(row, 'childrenAfterSort', childrenAfterAggFilterSet);
        this.validateChildren(row, 'allLeafChildren', null);

        if (row.level >= 0) {
            rowErrors.expectValueEqual('group', row.group, !!row.childrenAfterGroup?.length);
        }

        this.verifyLeafs(row);
    }

    private validateChildren(
        parentRow: RowNode,
        name: RowChildrenField,
        superset: (ReadonlySet<IRowNode> & { readonly name?: string }) | null
    ): Set<IRowNode> & { name: string } {
        const set = new Set<IRowNode>();
        (set as any).name = name;
        let children = parentRow[name];
        if (children && !Array.isArray(children)) {
            this.errors.get(parentRow).add(`${name} is not an array`);
            children = [];
        }

        if (!children) {
            if (this.gridRows.treeData) {
                if (!this.gridRows.isDuplicateIdRow(parentRow)) {
                    this.errors.get(parentRow).add(`${name} is missing`);
                }
            } else if (parentRow.group && (name === 'childrenAfterGroup' || name === 'allLeafChildren')) {
                this.errors.get(parentRow).add(`${name} is missing`);
            }
        }
        children ??= [];
        const parentErrors = this.errors.get(parentRow);
        let duplicates = 0;
        for (let index = 0; index < children.length; ++index) {
            const child = children[index];
            if (!(child instanceof RowNode)) {
                parentErrors.add(`${name}[${index}] is not a RowNode`);
                continue;
            }
            if (set.has(child)) {
                ++duplicates;
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
            if (!this.gridRows.isInRowNodes(child) && !this.gridRows.isRowDisplayed(child)) {
                if (this.gridRows.getById(child.id) === child) {
                    parentErrors.add(`${name}[${index}] ${rowIdAndIndexToString(child)} is not in rowNodes`);
                }
            }
            if (name === 'childrenAfterSort') {
                const childErrors = this.errors.get(child);
                childErrors.expectValueEqual('childIndex', child.childIndex, child.footer ? undefined : index);
                childErrors.expectValueEqual('firstChild', child.firstChild, index === 0);
                if (duplicates === 0) {
                    childErrors.expectValueEqual('lastChild', child.lastChild, index === children.length - 1);
                }
            }
            this.validateRow(child);
        }
        if (duplicates > 0) {
            parentErrors.add(`${name} has ${duplicates} duplicates.`);
        }
        return set as any;
    }

    private validateSelectedRows() {
        const selectedRows = this.gridRows.api.getSelectedNodes();
        const selectedRowsSet = new Set();
        let duplicates = 0;
        for (const row of selectedRows) {
            const rowErrors = this.errors.get(row);
            if (!this.gridRows.isInRowNodes(row) && !this.gridRows.isRowDisplayed(row)) {
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

    private computeUiLevel(row: RowNode): number {
        let level = -1;
        let parent = row.parent;
        while (parent) {
            if (parent.footer) {
                ++level;
            }
            parent = parent.parent;
            ++level;
        }
        if (row.footer) {
            ++level;
        }
        if (level <= 0) {
            return 0;
        }
        return level;
    }

    private verifyLeafs(row: RowNode): RowAllLeafs {
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
        const treeData = this.gridRows.treeData;
        for (let i = 0; i < length; ++i) {
            const child = array[i];
            if (!(child instanceof RowNode)) {
                continue;
            }
            if (child === row) {
                this.errors.get(row).add('Found self in allChildren');
                continue;
            }
            const childAllChildren = this.verifyLeafs(array[i]);
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
            this.errors.get(row).add('Found ' + duplicates + ' building allChildren');
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
            this.errors.get(row).add('Found ' + allLeafChildrenDuplicates + ' building allLeafChildren');
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
}
