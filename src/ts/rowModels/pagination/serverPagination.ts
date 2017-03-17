import {Bean, Autowired, PostConstruct} from "../../context/context";
import {BeanStub} from "../../context/beanStub";
import {PaginationStrategy} from "./paginationService";
import {IDatasource} from "../iDatasource";
import {_} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {IRowModel} from "../../interfaces/iRowModel";
import {GridPanel} from "../../gridPanel/gridPanel";
import {SortController} from "../../sortController";
import {FilterManager} from "../../filter/filterManager";
import {IInMemoryRowModel} from "../../interfaces/iInMemoryRowModel";

@Bean('serverPaginationStrategy')
export class ServerPaginationStrategy extends BeanStub implements PaginationStrategy {
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

    onSortOrFilterPage(currentPage:number, pageSize:number, doneCb:()=>void): void {
        this.onLoadPage(currentPage, pageSize, doneCb);
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
