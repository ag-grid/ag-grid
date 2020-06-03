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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var AggregationComp = /** @class */ (function (_super) {
    __extends(AggregationComp, _super);
    function AggregationComp() {
        return _super.call(this, AggregationComp.TEMPLATE) || this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    AggregationComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    AggregationComp.prototype.postConstruct = function () {
        if (!this.isValidRowModel()) {
            console.warn("ag-Grid: agAggregationComponent should only be used with the client and server side row model.");
            return;
        }
        this.avgAggregationComp.setLabel('average', 'Average');
        this.countAggregationComp.setLabel('count', 'Count');
        this.minAggregationComp.setLabel('min', 'Min');
        this.maxAggregationComp.setLabel('max', 'Max');
        this.sumAggregationComp.setLabel('sum', 'Sum');
        this.addManagedListener(this.eventService, core_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    };
    AggregationComp.prototype.isValidRowModel = function () {
        // this component is only really useful with client or server side rowmodels
        var rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    };
    AggregationComp.prototype.init = function () {
    };
    AggregationComp.prototype.setAggregationComponentValue = function (aggFuncName, value, visible) {
        var statusBarValueComponent = this.getAggregationValueComponent(aggFuncName);
        if (core_1._.exists(statusBarValueComponent) && statusBarValueComponent) {
            statusBarValueComponent.setValue(core_1._.formatNumberTwoDecimalPlacesAndCommas(value));
            statusBarValueComponent.setDisplayed(visible);
        }
    };
    AggregationComp.prototype.getAggregationValueComponent = function (aggFuncName) {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        var refComponentName = aggFuncName + "AggregationComp";
        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        var statusBarValueComponent = null;
        var aggregationPanelConfig = core_1._.exists(this.gridOptions.statusBar) && this.gridOptions.statusBar ? core_1._.find(this.gridOptions.statusBar.statusPanels, function (panel) { return panel.statusPanel === 'agAggregationComponent'; }) : null;
        if (core_1._.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!core_1._.exists(aggregationPanelConfig.statusPanelParams) ||
                (core_1._.exists(aggregationPanelConfig.statusPanelParams) &&
                    core_1._.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    core_1._.exists(core_1._.find(aggregationPanelConfig.statusPanelParams.aggFuncs, function (func) { return func === aggFuncName; })))) {
                statusBarValueComponent = this[refComponentName];
            }
        }
        else {
            // components not specified - assume we can show this component
            statusBarValueComponent = this[refComponentName];
        }
        // either we can't find it (which would indicate a typo or similar user side), or the user has deliberately
        // not listed the component in aggFuncs
        return statusBarValueComponent;
    };
    AggregationComp.prototype.onRangeSelectionChanged = function () {
        var _this = this;
        var cellRanges = this.rangeController ? this.rangeController.getCellRanges() : undefined;
        var sum = 0;
        var count = 0;
        var numberCount = 0;
        var min = null;
        var max = null;
        var cellsSoFar = {};
        if (cellRanges && !core_1._.missingOrEmpty(cellRanges)) {
            cellRanges.forEach(function (cellRange) {
                var currentRow = _this.rangeController.getRangeStartRow(cellRange);
                var lastRow = _this.rangeController.getRangeEndRow(cellRange);
                while (true) {
                    var finishedAllRows = core_1._.missing(currentRow) || !currentRow || _this.rowPositionUtils.before(lastRow, currentRow);
                    if (finishedAllRows || !currentRow || !cellRange.columns) {
                        break;
                    }
                    cellRange.columns.forEach(function (col) {
                        if (currentRow === null) {
                            return;
                        }
                        // we only want to include each cell once, in case a cell is in multiple ranges
                        var cellId = _this.cellPositionUtils.createId({
                            rowPinned: currentRow.rowPinned,
                            column: col,
                            rowIndex: currentRow.rowIndex
                        });
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;
                        var rowNode = _this.rowRenderer.getRowNode(currentRow);
                        if (core_1._.missing(rowNode)) {
                            return;
                        }
                        var value = _this.valueService.getValue(col, rowNode);
                        // if empty cell, skip it, doesn't impact count or anything
                        if (core_1._.missing(value) || value === '') {
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
        var gotResult = count > 1;
        var gotNumberResult = numberCount > 1;
        // we show count even if no numbers
        this.setAggregationComponentValue('count', count, gotResult);
        // show if numbers found
        this.setAggregationComponentValue('sum', sum, gotNumberResult);
        this.setAggregationComponentValue('min', min, gotNumberResult);
        this.setAggregationComponentValue('max', max, gotNumberResult);
        this.setAggregationComponentValue('avg', (sum / numberCount), gotNumberResult);
    };
    AggregationComp.TEMPLATE = "<div class=\"ag-status-panel ag-status-panel-aggregations\">\n            <ag-name-value ref=\"avgAggregationComp\"></ag-name-value>\n            <ag-name-value ref=\"countAggregationComp\"></ag-name-value>\n            <ag-name-value ref=\"minAggregationComp\"></ag-name-value>\n            <ag-name-value ref=\"maxAggregationComp\"></ag-name-value>\n            <ag-name-value ref=\"sumAggregationComp\"></ag-name-value>\n        </div>";
    __decorate([
        core_1.Optional('rangeController')
    ], AggregationComp.prototype, "rangeController", void 0);
    __decorate([
        core_1.Autowired('valueService')
    ], AggregationComp.prototype, "valueService", void 0);
    __decorate([
        core_1.Autowired('cellNavigationService')
    ], AggregationComp.prototype, "cellNavigationService", void 0);
    __decorate([
        core_1.Autowired('rowRenderer')
    ], AggregationComp.prototype, "rowRenderer", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], AggregationComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('gridOptions')
    ], AggregationComp.prototype, "gridOptions", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], AggregationComp.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('cellPositionUtils')
    ], AggregationComp.prototype, "cellPositionUtils", void 0);
    __decorate([
        core_1.Autowired('rowPositionUtils')
    ], AggregationComp.prototype, "rowPositionUtils", void 0);
    __decorate([
        core_1.RefSelector('sumAggregationComp')
    ], AggregationComp.prototype, "sumAggregationComp", void 0);
    __decorate([
        core_1.RefSelector('countAggregationComp')
    ], AggregationComp.prototype, "countAggregationComp", void 0);
    __decorate([
        core_1.RefSelector('minAggregationComp')
    ], AggregationComp.prototype, "minAggregationComp", void 0);
    __decorate([
        core_1.RefSelector('maxAggregationComp')
    ], AggregationComp.prototype, "maxAggregationComp", void 0);
    __decorate([
        core_1.RefSelector('avgAggregationComp')
    ], AggregationComp.prototype, "avgAggregationComp", void 0);
    __decorate([
        core_1.PostConstruct
    ], AggregationComp.prototype, "postConstruct", null);
    return AggregationComp;
}(core_1.Component));
exports.AggregationComp = AggregationComp;
//# sourceMappingURL=aggregationComp.js.map