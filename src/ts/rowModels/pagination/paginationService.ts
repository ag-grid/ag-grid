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
import {IDatasource} from "./../iDatasource";
import {BeanStub} from "../../context/beanStub";
import {InMemoryPaginationDef, PaginationModel} from "../inMemory/inMemoryRowModel";
import {Constants} from "../../constants";

export enum PaginationType {
    CLIENT, SERVER, NONE
}

export interface PaginationStrategy {
    isReady ():boolean;

    onLoadPage (currentPage:number, pageSize:number, doneCb:()=>void):void;

    rowCount ():number;
}

@Bean('serverPaginationStrategy')
export class ServerPaginationStrategy implements PaginationStrategy {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    // we wire up rowModel, but cast to inMemoryRowModel before using it
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('filterManager') private filterManager: FilterManager;
    private inMemoryRowModel: IInMemoryRowModel;

    private callVersion = 0;
    private datasource: IDatasource;

    @PostConstruct
    public init() {
        // if we are doing pagination, we are guaranteed that the model type
        // is normal. if it is not, then this paginationController service
        // will never be called.
        this.inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
    }

    public setDatasource(datasource: IDatasource) {
        this.datasource = datasource;

        if (datasource) {
            this.checkForDeprecated();
        }
    }

    rowCount(): number {
        return this.datasource.rowCount;
    }

    isReady(): boolean {
        return _.missing(this.datasource);
    }

    onLoadPage(currentPage:number, pageSize:number, doneCb:()=>void): void {
        let startRow = currentPage * pageSize;
        let endRow = (currentPage + 1) * pageSize;

        this.callVersion++;
        let callVersionCopy = this.callVersion;
        let that = this;
        this.gridPanel.showLoadingOverlay();

        let sortModel: any;
        if (this.gridOptionsWrapper.isSortingProvided()) {
            sortModel = this.sortController.getSortModel();
        }

        let filterModel: any;
        if (this.gridOptionsWrapper.isFilterProvided()) {
            filterModel = this.filterManager.getFilterModel();
        }

        let params = {
            startRow: startRow,
            endRow: endRow,
            successCallback: successCallback,
            failCallback: failCallback,
            sortModel: sortModel,
            filterModel: filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

        // check if old version of datasource used
        let getRowsParams = _.getFunctionParameters(this.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }

        // put in timeout, to force result to be async
        setTimeout( ()=> {
            this.datasource.getRows(params);
        }, 0);



        function successCallback(rows: any) {
            if (that.isCallDaemon(callVersionCopy)) {
                return;
            }
            that.pageLoaded(currentPage, pageSize, rows, doneCb);
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


    private checkForDeprecated(): void {
        let ds = <any> this.datasource;
        if (_.exists(ds.pageSize)) {
            console.error('ag-Grid: since version 5.1.x, pageSize is replaced with grid property paginationPageSize');
        }
    }

    private isCallDaemon(versionCopy: any) {
        return versionCopy !== this.callVersion;
    }

    private pageLoaded(currentPage:number, pageSize:number, rows: any, doneCb:()=>void) {
        let firstId = currentPage * pageSize;
        this.inMemoryRowModel.setRowData(rows, true, firstId);
        doneCb();
    }
}

@Bean('inMemoryPaginationStrategy')
export class InMemoryPaginationStrategy implements PaginationStrategy {
    @Autowired('rowModel') private rowModel: IRowModel;
    private inMemoryRowModel: IInMemoryRowModel;
    private paginationModel:PaginationModel;

    @PostConstruct
    public init() {
        // if we are doing pagination, we are guaranteed that the model type
        // is normal. if it is not, then this paginationController service
        // will never be called.
        this.inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
    }

    isReady(): boolean {
        return true;
    }

    onLoadPage(currentPage: number, pageSize: number, doneCb: () => void): void {
        this.setPaginationDef({
            currentPage: currentPage,
            pageSize: pageSize
        });
        this.inMemoryRowModel.refreshModel({step: Constants.STEP_PAGINATION);
        doneCb();
    }

    rowCount(): number {
        return this.paginationModel.allRowsCount;
    }

    setPaginationDef(memoryPaginationDef: InMemoryPaginationDef) {
        this.paginationModel = this.inMemoryRowModel.paginate(memoryPaginationDef);
    }
}

@Bean('paginationService')
export class PaginationService extends BeanStub {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('serverPaginationStrategy') private serverPaginationStrategy: ServerPaginationStrategy;
    @Autowired('inMemoryPaginationStrategy') private inMemoryPaginationStrategy: InMemoryPaginationStrategy;
    private type:PaginationType = PaginationType.NONE;


    private pageSize: number;
    private rowCount: number;
    private lastPageFound: boolean;
    private totalPages: number;
    private currentPage: number;

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

    public getRowCount(): number {
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
            // max page is totalPages-1 IF we konw the last page
            this.currentPage = this.totalPages - 1;
        } else {
            // otherwise take page as is
            this.currentPage = page;
        }
        this.loadPage();
    }

    public activateInMemoryPagination (memoryPaginationDef:InMemoryPaginationDef){
        this.type = PaginationType.CLIENT;
        this.inMemoryPaginationStrategy.setPaginationDef (memoryPaginationDef);
        this.reset(true);
    }

    public activateServerPagination (dataSource:IDatasource){
        this.type = PaginationType.SERVER;
        this.serverPaginationStrategy.setDatasource(dataSource);
        this.reset(true);
    }

    @PostConstruct
    public init() {
        var paginationEnabled = this.gridOptionsWrapper.isRowModelAnyPagination();
        // if not doing pagination, then quite the setup
        if (!paginationEnabled) { return; }


        let addSortListener = ()=>{
            this.addDestroyableEventListener(
                this.eventService,
                Events.EVENT_SORT_CHANGED,
                this.reset.bind(this,false));
        };

        let addFilterListener = ()=>{
            this.addDestroyableEventListener(
                this.eventService,
                Events.EVENT_FILTER_CHANGED,
                this.reset.bind(this,false));
        };

        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            addSortListener();
        }

        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            addFilterListener();
        }
    }

    public setPageSize (pageSize:number):void{
        this.gridOptionsWrapper.setProperty('paginationPageSize', pageSize);
        this.pageSize = pageSize;
        this.reset (true);
    }

    private reset(freshDatasource: boolean) {
        if (!this.assertPaginating().isReady()) return;

        // if user is providing id's, then this means we can keep the selection between datsource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done. if it's a new datasource, then always clear the selection.
        let userGeneratingRows = _.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        let resetSelectionController = freshDatasource || !userGeneratingRows;
        if (resetSelectionController) {
            this.selectionController.reset();
        }

        // copy pageSize, to guard against it changing the the datasource between calls
        this.pageSize = this.gridOptionsWrapper.getPaginationPageSize();
        if ( !(this.pageSize>=1) ) {
            this.pageSize = 100;
        }

        this.updateCounts();
        this.resetCurrentPage();

        this.eventService.dispatchEvent(Events.EVENT_PAGINATION_RESET);

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



    private updateCounts() {
        this.rowCount = this.assertPaginating().rowCount();
        this.lastPageFound = this.rowCount !== null;
        if (!this.lastPageFound){
            this.totalPages = null;
        } else {
            this.calculateTotalPages();
        }
    }

    private loadPage() {
        this.assertPaginating().onLoadPage(this.currentPage, this.pageSize, ()=>{
            this.updateCounts();
            this.eventService.dispatchEvent(Events.EVENT_PAGINATION_PAGE_LOADED);
        });
        this.eventService.dispatchEvent(Events.EVENT_PAGINATION_PAGE_REQUESTED);
    }

    private assertPaginating ():PaginationStrategy{
        if (this.type == PaginationType.NONE){
            console.error(`Pagination can't be performed. The pagination has not been set.`);
        }

        return this.type === PaginationType.CLIENT ? this.inMemoryPaginationStrategy : this.serverPaginationStrategy;
    }

}
