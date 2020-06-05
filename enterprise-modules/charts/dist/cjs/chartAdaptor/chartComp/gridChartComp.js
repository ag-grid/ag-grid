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
var chartMenu_1 = require("./menu/chartMenu");
var titleEdit_1 = require("./titleEdit");
var chartController_1 = require("./chartController");
var chartDataModel_1 = require("./chartDataModel");
var barChartProxy_1 = require("./chartProxies/cartesian/barChartProxy");
var areaChartProxy_1 = require("./chartProxies/cartesian/areaChartProxy");
var lineChartProxy_1 = require("./chartProxies/cartesian/lineChartProxy");
var pieChartProxy_1 = require("./chartProxies/polar/pieChartProxy");
var doughnutChartProxy_1 = require("./chartProxies/polar/doughnutChartProxy");
var scatterChartProxy_1 = require("./chartProxies/cartesian/scatterChartProxy");
var histogramChartProxy_1 = require("./chartProxies/cartesian/histogramChartProxy");
var GridChartComp = /** @class */ (function (_super) {
    __extends(GridChartComp, _super);
    function GridChartComp(params) {
        var _this = _super.call(this, GridChartComp.TEMPLATE) || this;
        _this.params = params;
        return _this;
    }
    GridChartComp.prototype.init = function () {
        var modelParams = {
            pivotChart: this.params.pivotChart,
            chartType: this.params.chartType,
            aggFunc: this.params.aggFunc,
            cellRange: this.params.cellRange,
            suppressChartRanges: this.params.suppressChartRanges,
        };
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        core_1._.addCssClass(this.getGui(), isRtl ? 'ag-rtl' : 'ag-ltr');
        this.model = this.createBean(new chartDataModel_1.ChartDataModel(modelParams));
        this.chartController = this.createManagedBean(new chartController_1.ChartController(this.model, this.params.chartPaletteName));
        // create chart before dialog to ensure dialog is correct size
        this.createChart();
        if (this.params.insideDialog) {
            this.addDialog();
        }
        this.addMenu();
        this.addTitleEditComp();
        this.addManagedListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.refresh.bind(this));
        this.addManagedListener(this.chartMenu, chartMenu_1.ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));
        this.refresh();
        this.raiseChartCreatedEvent();
    };
    GridChartComp.prototype.createChart = function () {
        var width, height;
        // if chart already exists, destroy it and remove it from DOM
        if (this.chartProxy) {
            var chart = this.chartProxy.getChart();
            if (chart) {
                // preserve existing width/height
                width = chart.width;
                height = chart.height;
            }
            this.chartProxy.destroy();
        }
        var processChartOptionsFunc = this.params.processChartOptions || this.gridOptionsWrapper.getProcessChartOptionsFunc();
        var chartType = this.model.getChartType();
        var isGrouping = this.model.isGrouping();
        var chartProxyParams = {
            chartId: this.model.getChartId(),
            chartType: chartType,
            processChartOptions: processChartOptionsFunc,
            getChartPaletteName: this.getChartPaletteName.bind(this),
            allowPaletteOverride: !this.params.chartPaletteName,
            isDarkTheme: this.environment.isThemeDark.bind(this.environment),
            parentElement: this.eChart,
            width: width,
            height: height,
            grouping: isGrouping,
            document: this.gridOptionsWrapper.getDocument(),
            eventService: this.eventService,
            gridApi: this.gridApi,
            columnApi: this.columnApi,
        };
        // set local state used to detect when chart type changes
        this.chartType = chartType;
        this.chartProxy = this.createChartProxy(chartProxyParams);
        this.titleEdit && this.titleEdit.setChartProxy(this.chartProxy);
        core_1._.addCssClass(this.eChart.querySelector('canvas'), 'ag-charts-canvas');
        this.chartController.setChartProxy(this.chartProxy);
    };
    GridChartComp.prototype.getChartPaletteName = function () {
        return this.chartController.getPaletteName();
    };
    GridChartComp.prototype.createChartProxy = function (chartProxyParams) {
        switch (chartProxyParams.chartType) {
            case core_1.ChartType.GroupedColumn:
            case core_1.ChartType.StackedColumn:
            case core_1.ChartType.NormalizedColumn:
            case core_1.ChartType.GroupedBar:
            case core_1.ChartType.StackedBar:
            case core_1.ChartType.NormalizedBar:
                return new barChartProxy_1.BarChartProxy(chartProxyParams);
            case core_1.ChartType.Pie:
                return new pieChartProxy_1.PieChartProxy(chartProxyParams);
            case core_1.ChartType.Doughnut:
                return new doughnutChartProxy_1.DoughnutChartProxy(chartProxyParams);
            case core_1.ChartType.Area:
            case core_1.ChartType.StackedArea:
            case core_1.ChartType.NormalizedArea:
                return new areaChartProxy_1.AreaChartProxy(chartProxyParams);
            case core_1.ChartType.Line:
                return new lineChartProxy_1.LineChartProxy(chartProxyParams);
            case core_1.ChartType.Scatter:
            case core_1.ChartType.Bubble:
                return new scatterChartProxy_1.ScatterChartProxy(chartProxyParams);
            case core_1.ChartType.Histogram:
                return new histogramChartProxy_1.HistogramChartProxy(chartProxyParams);
        }
    };
    GridChartComp.prototype.addDialog = function () {
        var _this = this;
        var title = this.chartTranslator.translate(this.params.pivotChart ? 'pivotChartTitle' : 'rangeChartTitle');
        var _a = this.getBestDialogSize(), width = _a.width, height = _a.height;
        this.chartDialog = new core_1.AgDialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title: title,
            width: width,
            height: height,
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().createBean(this.chartDialog);
        this.chartDialog.addEventListener(core_1.AgDialog.EVENT_DESTROYED, function () { return _this.destroy(); });
    };
    GridChartComp.prototype.getBestDialogSize = function () {
        var popupParent = this.popupService.getPopupParent();
        var maxWidth = core_1._.getAbsoluteWidth(popupParent) * 0.75;
        var maxHeight = core_1._.getAbsoluteHeight(popupParent) * 0.75;
        var ratio = 0.553;
        {
            var _a = this.chartProxy.getChartOptions(), width_1 = _a.width, height_1 = _a.height;
            if (width_1 && height_1) {
                return { width: width_1, height: height_1 };
            }
        }
        var chart = this.chartProxy.getChart();
        var width = this.params.insideDialog ? 850 : chart.width;
        var height = this.params.insideDialog ? 470 : chart.height;
        if (width > maxWidth || height > maxHeight) {
            width = Math.min(width, maxWidth);
            height = Math.round(width * ratio);
            if (height > maxHeight) {
                height = maxHeight;
                width = Math.min(width, Math.round(height / ratio));
            }
        }
        return { width: width, height: height };
    };
    GridChartComp.prototype.addMenu = function () {
        this.chartMenu = this.createBean(new chartMenu_1.ChartMenu(this.eChartContainer, this.eMenuContainer, this.chartController));
        this.eChartContainer.appendChild(this.chartMenu.getGui());
    };
    GridChartComp.prototype.addTitleEditComp = function () {
        this.titleEdit = this.createBean(new titleEdit_1.TitleEdit(this.chartMenu));
        this.eTitleEditContainer.appendChild(this.titleEdit.getGui());
        if (this.chartProxy) {
            this.titleEdit.setChartProxy(this.chartProxy);
        }
    };
    GridChartComp.prototype.refresh = function () {
        if (this.shouldRecreateChart()) {
            this.createChart();
        }
        this.updateChart();
    };
    GridChartComp.prototype.shouldRecreateChart = function () {
        return this.chartType !== this.model.getChartType();
    };
    GridChartComp.prototype.getCurrentChartType = function () {
        return this.chartType;
    };
    GridChartComp.prototype.getChartModel = function () {
        return this.chartController.getChartModel();
    };
    GridChartComp.prototype.updateChart = function () {
        var _a = this, model = _a.model, chartProxy = _a.chartProxy;
        var selectedCols = model.getSelectedValueColState();
        var fields = selectedCols.map(function (c) { return ({ colId: c.colId, displayName: c.displayName }); });
        var data = model.getData();
        var chartEmpty = this.handleEmptyChart(data, fields);
        if (chartEmpty) {
            return;
        }
        var selectedDimension = model.getSelectedDimension();
        var chartUpdateParams = {
            data: data,
            grouping: model.isGrouping(),
            category: {
                id: selectedDimension.colId,
                name: selectedDimension.displayName
            },
            fields: fields
        };
        chartProxy.update(chartUpdateParams);
    };
    GridChartComp.prototype.handleEmptyChart = function (data, fields) {
        var container = this.chartProxy.getChart().container;
        var pivotModeDisabled = this.model.isPivotChart() && !this.model.isPivotMode();
        var minFieldsRequired = 1;
        if (this.chartController.isActiveXYChart()) {
            minFieldsRequired = this.model.getChartType() === core_1.ChartType.Bubble ? 3 : 2;
        }
        var isEmptyChart = fields.length < minFieldsRequired || data.length === 0;
        if (container) {
            var isEmpty = pivotModeDisabled || isEmptyChart;
            core_1._.setDisplayed(this.eChart, !isEmpty);
            core_1._.setDisplayed(this.eEmpty, isEmpty);
        }
        if (pivotModeDisabled) {
            this.eEmpty.innerText = this.chartTranslator.translate('pivotChartRequiresPivotMode');
            return true;
        }
        if (isEmptyChart) {
            this.eEmpty.innerText = this.chartTranslator.translate('noDataToChart');
            return true;
        }
        return false;
    };
    GridChartComp.prototype.downloadChart = function () {
        this.chartProxy.downloadChart();
    };
    GridChartComp.prototype.refreshCanvasSize = function () {
        if (!this.params.insideDialog) {
            return;
        }
        var _a = this, chartProxy = _a.chartProxy, eChart = _a.eChart;
        if (this.chartMenu.isVisible()) {
            // we don't want the menu showing to affect the chart options
            var chart = this.chartProxy.getChart();
            chart.height = core_1._.getInnerHeight(eChart);
            chart.width = core_1._.getInnerWidth(eChart);
        }
        else {
            chartProxy.setChartOption('width', core_1._.getInnerWidth(eChart));
            chartProxy.setChartOption('height', core_1._.getInnerHeight(eChart));
        }
    };
    GridChartComp.prototype.setActiveChartCellRange = function (focusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget)) {
            return;
        }
        this.chartController.setChartRange(true);
        this.gridApi.focusController.clearFocusedCell();
    };
    GridChartComp.prototype.raiseChartCreatedEvent = function () {
        var chartModel = this.chartController.getChartModel();
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_CREATED,
            chartId: chartModel.chartId,
            chartModel: chartModel,
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    };
    GridChartComp.prototype.raiseChartDestroyedEvent = function () {
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_DESTROYED,
            chartId: this.model.getChartId(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    };
    GridChartComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
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
        var eGui = this.getGui();
        core_1._.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        core_1._.removeFromParent(eGui);
        this.raiseChartDestroyedEvent();
    };
    GridChartComp.TEMPLATE = "<div class=\"ag-chart\" tabindex=\"-1\">\n            <div ref=\"eChartContainer\" tabindex=\"-1\" class=\"ag-chart-components-wrapper\">\n                <div ref=\"eChart\" class=\"ag-chart-canvas-wrapper\"></div>\n                <div ref=\"eEmpty\" class=\"ag-chart-empty-text ag-unselectable\"></div>\n            </div>\n            <div ref=\"eTitleEditContainer\"></div>\n            <div ref=\"eMenuContainer\" class=\"ag-chart-docked-container\"></div>\n        </div>";
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
        core_1.Autowired('gridOptionsWrapper')
    ], GridChartComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('environment')
    ], GridChartComp.prototype, "environment", void 0);
    __decorate([
        core_1.Autowired('chartTranslator')
    ], GridChartComp.prototype, "chartTranslator", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], GridChartComp.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], GridChartComp.prototype, "columnApi", void 0);
    __decorate([
        core_1.Autowired('popupService')
    ], GridChartComp.prototype, "popupService", void 0);
    __decorate([
        core_1.PostConstruct
    ], GridChartComp.prototype, "init", null);
    return GridChartComp;
}(core_1.Component));
exports.GridChartComp = GridChartComp;
//# sourceMappingURL=gridChartComp.js.map