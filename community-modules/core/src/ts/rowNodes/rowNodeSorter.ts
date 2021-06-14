import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { Autowired, Bean } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ValueService } from "../valueService/valueService";
import { _ } from "../utils";
import { Constants } from "../constants/constants";
import { ColumnModel } from "../columns/columnModel";

export interface SortOption {
    sort: string;
    column: Column;
}

export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}

// this logic is used by both SSRM and CSRM

@Bean('rowNodeSorter')
export class RowNodeSorter {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    public doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[] {

        const mapper = (rowNode: RowNode, pos: number) => ({currentPos: pos, rowNode: rowNode});
        const sortedRowNodes: SortedRowNode[] = rowNodes.map(mapper);

        sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));

        return sortedRowNodes.map(item => item.rowNode);
    }

    public compareRowNodes(sortOptions: SortOption[], sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode): number {
        const nodeA: RowNode = sortedNodeA.rowNode;
        const nodeB: RowNode = sortedNodeB.rowNode;

        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; i++) {
            const sortOption = sortOptions[i];
            const isInverted = sortOption.sort === Constants.SORT_DESC;

            const valueA: any = this.getValue(nodeA, sortOption.column);
            const valueB: any = this.getValue(nodeB, sortOption.column);

            let comparatorResult: number;
            const providedComparator = this.getComparator(sortOption, nodeA);
            if (providedComparator) {
                //if comparator provided, use it
                comparatorResult = providedComparator(valueA, valueB, nodeA, nodeB, isInverted);
            } else {
                //otherwise do our own comparison
                comparatorResult = _.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }

            if (comparatorResult !== 0) {
                return sortOption.sort === Constants.SORT_ASC ? comparatorResult : comparatorResult * -1;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    }

    private getComparator(sortOption: SortOption, rowNode: RowNode) {
        let column = sortOption.column;

        const autoColumnGroup = column.getColId().indexOf(Constants.GROUP_AUTO_COLUMN_ID) === 0;
        if (autoColumnGroup) {
            // first check if there is a group comparator supplied on the autoGroupColumnDef
            const autoColumnGroupComparator = column.getColDef().comparator;
            if (autoColumnGroupComparator) {
                return autoColumnGroupComparator;
            }

            // then check for a comparator on the underlying row group column
            if (rowNode.rowGroupColumn) {
                return rowNode.rowGroupColumn.getColDef().comparator;
            }

            // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
            const groupLeafField = !rowNode.group && column.getColDef().field;
            if (groupLeafField) {
                let primaryColumn = this.columnModel.getPrimaryColumn(column.getColDef().field!);
                const groupLeafComparator = primaryColumn!.getColDef().comparator;
                if (groupLeafComparator) {
                    return groupLeafComparator;
                }
            }
        }

        // otherwise use comparator on sorted column
        return column.getColDef().comparator;
    }

    private getValue(nodeA: RowNode, column: Column): string {
        // supplying `useRawKeyValue = true` to ensure the comparator receives the raw / underlying value rather than
        // the group key value which is converted to a string, when row grouping.
        return this.valueService.getValue(column, nodeA, false, false, true);
    }
}