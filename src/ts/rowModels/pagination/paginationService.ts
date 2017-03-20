import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Bean, Autowired, PostConstruct} from "../../context/context";
import {SelectionController} from "../../selectionController";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {IDatasource} from "../iDatasource";
import {BeanStub} from "../../context/beanStub";
import {PaginationDef} from "../inMemory/inMemoryRowModel";
import {ServerPaginationStrategy} from "./serverPagination";
import {ClientSidePaginationStrategy} from "./inMemoryPagination";

export interface PaginationStrategy {
    isReady ():boolean;

    onLoadPage (currentPage:number, pageSize:number, doneCb:()=>void):void;

    onSortOrFilterPage (currentPage:number, pageSize:number, doneCb:()=>void):void;

    rowCount ():number;
}



@Bean('paginationService')
export class PaginationService extends BeanStub {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('serverPaginationStrategy') private serverPaginationStrategy: ServerPaginationStrategy;
    @Autowired('clientSidePaginationStrategy') private clientSidePaginationStrategy: ClientSidePaginationStrategy;
    @Autowired('eventService') private eventService: EventService;


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

    @PostConstruct
    public init() {
        var paginationEnabled = this.gridOptionsWrapper.isRowModelAnyPagination();
        // if not doing pagination, then quite the setup
        if (!paginationEnabled) { return; }

        this.addDestroyableEventListener(
            this.eventService,
            Events.EVENT_SORT_CHANGED,
            ()=>{
                this.reset(false, Events.EVENT_SORT_CHANGED)
            });

        this.addDestroyableEventListener(
            this.eventService,
            Events.EVENT_FILTER_CHANGED,
            ()=>{
                this.reset(false, Events.EVENT_FILTER_CHANGED)
            });


        this.addDestroyableEventListener(
            this.eventService,
                Events.EVENT_MODEL_UPDATED,
                ()=>{
                    this.updateCounts();
                    if (this.getTotalPages()){
                        if (this.getCurrentPage() > this.getTotalPages()){
                            this.goToPage(this.getTotalPages() - 1);
                            return;
                        }
                    }
                    this.eventService.dispatchEvent(Events.EVENT_PAGINATION_PAGE_LOADED);
                }
        );

        if (this.gridOptionsWrapper.getDatasource()){
            this.activateServerPagination(this.gridOptionsWrapper.getDatasource());
        }

        if (this.gridOptionsWrapper.isRowModelClientPagination()){
            this.clientSidePaginationStrategy.setPaginationDef({
                pageSize: this.gridOptionsWrapper.getPaginationPageSize() || 100,
                currentPage: this.gridOptionsWrapper.getPaginationStartPage() || 0
            });
            this.reset(true);
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

    public activateServerPagination (dataSource:IDatasource){
        this.serverPaginationStrategy.setDatasource(dataSource);
        this.reset(true);
    }

    public updateCounts() {
        if (!this.gridOptionsWrapper.isRowModelAnyPagination()) return;

        this.rowCount = this.getPaginationStrategy().rowCount();
        this.lastPageFound = _.exists(this.rowCount);
        if (!this.lastPageFound){
            this.totalPages = null;
        } else {
            this.calculateTotalPages();
        }
    }

    private reset(freshDatasource: boolean, causedBy?:string) {
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

        this.loadPage(causedBy);
    }



    public setPageSize (pageSize:number):void{
        this.gridOptionsWrapper.setProperty('paginationPageSize', pageSize);
        this.pageSize = pageSize;
        this.reset (true);
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

    private loadPage(causedByEvent?:string) {
        let paginationStrategy = this.getPaginationStrategy();

        let doneCallback = ()=>{
            this.updateCounts();
            this.eventService.dispatchEvent(Events.EVENT_PAGINATION_PAGE_LOADED);
        };

        if (!causedByEvent) {
            paginationStrategy.onLoadPage(this.currentPage, this.pageSize, doneCallback);
        } else {
            paginationStrategy.onSortOrFilterPage(this.currentPage, this.pageSize, doneCallback);
        }

        this.eventService.dispatchEvent(Events.EVENT_PAGINATION_PAGE_REQUESTED);
    }

    private getPaginationStrategy ():PaginationStrategy{
        if (!this.gridOptionsWrapper.isRowModelAnyPagination()){
            console.error(`Pagination can't be performed. The pagination has not been set.`);
        }

        return this.gridOptionsWrapper.isRowModelClientPagination() ? this.clientSidePaginationStrategy : this.serverPaginationStrategy;
    }

}
