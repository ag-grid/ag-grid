import { Column } from "./entities/column";
import { Autowired, Bean } from "./context/context";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { ColumnApi } from "./columnController/columnApi";
import { ColumnController } from "./columnController/columnController";
import { EventService } from "./eventService";
import { ColumnEventType, Events, SortChangedEvent } from "./events";
import { GridApi } from "./gridApi";
import { _ } from './utils';

@Bean('sortController')
export class SortController {

    private static DEFAULT_SORTING_ORDER = [Column.SORT_ASC, Column.SORT_DESC, null];

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    public progressSort(column: Column, multiSort: boolean, source: ColumnEventType = "api"): void {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }

    public setSortForColumn(column: Column, sort: string | null, multiSort: boolean, source: ColumnEventType = "api"): void {

        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== Column.SORT_ASC && sort !== Column.SORT_DESC) {
            sort = null;
        }

        // update sort on current col
        column.setSort(sort, source);

        // sortedAt used for knowing order of cols when multi-col sort
        if (column.getSort()) {
            const sortedAt = Number(new Date().valueOf());
            column.setSortedAt(sortedAt);
        } else {
            column.setSortedAt(null);
        }

        const doingMultiSort = multiSort && !this.gridOptionsWrapper.isSuppressMultiSort();

        // clear sort on all columns except this one, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarThisColumn(column, source);
        }

        this.dispatchSortChangedEvents();
    }

    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    public onSortChanged(): void {
        this.dispatchSortChangedEvents();
    }

    private dispatchSortChangedEvents(): void {
        const event: SortChangedEvent = {
            type: Events.EVENT_SORT_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    private clearSortBarThisColumn(columnToSkip: Column, source: ColumnEventType): void {
        this.columnController.getPrimaryAndSecondaryAndAutoColumns().forEach((columnToClear: Column) => {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(columnToClear === columnToSkip)) {
                // setting to 'undefined' as null means 'none' rather than cleared, otherwise issue will arise
                // if sort order is: ['desc', null , 'asc'], as it will start at null rather than 'desc'.
                columnToClear.setSort(undefined, source);
            }
        });
    }

    private getNextSortDirection(column: Column): string | null {

        let sortingOrder: (string | null)[] | null | undefined;
        if (column.getColDef().sortingOrder) {
            sortingOrder = column.getColDef().sortingOrder;
        } else if (this.gridOptionsWrapper.getSortingOrder()) {
            sortingOrder = this.gridOptionsWrapper.getSortingOrder();
        } else {
            sortingOrder = SortController.DEFAULT_SORTING_ORDER;
        }

        if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
            console.warn(`ag-grid: sortingOrder must be an array with at least one element, currently it\'s ${sortingOrder}`);
            return null;
        }

        const currentIndex = sortingOrder.indexOf(column.getSort());
        const notInArray = currentIndex < 0;
        const lastItemInArray = currentIndex == sortingOrder.length - 1;
        let result: string | null;
        if (notInArray || lastItemInArray) {
            result = sortingOrder[0];
        } else {
            result = sortingOrder[currentIndex + 1];
        }

        // verify the sort type exists, as the user could provide the sortingOrder, need to make sure it's valid
        if (SortController.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
            console.warn('ag-grid: invalid sort type ' + result);
            return null;
        }

        return result;
    }

    // used by the public api, for saving the sort model
    public getSortModel() {
        const columnsWithSorting = this.getColumnsWithSortingOrdered();

        return _.map(columnsWithSorting, (column: Column) => {
            return {
                colId: column.getColId(),
                sort: column.getSort()
            };
        });
    }

    public setSortModel(sortModel: any, source: ColumnEventType = "api") {
        // first up, clear any previous sort
        const sortModelProvided = sortModel && sortModel.length > 0;

        const allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        allColumnsIncludingAuto.forEach((column: Column) => {
            let sortForCol: any = null;
            let sortedAt = -1;
            if (sortModelProvided && column.getColDef().sortable) {
                for (let j = 0; j < sortModel.length; j++) {
                    const sortModelEntry = sortModel[j];
                    if (typeof sortModelEntry.colId === 'string'
                        && typeof column.getColId() === 'string'
                        && this.compareColIds(sortModelEntry, column)) {
                        sortForCol = sortModelEntry.sort;
                        sortedAt = j;
                    }
                }
            }

            if (sortForCol) {
                column.setSort(sortForCol, source);
                column.setSortedAt(sortedAt);
            } else {
                column.setSort(null, source);
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
        const allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        const columnsWithSorting = _.filter(allColumnsIncludingAuto, (column: Column) => !!column.getSort()) as Column[];

        // put the columns in order of which one got sorted first
        columnsWithSorting.sort((a: any, b: any) => a.sortedAt - b.sortedAt);

        return columnsWithSorting;
    }

    // used by row controller, when doing the sorting
    public getSortForRowController(): any[] {
        const columnsWithSorting = this.getColumnsWithSortingOrdered();

        return _.map(columnsWithSorting, (column: Column) => {
            const ascending = column.getSort() === Column.SORT_ASC;
            return {
                inverter: ascending ? 1 : -1,
                column: column
            };
        });
    }
}