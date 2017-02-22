import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Bean, Autowired, PostConstruct} from "../context/context";
import {GridPanel} from "../gridPanel/gridPanel";
import {SelectionController} from "../selectionController";
import {IRowModel} from "./../interfaces/iRowModel";
import {SortController} from "../sortController";
import {EventService} from "../eventService";
import {Events} from "../events";
import {FilterManager} from "../filter/filterManager";
import {IInMemoryRowModel} from "../interfaces/iInMemoryRowModel";
import {Constants} from "../constants";
import {IDatasource} from "./iDatasource";

var template =
        '<div class="ag-paging-panel ag-font-style">'+
            '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">'+
                '<span id="firstRowOnPage"></span>'+
                ' [TO] '+
                '<span id="lastRowOnPage"></span>'+
                ' [OF] '+
                '<span id="recordCount"></span>'+
            '</span>'+
            '<span class="ag-paging-page-summary-panel">'+
                '<button type="button" class="ag-paging-button" id="btFirst">[FIRST]</button>'+
                '<button type="button" class="ag-paging-button" id="btPrevious">[PREVIOUS]</button>'+
                '[PAGE] '+
                '<span id="current"></span>'+
                ' [OF] '+
                '<span id="total"></span>'+
                '<button type="button" class="ag-paging-button" id="btNext">[NEXT]</button>'+
                '<button type="button" class="ag-paging-button" id="btLast">[LAST]</button>'+
            '</span>'+
        '</div>';

@Bean('paginationController')
export class PaginationController {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('eventService') private eventService: EventService;

    // we wire up rowModel, but cast to inMemoryRowModel before using it
    @Autowired('rowModel') private rowModel: IRowModel;
    private inMemoryRowModel: IInMemoryRowModel;

    private eGui: any;
    private btNext: any;
    private btPrevious: any;
    private btFirst: any;
    private btLast: any;
    private lbCurrent: any;
    private lbTotal: any;

    private lbRecordCount: any;
    private lbFirstRowOnPage: any;
    private lbLastRowOnPage: any;
    private ePageRowSummaryPanel: any;

    private callVersion: number;
    private datasource: IDatasource;
    private pageSize: number;
    private rowCount: number;
    private foundMaxRow: boolean;
    private totalPages: number;
    private currentPage: number;

    @PostConstruct
    public init() {

        // if we are doing pagination, we are guaranteed that the model type
        // is normal. if it is not, then this paginationController service
        // will never be called.
        if (this.rowModel.getType()===Constants.ROW_MODEL_TYPE_NORMAL) {
            this.inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
        }

        this.setupComponents();
        this.callVersion = 0;
        var paginationEnabled = this.gridOptionsWrapper.isRowModelPagination();

        this.eventService.addEventListener(Events.EVENT_FILTER_CHANGED, ()=> {
            if (paginationEnabled && this.gridOptionsWrapper.isEnableServerSideFilter()) {
                this.reset(false);
            }
        });

        this.eventService.addEventListener(Events.EVENT_SORT_CHANGED, ()=> {
            if (paginationEnabled && this.gridOptionsWrapper.isEnableServerSideSorting()) {
                this.reset(false);
            }
        });

        if (paginationEnabled && this.gridOptionsWrapper.getDatasource()) {
            this.setDatasource(this.gridOptionsWrapper.getDatasource());
        }
    }

    public setDatasource(datasource: any) {
        this.datasource = datasource;

        if (!datasource) {
            // only continue if we have a valid datasource to work with
            return;
        }

        this.reset(true);
    }

    private checkForDeprecated(): void {
        var ds = <any> this.datasource;
        if (_.exists(ds.pageSize)) {
            console.error('ag-Grid: since version 5.1.x, pageSize is replaced with grid property paginationPageSize');
        }
    }

    private reset(freshDatasource: boolean) {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (_.missing(this.datasource)) {
            return;
        }

        this.checkForDeprecated();

        // if user is providing id's, then this means we can keep the selection between datsource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done. if it's a new datasource, then always clear the selection.
        var userGeneratingRows = _.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        var resetSelectionController = freshDatasource || !userGeneratingRows;
        if (resetSelectionController) {
            this.selectionController.reset();
        }

        // copy pageSize, to guard against it changing the the datasource between calls
        this.pageSize = this.gridOptionsWrapper.getPaginationPageSize();
        if ( !(this.pageSize>=1) ) {
            this.pageSize = 100;
        }

        // see if we know the total number of pages, or if it's 'to be decided'
        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
            this.rowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
            this.calculateTotalPages();
        } else {
            this.rowCount = 0;
            this.foundMaxRow = false;
            this.totalPages = null;
        }

        this.currentPage = 0;

        // hide the summary panel until something is loaded
        this.ePageRowSummaryPanel.style.visibility = 'hidden';

        this.setTotalLabels();
        this.loadPage();
    }

    // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE
    private myToLocaleString(input: number): string {
        if (typeof input !== 'number') {
            return '';
        } else {
            // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
            return input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
    }

    private setTotalLabels() {
        if (this.foundMaxRow) {
            this.lbTotal.innerHTML = this.myToLocaleString(this.totalPages);
            this.lbRecordCount.innerHTML = this.myToLocaleString(this.rowCount);
        } else {
            var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
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
        if (!this.foundMaxRow && lastRowIndex >= 0) {
            this.foundMaxRow = true;
            this.rowCount = lastRowIndex;
            this.calculateTotalPages();
            this.setTotalLabels();

            // if overshot pages, go back
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages - 1;
                this.loadPage();
            }
        }
        this.enableOrDisableButtons();
        this.updateRowLabels();
    }

    private updateRowLabels() {
        var startRow: any;
        var endRow: any;
        if (this.isZeroPagesToDisplay()) {
            startRow = 0;
            endRow = 0;
        } else {
            startRow = (this.pageSize * this.currentPage) + 1;
            endRow = startRow + this.pageSize - 1;
            if (this.foundMaxRow && endRow > this.rowCount) {
                endRow = this.rowCount;
            }
        }
        this.lbFirstRowOnPage.innerHTML = this.myToLocaleString(startRow);
        this.lbLastRowOnPage.innerHTML = this.myToLocaleString(endRow);

        // show the summary panel, when first shown, this is blank
        this.ePageRowSummaryPanel.style.visibility = "";
    }

    private loadPage() {
        this.enableOrDisableButtons();
        var startRow = this.currentPage * this.pageSize;
        var endRow = (this.currentPage + 1) * this.pageSize;

        this.lbCurrent.innerHTML = this.myToLocaleString(this.currentPage + 1);

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

    private onBtNext() {
        this.currentPage++;
        this.loadPage();
    }

    private onBtPrevious() {
        this.currentPage--;
        this.loadPage();
    }

    private onBtFirst() {
        this.currentPage = 0;
        this.loadPage();
    }

    private onBtLast() {
        this.currentPage = this.totalPages - 1;
        this.loadPage();
    }

    private isZeroPagesToDisplay() {
        return this.foundMaxRow && this.totalPages === 0;
    }

    private enableOrDisableButtons() {
        var disablePreviousAndFirst = this.currentPage === 0;
        this.btPrevious.disabled = disablePreviousAndFirst;
        this.btFirst.disabled = disablePreviousAndFirst;

        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
        var onLastPage = this.foundMaxRow && this.currentPage === (this.totalPages - 1);

        var disableNext = onLastPage || zeroPagesToDisplay;
        this.btNext.disabled = disableNext;

        var disableLast = !this.foundMaxRow || zeroPagesToDisplay || this.currentPage === (this.totalPages - 1);
        this.btLast.disabled = disableLast;
    }

    private createTemplate() {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        return template
            .replace('[PAGE]', localeTextFunc('page', 'Page'))
            .replace('[TO]', localeTextFunc('to', 'to'))
            .replace('[OF]', localeTextFunc('of', 'of'))
            .replace('[OF]', localeTextFunc('of', 'of'))
            .replace('[FIRST]', localeTextFunc('first', 'First'))
            .replace('[PREVIOUS]', localeTextFunc('previous', 'Previous'))
            .replace('[NEXT]', localeTextFunc('next', 'Next'))
            .replace('[LAST]', localeTextFunc('last', 'Last'));
    }

    public getGui() {
        return this.eGui;
    }

    private setupComponents() {

        this.eGui = _.loadTemplate(this.createTemplate());

        this.btNext = this.eGui.querySelector('#btNext');
        this.btPrevious = this.eGui.querySelector('#btPrevious');
        this.btFirst = this.eGui.querySelector('#btFirst');
        this.btLast = this.eGui.querySelector('#btLast');
        this.lbCurrent = this.eGui.querySelector('#current');
        this.lbTotal = this.eGui.querySelector('#total');

        this.lbRecordCount = this.eGui.querySelector('#recordCount');
        this.lbFirstRowOnPage = this.eGui.querySelector('#firstRowOnPage');
        this.lbLastRowOnPage = this.eGui.querySelector('#lastRowOnPage');
        this.ePageRowSummaryPanel = this.eGui.querySelector('#pageRowSummaryPanel');

        var that = this;

        this.btNext.addEventListener('click', function () {
            that.onBtNext();
        });

        this.btPrevious.addEventListener('click', function () {
            that.onBtPrevious();
        });

        this.btFirst.addEventListener('click', function () {
            that.onBtFirst();
        });

        this.btLast.addEventListener('click', function () {
            that.onBtLast();
        });
    }
}
