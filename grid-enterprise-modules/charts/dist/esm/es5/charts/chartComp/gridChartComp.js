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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { _, AgDialog, Autowired, CHART_TOOL_PANEL_MENU_OPTIONS, Component, Events, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { ChartMenu } from "./menu/chartMenu";
import { TitleEdit } from "./chartTitle/titleEdit";
import { ChartController, DEFAULT_THEMES } from "./chartController";
import { ChartDataModel } from "./model/chartDataModel";
import { BarChartProxy } from "./chartProxies/cartesian/barChartProxy";
import { AreaChartProxy } from "./chartProxies/cartesian/areaChartProxy";
import { LineChartProxy } from "./chartProxies/cartesian/lineChartProxy";
import { PieChartProxy } from "./chartProxies/polar/pieChartProxy";
import { ScatterChartProxy } from "./chartProxies/cartesian/scatterChartProxy";
import { HistogramChartProxy } from "./chartProxies/cartesian/histogramChartProxy";
import { ChartOptionsService } from "./services/chartOptionsService";
import { ComboChartProxy } from "./chartProxies/combo/comboChartProxy";
var GridChartComp = /** @class */ (function (_super) {
    __extends(GridChartComp, _super);
    function GridChartComp(params) {
        var _this = _super.call(this, GridChartComp.TEMPLATE) || this;
        _this.params = params;
        return _this;
    }
    GridChartComp.prototype.init = function () {
        var _this = this;
        var availableChartThemes = this.gridOptionsService.get('chartThemes') || DEFAULT_THEMES;
        if (availableChartThemes.length < 1) {
            throw new Error('Cannot create chart: no chart themes are available to be used.');
        }
        var chartThemeName = this.params.chartThemeName;
        if (!_.includes(availableChartThemes, chartThemeName)) {
            chartThemeName = availableChartThemes[0];
        }
        var modelParams = {
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
        var isRtl = this.gridOptionsService.is('enableRtl');
        this.addCssClass(isRtl ? 'ag-rtl' : 'ag-ltr');
        // only the chart controller interacts with the chart model
        var model = this.createBean(new ChartDataModel(modelParams));
        this.chartController = this.createManagedBean(new ChartController(model));
        this.validateCustomThemes();
        // create chart before dialog to ensure dialog is correct size
        this.createChart();
        if (this.params.insideDialog) {
            this.addDialog();
        }
        this.addMenu();
        this.addTitleEditComp();
        this.addManagedListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.update.bind(this));
        if (this.chartMenu) {
            // chart menu may not exist, i.e. cross filtering
            this.addManagedListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, function () { return _this.downloadChart(); });
        }
        this.update();
        this.raiseChartCreatedEvent();
    };
    GridChartComp.prototype.validateCustomThemes = function () {
        var suppliedThemes = this.getChartThemes();
        var customChartThemes = this.gridOptionsService.get('customChartThemes');
        if (customChartThemes) {
            _.getAllKeysInObjects([customChartThemes]).forEach(function (customThemeName) {
                if (!_.includes(suppliedThemes, customThemeName)) {
                    console.warn("AG Grid: a custom chart theme with the name '" + customThemeName + "' has been " +
                        "supplied but not added to the 'chartThemes' list");
                }
            });
        }
    };
    GridChartComp.prototype.createChart = function () {
        var _this = this;
        // if chart already exists, destroy it and remove it from DOM
        var chartInstance = undefined;
        if (this.chartProxy) {
            chartInstance = this.chartProxy.destroy({ keepChartInstance: true });
        }
        var crossFilterCallback = function (event, reset) {
            var ctx = _this.params.crossFilteringContext;
            ctx.lastSelectedChartId = reset ? '' : _this.chartController.getChartId();
            if (reset) {
                _this.params.crossFilteringResetCallback();
            }
            _this.crossFilterService.filter(event, reset);
        };
        var chartType = this.chartController.getChartType();
        var chartProxyParams = {
            chartType: chartType,
            chartInstance: chartInstance,
            getChartThemeName: this.getChartThemeName.bind(this),
            getChartThemes: this.getChartThemes.bind(this),
            customChartThemes: this.gridOptionsService.get('customChartThemes'),
            getGridOptionsChartThemeOverrides: function () { return _this.getGridOptionsChartThemeOverrides(); },
            getExtraPaddingDirections: function () { var _a, _b; return (_b = (_a = _this.chartMenu) === null || _a === void 0 ? void 0 : _a.getExtraPaddingDirections()) !== null && _b !== void 0 ? _b : []; },
            apiChartThemeOverrides: this.params.chartThemeOverrides,
            crossFiltering: this.params.crossFiltering,
            crossFilterCallback: crossFilterCallback,
            parentElement: this.eChart,
            grouping: this.chartController.isGrouping(),
            chartThemeToRestore: this.params.chartThemeName,
            chartOptionsToRestore: this.params.chartOptionsToRestore,
            chartPaletteToRestore: this.params.chartPaletteToRestore,
            seriesChartTypes: this.chartController.getSeriesChartTypes(),
            translate: function (toTranslate, defaultText) { return _this.chartTranslationService.translate(toTranslate, defaultText); },
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
        var canvas = this.eChart.querySelector('canvas');
        if (canvas) {
            canvas.classList.add('ag-charts-canvas');
        }
        this.chartController.setChartProxy(this.chartProxy);
        this.chartOptionsService = this.createBean(new ChartOptionsService(this.chartController));
        this.titleEdit && this.titleEdit.refreshTitle(this.chartController, this.chartOptionsService);
    };
    GridChartComp.prototype.getChartThemeName = function () {
        return this.chartController.getChartThemeName();
    };
    GridChartComp.prototype.getChartThemes = function () {
        return this.chartController.getThemes();
    };
    GridChartComp.prototype.getGridOptionsChartThemeOverrides = function () {
        return this.gridOptionsService.get('chartThemeOverrides');
    };
    GridChartComp.createChartProxy = function (chartProxyParams) {
        switch (chartProxyParams.chartType) {
            case 'column':
            case 'bar':
            case 'groupedColumn':
            case 'stackedColumn':
            case 'normalizedColumn':
            case 'groupedBar':
            case 'stackedBar':
            case 'normalizedBar':
                return new BarChartProxy(chartProxyParams);
            case 'pie':
            case 'doughnut':
                return new PieChartProxy(chartProxyParams);
            case 'area':
            case 'stackedArea':
            case 'normalizedArea':
                return new AreaChartProxy(chartProxyParams);
            case 'line':
                return new LineChartProxy(chartProxyParams);
            case 'scatter':
            case 'bubble':
                return new ScatterChartProxy(chartProxyParams);
            case 'histogram':
                return new HistogramChartProxy(chartProxyParams);
            case 'columnLineCombo':
            case 'areaColumnCombo':
            case 'customCombo':
                return new ComboChartProxy(chartProxyParams);
            default:
                throw "AG Grid: Unable to create chart as an invalid chartType = '" + chartProxyParams.chartType + "' was supplied.";
        }
    };
    GridChartComp.prototype.addDialog = function () {
        var _this = this;
        var title = this.chartTranslationService.translate(this.params.pivotChart ? 'pivotChartTitle' : 'rangeChartTitle');
        var _a = this.getBestDialogSize(), width = _a.width, height = _a.height;
        this.chartDialog = new AgDialog({
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
        this.chartDialog.addEventListener(AgDialog.EVENT_DESTROYED, function () { return _this.destroy(); });
    };
    GridChartComp.prototype.getBestDialogSize = function () {
        var popupParent = this.popupService.getPopupParent();
        var maxWidth = _.getAbsoluteWidth(popupParent) * 0.75;
        var maxHeight = _.getAbsoluteHeight(popupParent) * 0.75;
        var ratio = 0.553;
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
        if (!this.params.crossFiltering) {
            this.chartMenu = this.createBean(new ChartMenu(this.eChartContainer, this.eMenuContainer, this.chartController, this.chartOptionsService));
            this.eChartContainer.appendChild(this.chartMenu.getGui());
        }
    };
    GridChartComp.prototype.addTitleEditComp = function () {
        this.titleEdit = this.createBean(new TitleEdit(this.chartMenu));
        this.eTitleEditContainer.appendChild(this.titleEdit.getGui());
        if (this.chartProxy) {
            this.titleEdit.refreshTitle(this.chartController, this.chartOptionsService);
        }
    };
    GridChartComp.prototype.update = function (params) {
        var _this = this;
        // update chart model for api.updateChart()
        if (params === null || params === void 0 ? void 0 : params.chartId) {
            var validUpdate = this.chartController.update(params);
            if (!validUpdate) {
                return; // warning already logged!
            }
        }
        var chartTypeChanged = this.chartTypeChanged(params);
        // recreate chart if chart type has changed
        if (chartTypeChanged)
            this.createChart();
        // update chart options if chart type hasn't changed or if overrides are supplied
        this.updateChart(params === null || params === void 0 ? void 0 : params.chartThemeOverrides);
        if (params === null || params === void 0 ? void 0 : params.chartId) {
            this.chartProxy.getChart().waitForUpdate().then(function () {
                _this.chartController.raiseChartApiUpdateEvent();
            });
        }
    };
    GridChartComp.prototype.updateChart = function (updatedOverrides) {
        var _this = this;
        var chartProxy = this.chartProxy;
        var selectedCols = this.chartController.getSelectedValueColState();
        var fields = selectedCols.map(function (c) { return ({ colId: c.colId, displayName: c.displayName }); });
        var data = this.chartController.getChartData();
        var chartEmpty = this.handleEmptyChart(data, fields);
        if (chartEmpty) {
            return;
        }
        var chartUpdateParams = this.chartController.getChartUpdateParams(updatedOverrides);
        chartProxy.update(chartUpdateParams);
        this.chartProxy.getChart().waitForUpdate().then(function () {
            _this.chartController.raiseChartUpdatedEvent();
        });
        this.titleEdit.refreshTitle(this.chartController, this.chartOptionsService);
    };
    GridChartComp.prototype.chartTypeChanged = function (updateParams) {
        var _a = __read([this.chartController.getChartType(), updateParams === null || updateParams === void 0 ? void 0 : updateParams.chartType], 2), currentType = _a[0], updatedChartType = _a[1];
        return this.chartType !== currentType || (!!updatedChartType && this.chartType !== updatedChartType);
    };
    GridChartComp.prototype.getChartModel = function () {
        return this.chartController.getChartModel();
    };
    GridChartComp.prototype.getChartImageDataURL = function (fileFormat) {
        return this.chartProxy.getChartImageDataURL(fileFormat);
    };
    GridChartComp.prototype.handleEmptyChart = function (data, fields) {
        var pivotModeDisabled = this.chartController.isPivotChart() && !this.chartController.isPivotMode();
        var minFieldsRequired = 1;
        if (this.chartController.isActiveXYChart()) {
            minFieldsRequired = this.chartController.getChartType() === 'bubble' ? 3 : 2;
        }
        var isEmptyChart = fields.length < minFieldsRequired || data.length === 0;
        if (this.eChart) {
            var isEmpty = pivotModeDisabled || isEmptyChart;
            _.setDisplayed(this.eChart, !isEmpty);
            _.setDisplayed(this.eEmpty, isEmpty);
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
    };
    GridChartComp.prototype.downloadChart = function (dimensions, fileName, fileFormat) {
        this.chartProxy.downloadChart(dimensions, fileName, fileFormat);
    };
    GridChartComp.prototype.openChartToolPanel = function (panel) {
        var menuPanel = panel ? CHART_TOOL_PANEL_MENU_OPTIONS[panel] : panel;
        this.chartMenu.showMenu(menuPanel);
    };
    GridChartComp.prototype.closeChartToolPanel = function () {
        this.chartMenu.hideMenu();
    };
    GridChartComp.prototype.getChartId = function () {
        return this.chartController.getChartId();
    };
    GridChartComp.prototype.getUnderlyingChart = function () {
        return this.chartProxy.getChartRef();
    };
    GridChartComp.prototype.crossFilteringReset = function () {
        this.chartProxy.crossFilteringReset();
    };
    GridChartComp.prototype.setActiveChartCellRange = function (focusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget)) {
            return;
        }
        this.chartController.setChartRange(true);
        this.gridApi.focusService.clearFocusedCell();
    };
    GridChartComp.prototype.raiseChartCreatedEvent = function () {
        var _this = this;
        var event = {
            type: Events.EVENT_CHART_CREATED,
            chartId: this.chartController.getChartId()
        };
        this.chartProxy.getChart().waitForUpdate().then(function () {
            _this.eventService.dispatchEvent(event);
        });
    };
    GridChartComp.prototype.raiseChartDestroyedEvent = function () {
        var event = {
            type: Events.EVENT_CHART_DESTROYED,
            chartId: this.chartController.getChartId(),
        };
        this.eventService.dispatchEvent(event);
    };
    GridChartComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.chartProxy) {
            this.chartProxy.destroy();
        }
        this.destroyBean(this.chartMenu);
        this.destroyBean(this.titleEdit);
        // don't want to invoke destroy() on the Dialog (prevents destroy loop)
        if (this.chartDialog && this.chartDialog.isAlive()) {
            this.destroyBean(this.chartDialog);
        }
        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        var eGui = this.getGui();
        _.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        _.removeFromParent(eGui);
        this.raiseChartDestroyedEvent();
    };
    GridChartComp.TEMPLATE = "<div class=\"ag-chart\" tabindex=\"-1\">\n            <div ref=\"eChartContainer\" tabindex=\"-1\" class=\"ag-chart-components-wrapper\">\n                <div ref=\"eChart\" class=\"ag-chart-canvas-wrapper\"></div>\n                <div ref=\"eEmpty\" class=\"ag-chart-empty-text ag-unselectable\"></div>\n            </div>\n            <div ref=\"eTitleEditContainer\"></div>\n            <div ref=\"eMenuContainer\" class=\"ag-chart-docked-container\"></div>\n        </div>";
    __decorate([
        RefSelector('eChart')
    ], GridChartComp.prototype, "eChart", void 0);
    __decorate([
        RefSelector('eChartContainer')
    ], GridChartComp.prototype, "eChartContainer", void 0);
    __decorate([
        RefSelector('eMenuContainer')
    ], GridChartComp.prototype, "eMenuContainer", void 0);
    __decorate([
        RefSelector('eEmpty')
    ], GridChartComp.prototype, "eEmpty", void 0);
    __decorate([
        RefSelector('eTitleEditContainer')
    ], GridChartComp.prototype, "eTitleEditContainer", void 0);
    __decorate([
        Autowired('chartCrossFilterService')
    ], GridChartComp.prototype, "crossFilterService", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], GridChartComp.prototype, "chartTranslationService", void 0);
    __decorate([
        Autowired('gridApi')
    ], GridChartComp.prototype, "gridApi", void 0);
    __decorate([
        Autowired('popupService')
    ], GridChartComp.prototype, "popupService", void 0);
    __decorate([
        PostConstruct
    ], GridChartComp.prototype, "init", null);
    return GridChartComp;
}(Component));
export { GridChartComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZENoYXJ0Q29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2dyaWRDaGFydENvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsUUFBUSxFQUNSLFNBQVMsRUFFVCw2QkFBNkIsRUFNN0IsU0FBUyxFQUNULE1BQU0sRUFJTixhQUFhLEVBQ2IsV0FBVyxHQUlkLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxjQUFjLEVBQW9CLE1BQU0sd0JBQXdCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUV6RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDekUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ25FLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBSW5GLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQXFCdkU7SUFBbUMsaUNBQVM7SUFvQ3hDLHVCQUFZLE1BQXVCO1FBQW5DLFlBQ0ksa0JBQU0sYUFBYSxDQUFDLFFBQVEsQ0FBQyxTQUVoQztRQURHLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztJQUN6QixDQUFDO0lBR00sNEJBQUksR0FBWDtRQURBLGlCQXlEQztRQXZERyxJQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksY0FBYyxDQUFDO1FBRTFGLElBQUksb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7U0FDckY7UUFFSyxJQUFBLGNBQWMsR0FBSyxJQUFJLENBQUMsTUFBTSxlQUFoQixDQUFpQjtRQUVyQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUMsRUFBRTtZQUNuRCxjQUFjLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFNLFdBQVcsR0FBcUI7WUFDbEMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztZQUM1QixVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO1lBQ2xDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVM7WUFDaEMsY0FBYyxFQUFFLGNBQWU7WUFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztZQUM1QixTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTO1lBQ2hDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CO1lBQ3BELFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVc7WUFDcEMsY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYztZQUMxQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQjtTQUNqRCxDQUFDO1FBRUYsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU5QywyREFBMkQ7UUFDM0QsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFMUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFFNUIsOERBQThEO1FBQzlELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1lBQzFCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNwQjtRQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXhCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVoSCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsaURBQWlEO1lBQ2pELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGFBQWEsRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7U0FDdkc7UUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRU8sNENBQW9CLEdBQTVCO1FBQ0ksSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzdDLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzNFLElBQUksaUJBQWlCLEVBQUU7WUFDbkIsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLGVBQWU7Z0JBQzlELElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsRUFBRTtvQkFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQywrQ0FBK0MsR0FBRyxlQUFlLEdBQUcsYUFBYTt3QkFDMUYsa0RBQWtELENBQUMsQ0FBQztpQkFDM0Q7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVPLG1DQUFXLEdBQW5CO1FBQUEsaUJBMERDO1FBekRHLDZEQUE2RDtRQUM3RCxJQUFJLGFBQWEsR0FBZ0MsU0FBUyxDQUFDO1FBQzNELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLEtBQVUsRUFBRSxLQUFjO1lBQ25ELElBQU0sR0FBRyxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUM7WUFDOUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3pFLElBQUksS0FBSyxFQUFFO2dCQUNQLEtBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTRCLEVBQUUsQ0FBQzthQUM5QztZQUNELEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQztRQUVGLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEQsSUFBTSxnQkFBZ0IsR0FBcUI7WUFDdkMsU0FBUyxXQUFBO1lBQ1QsYUFBYSxlQUFBO1lBQ2IsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDcEQsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM5QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO1lBQ25FLGlDQUFpQyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsaUNBQWlDLEVBQUUsRUFBeEMsQ0FBd0M7WUFDakYseUJBQXlCLEVBQUUsMEJBQU0sT0FBQSxNQUFBLE1BQUEsS0FBSSxDQUFDLFNBQVMsMENBQUUseUJBQXlCLEVBQUUsbUNBQUksRUFBRSxDQUFBLEVBQUE7WUFDbEYsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUI7WUFDdkQsY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYztZQUMxQyxtQkFBbUIscUJBQUE7WUFDbkIsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQzFCLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRTtZQUMzQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWM7WUFDL0MscUJBQXFCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUI7WUFDeEQscUJBQXFCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUI7WUFDeEQsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRTtZQUM1RCxTQUFTLEVBQUUsVUFBQyxXQUFtQixFQUFFLFdBQW9CLElBQUssT0FBQSxLQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBaEUsQ0FBZ0U7U0FDN0gsQ0FBQztRQUVGLHVFQUF1RTtRQUN2RSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQztRQUU5QyxvREFBb0Q7UUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFL0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25GLE9BQU87U0FDVjtRQUVELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRU8seUNBQWlCLEdBQXpCO1FBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVPLHNDQUFjLEdBQXRCO1FBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFTyx5REFBaUMsR0FBekM7UUFDSSxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRWMsOEJBQWdCLEdBQS9CLFVBQWdDLGdCQUFrQztRQUM5RCxRQUFRLGdCQUFnQixDQUFDLFNBQVMsRUFBRTtZQUNoQyxLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxlQUFlLENBQUM7WUFDckIsS0FBSyxlQUFlLENBQUM7WUFDckIsS0FBSyxrQkFBa0IsQ0FBQztZQUN4QixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLGVBQWU7Z0JBQ2hCLE9BQU8sSUFBSSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMvQyxLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssVUFBVTtnQkFDWCxPQUFPLElBQUksYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDL0MsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLGFBQWEsQ0FBQztZQUNuQixLQUFLLGdCQUFnQjtnQkFDakIsT0FBTyxJQUFJLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2hELEtBQUssTUFBTTtnQkFDUCxPQUFPLElBQUksY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDaEQsS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFFBQVE7Z0JBQ1QsT0FBTyxJQUFJLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDbkQsS0FBSyxXQUFXO2dCQUNaLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3JELEtBQUssaUJBQWlCLENBQUM7WUFDdkIsS0FBSyxpQkFBaUIsQ0FBQztZQUN2QixLQUFLLGFBQWE7Z0JBQ2QsT0FBTyxJQUFJLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2pEO2dCQUNJLE1BQU0sZ0VBQThELGdCQUFnQixDQUFDLFNBQVMsb0JBQWlCLENBQUM7U0FDdkg7SUFDTCxDQUFDO0lBRU8saUNBQVMsR0FBakI7UUFBQSxpQkFvQkM7UUFuQkcsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFL0csSUFBQSxLQUFvQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBMUMsS0FBSyxXQUFBLEVBQUUsTUFBTSxZQUE2QixDQUFDO1FBRW5ELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxRQUFRLENBQUM7WUFDNUIsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLEtBQUssT0FBQTtZQUNMLEtBQUssT0FBQTtZQUNMLE1BQU0sUUFBQTtZQUNOLFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxPQUFPLEVBQUUsRUFBZCxDQUFjLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRU8seUNBQWlCLEdBQXpCO1FBQ0ksSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2RCxJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3hELElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDMUQsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRXBCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUN6RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBRTNELElBQUksS0FBSyxHQUFHLFFBQVEsSUFBSSxNQUFNLEdBQUcsU0FBUyxFQUFFO1lBQ3hDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFFbkMsSUFBSSxNQUFNLEdBQUcsU0FBUyxFQUFFO2dCQUNwQixNQUFNLEdBQUcsU0FBUyxDQUFDO2dCQUNuQixLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUN2RDtTQUNKO1FBRUQsT0FBTyxFQUFFLEtBQUssT0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVPLCtCQUFPLEdBQWY7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDM0ksSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQzdEO0lBQ0wsQ0FBQztJQUVPLHdDQUFnQixHQUF4QjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM5RCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUMvRTtJQUNMLENBQUM7SUFFTSw4QkFBTSxHQUFiLFVBQWMsTUFBMEI7UUFBeEMsaUJBc0JDO1FBckJHLDJDQUEyQztRQUMzQyxJQUFJLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxPQUFPLEVBQUU7WUFDakIsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDZCxPQUFPLENBQUMsMEJBQTBCO2FBQ3JDO1NBQ0o7UUFFRCxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV2RCwyQ0FBMkM7UUFDM0MsSUFBSSxnQkFBZ0I7WUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFekMsaUZBQWlGO1FBQ2pGLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLG1CQUFtQixDQUFDLENBQUM7UUFFOUMsSUFBSSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsT0FBTyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDO2dCQUM1QyxLQUFJLENBQUMsZUFBZSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDcEQsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFTyxtQ0FBVyxHQUFuQixVQUFvQixnQkFBd0M7UUFBNUQsaUJBb0JDO1FBbkJXLElBQUEsVUFBVSxHQUFLLElBQUksV0FBVCxDQUFVO1FBRTVCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNyRSxJQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBaEQsQ0FBZ0QsQ0FBQyxDQUFDO1FBQ3ZGLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV2RCxJQUFJLFVBQVUsRUFBRTtZQUNaLE9BQU87U0FDVjtRQUVELElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BGLFVBQVUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQztZQUM1QyxLQUFJLENBQUMsZUFBZSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFTyx3Q0FBZ0IsR0FBeEIsVUFBeUIsWUFBZ0M7UUFDL0MsSUFBQSxLQUFBLE9BQWtDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsU0FBUyxDQUFDLElBQUEsRUFBL0YsV0FBVyxRQUFBLEVBQUUsZ0JBQWdCLFFBQWtFLENBQUM7UUFDdkcsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLGdCQUFnQixDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVNLHFDQUFhLEdBQXBCO1FBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ2hELENBQUM7SUFFTSw0Q0FBb0IsR0FBM0IsVUFBNEIsVUFBbUI7UUFDM0MsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFTyx3Q0FBZ0IsR0FBeEIsVUFBeUIsSUFBVyxFQUFFLE1BQWE7UUFDL0MsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyRyxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDeEMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztRQUU1RSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFNLE9BQU8sR0FBRyxpQkFBaUIsSUFBSSxZQUFZLENBQUM7WUFDbEQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsSUFBSSxpQkFBaUIsRUFBRTtZQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDOUYsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELElBQUksWUFBWSxFQUFFO1lBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNoRixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLHFDQUFhLEdBQXBCLFVBQXFCLFVBQThDLEVBQUUsUUFBaUIsRUFBRSxVQUFtQjtRQUN2RyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTSwwQ0FBa0IsR0FBekIsVUFBMEIsS0FBMEI7UUFDaEQsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQ0FBbUIsR0FBMUI7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTSxrQ0FBVSxHQUFqQjtRQUNJLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRU0sMENBQWtCLEdBQXpCO1FBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFTSwyQ0FBbUIsR0FBMUI7UUFDSSxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVPLCtDQUF1QixHQUEvQixVQUFnQyxVQUFzQjtRQUNsRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGFBQTRCLENBQUMsRUFBRTtZQUNqRSxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsT0FBZSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFTyw4Q0FBc0IsR0FBOUI7UUFBQSxpQkFTQztRQVJHLElBQU0sS0FBSyxHQUFvQztZQUMzQyxJQUFJLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtZQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUU7U0FDN0MsQ0FBQztRQUVGLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQzVDLEtBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGdEQUF3QixHQUFoQztRQUNJLElBQU0sS0FBSyxHQUFzQztZQUM3QyxJQUFJLEVBQUUsTUFBTSxDQUFDLHFCQUFxQjtZQUNsQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUU7U0FDN0MsQ0FBQztRQUVGLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFUywrQkFBTyxHQUFqQjtRQUNJLGlCQUFNLE9BQU8sV0FBRSxDQUFDO1FBRWhCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFakMsdUVBQXVFO1FBQ3ZFLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsbUdBQW1HO1FBQ25HLCtFQUErRTtRQUMvRSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0IsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQiw2RkFBNkY7UUFDN0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXpCLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUExYmMsc0JBQVEsR0FDbkIsZ2VBT08sQ0FBQztJQUVXO1FBQXRCLFdBQVcsQ0FBQyxRQUFRLENBQUM7aURBQXNDO0lBQzVCO1FBQS9CLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQzswREFBK0M7SUFDL0M7UUFBOUIsV0FBVyxDQUFDLGdCQUFnQixDQUFDO3lEQUE4QztJQUNyRDtRQUF0QixXQUFXLENBQUMsUUFBUSxDQUFDO2lEQUFzQztJQUN4QjtRQUFuQyxXQUFXLENBQUMscUJBQXFCLENBQUM7OERBQXNEO0lBRW5EO1FBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQzs2REFBOEQ7SUFDN0Q7UUFBckMsU0FBUyxDQUFDLHlCQUF5QixDQUFDO2tFQUFtRTtJQUVsRjtRQUFyQixTQUFTLENBQUMsU0FBUyxDQUFDO2tEQUFtQztJQUM3QjtRQUExQixTQUFTLENBQUMsY0FBYyxDQUFDO3VEQUE2QztJQXFCdkU7UUFEQyxhQUFhOzZDQXlEYjtJQTBWTCxvQkFBQztDQUFBLEFBNWJELENBQW1DLFNBQVMsR0E0YjNDO1NBNWJZLGFBQWEifQ==