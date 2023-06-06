/**
          * @ag-grid-enterprise/status-bar - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Bean, BeanStub, Autowired, RefSelector, PostConstruct, Component, AgPromise, Events, _, Optional, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let StatusBarService = class StatusBarService extends BeanStub {
    // tslint:disable-next-line
    constructor() {
        super();
        this.allComponents = {};
    }
    registerStatusPanel(key, component) {
        this.allComponents[key] = component;
    }
    getStatusPanel(key) {
        return this.allComponents[key];
    }
};
StatusBarService = __decorate$7([
    Bean('statusBarService')
], StatusBarService);

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class StatusBar extends Component {
    constructor() {
        super(StatusBar.TEMPLATE);
    }
    postConstruct() {
        var _a;
        const statusPanels = (_a = this.gridOptionsService.get('statusBar')) === null || _a === void 0 ? void 0 : _a.statusPanels;
        if (statusPanels) {
            const leftStatusPanelComponents = statusPanels
                .filter((componentConfig) => componentConfig.align === 'left');
            this.createAndRenderComponents(leftStatusPanelComponents, this.eStatusBarLeft);
            const centerStatusPanelComponents = statusPanels
                .filter((componentConfig) => componentConfig.align === 'center');
            this.createAndRenderComponents(centerStatusPanelComponents, this.eStatusBarCenter);
            const rightStatusPanelComponents = statusPanels
                .filter((componentConfig) => (!componentConfig.align || componentConfig.align === 'right'));
            this.createAndRenderComponents(rightStatusPanelComponents, this.eStatusBarRight);
        }
        else {
            this.setDisplayed(false);
        }
    }
    createAndRenderComponents(statusBarComponents, ePanelComponent) {
        const componentDetails = [];
        statusBarComponents.forEach(componentConfig => {
            const params = {};
            const compDetails = this.userComponentFactory.getStatusPanelCompDetails(componentConfig, params);
            const promise = compDetails.newAgStackInstance();
            if (!promise) {
                return;
            }
            componentDetails.push({
                // default to the component name if no key supplied
                key: componentConfig.key || componentConfig.statusPanel,
                promise
            });
        });
        AgPromise.all(componentDetails.map((details) => details.promise))
            .then(() => {
            componentDetails.forEach(componentDetail => {
                componentDetail.promise.then((component) => {
                    const destroyFunc = () => {
                        this.getContext().destroyBean(component);
                    };
                    if (this.isAlive()) {
                        this.statusBarService.registerStatusPanel(componentDetail.key, component);
                        ePanelComponent.appendChild(component.getGui());
                        this.addDestroyFunc(destroyFunc);
                    }
                    else {
                        destroyFunc();
                    }
                });
            });
        });
    }
}
StatusBar.TEMPLATE = `<div class="ag-status-bar">
            <div ref="eStatusBarLeft" class="ag-status-bar-left" role="status"></div>
            <div ref="eStatusBarCenter" class="ag-status-bar-center" role="status"></div>
            <div ref="eStatusBarRight" class="ag-status-bar-right" role="status"></div>
        </div>`;
__decorate$6([
    Autowired('userComponentFactory')
], StatusBar.prototype, "userComponentFactory", void 0);
__decorate$6([
    Autowired('statusBarService')
], StatusBar.prototype, "statusBarService", void 0);
__decorate$6([
    RefSelector('eStatusBarLeft')
], StatusBar.prototype, "eStatusBarLeft", void 0);
__decorate$6([
    RefSelector('eStatusBarCenter')
], StatusBar.prototype, "eStatusBarCenter", void 0);
__decorate$6([
    RefSelector('eStatusBarRight')
], StatusBar.prototype, "eStatusBarRight", void 0);
__decorate$6([
    PostConstruct
], StatusBar.prototype, "postConstruct", null);

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class NameValueComp extends Component {
    constructor() {
        super(NameValueComp.TEMPLATE);
    }
    setLabel(key, defaultValue) {
        // we want to hide until the first value comes in
        this.setDisplayed(false);
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    }
    setValue(value) {
        this.eValue.innerHTML = value;
    }
}
NameValueComp.TEMPLATE = `<div class="ag-status-name-value">
            <span ref="eLabel"></span>:&nbsp;
            <span ref="eValue" class="ag-status-name-value-value"></span>
        </div>`;
__decorate$5([
    RefSelector('eLabel')
], NameValueComp.prototype, "eLabel", void 0);
__decorate$5([
    RefSelector('eValue')
], NameValueComp.prototype, "eValue", void 0);

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class TotalAndFilteredRowsComp extends NameValueComp {
    postConstruct() {
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`AG Grid: agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }
        this.setLabel('totalAndFilteredRows', 'Rows');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');
        this.setDisplayed(true);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
        this.onDataChanged();
    }
    onDataChanged() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        const rowCount = _.formatNumberCommas(this.getFilteredRowCountValue(), thousandSeparator, decimalSeparator);
        const totalRowCount = _.formatNumberCommas(this.getTotalRowCount(), thousandSeparator, decimalSeparator);
        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        }
        else {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            this.setValue(`${rowCount} ${localeTextFunc('of', 'of')} ${totalRowCount}`);
        }
    }
    getFilteredRowCountValue() {
        let filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter((node) => {
            if (!node.group) {
                filteredRowCount++;
            }
        });
        return filteredRowCount;
    }
    getTotalRowCount() {
        let totalRowCount = 0;
        this.gridApi.forEachNode(node => {
            if (!node.group) {
                totalRowCount++;
            }
        });
        return totalRowCount;
    }
    init() { }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
__decorate$4([
    Autowired('gridApi')
], TotalAndFilteredRowsComp.prototype, "gridApi", void 0);
__decorate$4([
    PostConstruct
], TotalAndFilteredRowsComp.prototype, "postConstruct", null);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class FilteredRowsComp extends NameValueComp {
    postConstruct() {
        this.setLabel('filteredRows', 'Filtered');
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`AG Grid: agFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-filtered-row-count');
        this.setDisplayed(true);
        const listener = this.onDataChanged.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, listener);
        listener();
    }
    onDataChanged() {
        const totalRowCountValue = this.getTotalRowCountValue();
        const filteredRowCountValue = this.getFilteredRowCountValue();
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(filteredRowCountValue, thousandSeparator, decimalSeparator));
        this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
    }
    getTotalRowCountValue() {
        let totalRowCount = 0;
        this.gridApi.forEachNode((node) => totalRowCount += 1);
        return totalRowCount;
    }
    getFilteredRowCountValue() {
        let filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter((node) => {
            if (!node.group) {
                filteredRowCount += 1;
            }
        });
        return filteredRowCount;
    }
    init() { }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
__decorate$3([
    Autowired('gridApi')
], FilteredRowsComp.prototype, "gridApi", void 0);
__decorate$3([
    PostConstruct
], FilteredRowsComp.prototype, "postConstruct", null);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class TotalRowsComp extends NameValueComp {
    postConstruct() {
        this.setLabel('totalRows', 'Total Rows');
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`AG Grid: agTotalRowCountComponent should only be used with the client side row model.`);
            return;
        }
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-row-count');
        this.setDisplayed(true);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
        this.onDataChanged();
    }
    onDataChanged() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(this.getRowCountValue(), thousandSeparator, decimalSeparator));
    }
    getRowCountValue() {
        let totalRowCount = 0;
        this.gridApi.forEachLeafNode((node) => totalRowCount += 1);
        return totalRowCount;
    }
    init() {
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
__decorate$2([
    Autowired('gridApi')
], TotalRowsComp.prototype, "gridApi", void 0);
__decorate$2([
    PostConstruct
], TotalRowsComp.prototype, "postConstruct", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class SelectedRowsComp extends NameValueComp {
    postConstruct() {
        if (!this.isValidRowModel()) {
            console.warn(`AG Grid: agSelectedRowCountComponent should only be used with the client and server side row model.`);
            return;
        }
        this.setLabel('selectedRows', 'Selected');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-selected-row-count');
        this.onRowSelectionChanged();
        const eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, eventListener);
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, eventListener);
    }
    isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    }
    onRowSelectionChanged() {
        const selectedRowCount = this.selectionService.getSelectionCount();
        if (selectedRowCount < 0) {
            this.setValue('?');
            this.setDisplayed(true);
            return;
        }
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(selectedRowCount, thousandSeparator, decimalSeparator));
        this.setDisplayed(selectedRowCount > 0);
    }
    init() {
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
__decorate$1([
    Autowired('gridApi')
], SelectedRowsComp.prototype, "gridApi", void 0);
__decorate$1([
    Autowired('selectionService')
], SelectedRowsComp.prototype, "selectionService", void 0);
__decorate$1([
    PostConstruct
], SelectedRowsComp.prototype, "postConstruct", null);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class AggregationComp extends Component {
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

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

const StatusBarModule = {
    version: VERSION,
    moduleName: ModuleNames.StatusBarModule,
    beans: [StatusBarService],
    agStackComponents: [
        { componentName: 'AgStatusBar', componentClass: StatusBar },
        { componentName: 'AgNameValue', componentClass: NameValueComp },
    ],
    userComponents: [
        { componentName: 'agAggregationComponent', componentClass: AggregationComp },
        { componentName: 'agSelectedRowCountComponent', componentClass: SelectedRowsComp },
        { componentName: 'agTotalRowCountComponent', componentClass: TotalRowsComp },
        { componentName: 'agFilteredRowCountComponent', componentClass: FilteredRowsComp },
        { componentName: 'agTotalAndFilteredRowCountComponent', componentClass: TotalAndFilteredRowsComp }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { StatusBarModule };
