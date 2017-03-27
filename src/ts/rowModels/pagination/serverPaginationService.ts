import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Bean, Autowired, PostConstruct} from "../../context/context";
import {GridPanel} from "../../gridPanel/gridPanel";
import {SelectionController} from "../../selectionController";
import {IRowModel} from "./../../interfaces/iRowModel";
import {SortController} from "../../sortController";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {FilterManager} from "../../filter/filterManager";
import {IInMemoryRowModel} from "../../interfaces/iInMemoryRowModel";
import {Constants} from "../../constants";
import {IDatasource} from "./../iDatasource";
import {BeanStub} from "../../context/beanStub";

export interface IPaginationService {
    isLastPageFound(): boolean;
    getCurrentPage(): number;
    goToNextPage(): void;
    goToPreviousPage(): void;
    goToFirstPage(): void;
    goToLastPage(): void;
    getPageSize(): number
    getTotalPages(): number;
    getTotalRowCount(): number;
    goToPage(page: number): void;
}

@Bean('serverPaginationService')
export class ServerPaginationService extends BeanStub implements IPaginationService {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('eventService') private eventService: EventService;

    // we wire up rowModel, but cast to inMemoryRowModel before using it
    @Autowired('rowModel') private rowModel: IRowModel;
    private inMemoryRowModel: IInMemoryRowModel;

    private callVersion = 0;
    private datasource: IDatasource;
    private pageSize = 100;
    private rowCount = 0;
    private lastPageFound = false;
    private totalPages = 0;
    private currentPage = 0;

    public isLastPageFound(): boolean {
        return this.lastPageFound;
    }

    public getPageSize(): number {
        return this.pageSize;
    }

    public getCurrentPage(): number {
        return this.currentPage;
    }

    public getTotalPages(): number {
        return this.totalPages;
    }

    public getTotalRowCount(): number {
        return this.rowCount;
    }

    public goToNextPage(): void {
        this.goToPage(this.currentPage + 1);
    }

    public goToPreviousPage(): void {
        this.goToPage(this.currentPage - 1);
    }

    public goToFirstPage(): void {
        this.goToPage(0);
    }

    public goToLastPage(): void {
        if (this.lastPageFound) {
            this.goToPage(this.totalPages - 1);
        }
    }

    public goToPage(page: number): void {
        if (page<0) {
            // min page is zero
            this.currentPage = 0;
        } else if (this.lastPageFound && page > this.totalPages) {
            // max page is totalPages-1 IF we know the last page
            this.currentPage = this.totalPages - 1;
        } else {
            // otherwise take page as is
            this.currentPage = page;
        }
        this.loadPage();
    }

    @PostConstruct
    public init() {

        // if we are doing pagination, we are guaranteed that the model type
        // is normal. if it is not, then this paginationController service
        // will never be called.
        if (this.rowModel.getType()===Constants.ROW_MODEL_TYPE_NORMAL) {
            this.inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
        }

        this.addDestroyableEventListener(this.gridOptionsWrapper, 'paginationPageSize', () => {
            this.reset(false);
            this.setPageSize();
        });

        this.setPageSize();

        let paginationEnabled = this.gridOptionsWrapper.isRowModelServerPagination();
        // if not doing pagination, then quite the setup
        if (!paginationEnabled) { return; }

        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            this.addDestroyableEventListener(
                this.eventService,
                Events.EVENT_FILTER_CHANGED,
                this.reset.bind(this,false));
        }

        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            this.addDestroyableEventListener(
                this.eventService,
                Events.EVENT_SORT_CHANGED,
                this.reset.bind(this,false));
        }

        this.setDatasource(this.gridOptionsWrapper.getDatasource());
    }

    public setDatasource(datasource: IDatasource) {
        this.datasource = datasource;

        if (datasource) {
            this.checkForDeprecated();
            this.reset(true);
        }
    }

    private checkForDeprecated(): void {
        var ds = <any> this.datasource;
        if (_.exists(ds.pageSize)) {
            console.error('ag-Grid: since version 5.1.x, pageSize is replaced with grid property infinPageSize');
        }
    }

    private setPageSize(): void {
        // copy pageSize, to guard against it changing the the datasource between calls
        this.pageSize = this.gridOptionsWrapper.getPaginationPageSize();
        if ( !(this.pageSize>=1) ) {
            this.pageSize = 100;
        }
    }

    private reset(freshDatasource: boolean) {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (_.missing(this.datasource)) {
            return;
        }

        // if user is providing id's, then this means we can keep the selection between datsource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done. if it's a new datasource, then always clear the selection.
        let userGeneratingRows = _.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        let resetSelectionController = freshDatasource || !userGeneratingRows;
        if (resetSelectionController) {
            this.selectionController.reset();
        }

        this.setPageSize();

        // see if we know the total number of pages, or if it's 'to be decided'
        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
            this.rowCount = this.datasource.rowCount;
            this.lastPageFound = true;
            this.calculateTotalPages();
        } else {
            this.rowCount = 0;
            this.lastPageFound = false;
            this.totalPages = 0;
        }

        this.resetCurrentPage();

        this.eventService.dispatchEvent(Events.DEPRECATED_EVENT_PAGINATION_RESET);
        this.eventService.dispatchEvent(Events.EVENT_PAGINATION_CHANGED);

        this.loadPage();
    }

    private resetCurrentPage(): void {
        let userFirstPage = this.gridOptionsWrapper.getPaginationStartPage();
        if (userFirstPage>0) {
            this.currentPage = userFirstPage;
        } else {
            this.currentPage = 0;
        }
    }

    private calculateTotalPages() {
        this.totalPages = Math.floor((this.rowCount - 1) / this.pageSize) + 1;
    }

    private pageLoaded(rows: any, lastRowIndex: any) {
        lastRowIndex = _.cleanNumber(lastRowIndex);
        var firstId = this.currentPage * this.pageSize;
        this.inMemoryRowModel.setRowData(rows, true, firstId);
        // see if we hit the last row
        if (!this.lastPageFound && lastRowIndex >= 0) {
            this.lastPageFound = true;
            this.rowCount = lastRowIndex;
            this.calculateTotalPages();

            // if overshot pages, go back
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages - 1;
                this.loadPage();
            }
        }

        this.eventService.dispatchEvent(Events.DEPRECATED_EVENT_PAGINATION_PAGE_LOADED);
        this.eventService.dispatchEvent(Events.EVENT_PAGINATION_CHANGED);
    }

    private loadPage() {
        var startRow = this.currentPage * this.pageSize;
        var endRow = (this.currentPage + 1) * this.pageSize;

        this.callVersion++;
        var callVersionCopy = this.callVersion;
        var that = this;
        this.gridPanel.showLoadingOverlay();

        var sortModel: any;
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sortModel = this.sortController.getSortModel();
        }

        var filterModel: any;
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            filterModel = this.filterManager.getFilterModel();
        }

        var params = {
            startRow: startRow,
            endRow: endRow,
            successCallback: successCallback,
            failCallback: failCallback,
            sortModel: sortModel,
            filterModel: filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

        // check if old version of datasource used
        var getRowsParams = _.getFunctionParameters(this.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }

        // put in timeout, to force result to be async
        setTimeout( ()=> {
            this.datasource.getRows(params);
        }, 0);

        this.eventService.dispatchEvent(Events.DEPRECATED_EVENT_PAGINATION_PAGE_REQUESTED);
        this.eventService.dispatchEvent(Events.EVENT_PAGINATION_CHANGED);

        function successCallback(rows: any, lastRowIndex: any) {
            if (that.isCallDaemon(callVersionCopy)) {
                return;
            }
            that.pageLoaded(rows, lastRowIndex);
        }

        function failCallback() {
            if (that.isCallDaemon(callVersionCopy)) {
                return;
            }
            // set in an empty set of rows, this will at
            // least get rid of the loading panel, and
            // stop blocking things
            that.inMemoryRowModel.setRowData([], true);
        }
    }

    private isCallDaemon(versionCopy: any) {
        return versionCopy !== this.callVersion;
    }

}
