import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { Autowired, Bean } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ValueService } from "../valueService/valueService";
import { _ } from "../utils";
import { Constants } from "../constants/constants";

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
            // let compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);

            const isInverted = sortOption.sort === Constants.SORT_DESC;
            const valueA: any = this.getValue(nodeA, sortOption.column);
            const valueB: any = this.getValue(nodeB, sortOption.column);
            let comparatorResult: number;
            const providedComparator = sortOption.column.getColDef().comparator;
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

    private getValue(nodeA: RowNode, column: Column): string {
        return this.valueService.getValue(column, nodeA);
    }

}