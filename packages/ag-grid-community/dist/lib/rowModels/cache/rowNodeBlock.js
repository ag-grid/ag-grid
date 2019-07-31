/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils");
var rowNode_1 = require("../../entities/rowNode");
var beanStub_1 = require("../../context/beanStub");
var RowNodeBlock = /** @class */ (function (_super) {
    __extends(RowNodeBlock, _super);
    function RowNodeBlock(blockNumber, rowNodeCacheParams) {
        var _this = _super.call(this) || this;
        _this.version = 0;
        _this.state = RowNodeBlock.STATE_DIRTY;
        _this.rowNodeCacheParams = rowNodeCacheParams;
        _this.blockNumber = blockNumber;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        _this.startRow = blockNumber * rowNodeCacheParams.blockSize;
        _this.endRow = _this.startRow + rowNodeCacheParams.blockSize;
        return _this;
    }
    RowNodeBlock.prototype.isAnyNodeOpen = function (rowCount) {
        var result = false;
        this.forEachNodeCallback(function (rowNode) {
            if (rowNode.expanded) {
                result = true;
            }
        }, rowCount);
        return result;
    };
    RowNodeBlock.prototype.forEachNodeCallback = function (callback, rowCount) {
        for (var rowIndex = this.startRow; rowIndex < this.endRow; rowIndex++) {
            // we check against rowCount as this page may be the last one, and if it is, then
            // the last rows are not part of the set
            if (rowIndex < rowCount) {
                var rowNode = this.getRowUsingLocalIndex(rowIndex);
                callback(rowNode, rowIndex);
            }
        }
    };
    RowNodeBlock.prototype.forEachNode = function (callback, sequence, rowCount, deep) {
        this.forEachNodeCallback(function (rowNode) {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (deep && rowNode.childrenCache) {
                rowNode.childrenCache.forEachNodeDeep(callback, sequence);
            }
        }, rowCount);
    };
    RowNodeBlock.prototype.forEachNodeDeep = function (callback, sequence, rowCount) {
        this.forEachNode(callback, sequence, rowCount, true);
    };
    RowNodeBlock.prototype.forEachNodeShallow = function (callback, sequence, rowCount) {
        this.forEachNode(callback, sequence, rowCount, false);
    };
    RowNodeBlock.prototype.getVersion = function () {
        return this.version;
    };
    RowNodeBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    RowNodeBlock.prototype.getRowUsingLocalIndex = function (rowIndex, dontTouchLastAccessed) {
        if (dontTouchLastAccessed === void 0) { dontTouchLastAccessed = false; }
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.rowNodeCacheParams.lastAccessedSequence.next();
        }
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
    RowNodeBlock.prototype.getBlockNumber = function () {
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
    };
    RowNodeBlock.prototype.setBlankRowNode = function (rowIndex) {
        var localIndex = rowIndex - this.startRow;
        var newRowNode = this.createBlankRowNode(rowIndex);
        this.rowNodes[localIndex] = newRowNode;
        return newRowNode;
    };
    RowNodeBlock.prototype.setNewData = function (rowIndex, dataItem) {
        var newRowNode = this.setBlankRowNode(rowIndex);
        this.setDataAndId(newRowNode, dataItem, this.startRow + rowIndex);
        return newRowNode;
    };
    RowNodeBlock.prototype.createBlankRowNode = function (rowIndex) {
        var rowNode = new rowNode_1.RowNode();
        this.beans.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowNodeCacheParams.rowHeight);
        return rowNode;
    };
    // creates empty row nodes, data is missing as not loaded yet
    RowNodeBlock.prototype.createRowNodes = function () {
        this.rowNodes = [];
        for (var i = 0; i < this.rowNodeCacheParams.blockSize; i++) {
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
        var event = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: false,
            page: this,
            lastRow: null
        };
        this.dispatchEvent(event);
    };
    RowNodeBlock.prototype.populateWithRowData = function (rows) {
        var _this = this;
        var rowNodesToRefresh = [];
        this.rowNodes.forEach(function (rowNode, index) {
            var data = rows[index];
            if (rowNode.stub) {
                rowNodesToRefresh.push(rowNode);
            }
            _this.setDataAndId(rowNode, data, _this.startRow + index);
        });
        if (rowNodesToRefresh.length > 0) {
            this.beans.rowRenderer.redrawRows(rowNodesToRefresh);
        }
    };
    RowNodeBlock.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.rowNodes.forEach(function (rowNode) {
            if (rowNode.childrenCache) {
                rowNode.childrenCache.destroy();
                rowNode.childrenCache = null;
            }
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown. maybe
            // rowNode should have a flag on whether it is visible???
            rowNode.clearRowTop();
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
        lastRow = utils_1._.cleanNumber(lastRow);
        // check here if lastRow should be set
        var event = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: true,
            page: this,
            lastRow: lastRow
        };
        this.dispatchEvent(event);
    };
    RowNodeBlock.EVENT_LOAD_COMPLETE = 'loadComplete';
    RowNodeBlock.STATE_DIRTY = 'dirty';
    RowNodeBlock.STATE_LOADING = 'loading';
    RowNodeBlock.STATE_LOADED = 'loaded';
    RowNodeBlock.STATE_FAILED = 'failed';
    return RowNodeBlock;
}(beanStub_1.BeanStub));
exports.RowNodeBlock = RowNodeBlock;
