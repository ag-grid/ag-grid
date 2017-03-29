/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var rowNode_1 = require("../../entities/rowNode");
var context_1 = require("../../context/context");
var eventService_1 = require("../../eventService");
var InfinitePage = (function () {
    function InfinitePage(pageNumber, cacheSettings) {
        this.state = InfinitePage.STATE_DIRTY;
        this.version = 0;
        this.localEventService = new eventService_1.EventService();
        this.pageNumber = pageNumber;
        this.cacheParams = cacheSettings;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = pageNumber * cacheSettings.pageSize;
        this.endRow = this.startRow + cacheSettings.pageSize;
    }
    InfinitePage.prototype.setDirty = function () {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = InfinitePage.STATE_DIRTY;
    };
    InfinitePage.prototype.setDirtyAndPurge = function () {
        this.setDirty();
        this.rowNodes.forEach(function (rowNode) {
            rowNode.setData(null);
        });
    };
    InfinitePage.prototype.getStartRow = function () {
        return this.startRow;
    };
    InfinitePage.prototype.getEndRow = function () {
        return this.endRow;
    };
    InfinitePage.prototype.getPageNumber = function () {
        return this.pageNumber;
    };
    InfinitePage.prototype.addEventListener = function (eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    };
    InfinitePage.prototype.removeEventListener = function (eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    };
    InfinitePage.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    InfinitePage.prototype.getState = function () {
        return this.state;
    };
    InfinitePage.prototype.setRowNode = function (rowIndex, rowNode) {
        var localIndex = rowIndex - this.startRow;
        this.rowNodes[localIndex] = rowNode;
        rowNode.setRowIndex(rowIndex);
        this.setTopOnRowNode(rowNode, rowIndex);
    };
    InfinitePage.prototype.setBlankRowNode = function (rowIndex) {
        var localIndex = rowIndex - this.startRow;
        var newRowNode = this.createBlankRowNode(rowIndex);
        this.rowNodes[localIndex] = newRowNode;
        return newRowNode;
    };
    InfinitePage.prototype.setNewData = function (rowIndex, dataItem) {
        var newRowNode = this.setBlankRowNode(rowIndex);
        newRowNode.setDataAndId(dataItem, rowIndex.toString());
        return newRowNode;
    };
    InfinitePage.prototype.init = function () {
        this.createRowNodes();
    };
    // creates empty row nodes, data is missing as not loaded yet
    InfinitePage.prototype.createRowNodes = function () {
        this.rowNodes = [];
        for (var i = 0; i < this.cacheParams.pageSize; i++) {
            var rowIndex = this.startRow + i;
            var rowNode = this.createBlankRowNode(rowIndex);
            this.rowNodes.push(rowNode);
        }
    };
    InfinitePage.prototype.setTopOnRowNode = function (rowNode, rowIndex) {
        rowNode.rowTop = this.cacheParams.rowHeight * rowIndex;
    };
    InfinitePage.prototype.createBlankRowNode = function (rowIndex) {
        var rowNode = new rowNode_1.RowNode();
        this.context.wireBean(rowNode);
        rowNode.setRowHeight(this.cacheParams.rowHeight);
        rowNode.setRowIndex(rowIndex);
        this.setTopOnRowNode(rowNode, rowIndex);
        return rowNode;
    };
    InfinitePage.prototype.getRow = function (rowIndex) {
        this.lastAccessed = this.cacheParams.lastAccessedSequence.next();
        var localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    };
    InfinitePage.prototype.load = function () {
        var _this = this;
        this.state = InfinitePage.STATE_LOADING;
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        var params = {
            startRow: this.startRow,
            endRow: this.endRow,
            successCallback: this.pageLoaded.bind(this, this.version),
            failCallback: this.pageLoadFailed.bind(this),
            sortModel: this.cacheParams.sortModel,
            filterModel: this.cacheParams.filterModel,
            context: this.gridOptionsWrapper.getContext()
        };
        if (utils_1.Utils.missing(this.cacheParams.datasource.getRows)) {
            console.warn("ag-Grid: datasource is missing getRows method");
            return;
        }
        // check if old version of datasource used
        var getRowsParams = utils_1.Utils.getFunctionParameters(this.cacheParams.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }
        // put in timeout, to force result to be async
        setTimeout(function () {
            _this.cacheParams.datasource.getRows(params);
        }, 0);
    };
    InfinitePage.prototype.pageLoadFailed = function () {
        this.state = InfinitePage.STATE_FAILED;
        var event = { success: true, page: this };
        this.localEventService.dispatchEvent(InfinitePage.EVENT_LOAD_COMPLETE, event);
    };
    InfinitePage.prototype.populateWithRowData = function (rows) {
        var _this = this;
        this.rowNodes.forEach(function (rowNode, index) {
            var data = rows[index];
            if (utils_1.Utils.exists(data)) {
                // this means if the user is not providing id's we just use the
                // index for the row. this will allow selection to work (that is based
                // on index) as long user is not inserting or deleting rows,
                // or wanting to keep selection between server side sorting or filtering
                var indexOfRow = _this.startRow + index;
                rowNode.setDataAndId(data, indexOfRow.toString());
            }
            else {
                rowNode.setDataAndId(undefined, undefined);
            }
        });
    };
    InfinitePage.prototype.pageLoaded = function (version, rows, lastRow) {
        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version === this.version) {
            this.state = InfinitePage.STATE_LOADED;
            this.populateWithRowData(rows);
        }
        lastRow = utils_1.Utils.cleanNumber(lastRow);
        // check here if lastrow should be set
        var event = { success: true, page: this, lastRow: lastRow };
        this.localEventService.dispatchEvent(InfinitePage.EVENT_LOAD_COMPLETE, event);
    };
    return InfinitePage;
}());
InfinitePage.EVENT_LOAD_COMPLETE = 'loadComplete';
InfinitePage.STATE_DIRTY = 'dirty';
InfinitePage.STATE_LOADING = 'loading';
InfinitePage.STATE_LOADED = 'loaded';
InfinitePage.STATE_FAILED = 'failed';
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], InfinitePage.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], InfinitePage.prototype, "context", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InfinitePage.prototype, "init", null);
exports.InfinitePage = InfinitePage;
