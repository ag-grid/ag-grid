// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var rangeController_1 = require("../../rangeController");
var nameValueComp_1 = require("./nameValueComp");
var AggregationComp = /** @class */ (function (_super) {
    __extends(AggregationComp, _super);
    function AggregationComp() {
        return _super.call(this, AggregationComp.TEMPLATE) || this;
    }
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
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
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
        if (ag_grid_community_1._.exists(statusBarValueComponent) && statusBarValueComponent) {
            statusBarValueComponent.setValue(ag_grid_community_1._.formatNumberTwoDecimalPlacesAndCommas(value));
            statusBarValueComponent.setDisplayed(visible);
        }
    };
    AggregationComp.prototype.getAggregationValueComponent = function (aggFuncName) {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        var refComponentName = aggFuncName + "AggregationComp";
        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        var statusBarValueComponent = null;
        var aggregationPanelConfig = ag_grid_community_1._.exists(this.gridOptions.statusBar) && this.gridOptions.statusBar ? ag_grid_community_1._.find(this.gridOptions.statusBar.statusPanels, function (panel) { return panel.statusPanel === 'agAggregationComponent'; }) : null;
        if (ag_grid_community_1._.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!ag_grid_community_1._.exists(aggregationPanelConfig.statusPanelParams) ||
                (ag_grid_community_1._.exists(aggregationPanelConfig.statusPanelParams) &&
                    ag_grid_community_1._.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    ag_grid_community_1._.exists(ag_grid_community_1._.find(aggregationPanelConfig.statusPanelParams.aggFuncs, function (func) { return func === aggFuncName; })))) {
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
        var cellRanges = this.rangeController.getCellRanges();
        var sum = 0;
        var count = 0;
        var numberCount = 0;
        var min = null;
        var max = 0;
        var cellsSoFar = {};
        if (cellRanges && !ag_grid_community_1._.missingOrEmpty(cellRanges)) {
            cellRanges.forEach(function (cellRange) {
                var currentRow = _this.rangeController.getRangeStartRow(cellRange);
                var lastRow = _this.rangeController.getRangeEndRow(cellRange);
                while (true) {
                    var finishedAllRows = ag_grid_community_1._.missing(currentRow) || !currentRow || _this.rowPositionUtils.before(lastRow, currentRow);
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
                        if (ag_grid_community_1._.missing(rowNode)) {
                            return;
                        }
                        var value = _this.valueService.getValue(col, rowNode);
                        // if empty cell, skip it, doesn't impact count or anything
                        if (ag_grid_community_1._.missing(value) || value === '') {
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
    AggregationComp.TEMPLATE = "<div class=\"ag-status-panel ag-status-panel-aggregations\">\n                <ag-name-value ref=\"avgAggregationComp\"></ag-name-value>\n                <ag-name-value ref=\"countAggregationComp\"></ag-name-value>\n                <ag-name-value ref=\"minAggregationComp\"></ag-name-value>\n                <ag-name-value ref=\"maxAggregationComp\"></ag-name-value>\n                <ag-name-value ref=\"sumAggregationComp\"></ag-name-value>\n            </div>";
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], AggregationComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], AggregationComp.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], AggregationComp.prototype, "valueService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('cellNavigationService'),
        __metadata("design:type", ag_grid_community_1.CellNavigationService)
    ], AggregationComp.prototype, "cellNavigationService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowRenderer'),
        __metadata("design:type", ag_grid_community_1.RowRenderer)
    ], AggregationComp.prototype, "rowRenderer", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], AggregationComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptions'),
        __metadata("design:type", Object)
    ], AggregationComp.prototype, "gridOptions", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], AggregationComp.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('cellPositionUtils'),
        __metadata("design:type", ag_grid_community_1.CellPositionUtils)
    ], AggregationComp.prototype, "cellPositionUtils", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowPositionUtils'),
        __metadata("design:type", ag_grid_community_1.RowPositionUtils)
    ], AggregationComp.prototype, "rowPositionUtils", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('sumAggregationComp'),
        __metadata("design:type", nameValueComp_1.NameValueComp)
    ], AggregationComp.prototype, "sumAggregationComp", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('countAggregationComp'),
        __metadata("design:type", nameValueComp_1.NameValueComp)
    ], AggregationComp.prototype, "countAggregationComp", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('minAggregationComp'),
        __metadata("design:type", nameValueComp_1.NameValueComp)
    ], AggregationComp.prototype, "minAggregationComp", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('maxAggregationComp'),
        __metadata("design:type", nameValueComp_1.NameValueComp)
    ], AggregationComp.prototype, "maxAggregationComp", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('avgAggregationComp'),
        __metadata("design:type", nameValueComp_1.NameValueComp)
    ], AggregationComp.prototype, "avgAggregationComp", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AggregationComp.prototype, "postConstruct", null);
    return AggregationComp;
}(ag_grid_community_1.Component));
exports.AggregationComp = AggregationComp;
