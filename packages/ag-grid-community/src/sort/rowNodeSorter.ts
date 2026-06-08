import { _defaultComparator } from 'ag-stack';

import { _csrmFirstLeaf } from '../clientSideRowModel/clientSideRowModelUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { _normalizeSortType } from '../entities/agColumn';
import type { ColDef, SortComparatorFn } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import { _isClientSideRowModel, _isColumnsSortingCoupledToGroup, _isGroupUseEntireRow } from '../gridOptionsUtils';
import type { SortOption } from '../interfaces/iSortOption';

// this logic is used by both SSRM and CSRM

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowNodeSorter extends BeanStub implements NamedBean {
    beanName = 'rowNodeSorter' as const;

    private accentedSort: boolean = false;
    private primaryColumnsSortGroups: boolean = false;
    private pivotActive: boolean = false;
    private firstLeaf: (row: RowNode) => RowNode | undefined;

    public postConstruct(): void {
        this.firstLeaf = _isClientSideRowModel(this.gos) ? _csrmFirstLeaf : defaultGetLeaf;

        this.addManagedPropertyListeners(
            ['accentedSort', 'autoGroupColumnDef', 'treeData'],
            this.updateOptions.bind(this)
        );

        const updatePivotModeState = this.updatePivotModeState.bind(this);
        this.addManagedEventListeners({
            columnPivotModeChanged: updatePivotModeState,
            columnPivotChanged: updatePivotModeState,
        });

        this.updateOptions();
        updatePivotModeState();
    }

    private updateOptions(): void {
        this.accentedSort = !!this.gos.get('accentedSort');
        this.primaryColumnsSortGroups = _isColumnsSortingCoupledToGroup(this.gos);
    }

    private updatePivotModeState(): void {
        this.pivotActive = this.beans.colModel.isPivotActive();
    }

    public doFullSortInPlace(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[] {
        // This relies on stable sorting, present since ECMAScript 2019 - all browser within AG Grid's support matrix
        return rowNodes.sort((a, b) => this.compareRowNodes(sortOptions, a, b));
    }

    public compareRowNodes(sortOptions: SortOption[], nodeA: RowNode, nodeB: RowNode): number {
        if (nodeA === nodeB) {
            return 0;
        }

        const accentedCompare = this.accentedSort;

        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; ++i) {
            const sortOption = sortOptions[i];
            const isDescending = sortOption.sort === 'desc';

            const column = sortOption.column as AgColumn;
            let valueA = this.getValue(nodeA, column);
            let valueB = this.getValue(nodeB, column);

            let comparatorResult: number;
            const providedComparator = this.getComparator(sortOption, nodeA);
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isDescending);
            } else {
                //otherwise do our own comparison

                if (sortOption.type === 'absolute') {
                    valueA = absoluteValueTransformer(valueA);
                    valueB = absoluteValueTransformer(valueB);
                }

                comparatorResult = _defaultComparator(valueA, valueB, accentedCompare);
            }

            // user provided comparators can return 'NaN' if they don't correctly handle 'undefined' values, this
            // typically occurs when the comparator is used on a group row
            if (comparatorResult) {
                return sortOption.sort === 'asc' ? comparatorResult : -comparatorResult;
            }
        }

        return 0;
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
        const colDef = (sortOption.column as AgColumn).colDef;

        // comparator on col get preference over everything else
        const comparatorOnCol = this.getComparatorFromColDef(colDef, sortOption);
        if (comparatorOnCol) {
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

        const primaryColumn = this.beans.colModel.getNonPivotCol(groupLeafField);
        if (!primaryColumn) {
            return;
        }
        // comparator on col get preference over everything else
        return this.getComparatorFromColDef(primaryColumn.colDef, sortOption);
    }

    private getComparatorFromColDef(colDef: ColDef, sortOption: SortOption): SortComparatorFn | undefined {
        const comparator = colDef.comparator;
        if (comparator == null) {
            return;
        }
        if (typeof comparator === 'object') {
            return comparator[_normalizeSortType(sortOption.type)];
        }
        return comparator;
    }

    private getValue(node: RowNode, column: AgColumn): any {
        const beans = this.beans;

        if (this.primaryColumnsSortGroups) {
            if (node.rowGroupColumn === column) {
                return this.getGroupDataValue(node, column);
            }

            if (node.group && column.colDef.showRowGroup) {
                return undefined;
            }
        }

        const value = beans.valueSvc.getValue(column, node, 'data');
        if (column.colDef.allowFormula) {
            const formula = beans.formula;
            if (formula?.isFormula(value)) {
                return formula.resolveValue(column, node);
            }
        }
        return value;
    }

    private getGroupDataValue(node: RowNode, column: AgColumn): any {
        // because they're group rows, no display cols exist, so groupData never populated.
        // instead delegate to getting value from leaf child.
        // Formulas are currently not supported on row-group columns, so no formula resolution is needed here.
        if (_isGroupUseEntireRow(this.gos, this.pivotActive)) {
            const leafChild = this.firstLeaf(node);
            return leafChild && this.beans.valueSvc.getValue(column, leafChild, 'data');
        }

        const displayCol = column.showRowGroupCol;
        return displayCol ? node.groupData?.[displayCol.colId] : undefined;
    }
}

/**
 * _csrmFirstLeaf gets the first lead child of the row node for CSRM,
 * it uses sourceRowIndex to identify if the row comes from row data or transaction or not.
 * Groups and filler nodes have negative sourceRowIndex.
 *
 * For SSRM and other view model however we don't have any other way to identify
 * if the row comes from data or not, so we simply check if data exists on the node.
 */
const defaultGetLeaf = (row: RowNode): RowNode | undefined => {
    if (row.data) {
        return row;
    }
    let childrenAfterGroup = row.childrenAfterGroup;
    while (childrenAfterGroup?.length) {
        const node = childrenAfterGroup[0];
        if (node.data) {
            return node;
        }
        childrenAfterGroup = node.childrenAfterGroup;
    }
};

const absoluteValueTransformer = (value: any): number | bigint | null => {
    if (!value) {
        return value;
    }
    if (typeof value === 'bigint') {
        return value < 0n ? -value : value;
    }
    const numberValue = Number(value);
    return isNaN(numberValue) ? value : Math.abs(numberValue);
};
