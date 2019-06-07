// ag-grid-enterprise v21.0.1
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
var barChartProxy_1 = require("./chartProxies/barChartProxy");
var lineChartProxy_1 = require("./chartProxies/lineChartProxy");
var pieChartProxy_1 = require("./chartProxies/pieChartProxy");
var doughnutChartProxy_1 = require("./chartProxies/doughnutChartProxy");
var palettes_1 = require("../../charts/chart/palettes");
var GridChartComp = /** @class */ (function (_super) {
    __extends(GridChartComp, _super);
    function GridChartComp(params) {
        var _this = _super.call(this, GridChartComp.TEMPLATE) || this;
        _this.params = params;
        return _this;
    }
    GridChartComp.prototype.init = function () {
        var modelParams = {
            chartType: this.params.chartType,
            aggregate: this.params.aggregate,
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
            ag_grid_community_1._.clearElement(this.eChart);
        }
        var processChartOptionsFunc = this.params.processChartOptions ?
            this.params.processChartOptions : this.gridOptionsWrapper.getProcessChartOptionsFunc();
        var chartProxyParams = {
            chartType: this.model.getChartType(),
            processChartOptions: processChartOptionsFunc,
            getSelectedPalette: this.getSelectedPalette.bind(this),
            isDarkTheme: this.environment.isThemeDark.bind(this.environment),
            parentElement: this.eChart,
            width: width,
            height: height,
        };
        this.chartProxy = this.createChartProxy(chartProxyParams);
        this.currentChartType = this.model.getChartType();
    };
    GridChartComp.prototype.getSelectedPalette = function () {
        return this.model.getPalettes()[this.model.getActivePalette()];
    };
    GridChartComp.prototype.createChartProxy = function (chartOptions) {
        switch (chartOptions.chartType) {
            case ag_grid_community_1.ChartType.GroupedBar:
                return new barChartProxy_1.BarChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.StackedBar:
                return new barChartProxy_1.BarChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Pie:
                return new pieChartProxy_1.PieChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Doughnut:
                return new doughnutChartProxy_1.DoughnutChartProxy(chartOptions);
            case ag_grid_community_1.ChartType.Line:
                return new lineChartProxy_1.LineChartProxy(chartOptions);
        }
    };
    GridChartComp.prototype.addDialog = function () {
        var _this = this;
        this.chartDialog = new ag_grid_community_1.Dialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title: '',
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().wireBean(this.chartDialog);
        this.chartDialog.addEventListener(ag_grid_community_1.Dialog.EVENT_DESTROYED, function () { return _this.destroy(); });
    };
    GridChartComp.prototype.addMenu = function () {
        this.chartMenu = new chartMenu_1.ChartMenu(this.chartController);
        this.chartMenu.setParentComponent(this);
        this.getContext().wireBean(this.chartMenu);
        var eChart = this.getGui();
        eChart.appendChild(this.chartMenu.getGui());
    };
    GridChartComp.prototype.refresh = function () {
        if (this.model.getChartType() !== this.currentChartType) {
            this.createChart();
        }
        this.updateChart();
    };
    GridChartComp.prototype.getCurrentChartType = function () {
        return this.currentChartType;
    };
    GridChartComp.prototype.updateChart = function () {
        var selectedCols = this.model.getSelectedColState();
        var fields = selectedCols.map(function (c) {
            return { colId: c.colId, displayName: c.displayName };
        });
        var chartUpdateParams = {
            data: this.model.getData(),
            categoryId: this.model.getSelectedDimensionId(),
            fields: fields
        };
        this.chartProxy.update(chartUpdateParams);
    };
    GridChartComp.prototype.downloadChart = function () {
        // TODO use chart / dialog title for filename
        this.chartProxy.getChart().scene.download({ fileName: "chart" });
    };
    GridChartComp.prototype.addResizeListener = function () {
        var _this = this;
        var eGui = this.getGui();
        var resizeFunc = function () {
            var eParent = eGui.parentElement;
            if (!eGui || !eGui.offsetParent) {
                observeResizeFunc();
                return;
            }
            var chart = _this.chartProxy.getChart();
            chart.height = ag_grid_community_1._.getInnerHeight(eParent);
            chart.width = ag_grid_community_1._.getInnerWidth(eParent);
        };
        var observeResizeFunc = this.resizeObserverService.observeResize(eGui, resizeFunc, 5);
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
        ag_grid_community_1._.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        ag_grid_community_1._.removeFromParent(eGui);
    };
    GridChartComp.TEMPLATE = "<div class=\"ag-chart\" tabindex=\"-1\">\n            <div ref=\"eChart\" class=\"ag-chart-canvas-wrapper\"></div>\n        </div>";
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
        ag_grid_community_1.RefSelector('eChart'),
        __metadata("design:type", HTMLElement)
    ], GridChartComp.prototype, "eChart", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridChartComp.prototype, "init", null);
    return GridChartComp;
}(ag_grid_community_1.Component));
exports.GridChartComp = GridChartComp;
