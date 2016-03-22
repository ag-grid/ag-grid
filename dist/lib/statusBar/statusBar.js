// ag-grid-enterprise v4.0.7
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require('ag-grid/main');
var statusItem_1 = require("./statusItem");
var rangeController_1 = require("../rangeController");
var StatusBar = (function (_super) {
    __extends(StatusBar, _super);
    function StatusBar() {
        _super.call(this, StatusBar.TEMPLATE);
        this.aggregationsComponent = new main_1.Component('<div class="ag-status-bar-aggregations"></div>');
    }
    StatusBar.prototype.init = function () {
        this.createStatusItems();
        this.eventService.addEventListener(main_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
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
        if (!main_1.Utils.missingOrEmpty(cellRanges)) {
            cellRanges.forEach(function (cellRange) {
                // get starting and ending row, remember rowEnd could be before rowStart
                var startRow = cellRange.start.getGridRow();
                var endRow = cellRange.end.getGridRow();
                var startRowIsFirst = startRow.before(endRow);
                var currentRow = startRowIsFirst ? startRow : endRow;
                var lastRow = startRowIsFirst ? endRow : startRow;
                while (true) {
                    cellRange.columns.forEach(function (column) {
                        // we only want to include each cell once, in case a cell is in multiple ranges
                        var cellId = currentRow.getGridCell(column).createId();
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;
                        var rowNode = _this.getRowNode(currentRow);
                        var value = _this.valueService.getValue(column, rowNode);
                        // if empty cell, skip it, doesn't impact count or anything
                        if (main_1.Utils.missing(value) || value === '') {
                            return;
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
                    if (currentRow.equals(lastRow)) {
                        break;
                    }
                    currentRow = _this.cellNavigationService.getRowBelow(currentRow);
                }
            });
        }
        var gotResult = count > 1;
        var gotNumberResult = numberCount > 0;
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
    };
    StatusBar.prototype.getRowNode = function (gridRow) {
        switch (gridRow.floating) {
            case main_1.Constants.FLOATING_TOP:
                return this.floatingRowModel.getFloatingTopRowData()[gridRow.rowIndex];
            case main_1.Constants.FLOATING_BOTTOM:
                return this.floatingRowModel.getFloatingBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    StatusBar.TEMPLATE = '<div class="ag-status-bar">' +
        '</div>';
    __decorate([
        main_1.Autowired('eventService'), 
        __metadata('design:type', main_1.EventService)
    ], StatusBar.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('rangeController'), 
        __metadata('design:type', rangeController_1.RangeController)
    ], StatusBar.prototype, "rangeController", void 0);
    __decorate([
        main_1.Autowired('valueService'), 
        __metadata('design:type', main_1.ValueService)
    ], StatusBar.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('cellNavigationService'), 
        __metadata('design:type', main_1.CellNavigationService)
    ], StatusBar.prototype, "cellNavigationService", void 0);
    __decorate([
        main_1.Autowired('floatingRowModel'), 
        __metadata('design:type', main_1.FloatingRowModel)
    ], StatusBar.prototype, "floatingRowModel", void 0);
    __decorate([
        main_1.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], StatusBar.prototype, "rowModel", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], StatusBar.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], StatusBar.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], StatusBar.prototype, "init", null);
    StatusBar = __decorate([
        main_1.Bean('statusBar'), 
        __metadata('design:paramtypes', [])
    ], StatusBar);
    return StatusBar;
})(main_1.Component);
exports.StatusBar = StatusBar;
