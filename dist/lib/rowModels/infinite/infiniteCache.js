/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var eventService_1 = require("../../eventService");
var events_1 = require("../../events");
var logger_1 = require("../../logger");
var infiniteBlock_1 = require("./infiniteBlock");
var rowNodeCache_1 = require("../cache/rowNodeCache");
var gridApi_1 = require("../../gridApi");
var columnApi_1 = require("../../columnController/columnApi");
var InfiniteCache = /** @class */ (function (_super) {
    __extends(InfiniteCache, _super);
    function InfiniteCache(params) {
        return _super.call(this, params) || this;
    }
    InfiniteCache.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('InfiniteCache');
    };
    InfiniteCache.prototype.init = function () {
        _super.prototype.init.call(this);
        // start load of data, as the virtualRowCount will remain at 0 otherwise,
        // so we need this to kick things off, otherwise grid would never call getRow()
        this.getRow(0);
    };
    InfiniteCache.prototype.moveItemsDown = function (block, moveFromIndex, moveCount) {
        var startRow = block.getStartRow();
        var endRow = block.getEndRow();
        var indexOfLastRowToMove = moveFromIndex + moveCount;
        // all rows need to be moved down below the insertion index
        for (var currentRowIndex = endRow - 1; currentRowIndex >= startRow; currentRowIndex--) {
            // don't move rows at or before the insertion index
            if (currentRowIndex < indexOfLastRowToMove) {
                continue;
            }
            var indexOfNodeWeWant = currentRowIndex - moveCount;
            var nodeForThisIndex = this.getRow(indexOfNodeWeWant, true);
            if (nodeForThisIndex) {
                block.setRowNode(currentRowIndex, nodeForThisIndex);
            }
            else {
                block.setBlankRowNode(currentRowIndex);
                block.setDirty();
            }
        }
    };
    InfiniteCache.prototype.insertItems = function (block, indexToInsert, items) {
        var pageStartRow = block.getStartRow();
        var pageEndRow = block.getEndRow();
        var newRowNodes = [];
        // next stage is insert the rows into this page, if applicable
        for (var index = 0; index < items.length; index++) {
            var rowIndex = indexToInsert + index;
            var currentRowInThisPage = rowIndex >= pageStartRow && rowIndex < pageEndRow;
            if (currentRowInThisPage) {
                var dataItem = items[index];
                var newRowNode = block.setNewData(rowIndex, dataItem);
                newRowNodes.push(newRowNode);
            }
        }
        return newRowNodes;
    };
    InfiniteCache.prototype.insertItemsAtIndex = function (indexToInsert, items) {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        var _this = this;
        var newNodes = [];
        this.forEachBlockInReverseOrder(function (block) {
            var pageEndRow = block.getEndRow();
            // if the insertion is after this page, then this page is not impacted
            if (pageEndRow <= indexToInsert) {
                return;
            }
            _this.moveItemsDown(block, indexToInsert, items.length);
            var newNodesThisPage = _this.insertItems(block, indexToInsert, items);
            newNodesThisPage.forEach(function (rowNode) { return newNodes.push(rowNode); });
        });
        if (this.isMaxRowFound()) {
            this.hack_setVirtualRowCount(this.getVirtualRowCount() + items.length);
        }
        this.onCacheUpdated();
        var event = {
            type: events_1.Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    InfiniteCache.prototype.getRow = function (rowIndex, dontCreatePage) {
        if (dontCreatePage === void 0) { dontCreatePage = false; }
        var blockId = Math.floor(rowIndex / this.cacheParams.blockSize);
        var block = this.getBlock(blockId);
        if (!block) {
            if (dontCreatePage) {
                return null;
            }
            else {
                block = this.createBlock(blockId);
            }
        }
        return block.getRow(rowIndex);
    };
    InfiniteCache.prototype.createBlock = function (blockNumber) {
        var newBlock = new infiniteBlock_1.InfiniteBlock(blockNumber, this.cacheParams);
        this.getContext().wireBean(newBlock);
        this.postCreateBlock(newBlock);
        return newBlock;
    };
    // we have this on infinite row model only, not server side row model,
    // because for server side, it would leave the children in inconsistent
    // state - eg if a node had children, but after the refresh it had data
    // for a different row, then the children would be with the wrong row node.
    InfiniteCache.prototype.refreshCache = function () {
        this.forEachBlockInOrder(function (block) { return block.setDirty(); });
        this.checkBlockToLoad();
    };
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], InfiniteCache.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], InfiniteCache.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], InfiniteCache.prototype, "gridApi", void 0);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [logger_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], InfiniteCache.prototype, "setBeans", null);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], InfiniteCache.prototype, "init", null);
    return InfiniteCache;
}(rowNodeCache_1.RowNodeCache));
exports.InfiniteCache = InfiniteCache;
