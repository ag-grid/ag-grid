import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { Autowired, Bean } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ValueService } from "../valueService/valueService";
import { _ } from "../utils";
import { Constants } from "../constants/constants";
import { ColumnModel } from "../columns/columnModel";

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
export class RowNodeSorter {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    public doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[] {
        
        const mapper = (rowNode: RowNode, pos: number) => ({ currentPos: pos, rowNode: rowNode });
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

            // user provided comparators can return 'NaN' if they don't correctly handle 'undefined' values, this
            // typically occurs when the comparator is used on a group row
            const validResult = !isNaN(comparatorResult);

            if (validResult && comparatorResult !== 0) {
                return sortOption.sort === Constants.SORT_ASC ? comparatorResult : comparatorResult * -1;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    }

    private getComparator(sortOption: SortOption, rowNode: RowNode):
        ((valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number) | undefined {

        const column = sortOption.column;

        // comparator on col get preference over everything else
        const comparatorOnCol = column.getColDef().comparator;
        if (comparatorOnCol != null) {
            return comparatorOnCol;
        }

        // if no comparator on col, see if we are showing a group, and if we are, get comparator from row group col
        if (rowNode.rowGroupColumn) {
            return rowNode.rowGroupColumn.getColDef().comparator;
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
        const isNodeGroupedAtLevel = node.rowGroupColumn === column;
        if (isNodeGroupedAtLevel) {
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