/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.7
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require('../utils');
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("../context/context");
var gridPanel_1 = require("../gridPanel/gridPanel");
var selectionController_1 = require("../selectionController");
var context_2 = require("../context/context");
var sortController_1 = require("../sortController");
var context_3 = require("../context/context");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var filterManager_1 = require("../filter/filterManager");
var constants_1 = require("../constants");
var template = '<div class="ag-paging-panel ag-font-style">' +
    '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">' +
    '<span id="firstRowOnPage"></span>' +
    ' [TO] ' +
    '<span id="lastRowOnPage"></span>' +
    ' [OF] ' +
    '<span id="recordCount"></span>' +
    '</span>' +
    '<span class="ag-paging-page-summary-panel">' +
    '<button type="button" class="ag-paging-button" id="btFirst">[FIRST]</button>' +
    '<button type="button" class="ag-paging-button" id="btPrevious">[PREVIOUS]</button>' +
    '[PAGE] ' +
    '<span id="current"></span>' +
    ' [OF] ' +
    '<span id="total"></span>' +
    '<button type="button" class="ag-paging-button" id="btNext">[NEXT]</button>' +
    '<button type="button" class="ag-paging-button" id="btLast">[LAST]</button>' +
    '</span>' +
    '</div>';
var PaginationController = (function () {
    function PaginationController() {
    }
    PaginationController.prototype.init = function () {
        var _this = this;
        // if we are doing pagination, we are guaranteed that the model type
        // is normal. if it is not, then this paginationController service
        // will never be called.
        if (this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_NORMAL) {
            this.inMemoryRowModel = this.rowModel;
        }
        this.setupComponents();
        this.callVersion = 0;
        var paginationEnabled = this.gridOptionsWrapper.isRowModelPagination();
        this.eventService.addEventListener(events_1.Events.EVENT_FILTER_CHANGED, function () {
            if (paginationEnabled && _this.gridOptionsWrapper.isEnableServerSideFilter()) {
                _this.reset();
            }
        });
        this.eventService.addEventListener(events_1.Events.EVENT_SORT_CHANGED, function () {
            if (paginationEnabled && _this.gridOptionsWrapper.isEnableServerSideSorting()) {
                _this.reset();
            }
        });
        if (paginationEnabled && this.gridOptionsWrapper.getDatasource()) {
            this.setDatasource(this.gridOptionsWrapper.getDatasource());
        }
    };
    PaginationController.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;
        if (!datasource) {
            // only continue if we have a valid datasource to work with
            return;
        }
        this.reset();
    };
    PaginationController.prototype.reset = function () {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (utils_1.Utils.missing(this.datasource)) {
            return;
        }
        this.selectionController.reset();
        // copy pageSize, to guard against it changing the the datasource between calls
        if (this.datasource.pageSize && typeof this.datasource.pageSize !== 'number') {
            console.warn('datasource.pageSize should be a number');
        }
        this.pageSize = this.datasource.pageSize;
        // see if we know the total number of pages, or if it's 'to be decided'
        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
            this.rowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
            this.calculateTotalPages();
        }
        else {
            this.rowCount = 0;
            this.foundMaxRow = false;
            this.totalPages = null;
        }
        this.currentPage = 0;
        // hide the summary panel until something is loaded
        this.ePageRowSummaryPanel.style.visibility = 'hidden';
        this.setTotalLabels();
        this.loadPage();
    };
    // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE
    PaginationController.prototype.myToLocaleString = function (input) {
        if (typeof input !== 'number') {
            return '';
        }
        else {
            // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
            return input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
    };
    PaginationController.prototype.setTotalLabels = function () {
        if (this.foundMaxRow) {
            this.lbTotal.innerHTML = this.myToLocaleString(this.totalPages);
            this.lbRecordCount.innerHTML = this.myToLocaleString(this.rowCount);
        }
        else {
            var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    };
    PaginationController.prototype.calculateTotalPages = function () {
        this.totalPages = Math.floor((this.rowCount - 1) / this.pageSize) + 1;
    };
    PaginationController.prototype.pageLoaded = function (rows, lastRowIndex) {
        var firstId = this.currentPage * this.pageSize;
        this.inMemoryRowModel.setRowData(rows, true, firstId);
        // see if we hit the last row
        if (!this.foundMaxRow && typeof lastRowIndex === 'number' && lastRowIndex >= 0) {
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
    };
    PaginationController.prototype.updateRowLabels = function () {
        var startRow;
        var endRow;
        if (this.isZeroPagesToDisplay()) {
            startRow = 0;
            endRow = 0;
        }
        else {
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
    };
    PaginationController.prototype.loadPage = function () {
        var _this = this;
        this.enableOrDisableButtons();
        var startRow = this.currentPage * this.datasource.pageSize;
        var endRow = (this.currentPage + 1) * this.datasource.pageSize;
        this.lbCurrent.innerHTML = this.myToLocaleString(this.currentPage + 1);
        this.callVersion++;
        var callVersionCopy = this.callVersion;
        var that = this;
        this.gridPanel.showLoadingOverlay();
        var sortModel;
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sortModel = this.sortController.getSortModel();
        }
        var filterModel;
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
        var getRowsParams = utils_1.Utils.getFunctionParameters(this.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }
        // put in timeout, to force result to be async
        setTimeout(function () {
            _this.datasource.getRows(params);
        }, 0);
        function successCallback(rows, lastRowIndex) {
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
    };
    PaginationController.prototype.isCallDaemon = function (versionCopy) {
        return versionCopy !== this.callVersion;
    };
    PaginationController.prototype.onBtNext = function () {
        this.currentPage++;
        this.loadPage();
    };
    PaginationController.prototype.onBtPrevious = function () {
        this.currentPage--;
        this.loadPage();
    };
    PaginationController.prototype.onBtFirst = function () {
        this.currentPage = 0;
        this.loadPage();
    };
    PaginationController.prototype.onBtLast = function () {
        this.currentPage = this.totalPages - 1;
        this.loadPage();
    };
    PaginationController.prototype.isZeroPagesToDisplay = function () {
        return this.foundMaxRow && this.totalPages === 0;
    };
    PaginationController.prototype.enableOrDisableButtons = function () {
        var disablePreviousAndFirst = this.currentPage === 0;
        this.btPrevious.disabled = disablePreviousAndFirst;
        this.btFirst.disabled = disablePreviousAndFirst;
        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
        var onLastPage = this.foundMaxRow && this.currentPage === (this.totalPages - 1);
        var disableNext = onLastPage || zeroPagesToDisplay;
        this.btNext.disabled = disableNext;
        var disableLast = !this.foundMaxRow || zeroPagesToDisplay || this.currentPage === (this.totalPages - 1);
        this.btLast.disabled = disableLast;
    };
    PaginationController.prototype.createTemplate = function () {
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
    };
    PaginationController.prototype.getGui = function () {
        return this.eGui;
    };
    PaginationController.prototype.setupComponents = function () {
        this.eGui = utils_1.Utils.loadTemplate(this.createTemplate());
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
    };
    __decorate([
        context_2.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], PaginationController.prototype, "filterManager", void 0);
    __decorate([
        context_2.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], PaginationController.prototype, "gridPanel", void 0);
    __decorate([
        context_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], PaginationController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('selectionController'), 
        __metadata('design:type', selectionController_1.SelectionController)
    ], PaginationController.prototype, "selectionController", void 0);
    __decorate([
        context_2.Autowired('sortController'), 
        __metadata('design:type', sortController_1.SortController)
    ], PaginationController.prototype, "sortController", void 0);
    __decorate([
        context_2.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], PaginationController.prototype, "eventService", void 0);
    __decorate([
        context_2.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], PaginationController.prototype, "rowModel", void 0);
    __decorate([
        context_3.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], PaginationController.prototype, "init", null);
    PaginationController = __decorate([
        context_1.Bean('paginationController'), 
        __metadata('design:paramtypes', [])
    ], PaginationController);
    return PaginationController;
})();
exports.PaginationController = PaginationController;
