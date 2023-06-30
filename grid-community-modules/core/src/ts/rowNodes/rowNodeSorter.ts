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

        // Slice so we are not mutating the original array so that the original order is preserved
        // when no sorting is applied.
        const sortedRowNodes = rowNodes.slice(0);
        sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));

        return sortedRowNodes;
    }
    public compareRowNodes(sortOptions: SortOption[], nodeA: RowNode, nodeB: RowNode): number {

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
                return isDescending ? comparatorResult * -1 : comparatorResult;
            }
        }
        // All matched so return 0 to stable sort by Browser Spec
        return 0;
    }

    private getComparator(sortOption: SortOption, rowNode: RowNode):
        ((valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isDescending: boolean) => number) | undefined {

        const colDef = sortOption.column.getColDef();

        // comparator on col get preference over everything else
        const comparatorOnCol = colDef.comparator;
        if (comparatorOnCol != null) {
            return comparatorOnCol;
        }

        if (!colDef.showRowGroup) { return; }

        // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
        const groupLeafField = !rowNode.group && colDef.field;
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