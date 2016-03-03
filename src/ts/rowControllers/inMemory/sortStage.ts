import {Bean} from "../../context/context";
import {Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {SortController} from "../../sortController";
import {RowNode} from "../../entities/rowNode";
import {Column} from "../../entities/column";
import {ValueService} from "../../valueService";
import {Utils as _} from '../../utils';

@Bean('sortStage')
export class SortStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('valueService') private valueService: ValueService;

    public execute(rowsToSort: RowNode[]): RowNode[] {
        var sorting: any;

        // if the sorting is already done by the server, then we should not do it here
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sorting = false;
        } else {
            //see if there is a col we are sorting by
            var sortingOptions = this.sortController.getSortForRowController();
            sorting = sortingOptions.length > 0;
        }

        var result = rowsToSort.slice(0);

        if (sorting) {
            this.sortList(result, sortingOptions);
        } else {
            // if no sorting, set all group children after sort to the original list.
            // note: it is important to do this, even if doing server side sorting,
            // to allow the rows to pass to the next stage (ie set the node value
            // childrenAfterSort)
            this.recursivelyResetSort(result);
        }

        return result;
    }

    private sortList(nodes: RowNode[], sortOptions: any) {

        // sort any groups recursively
        for (var i = 0, l = nodes.length; i < l; i++) { // critical section, no functional programming
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterSort = node.childrenAfterFilter.slice(0);
                this.sortList(node.childrenAfterSort, sortOptions);
            }
        }

        var that = this;

        function compare(nodeA: RowNode, nodeB: RowNode, column: Column, isInverted: boolean) {
            var valueA = that.valueService.getValue(column, nodeA);
            var valueB = that.valueService.getValue(column, nodeB);
            if (column.getColDef().comparator) {
                //if comparator provided, use it
                return column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            } else {
                //otherwise do our own comparison
                return _.defaultComparator(valueA, valueB);
            }
        }

        nodes.sort(function (nodeA: RowNode, nodeB: RowNode) {
            // Iterate columns, return the first that doesn't match
            for (var i = 0, len = sortOptions.length; i < len; i++) {
                var sortOption = sortOptions[i];
                var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
                if (compared !== 0) {
                    return compared * sortOption.inverter;
                }
            }
            // All matched, these are identical as far as the sort is concerned:
            return 0;
        });

        this.updateChildIndexes(nodes);
    }

    private recursivelyResetSort(rowNodes: RowNode[]) {
        if (!rowNodes) {
            return;
        }
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group && item.children) {
                item.childrenAfterSort = item.childrenAfterFilter;
                this.recursivelyResetSort(item.children);
            }
        }

        this.updateChildIndexes(rowNodes);
    }


    private updateChildIndexes(nodes: RowNode[]) {
        for (var j = 0; j<nodes.length; j++) {
            var node = nodes[j];
            node.firstChild = j === 0;
            node.lastChild = j === nodes.length - 1;
            node.childIndex = j;
        }
    }
}