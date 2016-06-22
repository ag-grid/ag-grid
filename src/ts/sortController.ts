import {Column} from "./entities/column";
import {Autowired} from "./context/context";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ColumnController} from "./columnController/columnController";
import {EventService} from "./eventService";
import {Events} from "./events";
import {Bean} from "./context/context";
import {Utils as _} from './utils';

@Bean('sortController')
export class SortController {

    private static DEFAULT_SORTING_ORDER = [Column.SORT_ASC, Column.SORT_DESC, null];

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    public progressSort(column: Column, multiSort: boolean): void {

        // update sort on current col
        column.setSort(this.getNextSortDirection(column));

        // sortedAt used for knowing order of cols when multi-col sort
        if (column.getSort()) {
            column.setSortedAt(new Date().valueOf());
        } else {
            column.setSortedAt(null);
        }

        var doingMultiSort = multiSort && !this.gridOptionsWrapper.isSuppressMultiSort();

        // clear sort on all columns except this one, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarThisColumn(column);
        }

        this.dispatchSortChangedEvents();
    }

    private dispatchSortChangedEvents(): void {
        this.eventService.dispatchEvent(Events.EVENT_BEFORE_SORT_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_SORT_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_AFTER_SORT_CHANGED);
    }

    private clearSortBarThisColumn(columnToSkip: Column): void {
        this.columnController.getPrimaryAndSecondaryAndAutoColumns().forEach( (columnToClear: Column)=> {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(columnToClear === columnToSkip)) {
                columnToClear.setSort(null);
            }
        });
    }

    private getNextSortDirection(column: Column): string {

        var sortingOrder: string[];
        if (column.getColDef().sortingOrder) {
            sortingOrder = column.getColDef().sortingOrder;
        } else if (this.gridOptionsWrapper.getSortingOrder()) {
            sortingOrder = this.gridOptionsWrapper.getSortingOrder();
        } else {
            sortingOrder = SortController.DEFAULT_SORTING_ORDER;
        }

        if ( !Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
            console.warn('ag-grid: sortingOrder must be an array with at least one element, currently it\'s ' + sortingOrder);
            return;
        }

        var currentIndex = sortingOrder.indexOf(column.getSort());
        var notInArray = currentIndex < 0;
        var lastItemInArray = currentIndex == sortingOrder.length - 1;
        var result: string;
        if (notInArray || lastItemInArray) {
            result = sortingOrder[0];
        } else {
            result = sortingOrder[currentIndex + 1];
        }

        // verify the sort type exists, as the user could provide the sortOrder, need to make sure it's valid
        if (SortController.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
            console.warn('ag-grid: invalid sort type ' + result);
            return null;
        }

        return result;
    }

    // used by the public api, for saving the sort model
    public getSortModel() {
        var columnsWithSorting = this.getColumnsWithSortingOrdered();

        return _.map(columnsWithSorting, (column: Column) => {
            return {
                colId: column.getColId(),
                sort: column.getSort()
            }
        });
    }

    public setSortModel(sortModel: any) {
        if (!this.gridOptionsWrapper.isEnableSorting()) {
            console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
            return;
        }
        // first up, clear any previous sort
        var sortModelProvided = sortModel && sortModel.length > 0;

        var allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        allColumnsIncludingAuto.forEach( (column: Column)=> {
            var sortForCol: any = null;
            var sortedAt = -1;
            if (sortModelProvided && !column.getColDef().suppressSorting) {
                for (var j = 0; j < sortModel.length; j++) {
                    var sortModelEntry = sortModel[j];
                    if (typeof sortModelEntry.colId === 'string'
                        && typeof column.getColId() === 'string'
                        && sortModelEntry.colId === column.getColId()) {
                        sortForCol = sortModelEntry.sort;
                        sortedAt = j;
                    }
                }
            }

            if (sortForCol) {
                column.setSort(sortForCol);
                column.setSortedAt(sortedAt);
            } else {
                column.setSort(null);
                column.setSortedAt(null);
            }
        });

        this.dispatchSortChangedEvents();
    }

    public getColumnsWithSortingOrdered(): Column[] {
        // pull out all the columns that have sorting set
        var allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        var columnsWithSorting = <Column[]> _.filter(allColumnsIncludingAuto, (column:Column) => { return !!column.getSort();} );

        // put the columns in order of which one got sorted first
        columnsWithSorting.sort( (a: any, b: any) => { return a.sortedAt - b.sortedAt} );

        return columnsWithSorting;
    }

    // used by row controller, when doing the sorting
    public getSortForRowController(): any[] {
        var columnsWithSorting = this.getColumnsWithSortingOrdered();

        return _.map(columnsWithSorting, (column: Column) => {
            var ascending = column.getSort() === Column.SORT_ASC;
            return {
                inverter: ascending ? 1 : -1,
                column: column
            }
        });
    }
}