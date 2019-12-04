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
import { _, AgDialog, Autowired, ChartType, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ChartMenu } from "./menu/chartMenu";
import { ChartController } from "./chartController";
import { ChartDataModel } from "./chartDataModel";
import { BarChartProxy } from "./chartProxies/cartesian/barChartProxy";
import { AreaChartProxy } from "./chartProxies/cartesian/areaChartProxy";
import { LineChartProxy } from "./chartProxies/cartesian/lineChartProxy";
import { PieChartProxy } from "./chartProxies/polar/pieChartProxy";
import { DoughnutChartProxy } from "./chartProxies/polar/doughnutChartProxy";
import { ScatterChartProxy } from "./chartProxies/cartesian/scatterChartProxy";
var GridChartComp = /** @class */ (function (_super) {
    __extends(GridChartComp, _super);
    function GridChartComp(params) {
        var _this = _super.call(this, GridChartComp.TEMPLATE) || this;
        _this.getChartPaletteName = function () { return _this.chartController.getPaletteName(); };
        _this.getChartComponentsWrapper = function () { return _this.eChartComponentsWrapper; };
        _this.getDockedContainer = function () { return _this.eDockedContainer; };
        _this.getCurrentChartType = function () { return _this.chartType; };
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
        this.model = this.wireBean(new ChartDataModel(modelParams));
        this.chartController = this.wireBean(new ChartController(this.model, this.params.chartPaletteName));
        this.createChart();
        if (this.params.insideDialog) {
            this.addDialog();
        }
        this.addResizeListener();
        this.addMenu();
        this.addDestroyableEventListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));
        this.refresh();
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
        var processChartOptionsFunc = this.params.processChartOptions ?
            this.params.processChartOptions : this.gridOptionsWrapper.getProcessChartOptionsFunc();
        var categorySelected = this.model.getSelectedDimension().colId !== ChartDataModel.DEFAULT_CATEGORY;
        var chartType = this.model.getChartType();
        var isGrouping = this.model.isGrouping();
        var chartProxyParams = {
            chartType: chartType,
            processChartOptions: processChartOptionsFunc,
            getChartPaletteName: this.getChartPaletteName.bind(this),
            allowPaletteOverride: !this.params.chartPaletteName,
            isDarkTheme: this.environment.isThemeDark.bind(this.environment),
            parentElement: this.eChart,
            width: width,
            height: height,
            eventService: this.eventService,
            categorySelected: categorySelected,
            grouping: isGrouping,
            document: this.gridOptionsWrapper.getDocument()
        };
        // set local state used to detect when chart type changes
        this.chartType = chartType;
        this.chartGroupingActive = isGrouping;
        this.chartProxy = this.createChartProxy(chartProxyParams);
        this.chartController.setChartProxy(this.chartProxy);
    };
    GridChartComp.prototype.createChartProxy = function (chartProxyParams) {
        switch (chartProxyParams.chartType) {
            case ChartType.GroupedColumn:
            case ChartType.StackedColumn:
            case ChartType.NormalizedColumn:
            case ChartType.GroupedBar:
            case ChartType.StackedBar:
            case ChartType.NormalizedBar:
                return new BarChartProxy(chartProxyParams);
            case ChartType.Pie:
                return new PieChartProxy(chartProxyParams);
            case ChartType.Doughnut:
                return new DoughnutChartProxy(chartProxyParams);
            case ChartType.Area:
            case ChartType.StackedArea:
            case ChartType.NormalizedArea:
                return new AreaChartProxy(chartProxyParams);
            case ChartType.Line:
                return new LineChartProxy(chartProxyParams);
            case ChartType.Scatter:
            case ChartType.Bubble:
                return new ScatterChartProxy(chartProxyParams);
        }
    };
    GridChartComp.prototype.addDialog = function () {
        var _this = this;
        var title = this.chartTranslator.translate(this.params.pivotChart ? 'pivotChartTitle' : 'rangeChartTitle');
        this.chartDialog = new AgDialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title: title,
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().wireBean(this.chartDialog);
        this.chartDialog.addEventListener(AgDialog.EVENT_DESTROYED, function () { return _this.destroy(); });
    };
    GridChartComp.prototype.addMenu = function () {
        this.chartMenu = new ChartMenu(this.chartController);
        this.chartMenu.setParentComponent(this);
        this.getContext().wireBean(this.chartMenu);
        this.eChartComponentsWrapper.appendChild(this.chartMenu.getGui());
    };
    GridChartComp.prototype.refresh = function () {
        if (this.shouldRecreateChart()) {
            this.createChart();
        }
        this.updateChart();
    };
    GridChartComp.prototype.shouldRecreateChart = function () {
        var chartTypeChanged = this.chartType !== this.model.getChartType();
        var groupingChanged = this.chartGroupingActive !== this.model.isGrouping();
        return chartTypeChanged || groupingChanged;
    };
    GridChartComp.prototype.slideDockedOut = function (width) {
        this.eDockedContainer.style.minWidth = width + "px";
    };
    GridChartComp.prototype.slideDockedIn = function () {
        this.eDockedContainer.style.minWidth = '0';
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
            category: {
                id: selectedDimension.colId,
                name: selectedDimension.displayName
            },
            fields: fields
        };
        chartProxy.update(chartUpdateParams);
    };
    GridChartComp.prototype.handleEmptyChart = function (data, fields) {
        var parent = this.chartProxy.getChart().parent;
        var pivotModeDisabled = this.model.isPivotChart() && !this.model.isPivotMode();
        var minFieldsRequired = 1;
        if (this.chartController.isActiveXYChart()) {
            minFieldsRequired = this.model.getChartType() === ChartType.Bubble ? 3 : 2;
        }
        var isEmptyChart = fields.length < minFieldsRequired || data.length === 0;
        if (parent) {
            _.addOrRemoveCssClass(parent, 'ag-chart-empty', pivotModeDisabled || isEmptyChart);
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
        var chart = this.chartProxy.getChart();
        var fileName = chart.title ? chart.title.text : 'chart';
        chart.scene.download(fileName);
    };
    GridChartComp.prototype.refreshCanvasSize = function () {
        var eChartWrapper = this.eChart;
        var chart = this.chartProxy.getChart();
        chart.height = _.getInnerHeight(eChartWrapper);
        chart.width = _.getInnerWidth(eChartWrapper);
    };
    GridChartComp.prototype.addResizeListener = function () {
        var _this = this;
        var eGui = this.getGui();
        var resizeFunc = function () {
            if (!eGui || !eGui.offsetParent) {
                observeResizeFunc();
                return;
            }
            _this.refreshCanvasSize();
        };
        var observeResizeFunc = this.resizeObserverService.observeResize(this.eChart, resizeFunc, 5);
    };
    GridChartComp.prototype.setActiveChartCellRange = function (focusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget)) {
            return;
        }
        this.chartController.setChartRange();
    };
    GridChartComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.chartController) {
            this.chartController.destroy();
        }
        if (this.chartProxy) {
            this.chartProxy.destroy();
        }
        if (this.chartMenu) {
            this.chartMenu.destroy();
        }
        // don't want to invoke destroy() on the Dialog / MessageBox (prevents destroy loop)
        if (this.chartDialog && this.chartDialog.isAlive()) {
            this.chartDialog.destroy();
        }
        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        var eGui = this.getGui();
        _.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        _.removeFromParent(eGui);
    };
    GridChartComp.TEMPLATE = "<div class=\"ag-chart\" tabindex=\"-1\">\n            <div ref=\"eChartComponentsWrapper\" tabindex=\"-1\" class=\"ag-chart-components-wrapper\">\n                <div ref=\"eChart\" class=\"ag-chart-canvas-wrapper\">\n                    <div ref=\"eEmpty\" class=\"ag-chart-empty-text ag-unselectable\"></div>\n                </div>\n            </div>\n            <div ref=\"eDockedContainer\" class=\"ag-chart-docked-container\"></div>\n        </div>";
    __decorate([
        RefSelector('eChart')
    ], GridChartComp.prototype, "eChart", void 0);
    __decorate([
        RefSelector('eChartComponentsWrapper')
    ], GridChartComp.prototype, "eChartComponentsWrapper", void 0);
    __decorate([
        RefSelector('eDockedContainer')
    ], GridChartComp.prototype, "eDockedContainer", void 0);
    __decorate([
        RefSelector('eEmpty')
    ], GridChartComp.prototype, "eEmpty", void 0);
    __decorate([
        Autowired('resizeObserverService')
    ], GridChartComp.prototype, "resizeObserverService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], GridChartComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('environment')
    ], GridChartComp.prototype, "environment", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], GridChartComp.prototype, "chartTranslator", void 0);
    __decorate([
        Autowired('eventService')
    ], GridChartComp.prototype, "eventService", void 0);
    __decorate([
        PostConstruct
    ], GridChartComp.prototype, "init", null);
    return GridChartComp;
}(Component));
export { GridChartComp };
