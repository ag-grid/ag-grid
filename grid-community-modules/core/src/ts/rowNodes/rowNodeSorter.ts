import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { ValueService } from "../valueService/valueService";
import { _ } from "../utils";
import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";

export interface SortOption {
    sort: 'asc' | 'desc';
    column: Column;
}

export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}

// this logic is used by both SSRM and CSRM

@Bean('rowNodeSorter')
export class RowNodeSorter extends BeanStub {

    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private isAccentedSort: boolean;
    private primaryColumnsSortGroups: boolean;

    @PostConstruct
    public init(): void {
        this.isAccentedSort = this.gridOptionsService.is('accentedSort');
        this.primaryColumnsSortGroups = this.gridOptionsService.isColumnsSortingCoupledToGroup();

        this.addManagedPropertyListener('accentedSort', (propChange) => this.isAccentedSort = propChange.currentValue);
        this.addManagedPropertyListener('autoGroupColumnDef', () => this.primaryColumnsSortGroups = this.gridOptionsService.isColumnsSortingCoupledToGroup());
    }

    public doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[] {
        // Slice so we are not mutating the original array so that when no sort is active the original order is preserved.
        const sortedRowNodes = rowNodes.slice(0);
        sortedRowNodes.sort(this.comparePlainRowNodes.bind(this, sortOptions));
        return sortedRowNodes;
    }

    private comparePlainRowNodes(sortOptions: SortOption[], nodeA: RowNode, nodeB: RowNode): number {

        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; i++) {
            const sortOption = sortOptions[i];
            const isDescending = sortOption.sort === 'desc';

            const valueA: any = this.getValue(nodeA, sortOption.column);
            const valueB: any = this.getValue(nodeB, sortOption.column);

            let comparatorResult: number;
            const providedComparator = this.getComparator(sortOption, nodeA);
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isDescending);
            } else {
                //otherwise do our own comparison
                comparatorResult = _.defaultComparator(valueA, valueB, this.isAccentedSort);
            }

            // user provided comparators can return 'NaN' if they don't correctly handle 'undefined' values, this
            // typically occurs when the comparator is used on a group row
            const validResult = !isNaN(comparatorResult);

            if (validResult && comparatorResult !== 0) {
                return sortOption.sort === 'asc' ? comparatorResult : comparatorResult * -1;
            }
        }
        return 0;
    }

    public compareRowNodes(sortOptions: SortOption[], sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode): number {
        const nodeA: RowNode = sortedNodeA.rowNode;
        const nodeB: RowNode = sortedNodeB.rowNode;

        const sortOrder = this.comparePlainRowNodes(sortOptions, nodeA, nodeB);

        // All matched, we make is so that the original sort order is kept:
        // NOTE: Stable sorting is part of the browser spec now so this may not be required depending on the use case.
        // i.e fullSort does not use this any more as it simply sorts the entire array. 
        return sortOrder === 0 ? sortedNodeA.currentPos - sortedNodeB.currentPos : sortOrder;
    }

    private getComparator(sortOption: SortOption, rowNode: RowNode):
        ((valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isDescending: boolean) => number) | undefined {

        const column = sortOption.column;

        // comparator on col get preference over everything else
        const comparatorOnCol = column.getColDef().comparator;
        if (comparatorOnCol != null) {
            return comparatorOnCol;
        }

        if (!column.getColDef().showRowGroup) { return; }

        // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
        const groupLeafField = !rowNode.group && column.getColDef().field;
        if (!groupLeafField) { return; }

        const primaryColumn = this.columnModel.getPrimaryColumn(groupLeafField);
        if (!primaryColumn) { return; }

        return primaryColumn.getColDef().comparator;
    }

    private getValue(node: RowNode, column: Column): any {
        if (!this.primaryColumnsSortGroups) {
            return this.valueService.getValue(column, node, false, false);
        }

        const isNodeGroupedAtLevel = node.rowGroupColumn === column;
        if (isNodeGroupedAtLevel) {
            const isGroupRows = this.gridOptionsService.isGroupUseEntireRow(this.columnModel.isPivotActive());
            if (isGroupRows) {
                // if the column has a provided a keyCreator, we have to use the key, as the group could be
                // irrelevant to the column value
                const keyCreator = column.getColDef().keyCreator;
                if (keyCreator) {
                    return node.key;
                }

                // if the group was generated from the column data, all the leaf children should return the same
                // value
                const leafChild = node.allLeafChildren?.[0];
                if (leafChild) {
                    return this.valueService.getValue(column, leafChild, false, false);
                }
                return undefined;
            }

            const displayCol = this.columnModel.getGroupDisplayColumnForGroup(column.getId());
            if (!displayCol) {
                return undefined;
            }
            return node.groupData?.[displayCol.getId()];
        }

        if (node.group && column.getColDef().showRowGroup) {
            return undefined;
        }

        return this.valueService.getValue(column, node, false, false);
    }
}