/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var RowNodeBlock = (function () {
    function RowNodeBlock(blockNumber, rowNodeCacheParams) {
        this.version = 0;
        this.state = RowNodeBlock.STATE_DIRTY;
        this.localEventService = new eventService_1.EventService();
        this.rowNodeCacheParams = rowNodeCacheParams;
        this.blockNumber = blockNumber;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * rowNodeCacheParams.pageSize;
        this.endRow = this.startRow + rowNodeCacheParams.pageSize;
    }
    RowNodeBlock.prototype.addEventListener = function (eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    };
    RowNodeBlock.prototype.removeEventListener = function (eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    };
    RowNodeBlock.prototype.getVersion = function () {
        return this.version;
    };
    RowNodeBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    RowNodeBlock.prototype.getRow = function (rowIndex) {
        this.lastAccessed = this.rowNodeCacheParams.lastAccessedSequence.next();
        var localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    };
    RowNodeBlock.prototype.init = function (beans) {
        this.beans = beans;
        this.createRowNodes();
    };
    RowNodeBlock.prototype.getStartRow = function () {
        return this.startRow;
    };
    RowNodeBlock.prototype.getEndRow = function () {
        return this.endRow;
    };
    RowNodeBlock.prototype.getPageNumber = function () {
        return this.blockNumber;
    };
    RowNodeBlock.prototype.setDirty = function () {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_DIRTY;
    };
    RowNodeBlock.prototype.setDirtyAndPurge = function () {
        this.setDirty();
        this.rowNodes.forEach(function (rowNode) {
            rowNode.setData(null);
        });
    };
    RowNodeBlock.prototype.getState = function () {
        return this.state;
    };
    RowNodeBlock.prototype.setRowNode = function (rowIndex, rowNode) {
        var localIndex = rowIndex - this.startRow;
        this.rowNodes[localIndex] = rowNode;
        rowNode.setRowIndex(rowIndex);
        this.setTopOnRowNode(rowNode, rowIndex);
    };
    RowNodeBlock.prototype.setBlankRowNode = function (rowIndex) {
        var localIndex = rowIndex - this.startRow;
        var newRowNode = this.createBlankRowNode(rowIndex);
        this.rowNodes[localIndex] = newRowNode;
        return newRowNode;
    };
    RowNodeBlock.prototype.setNewData = function (rowIndex, dataItem) {
        var newRowNode = this.setBlankRowNode(rowIndex);
        newRowNode.setDataAndId(dataItem, rowIndex.toString());
        return newRowNode;
    };
    RowNodeBlock.prototype.createBlankRowNode = function (rowIndex) {
        var rowNode = new rowNode_1.RowNode();
        this.beans.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowNodeCacheParams.rowHeight);
        rowNode.setRowIndex(rowIndex);
        this.setTopOnRowNode(rowNode, rowIndex);
        return rowNode;
    };
    // creates empty row nodes, data is missing as not loaded yet
    RowNodeBlock.prototype.createRowNodes = function () {
        this.rowNodes = [];
        for (var i = 0; i < this.rowNodeCacheParams.pageSize; i++) {
            var rowIndex = this.startRow + i;
            var rowNode = this.createBlankRowNode(rowIndex);
            this.rowNodes.push(rowNode);
        }
    };
    RowNodeBlock.prototype.load = function () {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    };
    RowNodeBlock.prototype.pageLoadFailed = function () {
        this.state = RowNodeBlock.STATE_FAILED;
        var event = { success: true, page: this };
        this.localEventService.dispatchEvent(RowNodeBlock.EVENT_LOAD_COMPLETE, event);
    };
    RowNodeBlock.prototype.populateWithRowData = function (rows) {
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
    RowNodeBlock.prototype.pageLoaded = function (version, rows, lastRow) {
        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version === this.version) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.populateWithRowData(rows);
        }
        lastRow = utils_1.Utils.cleanNumber(lastRow);
        // check here if lastrow should be set
        var event = { success: true, page: this, lastRow: lastRow };
        this.localEventService.dispatchEvent(RowNodeBlock.EVENT_LOAD_COMPLETE, event);
    };
    return RowNodeBlock;
}());
RowNodeBlock.EVENT_LOAD_COMPLETE = 'loadComplete';
RowNodeBlock.STATE_DIRTY = 'dirty';
RowNodeBlock.STATE_LOADING = 'loading';
RowNodeBlock.STATE_LOADED = 'loaded';
RowNodeBlock.STATE_FAILED = 'failed';
exports.RowNodeBlock = RowNodeBlock;
var InfiniteBlock = (function (_super) {
    __extends(InfiniteBlock, _super);
    function InfiniteBlock(pageNumber, cacheSettings) {
        var _this = _super.call(this, pageNumber, cacheSettings) || this;
        _this.cacheParams = cacheSettings;
        return _this;
    }
    InfiniteBlock.prototype.init = function () {
        _super.prototype.init.call(this, {
            context: this.context
        });
    };
    InfiniteBlock.prototype.setTopOnRowNode = function (rowNode, rowIndex) {
        rowNode.rowTop = this.cacheParams.rowHeight * rowIndex;
    };
    InfiniteBlock.prototype.loadFromDatasource = function () {
        var _this = this;
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        var params = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
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
    return InfiniteBlock;
}(RowNodeBlock));
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], InfiniteBlock.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], InfiniteBlock.prototype, "context", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InfiniteBlock.prototype, "init", null);
exports.InfiniteBlock = InfiniteBlock;
