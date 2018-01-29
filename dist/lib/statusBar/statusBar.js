// ag-grid-enterprise v16.0.1
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
var main_1 = require("ag-grid/main");
var statusItem_1 = require("./statusItem");
var rangeController_1 = require("../rangeController");
var StatusBar = (function (_super) {
    __extends(StatusBar, _super);
    function StatusBar() {
        var _this = _super.call(this, StatusBar_1.TEMPLATE) || this;
        _this.aggregationsComponent = new main_1.Component('<div class="ag-status-bar-aggregations"></div>');
        _this.infoLabel = new main_1.Component("<div class=\"ag-status-bar-info-label\"></div>");
        return _this;
    }
    StatusBar_1 = StatusBar;
    StatusBar.prototype.init = function () {
        // we want to hide until the first aggregation comes in
        this.setVisible(false);
        this.createStatusItems();
        this.eventService.addEventListener(main_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.eventService.addEventListener(main_1.Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    };
    StatusBar.prototype.createStatusItems = function () {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.statusItemSum = new statusItem_1.StatusItem(localeTextFunc('sum', 'Sum'));
        this.statusItemCount = new statusItem_1.StatusItem(localeTextFunc('count', 'Count'));
        this.statusItemMin = new statusItem_1.StatusItem(localeTextFunc('min', 'Min'));
        this.statusItemMax = new statusItem_1.StatusItem(localeTextFunc('max', 'Max'));
        this.statusItemAvg = new statusItem_1.StatusItem(localeTextFunc('average', 'Average'));
        this.forEachStatusItem(function (statusItem) {
            _this.context.wireBean(statusItem);
            _this.aggregationsComponent.appendChild(statusItem);
            statusItem.setVisible(false);
        });
        this.appendChild(this.infoLabel);
        this.appendChild(this.aggregationsComponent);
    };
    StatusBar.prototype.forEachStatusItem = function (callback) {
        [this.statusItemAvg, this.statusItemCount, this.statusItemMin, this.statusItemMax, this.statusItemSum].forEach(callback);
    };
    StatusBar.prototype.onRangeSelectionChanged = function () {
        var _this = this;
        var cellRanges = this.rangeController.getCellRanges();
        var sum = 0;
        var count = 0;
        var numberCount = 0;
        var min = null;
        var max = null;
        var cellsSoFar = {};
        if (!main_1._.missingOrEmpty(cellRanges)) {
            cellRanges.forEach(function (cellRange) {
                // get starting and ending row, remember rowEnd could be before rowStart
                var startRow = cellRange.start.getGridRow();
                var endRow = cellRange.end.getGridRow();
                var startRowIsFirst = startRow.before(endRow);
                var currentRow = startRowIsFirst ? startRow : endRow;
                var lastRow = startRowIsFirst ? endRow : startRow;
                while (true) {
                    var finishedAllRows = main_1._.missing(currentRow) || lastRow.before(currentRow);
                    if (finishedAllRows) {
                        break;
                    }
                    cellRange.columns.forEach(function (column) {
                        // we only want to include each cell once, in case a cell is in multiple ranges
                        var cellId = currentRow.getGridCell(column).createId();
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;
                        var rowNode = _this.getRowNode(currentRow);
                        if (main_1._.missing(rowNode)) {
                            return;
                        }
                        var value = _this.valueService.getValue(column, rowNode);
                        // if empty cell, skip it, doesn't impact count or anything
                        if (main_1._.missing(value) || value === '') {
                            return;
                        }
                        // see if value is wrapped, can happen when doing count() or avg() functions
                        if (value.value) {
                            value = value.value;
                        }
                        if (typeof value === 'string') {
                            value = Number(value);
                        }
                        if (typeof value === 'number' && !isNaN(value)) {
                            sum += value;
                            if (max === null || value > max) {
                                max = value;
                            }
                            if (min === null || value < min) {
                                min = value;
                            }
                            numberCount++;
                        }
                        count++;
                    });
                    currentRow = _this.cellNavigationService.getRowBelow(currentRow);
                }
            });
        }
        var gotResult = this.gridOptionsWrapper.isAlwaysShowStatusBar() || count > 1;
        var gotNumberResult = numberCount > 1;
        // we should count even if no numbers
        if (gotResult) {
            this.statusItemCount.setValue(count);
        }
        this.statusItemCount.setVisible(gotResult);
        // if numbers, then show the number items
        if (gotNumberResult) {
            this.statusItemSum.setValue(sum);
            this.statusItemMin.setValue(min);
            this.statusItemMax.setValue(max);
            this.statusItemAvg.setValue(sum / numberCount);
        }
        this.statusItemSum.setVisible(gotNumberResult);
        this.statusItemMin.setVisible(gotNumberResult);
        this.statusItemMax.setVisible(gotNumberResult);
        this.statusItemAvg.setVisible(gotNumberResult);
        if (this.isVisible() !== gotResult) {
            this.setVisible(gotResult);
            this.gridCore.doLayout();
        }
    };
    StatusBar.prototype.getRowNode = function (gridRow) {
        switch (gridRow.floating) {
            case main_1.Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case main_1.Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    StatusBar.TEMPLATE = '<div class="ag-status-bar">' +
        '</div>';
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], StatusBar.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], StatusBar.prototype, "rangeController", void 0);
    __decorate([
        main_1.Autowired('valueService'),
        __metadata("design:type", main_1.ValueService)
    ], StatusBar.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('cellNavigationService'),
        __metadata("design:type", main_1.CellNavigationService)
    ], StatusBar.prototype, "cellNavigationService", void 0);
    __decorate([
        main_1.Autowired('pinnedRowModel'),
        __metadata("design:type", main_1.PinnedRowModel)
    ], StatusBar.prototype, "pinnedRowModel", void 0);
    __decorate([
        main_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], StatusBar.prototype, "rowModel", void 0);
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], StatusBar.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], StatusBar.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('gridCore'),
        __metadata("design:type", main_1.GridCore)
    ], StatusBar.prototype, "gridCore", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], StatusBar.prototype, "init", null);
    StatusBar = StatusBar_1 = __decorate([
        main_1.Bean('statusBar'),
        __metadata("design:paramtypes", [])
    ], StatusBar);
    return StatusBar;
    var StatusBar_1;
}(main_1.Component));
exports.StatusBar = StatusBar;
