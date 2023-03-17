"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationComp = void 0;
const core_1 = require("@ag-grid-community/core");
class AggregationComp extends core_1.Component {
    constructor() {
        super(AggregationComp.TEMPLATE);
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    postConstruct() {
        if (!this.isValidRowModel()) {
            console.warn(`AG Grid: agAggregationComponent should only be used with the client and server side row model.`);
            return;
        }
        this.avgAggregationComp.setLabel('avg', 'Average');
        this.countAggregationComp.setLabel('count', 'Count');
        this.minAggregationComp.setLabel('min', 'Min');
        this.maxAggregationComp.setLabel('max', 'Max');
        this.sumAggregationComp.setLabel('sum', 'Sum');
        this.addManagedListener(this.eventService, core_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    }
    isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    }
    init() {
    }
    setAggregationComponentValue(aggFuncName, value, visible) {
        const statusBarValueComponent = this.getAggregationValueComponent(aggFuncName);
        if (core_1._.exists(statusBarValueComponent) && statusBarValueComponent) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            const thousandSeparator = localeTextFunc('thousandSeparator', ',');
            const decimalSeparator = localeTextFunc('decimalSeparator', '.');
            statusBarValueComponent.setValue(core_1._.formatNumberTwoDecimalPlacesAndCommas(value, thousandSeparator, decimalSeparator));
            statusBarValueComponent.setDisplayed(visible);
        }
    }
    getAggregationValueComponent(aggFuncName) {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        const refComponentName = `${aggFuncName}AggregationComp`;
        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        let statusBarValueComponent = null;
        const statusBar = this.gridOptionsService.get('statusBar');
        const aggregationPanelConfig = core_1._.exists(statusBar) && statusBar ? statusBar.statusPanels.find(panel => panel.statusPanel === 'agAggregationComponent') : null;
        if (core_1._.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!core_1._.exists(aggregationPanelConfig.statusPanelParams) ||
                (core_1._.exists(aggregationPanelConfig.statusPanelParams) &&
                    core_1._.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    core_1._.exists(aggregationPanelConfig.statusPanelParams.aggFuncs.find((func) => func === aggFuncName)))) {
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
    }
    onRangeSelectionChanged() {
        const cellRanges = this.rangeService ? this.rangeService.getCellRanges() : undefined;
        let sum = 0;
        let count = 0;
        let numberCount = 0;
        let min = null;
        let max = null;
        const cellsSoFar = {};
        if (cellRanges && !core_1._.missingOrEmpty(cellRanges)) {
            cellRanges.forEach((cellRange) => {
                let currentRow = this.rangeService.getRangeStartRow(cellRange);
                const lastRow = this.rangeService.getRangeEndRow(cellRange);
                while (true) {
                    const finishedAllRows = core_1._.missing(currentRow) || !currentRow || this.rowPositionUtils.before(lastRow, currentRow);
                    if (finishedAllRows || !currentRow || !cellRange.columns) {
                        break;
                    }
                    cellRange.columns.forEach(col => {
                        if (currentRow === null) {
                            return;
                        }
                        // we only want to include each cell once, in case a cell is in multiple ranges
                        const cellId = this.cellPositionUtils.createId({
                            rowPinned: currentRow.rowPinned,
                            column: col,
                            rowIndex: currentRow.rowIndex
                        });
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;
                        const rowNode = this.rowRenderer.getRowNode(currentRow);
                        if (core_1._.missing(rowNode)) {
                            return;
                        }
                        let value = this.valueService.getValue(col, rowNode);
                        // if empty cell, skip it, doesn't impact count or anything
                        if (core_1._.missing(value) || value === '') {
                            return;
                        }
                        // see if value is wrapped, can happen when doing count() or avg() functions
                        if (typeof value === 'object' && 'value' in value) {
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
                    currentRow = this.cellNavigationService.getRowBelow(currentRow);
                }
            });
        }
        const gotResult = count > 1;
        const gotNumberResult = numberCount > 1;
        // we show count even if no numbers
        this.setAggregationComponentValue('count', count, gotResult);
        // show if numbers found
        this.setAggregationComponentValue('sum', sum, gotNumberResult);
        this.setAggregationComponentValue('min', min, gotNumberResult);
        this.setAggregationComponentValue('max', max, gotNumberResult);
        this.setAggregationComponentValue('avg', (sum / numberCount), gotNumberResult);
    }
}
AggregationComp.TEMPLATE = `<div class="ag-status-panel ag-status-panel-aggregations">
            <ag-name-value ref="avgAggregationComp"></ag-name-value>
            <ag-name-value ref="countAggregationComp"></ag-name-value>
            <ag-name-value ref="minAggregationComp"></ag-name-value>
            <ag-name-value ref="maxAggregationComp"></ag-name-value>
            <ag-name-value ref="sumAggregationComp"></ag-name-value>
        </div>`;
__decorate([
    core_1.Optional('rangeService')
], AggregationComp.prototype, "rangeService", void 0);
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
exports.AggregationComp = AggregationComp;
