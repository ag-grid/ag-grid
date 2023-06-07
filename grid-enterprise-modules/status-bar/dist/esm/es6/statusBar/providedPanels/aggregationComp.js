var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, Events, PostConstruct, RefSelector, _, Optional } from '@ag-grid-community/core';
export class AggregationComp extends Component {
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
        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
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
        if (_.exists(statusBarValueComponent) && statusBarValueComponent) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            const thousandSeparator = localeTextFunc('thousandSeparator', ',');
            const decimalSeparator = localeTextFunc('decimalSeparator', '.');
            statusBarValueComponent.setValue(_.formatNumberTwoDecimalPlacesAndCommas(value, thousandSeparator, decimalSeparator));
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
        const aggregationPanelConfig = _.exists(statusBar) && statusBar ? statusBar.statusPanels.find(panel => panel.statusPanel === 'agAggregationComponent') : null;
        if (_.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!_.exists(aggregationPanelConfig.statusPanelParams) ||
                (_.exists(aggregationPanelConfig.statusPanelParams) &&
                    _.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    _.exists(aggregationPanelConfig.statusPanelParams.aggFuncs.find((func) => func === aggFuncName)))) {
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
        if (cellRanges && !_.missingOrEmpty(cellRanges)) {
            cellRanges.forEach((cellRange) => {
                let currentRow = this.rangeService.getRangeStartRow(cellRange);
                const lastRow = this.rangeService.getRangeEndRow(cellRange);
                while (true) {
                    const finishedAllRows = _.missing(currentRow) || !currentRow || this.rowPositionUtils.before(lastRow, currentRow);
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
                        if (_.missing(rowNode)) {
                            return;
                        }
                        let value = this.valueService.getValue(col, rowNode);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRpb25Db21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0YXR1c0Jhci9wcm92aWRlZFBhbmVscy9hZ2dyZWdhdGlvbkNvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFFVCxTQUFTLEVBQ1QsTUFBTSxFQUlOLGFBQWEsRUFDYixXQUFXLEVBR1gsQ0FBQyxFQUVZLFFBQVEsRUFDeEIsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxTQUFTO0lBeUIxQztRQUNJLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDRGQUE0RjtJQUM1RixtRUFBbUU7SUFDNUQsT0FBTztRQUNWLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBR08sYUFBYTtRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0dBQWdHLENBQUMsQ0FBQztZQUMvRyxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVks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