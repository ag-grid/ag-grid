// ag-grid-enterprise v19.1.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
    AggregationComp.prototype.preConstruct = function () {
        this.instantiate(this.context);
    };
    AggregationComp.prototype.postConstruct = function () {
        if (!this.isValidRowModel()) {
            console.warn("ag-Grid: agSelectedRowCountComponent should only be used with the client and server side row model.");
            return;
        }
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    };
    AggregationComp.prototype.isValidRowModel = function () {
        // this component is only really useful with client or server side rowmodels
        var rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType !== 'serverSide';
    };
    AggregationComp.prototype.init = function () {
    };
    AggregationComp.prototype.setAggregationComponentValue = function (aggFuncName, value, visible) {
        var statusBarValueComponent = this.getAggregationValueComponent(aggFuncName);
        if (ag_grid_community_1._.exists(statusBarValueComponent) && statusBarValueComponent) {
            statusBarValueComponent.setValue(ag_grid_community_1._.formatNumberTwoDecimalPlacesAndCommas(value));
            statusBarValueComponent.setVisible(visible);
        }
    };
    AggregationComp.prototype.getAggregationValueComponent = function (aggFuncName) {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        var refComponentName = aggFuncName + "AggregationComp";
        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        var statusBarValueComponent = null;
        var aggregationPanelConfig = ag_grid_community_1._.exists(this.gridOptions.statusBar) && this.gridOptions.statusBar ? ag_grid_community_1._.find(this.gridOptions.statusBar.statusPanels, aggFuncName) : null;
        if (ag_grid_community_1._.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!ag_grid_community_1._.exists(aggregationPanelConfig.statusPanelParams) ||
                (ag_grid_community_1._.exists(aggregationPanelConfig.statusPanelParams) &&
                    ag_grid_community_1._.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    ag_grid_community_1._.exists(ag_grid_community_1._.find(aggregationPanelConfig.statusPanelParams.aggFuncs, function (item) { return item === aggFuncName; })))) {
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
        var min = 0;
        var max = 0;
        var cellsSoFar = {};
        if (!ag_grid_community_1._.missingOrEmpty(cellRanges)) {
            cellRanges.forEach(function (cellRange) {
                // get starting and ending row, remember rowEnd could be before rowStart
                var startRow = cellRange.start.getGridRow();
                var endRow = cellRange.end.getGridRow();
                var startRowIsFirst = startRow.before(endRow);
                var currentRow = startRowIsFirst ? startRow : endRow;
                var lastRow = startRowIsFirst ? endRow : startRow;
                while (true) {
                    var finishedAllRows = ag_grid_community_1._.missing(currentRow) || !currentRow || lastRow.before(currentRow);
                    if (finishedAllRows || !currentRow) {
                        break;
                    }
                    cellRange.columns.forEach(function (column) {
                        if (currentRow === null) {
                            return;
                        }
                        // we only want to include each cell once, in case a cell is in multiple ranges
                        var cellId = currentRow.getGridCell(column).createId();
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;
                        var rowNode = _this.getRowNode(currentRow);
                        if (ag_grid_community_1._.missing(rowNode)) {
                            return;
                        }
                        var value = _this.valueService.getValue(column, rowNode);
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
    AggregationComp.prototype.getRowNode = function (gridRow) {
        switch (gridRow.floating) {
            case ag_grid_community_1.Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case ag_grid_community_1.Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    AggregationComp.TEMPLATE = "<div class=\"ag-status-panel ag-status-panel-aggregations\">\n                <ag-name-value key=\"average\" default-value=\"Average\" ref=\"avgAggregationComp\"></ag-name-value>\n                <ag-name-value key=\"count\" default-value=\"Count\" ref=\"countAggregationComp\"></ag-name-value>\n                <ag-name-value key=\"min\" default-value=\"Min\" ref=\"minAggregationComp\"></ag-name-value>\n                <ag-name-value key=\"max\" default-value=\"Max\" ref=\"maxAggregationComp\"></ag-name-value>\n                <ag-name-value key=\"sum\" default-value=\"Sum\" ref=\"sumAggregationComp\"></ag-name-value>\n            </div>";
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
        ag_grid_community_1.Autowired('pinnedRowModel'),
        __metadata("design:type", ag_grid_community_1.PinnedRowModel)
    ], AggregationComp.prototype, "pinnedRowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], AggregationComp.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('context'),
        __metadata("design:type", ag_grid_community_1.Context)
    ], AggregationComp.prototype, "context", void 0);
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
        ag_grid_community_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AggregationComp.prototype, "preConstruct", null);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AggregationComp.prototype, "postConstruct", null);
    return AggregationComp;
}(ag_grid_community_1.Component));
exports.AggregationComp = AggregationComp;
