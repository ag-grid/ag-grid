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
        let nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort);
    }

    public setSortForColumn(column: Column, sort: string, multiSort: boolean): void {

        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort!==Column.SORT_ASC && sort!==Column.SORT_DESC) { sort = null; }

        // update sort on current col
        column.setSort(sort);

        // sortedAt used for knowing order of cols when multi-col sort
        if (column.getSort()) {
            let sortedAt = Number(new Date().valueOf());
            column.setSortedAt(sortedAt);
        } else {
            column.setSortedAt(null);
        }

        let doingMultiSort = multiSort && !this.gridOptionsWrapper.isSuppressMultiSort();

        // clear sort on all columns except this one, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarThisColumn(column);
        }

        this.dispatchSortChangedEvents();
    }

    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    public onSortChanged(): void {
        this.dispatchSortChangedEvents();
    }

    private dispatchSortChangedEvents(): void {
        this.eventService.dispatchEvent(Events.EVENT_SORT_CHANGED);
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

        let sortingOrder: string[];
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

        let currentIndex = sortingOrder.indexOf(column.getSort());
        let notInArray = currentIndex < 0;
        let lastItemInArray = currentIndex == sortingOrder.length - 1;
        let result: string;
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
        let columnsWithSorting = this.getColumnsWithSortingOrdered();

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
        let sortModelProvided = sortModel && sortModel.length > 0;

        let allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        allColumnsIncludingAuto.forEach( (column: Column)=> {
            let sortForCol: any = null;
            let sortedAt = -1;
            if (sortModelProvided && !column.getColDef().suppressSorting) {
                for (let j = 0; j < sortModel.length; j++) {
                    let sortModelEntry = sortModel[j];
                    if (typeof sortModelEntry.colId === 'string'
                        && typeof column.getColId() === 'string'
                        && this.compareColIds(sortModelEntry, column)) {
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

    private compareColIds(sortModelEntry: any, column: Column) {
        return sortModelEntry.colId === column.getColId();
    }

    public getColumnsWithSortingOrdered(): Column[] {
        // pull out all the columns that have sorting set
        let allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        let columnsWithSorting = <Column[]> _.filter(allColumnsIncludingAuto, (column:Column) => { return !!column.getSort();} );

        // put the columns in order of which one got sorted first
        columnsWithSorting.sort( (a: any, b: any) => { return a.sortedAt - b.sortedAt} );

        return columnsWithSorting;
    }

    // used by row controller, when doing the sorting
    public getSortForRowController(): any[] {
        let columnsWithSorting = this.getColumnsWithSortingOrdered();

        return _.map(columnsWithSorting, (column: Column) => {
            let ascending = column.getSort() === Column.SORT_ASC;
            return {
                inverter: ascending ? 1 : -1,
                column: column
            }
        });
    }
}