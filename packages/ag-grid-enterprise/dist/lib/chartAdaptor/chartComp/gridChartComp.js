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
var chartMenu_1 = require("./menu/chartMenu");
var chartController_1 = require("./chartController");
var chartModel_1 = require("./chartModel");
var barChartProxy_1 = require("./chartProxies/cartesian/barChartProxy");
var areaChartProxy_1 = require("./chartProxies/cartesian/areaChartProxy");
var lineChartProxy_1 = require("./chartProxies/cartesian/lineChartProxy");
var pieChartProxy_1 = require("./chartProxies/polar/pieChartProxy");
var doughnutChartProxy_1 = require("./chartProxies/polar/doughnutChartProxy");
var scatterChartProxy_1 = require("./chartProxies/cartesian/scatterChartProxy");
var palettes_1 = require("../../charts/chart/palettes");
var chartTranslator_1 = require("./chartTranslator");
var categoryAxis_1 = require("../../charts/chart/axis/categoryAxis");
var numberAxis_1 = require("../../charts/chart/axis/numberAxis");
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
            cellRanges: [this.params.cellRange],
            suppressChartRanges: this.params.suppressChartRanges,
            palettes: palettes_1.palettes,
            activePalette: 0
        };
        this.model = new chartModel_1.ChartModel(modelParams);
        this.getContext().wireBean(this.model);
        this.chartController = new chartController_1.ChartController(this.model);
        this.getContext().wireBean(this.chartController);
        this.createChart();
        if (this.params.insideDialog) {
            this.addDialog();
        }
        this.addResizeListener();
        this.addMenu();
        this.addDestroyableEventListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addDestroyableEventListener(this.chartController, chartController_1.ChartController.EVENT_CHART_MODEL_UPDATED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.chartMenu, chartMenu_1.ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));
        this.refresh();
    };
    GridChartComp.prototype.createChart = function () {
        var _a = this.params, width = _a.width, height = _a.height;
        // destroy chart and remove it from DOM
        if (this.chartProxy) {
            var chart = this.chartProxy.getChart();
            height = chart.height;
            width = chart.width;
            this.chartProxy.destroy();
            var canvas = this.eChart.querySelector('canvas');
            if (canvas) {
                this.eChart.removeChild(canvas);
            }
        }
        var processChartOptionsFunc = this.params.processChartOptions ?
            this.params.processChartOptions : this.gridOptionsWrapper.getProcessChartOptionsFunc();
        var categorySelected = this.model.getSelectedDimension().colId !== chartModel_1.ChartModel.DEFAULT_CATEGORY;
        var chartProxyParams = {
            chartType: this.model.getChartType(),
            processChartOptions: processChartOptionsFunc,
            getSelectedPalette: this.getSelectedPalette.bind(this),
            isDarkTheme: this.environment.isThemeDark.bind(this.environment),
            parentElement: this.eChart,
            width: width,
            height: height,
            eventService: this.eventService,
            categorySelected: categorySelected,
            grouping: this.model.isGrouping(),
            document: this.gridOptionsWrapper.getDocument()
        };
        // local state used to detect when chart type changes
        this.currentChartType = this.model.getChartType();
        this.currentChartGroupingActive = this.model.isGrouping();
        this.chartProxy = this.createChartProxy(chartProxyParams);
        // update chart proxy ref (used by format panel)
        this.model.setChartProxy(this.chartProxy);
    };
    GridChartComp.prototype.getSelectedPalette = function () {
        return this.model.getPalettes()[this.model.getActivePalette()];
    };
    GridChartComp.prototype.createChartProxy = function (chartOptions) {
        switch (chartOptions.chartType) {
            case ag_grid_community_1.ChartType.GroupedColumn:
            case ag_grid_community_1.ChartType.StackedColumn:
            case ag_grid_community_1.ChartType.NormalizedColumn:
            case ag_grid_community_1.ChartType.GroupedBar:
            case ag_grid_community_1.ChartType.StackedBar:
            case ag_grid_community_1.ChartType.NormalizedBar:
                return new barChartProxy_1.BarChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Pie:
                return new pieChartProxy_1.PieChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Doughnut:
                return new doughnutChartProxy_1.DoughnutChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Area:
            case ag_grid_community_1.ChartType.StackedArea:
            case ag_grid_community_1.ChartType.NormalizedArea:
                return new areaChartProxy_1.AreaChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Line:
                return new lineChartProxy_1.LineChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Scatter:
            case ag_grid_community_1.ChartType.Bubble:
                return new scatterChartProxy_1.ScatterChartProxy(chartOptions);
        }
    };
    GridChartComp.prototype.addDialog = function () {
        var _this = this;
        var title = this.chartTranslator.translate(this.params.pivotChart ? 'pivotChartTitle' : 'rangeChartTitle');
        this.chartDialog = new ag_grid_community_1.AgDialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title: title,
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().wireBean(this.chartDialog);
        this.chartDialog.addEventListener(ag_grid_community_1.AgDialog.EVENT_DESTROYED, function () { return _this.destroy(); });
    };
    GridChartComp.prototype.addMenu = function () {
        this.chartMenu = new chartMenu_1.ChartMenu(this.chartController);
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
        var chartTypeChanged = this.model.getChartType() !== this.currentChartType;
        var groupingChanged = this.currentChartGroupingActive !== this.model.isGrouping();
        if (chartTypeChanged || groupingChanged) {
            return true;
        }
        // we also need to recreate XY charts when xAxis changes
        if (this.isXYChart()) {
            var categorySelected = !this.chartController.isDefaultCategorySelected();
            var chart = this.chartProxy.getChart();
            var switchingToCategoryAxis = categorySelected && chart.xAxis instanceof numberAxis_1.NumberAxis;
            var switchingToNumberAxis = !categorySelected && chart.xAxis instanceof categoryAxis_1.CategoryAxis;
            return switchingToCategoryAxis || switchingToNumberAxis;
        }
        return false;
    };
    GridChartComp.prototype.getChartComponentsWrapper = function () {
        return this.eChartComponentsWrapper;
    };
    GridChartComp.prototype.getDockedContainer = function () {
        return this.eDockedContainer;
    };
    GridChartComp.prototype.slideDockedOut = function (width) {
        this.eDockedContainer.style.minWidth = width + 'px';
    };
    GridChartComp.prototype.slideDockedIn = function () {
        this.eDockedContainer.style.minWidth = '0';
    };
    GridChartComp.prototype.getCurrentChartType = function () {
        return this.currentChartType;
    };
    GridChartComp.prototype.updateChart = function () {
        var _a = this, model = _a.model, chartProxy = _a.chartProxy;
        var selectedCols = model.getSelectedValueColState();
        var fields = selectedCols.map(function (c) {
            return { colId: c.colId, displayName: c.displayName };
        });
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
            if (this.model.getChartType() === ag_grid_community_1.ChartType.Bubble) {
                minFieldsRequired = 3;
            }
            else {
                minFieldsRequired = 2;
            }
        }
        var isEmptyChart = fields.length < minFieldsRequired || data.length === 0;
        if (parent) {
            ag_grid_community_1._.addOrRemoveCssClass(parent, 'ag-chart-empty', pivotModeDisabled || isEmptyChart);
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
        chart.height = ag_grid_community_1._.getInnerHeight(eChartWrapper);
        chart.width = ag_grid_community_1._.getInnerWidth(eChartWrapper);
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
    GridChartComp.prototype.isXYChart = function () {
        return [ag_grid_community_1.ChartType.Scatter, ag_grid_community_1.ChartType.Bubble].indexOf(this.model.getChartType()) > -1;
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
        ag_grid_community_1._.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        ag_grid_community_1._.removeFromParent(eGui);
    };
    GridChartComp.TEMPLATE = "<div class=\"ag-chart\" tabindex=\"-1\">\n            <div ref=\"eChartComponentsWrapper\" tabindex=\"-1\" class=\"ag-chart-components-wrapper\">\n                <div ref=\"eChart\" class=\"ag-chart-canvas-wrapper\">\n                    <div ref=\"eEmpty\" class=\"ag-chart-empty-text ag-unselectable\"></div>\n                </div>\n            </div>\n            <div ref=\"eDockedContainer\" class=\"ag-chart-docked-container\"></div>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('eChart'),
        __metadata("design:type", HTMLElement)
    ], GridChartComp.prototype, "eChart", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eChartComponentsWrapper'),
        __metadata("design:type", HTMLElement)
    ], GridChartComp.prototype, "eChartComponentsWrapper", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eDockedContainer'),
        __metadata("design:type", HTMLElement)
    ], GridChartComp.prototype, "eDockedContainer", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eEmpty'),
        __metadata("design:type", HTMLElement)
    ], GridChartComp.prototype, "eEmpty", void 0);
    __decorate([
        ag_grid_community_1.Autowired('resizeObserverService'),
        __metadata("design:type", ag_grid_community_1.ResizeObserverService)
    ], GridChartComp.prototype, "resizeObserverService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], GridChartComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('environment'),
        __metadata("design:type", ag_grid_community_1.Environment)
    ], GridChartComp.prototype, "environment", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], GridChartComp.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], GridChartComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridChartComp.prototype, "init", null);
    return GridChartComp;
}(ag_grid_community_1.Component));
exports.GridChartComp = GridChartComp;
