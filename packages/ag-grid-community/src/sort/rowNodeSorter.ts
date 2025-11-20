import type { DefaultComparatorOptions } from '../agStack/utils/generic';
import { _defaultComparator } from '../agStack/utils/generic';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { SortComparatorFn } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import { _firstLeaf } from '../entities/rowNodeUtils';
import { _isColumnsSortingCoupledToGroup, _isGroupUseEntireRow } from '../gridOptionsUtils';
import type { SortOption } from '../interfaces/iSortOption';

export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}

// this logic is used by both SSRM and CSRM

export class RowNodeSorter extends BeanStub implements NamedBean {
    beanName = 'rowNodeSorter' as const;

    private isAccentedSort: boolean;
    private primaryColumnsSortGroups: boolean;

    public postConstruct(): void {
        const { gos } = this;
        this.isAccentedSort = gos.get('accentedSort');
        this.primaryColumnsSortGroups = _isColumnsSortingCoupledToGroup(gos);

        this.addManagedPropertyListener(
            'accentedSort',
            (propChange) => (this.isAccentedSort = propChange.currentValue)
        );
        this.addManagedPropertyListener(
            'autoGroupColumnDef',
            () => (this.primaryColumnsSortGroups = _isColumnsSortingCoupledToGroup(gos))
        );
    }

    public doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[] {
        const sortedRowNodes = rowNodes.map((rowNode, currentPos) => ({
            currentPos,
            rowNode,
        }));

        sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));

        return sortedRowNodes.map((item) => item.rowNode);
    }

    public compareRowNodes(sortOptions: SortOption[], sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode): number {
        const nodeA: RowNode = sortedNodeA.rowNode;
        const nodeB: RowNode = sortedNodeB.rowNode;

        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; i++) {
            const sortOption = sortOptions[i];
            const isDescending = sortOption.sort === 'desc';

            const valueA = this.getValue(nodeA, sortOption.column as AgColumn);
            const valueB = this.getValue(nodeB, sortOption.column as AgColumn);

            let comparatorResult: number;
            const providedComparator = this.getComparator(sortOption, nodeA);
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isDescending);
            } else {
                //otherwise do our own comparison
                const opts = { accentedCompare: this.isAccentedSort } as DefaultComparatorOptions;
                if (sortOption.type === 'absolute') {
                    opts.transform = _absoluteValueTransformer;
                }
                comparatorResult = _defaultComparator(valueA, valueB, opts);
            }

            // user provided comparators can return 'NaN' if they don't correctly handle 'undefined' values, this
            // typically occurs when the comparator is used on a group row
            const validResult = !isNaN(comparatorResult);

            if (validResult && comparatorResult !== 0) {
                return sortOption.sort === 'asc' ? comparatorResult : comparatorResult * -1;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    }

    /**
     * if user defines a comparator as a function then use that.
     * if user defines a dictionary of comparators, then use the one matching the sort type.
     * if no comparator provided, or no matching comparator found in dictionary, then return undefined.
     *
     * grid checks later if undefined is returned here and falls back to a default comparator corresponding to sort type on the coldef.
     * @private
     */
    private getComparator(sortOption: SortOption, rowNode: RowNode): SortComparatorFn | undefined {
        const colDef = sortOption.column.getColDef();

        // comparator on col get preference over everything else
        const comparatorOnCol = colDef.comparator;
        if (comparatorOnCol != null) {
            if (typeof comparatorOnCol === 'object') {
                return comparatorOnCol[sortOption.type || 'default'];
            }
            return comparatorOnCol;
        }

        if (!colDef.showRowGroup) {
            return;
        }

        // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
        const groupLeafField = !rowNode.group && colDef.field;
        if (!groupLeafField) {
            return;
        }

        const primaryColumn = this.beans.colModel.getColDefCol(groupLeafField);
        if (!primaryColumn) {
            return;
        }
        // comparator on col get preference over everything else
        const comparatorOnPrimaryCol = primaryColumn.getColDef().comparator;
        if (comparatorOnPrimaryCol == null) {
            return;
        }
        if (typeof comparatorOnPrimaryCol === 'object') {
            return comparatorOnPrimaryCol[sortOption.type || 'default'];
        }
        return comparatorOnPrimaryCol;
    }

    private getValue(node: RowNode, column: AgColumn): any {
        if (this.primaryColumnsSortGroups && node.rowGroupColumn === column) {
            return this.getGroupDataValue(node, column);
        }

        if (node.group && column.getColDef().showRowGroup) {
            return undefined;
        }

        const { valueSvc, formula } = this.beans;
        const value = valueSvc.getValue(column, node, false);
        if (formula?.isFormula(value)) {
            return formula.resolveValue(column, node);
        }
        return value;
    }

    private getGroupDataValue(node: RowNode, column: AgColumn): any {
        const { gos, valueSvc, colModel, showRowGroupCols } = this.beans;
        const isGroupRows = _isGroupUseEntireRow(gos, colModel.isPivotActive());
        // because they're group rows, no display cols exist, so groupData never populated.
        // instead delegate to getting value from leaf child.
        if (isGroupRows) {
            const leafChild = node.data ? node : _firstLeaf(node.childrenAfterGroup);
            return leafChild && valueSvc.getValue(column, leafChild, false);
        }

        const displayCol = showRowGroupCols?.getShowRowGroupCol(column.getId());
        if (!displayCol) {
            return undefined;
        }
        return node.groupData?.[displayCol.getId()];
    }
}

function _absoluteValueTransformer(value: any): number | null {
    if (value == null) {
        return null;
    }
    const numberValue = Number(value);
    return isNaN(numberValue) ? value : Math.abs(numberValue);
}
