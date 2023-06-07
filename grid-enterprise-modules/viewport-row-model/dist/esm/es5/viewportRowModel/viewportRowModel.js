var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { _, Autowired, Bean, BeanStub, Events, PostConstruct, PreDestroy, RowNode } from "@ag-grid-community/core";
var DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
var DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;
var ViewportRowModel = /** @class */ (function (_super) {
    __extends(ViewportRowModel, _super);
    function ViewportRowModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // rowRenderer tells us these
        _this.firstRow = -1;
        _this.lastRow = -1;
        // datasource tells us this
        _this.rowCount = -1;
        _this.rowNodesByIndex = {};
        return _this;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ViewportRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) { return false; };
    ViewportRowModel.prototype.init = function () {
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.addManagedListener(this.eventService, Events.EVENT_VIEWPORT_CHANGED, this.onViewportChanged.bind(this));
    };
    ViewportRowModel.prototype.start = function () {
        if (this.gridOptionsService.get('viewportDatasource')) {
            this.setViewportDatasource(this.gridOptionsService.get('viewportDatasource'));
        }
    };
    ViewportRowModel.prototype.isLastRowIndexKnown = function () {
        return true;
    };
    ViewportRowModel.prototype.destroyDatasource = function () {
        if (!this.viewportDatasource) {
            return;
        }
        if (this.viewportDatasource.destroy) {
            this.viewportDatasource.destroy();
        }
        this.rowRenderer.datasourceChanged();
        this.firstRow = -1;
        this.lastRow = -1;
    };
    ViewportRowModel.prototype.getViewportRowModelPageSize = function () {
        return _.oneOrGreater(this.gridOptionsService.getNum('viewportRowModelPageSize'), DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE);
    };
    ViewportRowModel.prototype.getViewportRowModelBufferSize = function () {
        return _.zeroOrGreater(this.gridOptionsService.getNum('viewportRowModelBufferSize'), DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE);
    };
    ViewportRowModel.prototype.calculateFirstRow = function (firstRenderedRow) {
        var bufferSize = this.getViewportRowModelBufferSize();
        var pageSize = this.getViewportRowModelPageSize();
        var afterBuffer = firstRenderedRow - bufferSize;
        if (afterBuffer < 0) {
            return 0;
        }
        return Math.floor(afterBuffer / pageSize) * pageSize;
    };
    ViewportRowModel.prototype.calculateLastRow = function (lastRenderedRow) {
        if (lastRenderedRow === -1) {
            return lastRenderedRow;
        }
        var bufferSize = this.getViewportRowModelBufferSize();
        var pageSize = this.getViewportRowModelPageSize();
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
                if (_this.isRowFocused(index)) {
                    return;
                }
                delete _this.rowNodesByIndex[index];
            }
        });
    };
    ViewportRowModel.prototype.isRowFocused = function (rowIndex) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var hasFocus = focusedCell.rowIndex === rowIndex;
        return hasFocus;
    };
    ViewportRowModel.prototype.setViewportDatasource = function (viewportDatasource) {
        this.destroyDatasource();
        this.viewportDatasource = viewportDatasource;
        this.rowCount = -1;
        if (!viewportDatasource.init) {
            console.warn('AG Grid: viewport is missing init method.');
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
        return 'viewport';
    };
    ViewportRowModel.prototype.getRow = function (rowIndex) {
        if (!this.rowNodesByIndex[rowIndex]) {
            this.rowNodesByIndex[rowIndex] = this.createBlankRowNode(rowIndex);
        }
        return this.rowNodesByIndex[rowIndex];
    };
    ViewportRowModel.prototype.getRowNode = function (id) {
        var result;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    };
    ViewportRowModel.prototype.getRowCount = function () {
        return this.rowCount === -1 ? 0 : this.rowCount;
    };
    ViewportRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        }
        return 0;
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
    ViewportRowModel.prototype.isEmpty = function () {
        return this.rowCount > 0;
    };
    ViewportRowModel.prototype.isRowsToRender = function () {
        return this.rowCount > 0;
    };
    ViewportRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        var firstIndex = _.missing(firstInRange) ? 0 : firstInRange.rowIndex;
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
        _.iterateObject(rowData, function (indexStr, dataItem) {
            var index = parseInt(indexStr, 10);
            // we should never keep rows that we didn't specifically ask for, this
            // guarantees the contract we have with the server.
            if (index >= _this.firstRow && index <= _this.lastRow) {
                var rowNode = _this.rowNodesByIndex[index];
                // the abnormal case is we requested a row even though the grid didn't need it
                // as a result of the paging and buffer (ie the row is off screen), in which
                // case we need to create a new node now
                if (_.missing(rowNode)) {
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
        var rowNode = new RowNode(this.beans);
        rowNode.setRowHeight(this.rowHeight);
        rowNode.setRowTop(this.rowHeight * rowIndex);
        rowNode.setRowIndex(rowIndex);
        return rowNode;
    };
    ViewportRowModel.prototype.setRowCount = function (rowCount, keepRenderedRows) {
        if (keepRenderedRows === void 0) { keepRenderedRows = false; }
        if (rowCount === this.rowCount) {
            return;
        }
        this.rowCount = rowCount;
        var event = {
            type: Events.EVENT_MODEL_UPDATED,
            newData: false,
            newPage: false,
            keepRenderedRows: keepRenderedRows,
            animate: false
        };
        this.eventService.dispatchEvent(event);
    };
    ViewportRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    __decorate([
        Autowired('rowRenderer')
    ], ViewportRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('focusService')
    ], ViewportRowModel.prototype, "focusService", void 0);
    __decorate([
        Autowired('beans')
    ], ViewportRowModel.prototype, "beans", void 0);
    __decorate([
        PostConstruct
    ], ViewportRowModel.prototype, "init", null);
    __decorate([
        PreDestroy
    ], ViewportRowModel.prototype, "destroyDatasource", null);
    ViewportRowModel = __decorate([
        Bean('rowModel')
    ], ViewportRowModel);
    return ViewportRowModel;
}(BeanStub));
export { ViewportRowModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRSb3dNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy92aWV3cG9ydFJvd01vZGVsL3ZpZXdwb3J0Um93TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFDUixNQUFNLEVBSU4sYUFBYSxFQUNiLFVBQVUsRUFFVixPQUFPLEVBTVYsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxJQUFNLG9DQUFvQyxHQUFHLENBQUMsQ0FBQztBQUMvQyxJQUFNLHNDQUFzQyxHQUFHLENBQUMsQ0FBQztBQUVqRDtJQUFzQyxvQ0FBUTtJQUE5QztRQUFBLHFFQW1SQztRQTdRRyw2QkFBNkI7UUFDckIsY0FBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2QsYUFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXJCLDJCQUEyQjtRQUNuQixjQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDZCxxQkFBZSxHQUErQixFQUFFLENBQUM7O0lBdVE3RCxDQUFDO0lBblFHLDRFQUE0RTtJQUNyRSxnREFBcUIsR0FBNUIsVUFBNkIsVUFBa0IsRUFBRSxRQUFnQixFQUFFLGVBQXVCLEVBQUUsYUFBcUIsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFHckksK0JBQUksR0FBWjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqSCxDQUFDO0lBRU0sZ0NBQUssR0FBWjtRQUNJLElBQUksSUFBSSxDQUFDLGtC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