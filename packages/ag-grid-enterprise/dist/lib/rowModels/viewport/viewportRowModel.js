// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var ViewportRowModel = /** @class */ (function () {
    function ViewportRowModel() {
        // rowRenderer tells us these
        this.firstRow = -1;
        this.lastRow = -1;
        // datasource tells us this
        this.rowCount = -1;
        this.rowNodesByIndex = {};
    }
    // we don't implement as lazy row heights is not supported in this row model
    ViewportRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) { return false; };
    ViewportRowModel.prototype.init = function () {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_VIEWPORT_CHANGED, this.onViewportChanged.bind(this));
        var viewportEnabled = this.gridOptionsWrapper.isRowModelViewport();
        if (viewportEnabled && this.gridOptionsWrapper.getViewportDatasource()) {
            this.setViewportDatasource(this.gridOptionsWrapper.getViewportDatasource());
        }
    };
    ViewportRowModel.prototype.isLastRowFound = function () {
        return true;
    };
    ViewportRowModel.prototype.destroyDatasource = function () {
        if (this.viewportDatasource) {
            if (this.viewportDatasource.destroy) {
                this.viewportDatasource.destroy();
            }
            this.rowRenderer.datasourceChanged();
            this.firstRow = -1;
            this.lastRow = -1;
        }
    };
    ViewportRowModel.prototype.calculateFirstRow = function (firstRenderedRow) {
        var bufferSize = this.gridOptionsWrapper.getViewportRowModelBufferSize();
        var pageSize = this.gridOptionsWrapper.getViewportRowModelPageSize();
        var afterBuffer = firstRenderedRow - bufferSize;
        if (afterBuffer < 0) {
            return 0;
        }
        else {
            return Math.floor(afterBuffer / pageSize) * pageSize;
        }
    };
    ViewportRowModel.prototype.calculateLastRow = function (lastRenderedRow) {
        if (lastRenderedRow === -1) {
            return lastRenderedRow;
        }
        var bufferSize = this.gridOptionsWrapper.getViewportRowModelBufferSize();
        var pageSize = this.gridOptionsWrapper.getViewportRowModelPageSize();
        var afterBuffer = lastRenderedRow + bufferSize;
        var result = Math.ceil(afterBuffer / pageSize) * pageSize;
        var lastRowIndex = this.rowCount - 1;
        return Math.min(result, lastRowIndex);
    };
    ViewportRowModel.prototype.onViewportChanged = function (event) {
        var newFirst = this.calculateFirstRow(event.firstRow);
        var newLast = this.calculateLastRow(event.lastRow);
        if (this.firstRow !== newFirst || this.lastRow !== newLast) {
            this.firstRow = newFirst;
            this.lastRow = newLast;
            this.purgeRowsNotInViewport();
            if (this.viewportDatasource) {
                this.viewportDatasource.setViewportRange(this.firstRow, this.lastRow);
            }
        }
    };
    ViewportRowModel.prototype.purgeRowsNotInViewport = function () {
        var _this = this;
        Object.keys(this.rowNodesByIndex).forEach(function (indexStr) {
            var index = parseInt(indexStr, 10);
            if (index < _this.firstRow || index > _this.lastRow) {
                delete _this.rowNodesByIndex[index];
            }
        });
    };
    ViewportRowModel.prototype.setViewportDatasource = function (viewportDatasource) {
        this.destroyDatasource();
        this.viewportDatasource = viewportDatasource;
        this.rowCount = 0;
        if (!viewportDatasource.init) {
            console.warn('ag-Grid: viewport is missing init method.');
        }
        else {
            viewportDatasource.init({
                setRowCount: this.setRowCount.bind(this),
                setRowData: this.setRowData.bind(this),
                getRow: this.getRow.bind(this)
            });
        }
    };
    ViewportRowModel.prototype.getType = function () {
        return ag_grid_community_1.Constants.ROW_MODEL_TYPE_VIEWPORT;
    };
    ViewportRowModel.prototype.getRow = function (rowIndex) {
        if (!this.rowNodesByIndex[rowIndex]) {
            this.rowNodesByIndex[rowIndex] = this.createBlankRowNode(rowIndex);
        }
        return this.rowNodesByIndex[rowIndex];
    };
    ViewportRowModel.prototype.getRowNode = function (id) {
        var result = null;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    };
    ViewportRowModel.prototype.getRowCount = function () {
        return this.rowCount;
    };
    ViewportRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        }
        else {
            return 0;
        }
    };
    ViewportRowModel.prototype.getRowBounds = function (index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    };
    ViewportRowModel.prototype.getTopLevelRowCount = function () {
        return this.getRowCount();
    };
    ViewportRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        return topLevelIndex;
    };
    ViewportRowModel.prototype.getCurrentPageHeight = function () {
        return this.rowCount * this.rowHeight;
    };
    ViewportRowModel.prototype.isEmpty = function () {
        return this.rowCount > 0;
    };
    ViewportRowModel.prototype.isRowsToRender = function () {
        return this.rowCount > 0;
    };
    ViewportRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        var firstIndex = ag_grid_community_1._.missing(firstInRange) ? 0 : firstInRange.rowIndex;
        var lastIndex = lastInRange.rowIndex;
        var firstNodeOutOfRange = firstIndex < this.firstRow || firstIndex > this.lastRow;
        var lastNodeOutOfRange = lastIndex < this.firstRow || lastIndex > this.lastRow;
        if (firstNodeOutOfRange || lastNodeOutOfRange) {
            return [];
        }
        var result = [];
        var startIndex = firstIndex <= lastIndex ? firstIndex : lastIndex;
        var endIndex = firstIndex <= lastIndex ? lastIndex : firstIndex;
        for (var i = startIndex; i <= endIndex; i++) {
            result.push(this.rowNodesByIndex[i]);
        }
        return result;
    };
    ViewportRowModel.prototype.forEachNode = function (callback) {
        var _this = this;
        var callbackCount = 0;
        Object.keys(this.rowNodesByIndex).forEach(function (indexStr) {
            var index = parseInt(indexStr, 10);
            var rowNode = _this.rowNodesByIndex[index];
            callback(rowNode, callbackCount);
            callbackCount++;
        });
    };
    ViewportRowModel.prototype.setRowData = function (rowData) {
        var _this = this;
        ag_grid_community_1._.iterateObject(rowData, function (indexStr, dataItem) {
            var index = parseInt(indexStr, 10);
            // we should never keep rows that we didn't specifically ask for, this
            // guarantees the contract we have with the server.
            if (index >= _this.firstRow && index <= _this.lastRow) {
                var rowNode = _this.rowNodesByIndex[index];
                // the abnormal case is we requested a row even though the grid didn't need it
                // as a result of the paging and buffer (ie the row is off screen), in which
                // case we need to create a new node now
                if (ag_grid_community_1._.missing(rowNode)) {
                    rowNode = _this.createBlankRowNode(index);
                    _this.rowNodesByIndex[index] = rowNode;
                }
                // now we deffo have a row node, so set in the details
                // if the grid already asked for this row (the normal case), then we would
                // of put a placeholder node in place.
                rowNode.setDataAndId(dataItem, index.toString());
            }
        });
    };
    ViewportRowModel.prototype.createBlankRowNode = function (rowIndex) {
        var rowNode = new ag_grid_community_1.RowNode();
        this.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowHeight);
        rowNode.setRowTop(this.rowHeight * rowIndex);
        rowNode.setRowIndex(rowIndex);
        return rowNode;
    };
    ViewportRowModel.prototype.setRowCount = function (rowCount) {
        if (rowCount !== this.rowCount) {
            this.rowCount = rowCount;
            var event_1 = {
                type: ag_grid_community_1.Events.EVENT_MODEL_UPDATED,
                api: this.gridApi,
                columnApi: this.columnApi,
                newData: false,
                newPage: false,
                keepRenderedRows: false,
                animate: false
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ViewportRowModel.prototype.isRowPresent = function (rowNode) {
        return false;
    };
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ViewportRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ViewportRowModel.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('selectionController'),
        __metadata("design:type", ag_grid_community_1.SelectionController)
    ], ViewportRowModel.prototype, "selectionController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('context'),
        __metadata("design:type", ag_grid_community_1.Context)
    ], ViewportRowModel.prototype, "context", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], ViewportRowModel.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnApi'),
        __metadata("design:type", ag_grid_community_1.ColumnApi)
    ], ViewportRowModel.prototype, "columnApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowRenderer'),
        __metadata("design:type", ag_grid_community_1.RowRenderer)
    ], ViewportRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ViewportRowModel.prototype, "init", null);
    __decorate([
        ag_grid_community_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ViewportRowModel.prototype, "destroyDatasource", null);
    ViewportRowModel = __decorate([
        ag_grid_community_1.Bean('rowModel')
    ], ViewportRowModel);
    return ViewportRowModel;
}());
exports.ViewportRowModel = ViewportRowModel;
