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
import { Autowired, Component, Events, PostConstruct, RefSelector, _, Optional } from '@ag-grid-community/core';
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
            console.warn("AG Grid: agAggregationComponent should only be used with the client and server side row model.");
            return;
        }
        this.avgAggregationComp.setLabel('avg', 'Average');
        this.countAggregationComp.setLabel('count', 'Count');
        this.minAggregationComp.setLabel('min', 'Min');
        this.maxAggregationComp.setLabel('max', 'Max');
        this.sumAggregationComp.setLabel('sum', 'Sum');
        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
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
        if (_.exists(statusBarValueComponent) && statusBarValueComponent) {
            var localeTextFunc = this.localeService.getLocaleTextFunc();
            var thousandSeparator = localeTextFunc('thousandSeparator', ',');
            var decimalSeparator = localeTextFunc('decimalSeparator', '.');
            statusBarValueComponent.setValue(_.formatNumberTwoDecimalPlacesAndCommas(value, thousandSeparator, decimalSeparator));
            statusBarValueComponent.setDisplayed(visible);
        }
    };
    AggregationComp.prototype.getAggregationValueComponent = function (aggFuncName) {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        var refComponentName = aggFuncName + "AggregationComp";
        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        var statusBarValueComponent = null;
        var statusBar = this.gridOptionsService.get('statusBar');
        var aggregationPanelConfig = _.exists(statusBar) && statusBar ? statusBar.statusPanels.find(function (panel) { return panel.statusPanel === 'agAggregationComponent'; }) : null;
        if (_.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!_.exists(aggregationPanelConfig.statusPanelParams) ||
                (_.exists(aggregationPanelConfig.statusPanelParams) &&
                    _.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    _.exists(aggregationPanelConfig.statusPanelParams.aggFuncs.find(function (func) { return func === aggFuncName; })))) {
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
        var cellRanges = this.rangeService ? this.rangeService.getCellRanges() : undefined;
        var sum = 0;
        var count = 0;
        var numberCount = 0;
        var min = null;
        var max = null;
        var cellsSoFar = {};
        if (cellRanges && !_.missingOrEmpty(cellRanges)) {
            cellRanges.forEach(function (cellRange) {
                var currentRow = _this.rangeService.getRangeStartRow(cellRange);
                var lastRow = _this.rangeService.getRangeEndRow(cellRange);
                while (true) {
                    var finishedAllRows = _.missing(currentRow) || !currentRow || _this.rowPositionUtils.before(lastRow, currentRow);
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
                        if (_.missing(rowNode)) {
                            return;
                        }
                        var value = _this.valueService.getValue(col, rowNode);
                        // if empty cell, skip it, doesn't impact count or anything
                        if (_.missing(value) || value === '') {
                            return;
                        }
                        count++;
                        // see if value is wrapped, can happen when doing count() or avg() functions
                        if (typeof value === 'object' && 'value' in value) {
                            value = value.value;
                            // ensure that the new value wouldn't have been skipped by the previous check
                            if (value === '') {
                                return;
                            }
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
        Optional('rangeService')
    ], AggregationComp.prototype, "rangeService", void 0);
    __decorate([
        Autowired('valueService')
    ], AggregationComp.prototype, "valueService", void 0);
    __decorate([
        Autowired('cellNavigationService')
    ], AggregationComp.prototype, "cellNavigationService", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], AggregationComp.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('gridApi')
    ], AggregationComp.prototype, "gridApi", void 0);
    __decorate([
        Autowired('cellPositionUtils')
    ], AggregationComp.prototype, "cellPositionUtils", void 0);
    __decorate([
        Autowired('rowPositionUtils')
    ], AggregationComp.prototype, "rowPositionUtils", void 0);
    __decorate([
        RefSelector('sumAggregationComp')
    ], AggregationComp.prototype, "sumAggregationComp", void 0);
    __decorate([
        RefSelector('countAggregationComp')
    ], AggregationComp.prototype, "countAggregationComp", void 0);
    __decorate([
        RefSelector('minAggregationComp')
    ], AggregationComp.prototype, "minAggregationComp", void 0);
    __decorate([
        RefSelector('maxAggregationComp')
    ], AggregationComp.prototype, "maxAggregationComp", void 0);
    __decorate([
        RefSelector('avgAggregationComp')
    ], AggregationComp.prototype, "avgAggregationComp", void 0);
    __decorate([
        PostConstruct
    ], AggregationComp.prototype, "postConstruct", null);
    return AggregationComp;
}(Component));
export { AggregationComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRpb25Db21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0YXR1c0Jhci9wcm92aWRlZFBhbmVscy9hZ2dyZWdhdGlvbkNvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFFVCxTQUFTLEVBQ1QsTUFBTSxFQUlOLGFBQWEsRUFDYixXQUFXLEVBR1gsQ0FBQyxFQUVZLFFBQVEsRUFDeEIsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQztJQUFxQyxtQ0FBUztJQXlCMUM7ZUFDSSxrQkFBTSxlQUFlLENBQUMsUUFBUSxDQUFDO0lBQ25DLENBQUM7SUFFRCw0RkFBNEY7SUFDNUYsbUVBQW1FO0lBQzVELGlDQUFPLEdBQWQ7UUFDSSxpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBR08sdUNBQWEsR0FBckI7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0dBQWdHLENBQUMsQ0FBQztZQUMvRyxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVks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