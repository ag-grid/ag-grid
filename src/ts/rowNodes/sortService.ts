import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {Autowired, Bean} from "../context/context";
import {SortController} from "../sortController";
import {_} from "../utils";
import {ValueService} from "../valueService";

export interface SortOption {
    inverter:number,
    column:Column
}


@Bean('sortService')
export class SortService {
    @Autowired('sortController') private sortController: SortController;
    @Autowired('valueService') private valueService: ValueService;

    sortAccordingToColumnsState (rowNode: RowNode){
        let sortOptions: SortOption[] = this.sortController.getSortForRowController();
        this.sort(rowNode, sortOptions);
    }

    sort (rowNode: RowNode, sortOptions: SortOption[]){
        // sort any groups recursively
        rowNode.childrenAfterFilter.forEach( child => {
            if (child.group) {
                this.sort(child, sortOptions);
            }
        });

        rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);

        let sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        if (sortActive) {
            rowNode.childrenAfterSort.sort(this.compareRowNodes.bind(this, sortOptions));
        }

        this.updateChildIndexes(rowNode);
    }


    private compareRowNodes(sortOptions: any, nodeA: RowNode, nodeB: RowNode) {
        // Iterate columns, return the first that doesn't match
        for (let i = 0, len = sortOptions.length; i < len; i++) {
            let sortOption = sortOptions[i];
            // let compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);

            let isInverted = sortOption.inverter === -1;
            let valueA = this.valueService.getValue(sortOption.column, nodeA);
            let valueB = this.valueService.getValue(sortOption.column, nodeB);
            let comparatorResult: number;
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