"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const chartMenu_1 = require("./menu/chartMenu");
const titleEdit_1 = require("./chartTitle/titleEdit");
const chartController_1 = require("./chartController");
const chartDataModel_1 = require("./chartDataModel");
const barChartProxy_1 = require("./chartProxies/cartesian/barChartProxy");
const areaChartProxy_1 = require("./chartProxies/cartesian/areaChartProxy");
const lineChartProxy_1 = require("./chartProxies/cartesian/lineChartProxy");
const pieChartProxy_1 = require("./chartProxies/polar/pieChartProxy");
const scatterChartProxy_1 = require("./chartProxies/cartesian/scatterChartProxy");
const histogramChartProxy_1 = require("./chartProxies/cartesian/histogramChartProxy");
const chartOptionsService_1 = require("./services/chartOptionsService");
const comboChartProxy_1 = require("./chartProxies/combo/comboChartProxy");
class GridChartComp extends core_1.Component {
    constructor(params) {
        super(GridChartComp.TEMPLATE);
        this.params = params;
    }
    init() {
        const availableChartThemes = this.gridOptionsWrapper.getChartThemes();
        if (availableChartThemes.length < 1) {
            throw new Error('Cannot create chart: no chart themes are available to be used.');
        }
        let { chartThemeName } = this.params;
        if (!core_1._.includes(availableChartThemes, chartThemeName)) {
            chartThemeName = availableChartThemes[0];
        }
        const modelParams = {
            chartId: this.params.chartId,
            pivotChart: this.params.pivotChart,
            chartType: this.params.chartType,
            chartThemeName: chartThemeName,
            aggFunc: this.params.aggFunc,
            cellRange: this.params.cellRange,
            suppressChartRanges: this.params.suppressChartRanges,
            unlinkChart: this.params.unlinkChart,
            crossFiltering: this.params.crossFiltering,
            seriesChartTypes: this.params.seriesChartTypes,
        };
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        this.addCssClass(isRtl ? 'ag-rtl' : 'ag-ltr');
        // only the chart controller interacts with the chart model
        const model = this.createBean(new chartDataModel_1.ChartDataModel(modelParams));
        this.chartController = this.createManagedBean(new chartController_1.ChartController(model));
        this.validateCustomThemes();
        // create chart before dialog to ensure dialog is correct size
        this.createChart();
        if (this.params.insideDialog) {
            this.addDialog();
        }
        this.addMenu();
        this.addTitleEditComp();
        this.addManagedListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.refresh.bind(this));
        if (this.chartMenu) {
            // chart menu may not exist, i.e. cross filtering
            this.addManagedListener(this.chartMenu, chartMenu_1.ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));
        }
        this.refresh();
        this.raiseChartCreatedEvent();
    }
    validateCustomThemes() {
        const suppliedThemes = this.gridOptionsWrapper.getChartThemes();
        const customChartThemes = this.gridOptionsWrapper.getCustomChartThemes();
        if (customChartThemes) {
            core_1._.getAllKeysInObjects([customChartThemes]).forEach(customThemeName => {
                if (!core_1._.includes(suppliedThemes, customThemeName)) {
                    console.warn("AG Grid: a custom chart theme with the name '" + customThemeName + "' has been " +
                        "supplied but not added to the 'chartThemes' list");
                }
            });
        }
    }
    createChart() {
        // if chart already exists, destroy it and remove it from DOM
        if (this.chartProxy) {
            this.chartProxy.destroy();
        }
        const crossFilterCallback = (event, reset) => {
            const ctx = this.params.crossFilteringContext;
            ctx.lastSelectedChartId = reset ? '' : this.chartController.getChartId();
            if (reset) {
                this.params.crossFilteringResetCallback();
            }
            this.crossFilterService.filter(event, reset);
        };
        const chartType = this.chartController.getChartType();
        const chartProxyParams = {
            chartType,
            getChartThemeName: this.getChartThemeName.bind(this),
            getChartThemes: this.getChartThemes.bind(this),
            customChartThemes: this.gridOptionsWrapper.getCustomChartThemes(),
            getGridOptionsChartThemeOverrides: this.getGridOptionsChartThemeOverrides.bind(this),
            apiChartThemeOverrides: this.params.chartThemeOverrides,
            crossFiltering: this.params.crossFiltering,
            crossFilterCallback,
            parentElement: this.eChart,
            grouping: this.chartController.isGrouping(),
            chartOptionsToRestore: this.params.chartOptionsToRestore,
            chartPaletteToRestore: this.params.chartPaletteToRestore,
            seriesChartTypes: this.chartController.getSeriesChartTypes(),
        };
        // ensure 'restoring' options are not reused when switching chart types
        this.params.chartOptionsToRestore = undefined;
        // set local state used to detect when chart changes
        this.chartType = chartType;
        this.chartThemeName = this.chartController.getChartThemeName();
        this.chartProxy = GridChartComp.createChartProxy(chartProxyParams);
        if (!this.chartProxy) {
            console.warn('AG Grid: invalid chart type supplied: ', chartProxyParams.chartType);
            return;
        }
        const canvas = this.eChart.querySelector('canvas');
        if (canvas) {
            canvas.classList.add('ag-charts-canvas');
        }
        this.chartController.setChartProxy(this.chartProxy);
        this.chartOptionsService = this.createBean(new chartOptionsService_1.ChartOptionsService(this.chartController));
        this.titleEdit && this.titleEdit.refreshTitle(this.chartController, this.chartOptionsService);
    }
    getChartThemeName() {
        return this.chartController.getChartThemeName();
    }
    getChartThemes() {
        return this.chartController.getThemes();
    }
    getGridOptionsChartThemeOverrides() {
        return this.gridOptionsWrapper.getChartThemeOverrides();
    }
    static createChartProxy(chartProxyParams) {
        switch (chartProxyParams.chartType) {
            case 'column':
            case 'bar':
            case 'groupedColumn':
            case 'stackedColumn':
            case 'normalizedColumn':
            case 'groupedBar':
            case 'stackedBar':
            case 'normalizedBar':
                return new barChartProxy_1.BarChartProxy(chartProxyParams);
            case 'pie':
            case 'doughnut':
                return new pieChartProxy_1.PieChartProxy(chartProxyParams);
            case 'area':
            case 'stackedArea':
            case 'normalizedArea':
                return new areaChartProxy_1.AreaChartProxy(chartProxyParams);
            case 'line':
                return new lineChartProxy_1.LineChartProxy(chartProxyParams);
            case 'scatter':
            case 'bubble':
                return new scatterChartProxy_1.ScatterChartProxy(chartProxyParams);
            case 'histogram':
                return new histogramChartProxy_1.HistogramChartProxy(chartProxyParams);
            case 'columnLineCombo':
            case 'areaColumnCombo':
            case 'customCombo':
                return new comboChartProxy_1.ComboChartProxy(chartProxyParams);
            default:
                throw `AG Grid: Unable to create chart as an invalid chartType = '${chartProxyParams.chartType}' was supplied.`;
        }
    }
    addDialog() {
        const title = this.chartTranslationService.translate(this.params.pivotChart ? 'pivotChartTitle' : 'rangeChartTitle');
        const { width, height } = this.getBestDialogSize();
        this.chartDialog = new core_1.AgDialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title,
            width,
            height,
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().createBean(this.chartDialog);
        this.chartDialog.addEventListener(core_1.AgDialog.EVENT_DESTROYED, () => this.destroy());
    }
    getBestDialogSize() {
        const popupParent = this.popupService.getPopupParent();
        const maxWidth = core_1._.getAbsoluteWidth(popupParent) * 0.75;
        const maxHeight = core_1._.getAbsoluteHeight(popupParent) * 0.75;
        const ratio = 0.553;
        const chart = this.chartProxy.getChart();
        let width = this.params.insideDialog ? 850 : chart.width;
        let height = this.params.insideDialog ? 470 : chart.height;
        if (width > maxWidth || height > maxHeight) {
            width = Math.min(width, maxWidth);
            height = Math.round(width * ratio);
            if (height > maxHeight) {
                height = maxHeight;
                width = Math.min(width, Math.round(height / ratio));
            }
        }
        return { width, height };
    }
    addMenu() {
        if (!this.params.crossFiltering) {
            this.chartMenu = this.createBean(new chartMenu_1.ChartMenu(this.eChartContainer, this.eMenuContainer, this.chartController, this.chartOptionsService));
            this.eChartContainer.appendChild(this.chartMenu.getGui());
        }
    }
    addTitleEditComp() {
        this.titleEdit = this.createBean(new titleEdit_1.TitleEdit(this.chartMenu));
        this.eTitleEditContainer.appendChild(this.titleEdit.getGui());
        if (this.chartProxy) {
            this.titleEdit.refreshTitle(this.chartController, this.chartOptionsService);
        }
    }
    refresh() {
        if (this.shouldRecreateChart()) {
            this.createChart();
        }
        this.updateChart();
    }
    shouldRecreateChart() {
        return this.chartType !== this.chartController.getChartType() || this.chartThemeName !== this.chartController.getChartThemeName();
    }
    getCurrentChartType() {
        return this.chartType;
    }
    getChartModel() {
        return this.chartController.getChartModel();
    }
    getChartImageDataURL(fileFormat) {
        return this.chartProxy.getChartImageDataURL(fileFormat);
    }
    updateChart() {
        const { chartProxy } = this;
        const selectedCols = this.chartController.getSelectedValueColState();
        const fields = selectedCols.map(c => ({ colId: c.colId, displayName: c.displayName }));
        const data = this.chartController.getChartData();
        const chartEmpty = this.handleEmptyChart(data, fields);
        if (chartEmpty) {
            return;
        }
        let chartUpdateParams = this.chartController.getChartUpdateParams();
        chartProxy.update(chartUpdateParams);
        this.titleEdit.refreshTitle(this.chartController, this.chartOptionsService);
    }
    handleEmptyChart(data, fields) {
        const container = this.chartProxy.getChart().container;
        const pivotModeDisabled = this.chartController.isPivotChart() && !this.chartController.isPivotMode();
        let minFieldsRequired = 1;
        if (this.chartController.isActiveXYChart()) {
            minFieldsRequired = this.chartController.getChartType() === 'bubble' ? 3 : 2;
        }
        const isEmptyChart = fields.length < minFieldsRequired || data.length === 0;
        if (container) {
            const isEmpty = pivotModeDisabled || isEmptyChart;
            core_1._.setDisplayed(this.eChart, !isEmpty);
            core_1._.setDisplayed(this.eEmpty, isEmpty);
        }
        if (pivotModeDisabled) {
            this.eEmpty.innerText = this.chartTranslationService.translate('pivotChartRequiresPivotMode');
            return true;
        }
        if (isEmptyChart) {
            this.eEmpty.innerText = this.chartTranslationService.translate('noDataToChart');
            return true;
        }
        return false;
    }
    downloadChart() {
        this.chartProxy.downloadChart();
    }
    getChartId() {
        return this.chartController.getChartId();
    }
    getUnderlyingChart() {
        return this.chartProxy.getChart();
    }
    crossFilteringReset() {
        this.chartProxy.crossFilteringReset();
    }
    setActiveChartCellRange(focusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget)) {
            return;
        }
        this.chartController.setChartRange(true);
        this.gridApi.focusService.clearFocusedCell();
    }
    raiseChartCreatedEvent() {
        const event = Object.freeze({
            type: core_1.Events.EVENT_CHART_CREATED,
            chartId: this.chartController.getChartId()
        });
        this.eventService.dispatchEvent(event);
    }
    raiseChartDestroyedEvent() {
        const event = Object.freeze({
            type: core_1.Events.EVENT_CHART_DESTROYED,
            chartId: this.chartController.getChartId(),
        });
        this.eventService.dispatchEvent(event);
    }
    destroy() {
        super.destroy();
        if (this.chartProxy) {
            this.chartProxy.destroy();
        }
        this.destroyBean(this.chartMenu);
        // don't want to invoke destroy() on the Dialog (prevents destroy loop)
        if (this.chartDialog && this.chartDialog.isAlive()) {
            this.destroyBean(this.chartDialog);
        }
        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        const eGui = this.getGui();
        core_1._.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        core_1._.removeFromParent(eGui);
        this.raiseChartDestroyedEvent();
    }
}
GridChartComp.TEMPLATE = `<div class="ag-chart" tabindex="-1">
            <div ref="eChartContainer" tabindex="-1" class="ag-chart-components-wrapper">
                <div ref="eChart" class="ag-chart-canvas-wrapper"></div>
                <div ref="eEmpty" class="ag-chart-empty-text ag-unselectable"></div>
            </div>
            <div ref="eTitleEditContainer"></div>
            <div ref="eMenuContainer" class="ag-chart-docked-container"></div>
        </div>`;
__decorate([
    core_1.RefSelector('eChart')
], GridChartComp.prototype, "eChart", void 0);
__decorate([
    core_1.RefSelector('eChartContainer')
], GridChartComp.prototype, "eChartContainer", void 0);
__decorate([
    core_1.RefSelector('eMenuContainer')
], GridChartComp.prototype, "eMenuContainer", void 0);
__decorate([
    core_1.RefSelector('eEmpty')
], GridChartComp.prototype, "eEmpty", void 0);
__decorate([
    core_1.RefSelector('eTitleEditContainer')
], GridChartComp.prototype, "eTitleEditContainer", void 0);
__decorate([
    core_1.Autowired('chartCrossFilterService')
], GridChartComp.prototype, "crossFilterService", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], GridChartComp.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.Autowired('gridApi')
], GridChartComp.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired('popupService')
], GridChartComp.prototype, "popupService", void 0);
__decorate([
    core_1.PostConstruct
], GridChartComp.prototype, "init", null);
exports.GridChartComp = GridChartComp;
