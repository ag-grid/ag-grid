import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { SortController } from "../sortController";
import { _ } from "../utils";
import { ValueService } from "../valueService/valueService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";

export interface SortOption {
    inverter: number;
    column: Column;
}

export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}

@Bean('sortService')
export class SortService {

    @Autowired('sortController') private sortController: SortController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private postSortFunc: (rowNodes: RowNode[]) => void;

    @PostConstruct
    public init(): void {
        this.postSortFunc = this.gridOptionsWrapper.getPostSortFunc();
    }

    public sortAccordingToColumnsState(rowNode: RowNode) {
        const sortOptions: SortOption[] = this.sortController.getSortForRowController();
        this.sort(rowNode, sortOptions);
    }

    public sort(rowNode: RowNode, sortOptions: SortOption[]) {
        rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);

        // we clear out the 'pull down open parents' first, as the values mix up the sorting
        this.pullDownDataForHideOpenParents(rowNode, true);

        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        if (sortActive) {
            // RE https://ag-grid.atlassian.net/browse/AG-444
            //Javascript sort is non deterministic when all the array items are equals
            //ie Comparator always returns 0, so if you want to ensure the array keeps its
            //order, then you need to add an additional sorting condition manually, in this
            //case we are going to inspect the original array position
            const sortedRowNodes: SortedRowNode[] = rowNode.childrenAfterSort.map((it, pos) => {
                return {currentPos: pos, rowNode: it};
            });
            sortedRowNodes.sort(this.compareRowNodes.bind(this, sortOptions));
            rowNode.childrenAfterSort = sortedRowNodes.map(sorted => sorted.rowNode);
        }

        this.updateChildIndexes(rowNode);
        this.pullDownDataForHideOpenParents(rowNode, false);

        // sort any groups recursively
        rowNode.childrenAfterFilter.forEach(child => {
            if (child.hasChildren()) {
                this.sort(child, sortOptions);
            }
        });

        if (this.postSortFunc) {
            this.postSortFunc(rowNode.childrenAfterSort);
        }
    }

    private compareRowNodes(sortOptions: any, sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode) {
        const nodeA: RowNode = sortedNodeA.rowNode;
        const nodeB: RowNode = sortedNodeB.rowNode;

        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; i++) {
            const sortOption = sortOptions[i];
            // let compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);

            const isInverted = sortOption.inverter === -1;
            const valueA: any = this.getValue(nodeA, sortOption.column);
            const valueB: any = this.getValue(nodeB, sortOption.column);
            let comparatorResult: number;
            if (sortOption.column.getColDef().comparator) {
                //if comparator provided, use it
                comparatorResult = sortOption.column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            } else {
                //otherwise do our own comparison
                comparatorResult = _.defaultComparator(valueA, valueB, this.gridOptionsWrapper.isAccentedSort());
            }

            if (comparatorResult !== 0) {
                return comparatorResult * sortOption.inverter;
            }
        }
        // All matched, we make is so that the original sort order is kept:
        return sortedNodeA.currentPos - sortedNodeB.currentPos;
    }

    private getValue(nodeA: RowNode, column: Column): string {
        return this.valueService.getValue(column, nodeA);
    }

    private updateChildIndexes(rowNode: RowNode) {
        if (_.missing(rowNode.childrenAfterSort)) {
            return;
        }

        rowNode.childrenAfterSort.forEach((child: RowNode, index: number) => {
            const firstChild = index === 0;
            const lastChild = index === rowNode.childrenAfterSort.length - 1;
            child.setFirstChild(firstChild);
            child.setLastChild(lastChild);
            child.setChildIndex(index);
        });
    }

    private pullDownDataForHideOpenParents(rowNode: RowNode, clearOperation: boolean) {
        if (_.missing(rowNode.childrenAfterSort)) {
            return;
        }

        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }

        rowNode.childrenAfterSort.forEach(childRowNode => {

            const groupDisplayCols = this.columnController.getGroupDisplayColumns();
            groupDisplayCols.forEach(groupDisplayCol => {

                const showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('ag-Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }
                const displayingGroupKey: string = showRowGroup as string;

                const rowGroupColumn = this.columnController.getPrimaryColumn(displayingGroupKey);

                const thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
                if (thisRowNodeMatches) { return; }

                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), null);
                } else {
                    // if doing a set operation, we set only where the pull down is to occur
                    const parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
                    if (parentToStealFrom) {
                        childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
                    }
                }
            });
        });
    }

}