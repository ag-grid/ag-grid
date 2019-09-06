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
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var context_1 = require("../../context/context");
var rowNodeBlock_1 = require("../cache/rowNodeBlock");
var rowRenderer_1 = require("../../rendering/rowRenderer");
var utils_1 = require("../../utils");
var InfiniteBlock = /** @class */ (function (_super) {
    __extends(InfiniteBlock, _super);
    function InfiniteBlock(pageNumber, params) {
        var _this = _super.call(this, pageNumber, params) || this;
        _this.cacheParams = params;
        return _this;
    }
    InfiniteBlock.prototype.createBlankRowNode = function (rowIndex) {
        var rowNode = _super.prototype.createBlankRowNode.call(this, rowIndex);
        rowNode.uiLevel = 0;
        this.setIndexAndTopOnRowNode(rowNode, rowIndex);
        return rowNode;
    };
    InfiniteBlock.prototype.setDataAndId = function (rowNode, data, index) {
        if (utils_1._.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
        }
    };
    InfiniteBlock.prototype.setRowNode = function (rowIndex, rowNode) {
        _super.prototype.setRowNode.call(this, rowIndex, rowNode);
        this.setIndexAndTopOnRowNode(rowNode, rowIndex);
    };
    InfiniteBlock.prototype.init = function () {
        _super.prototype.init.call(this, {
            context: this.getContext(),
            rowRenderer: this.rowRenderer
        });
    };
    InfiniteBlock.prototype.getNodeIdPrefix = function () {
        return null;
    };
    InfiniteBlock.prototype.getRow = function (displayIndex) {
        return this.getRowUsingLocalIndex(displayIndex);
    };
    InfiniteBlock.prototype.setIndexAndTopOnRowNode = function (rowNode, rowIndex) {
        rowNode.setRowIndex(rowIndex);
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
        if (utils_1._.missing(this.cacheParams.datasource.getRows)) {
            console.warn("ag-Grid: datasource is missing getRows method");
            return;
        }
        // check if old version of datasource used
        var getRowsParams = utils_1._.getFunctionParameters(this.cacheParams.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }
        // put in timeout, to force result to be async
        window.setTimeout(function () {
            _this.cacheParams.datasource.getRows(params);
        }, 0);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], InfiniteBlock.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], InfiniteBlock.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], InfiniteBlock.prototype, "init", null);
    return InfiniteBlock;
}(rowNodeBlock_1.RowNodeBlock));
exports.InfiniteBlock = InfiniteBlock;
