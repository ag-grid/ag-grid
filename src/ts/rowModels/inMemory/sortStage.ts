import {Bean, Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {SortController} from "../../sortController";
import {RowNode} from "../../entities/rowNode";
import {ValueService} from "../../valueService";
import {Utils as _} from "../../utils";
import {StageExecuteParams} from "../../interfaces/iRowNodeStage";

@Bean('sortStage')
export class SortStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('valueService') private valueService: ValueService;

    public execute(params: StageExecuteParams): void {
        let rowNode = params.rowNode;
        var sortOptions: any;

        // if the sorting is already done by the server, then we should not do it here
        if (!this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sortOptions = this.sortController.getSortForRowController();
        }

        this.sortRowNode(rowNode, sortOptions);
    }

    private sortRowNode(rowNode: RowNode, sortOptions: any) {

        // sort any groups recursively
        rowNode.childrenAfterFilter.forEach( child => {
            if (child.group) {
                this.sortRowNode(child, sortOptions);
            }
        });

        rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);

        var sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        if (sortActive) {
            rowNode.childrenAfterSort.sort(this.compareRowNodes.bind(this, sortOptions));
        }

        this.updateChildIndexes(rowNode);
    }

    private compareRowNodes(sortOptions: any, nodeA: RowNode, nodeB: RowNode) {
        // Iterate columns, return the first that doesn't match
        for (var i = 0, len = sortOptions.length; i < len; i++) {
            var sortOption = sortOptions[i];
            // var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);

            var isInverted = sortOption.inverter === -1;
            var valueA = this.valueService.getValue(sortOption.column, nodeA);
            var valueB = this.valueService.getValue(sortOption.column, nodeB);
            var comparatorResult: number;
            if (sortOption.column.getColDef().comparator) {
                //if comparator provided, use it
                comparatorResult = sortOption.column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            } else {
                //otherwise do our own comparison
                comparatorResult = _.defaultComparator(valueA, valueB);
            }

            if (comparatorResult !== 0) {
                return comparatorResult * sortOption.inverter;
            }
        }
        // All matched, these are identical as far as the sort is concerned:
        return 0;
    }

    private updateChildIndexes(rowNode: RowNode) {
        if (_.missing(rowNode.childrenAfterSort)) { return; }

        rowNode.childrenAfterSort.forEach( (child: RowNode, index: number) => {
            child.firstChild = index === 0;
            child.lastChild = index === rowNode.childrenAfterSort.length - 1;
            child.childIndex = index;
        });
    }
}