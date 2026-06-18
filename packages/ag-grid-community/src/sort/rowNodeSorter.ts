import { _defaultComparator } from 'ag-stack';

import { _csrmFirstLeaf } from '../clientSideRowModel/clientSideRowModelUtils';
import type { ColumnModel } from '../columns/columnModel';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { _isClientSideRowModel, _isColumnsSortingCoupledToGroup, _isGroupUseEntireRow } from '../gridOptionsUtils';
import type { IFormulaService } from '../interfaces/formulas';
import type { SortOption } from '../interfaces/iSortOption';
import type { ValueService } from '../valueService/valueService';

// this logic is used by both SSRM and CSRM

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowNodeSorter extends BeanStub implements NamedBean {
    beanName = 'rowNodeSorter' as const;

    private accentedSort: boolean = false;
    private primaryColumnsSortGroups: boolean = false;
    private pivotActive: boolean = false;
    private firstLeaf: (row: RowNode) => RowNode | undefined;

    private colModel: ColumnModel;
    private formula: IFormulaService | undefined;
    private valueSvc: ValueService;

    public postConstruct(): void {
        this.firstLeaf = _isClientSideRowModel(this.gos) ? _csrmFirstLeaf : defaultGetLeaf;

        const updatePivotModeState = () => {
            this.pivotActive = this.colModel.isPivotActive();
        };

        const updateOptions = () => {
            const gos = this.gos;
            this.accentedSort = !!gos.get('accentedSort');
            this.primaryColumnsSortGroups = _isColumnsSortingCoupledToGroup(gos);
        };

        this.addManagedPropertyListeners(['accentedSort', 'autoGroupColumnDef', 'treeData'], updateOptions);

        this.addManagedEventListeners({
            columnPivotModeChanged: updatePivotModeState,
            columnPivotChanged: updatePivotModeState,
        });

        updateOptions();
        updatePivotModeState();
    }

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.formula = beans.formula;
        this.valueSvc = beans.valueSvc;
    }

    public doFullSortInPlace(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[] {
        // This relies on stable sorting, present since ECMAScript 2019 - all browser within AG Grid's support matrix
        return rowNodes.sort((a, b) => this.compareRowNodes(sortOptions, a, b));
    }

    public compareRowNodes(sortOptions: SortOption[], nodeA: RowNode, nodeB: RowNode): number {
        const accentedCompare = this.accentedSort;

        // Iterate columns, return the first that doesn't match. Comparators are resolved up front
        // (see _resolveSortOptions): a col comparator applies to every row; a row-group display col falls back
        // to its primary column's comparator for leaf rows only; otherwise the grid's default comparator is used.
        for (let i = 0, len = sortOptions.length; i < len; ++i) {
            const sortOption = sortOptions[i];
            const column = sortOption.column as AgColumn;
            const descending = sortOption.descending;
            const valueA = this.getValue(nodeA, column);
            const valueB = this.getValue(nodeB, column);

            const comparator = sortOption.colComparator ?? (nodeA.group ? undefined : sortOption.leafComparator);
            let result: number;
            if (comparator) {
                result = comparator(valueA, valueB, nodeA, nodeB, descending);
            } else if (sortOption.absolute) {
                result = _defaultComparator(
                    absoluteValueTransformer(valueA),
                    absoluteValueTransformer(valueB),
                    accentedCompare
                );
            } else {
                result = _defaultComparator(valueA, valueB, accentedCompare);
            }

            // user comparators can return NaN for unhandled undefined values; NaN is falsy → treated as equal.
            if (result) {
                return descending ? -result : result;
            }
        }

        return 0;
    }

    private getValue(node: RowNode, column: AgColumn): any {
        if (this.primaryColumnsSortGroups) {
            if (node.rowGroupColumn === column) {
                return this.getGroupDataValue(node, column);
            }

            if (node.group && column.showRowGroup) {
                return undefined;
            }
        }

        const value = this.valueSvc.getValueFromData(column, node);
        if (column.allowFormula) {
            const formula = this.formula;
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
            return leafChild && this.valueSvc.getValueFromData(column, leafChild);
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
