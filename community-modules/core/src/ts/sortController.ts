import { Autowired, Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { Constants } from "./constants";
import { ColumnApi } from "./columnController/columnApi";
import { ColumnController } from "./columnController/columnController";
import { ColumnEventType, Events, SortChangedEvent } from "./events";
import { GridApi } from "./gridApi";
import { GridOptionsWrapper } from "./gridOptionsWrapper";

@Bean('sortController')
export class SortController extends BeanStub {

    private static DEFAULT_SORTING_ORDER = [Constants.SORT_ASC, Constants.SORT_DESC, null];

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    public progressSort(column: Column, multiSort: boolean, source: ColumnEventType = "api"): void {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }

    public setSortForColumn(column: Column, sort: string | null, multiSort: boolean, source: ColumnEventType = "api"): void {

        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== Constants.SORT_ASC && sort !== Constants.SORT_DESC) {
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

    // used by server side row models, to send sorting to server
    public getSortModel = () => {
        return this.getColumnsWithSortingOrdered().map(column => ({
            colId: column.getColId(),
            sort: column.getSort()
        }));
    }

    public isSortActive(): boolean {
        // pull out all the columns that have sorting set
        const allCols = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        const sortedCols = allCols.filter(column => !!column.getSort());
        return sortedCols && sortedCols.length > 0;
    }

    public dispatchSortChangedEvents(): void {
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

    public getColumnsWithSortingOrdered(): Column[] {
        // pull out all the columns that have sorting set
        const allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        const columnsWithSorting = allColumnsIncludingAuto.filter(column => !!column.getSort());

        // put the columns in order of which one got sorted first
        columnsWithSorting.sort((a: any, b: any) => a.sortedAt - b.sortedAt);

        return columnsWithSorting;
    }

    // used by row controller, when doing the sorting
    public getSortForRowController(): any[] {
        return this.getColumnsWithSortingOrdered().map(column => {
            const isAscending = column.getSort() === Constants.SORT_ASC;

            return {
                inverter: isAscending ? 1 : -1,
                column
            };
        });
    }
}
