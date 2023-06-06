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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Autowired, Bean, BeanStub, Optional, PreDestroy } from "@ag-grid-community/core";
import { VERSION as CHARTS_VERSION } from "ag-charts-community";
import { GridChartComp } from "./chartComp/gridChartComp";
import { upgradeChartModel } from "./chartModelMigration";
import { VERSION as GRID_VERSION } from "../version";
var ChartService = /** @class */ (function (_super) {
    __extends(ChartService, _super);
    function ChartService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
        // those in developer provided containers.
        _this.activeCharts = new Set();
        _this.activeChartComps = new Set();
        // this shared (singleton) context is used by cross filtering in line and area charts
        _this.crossFilteringContext = {
            lastSelectedChartId: '',
        };
        return _this;
    }
    ChartService.prototype.updateChart = function (params) {
        if (this.activeChartComps.size === 0) {
            console.warn("AG Grid - No active charts to update.");
            return;
        }
        var chartComp = __spreadArray([], __read(this.activeChartComps)).find(function (chartComp) { return chartComp.getChartId() === params.chartId; });
        if (!chartComp) {
            console.warn("AG Grid - Unable to update chart. No active chart found with ID: " + params.chartId + ".");
            return;
        }
        chartComp.update(params);
    };
    ChartService.prototype.getChartModels = function () {
        var models = [];
        var versionedModel = function (c) {
            return __assign(__assign({}, c), { version: GRID_VERSION });
        };
        this.activeChartComps.forEach(function (c) { return models.push(versionedModel(c.getChartModel())); });
        return models;
    };
    ChartService.prototype.getChartRef = function (chartId) {
        var chartRef;
        this.activeCharts.forEach(function (cr) {
            if (cr.chartId === chartId) {
                chartRef = cr;
            }
        });
        return chartRef;
    };
    ChartService.prototype.getChartComp = function (chartId) {
        var chartComp;
        this.activeChartComps.forEach(function (comp) {
            if (comp.getChartId() === chartId) {
                chartComp = comp;
            }
        });
        return chartComp;
    };
    ChartService.prototype.getChartImageDataURL = function (params) {
        var url;
        this.activeChartComps.forEach(function (c) {
            if (c.getChartId() === params.chartId) {
                url = c.getChartImageDataURL(params.fileFormat);
            }
        });
        return url;
    };
    ChartService.prototype.downloadChart = function (params) {
        var chartComp = Array.from(this.activeChartComps).find(function (c) { return c.getChartId() === params.chartId; });
        chartComp === null || chartComp === void 0 ? void 0 : chartComp.downloadChart(params.dimensions, params.fileName, params.fileFormat);
    };
    ChartService.prototype.openChartToolPanel = function (params) {
        var chartComp = Array.from(this.activeChartComps).find(function (c) { return c.getChartId() === params.chartId; });
        chartComp === null || chartComp === void 0 ? void 0 : chartComp.openChartToolPanel(params.panel);
    };
    ChartService.prototype.closeChartToolPanel = function (chartId) {
        var chartComp = Array.from(this.activeChartComps).find(function (c) { return c.getChartId() === chartId; });
        chartComp === null || chartComp === void 0 ? void 0 : chartComp.closeChartToolPanel();
    };
    ChartService.prototype.createChartFromCurrentRange = function (chartType) {
        if (chartType === void 0) { chartType = 'groupedColumn'; }
        var selectedRange = this.getSelectedRange();
        return this.createChart(selectedRange, chartType);
    };
    ChartService.prototype.restoreChart = function (model, chartContainer) {
        var _this = this;
        if (!model) {
            console.warn("AG Grid - unable to restore chart as no chart model is provided");
            return;
        }
        if (model.version !== GRID_VERSION) {
            model = upgradeChartModel(model);
        }
        var params = {
            cellRange: model.cellRange,
            chartType: model.chartType,
            chartThemeName: model.chartThemeName,
            chartContainer: chartContainer,
            suppressChartRanges: model.suppressChartRanges,
            aggFunc: model.aggFunc,
            unlinkChart: model.unlinkChart,
            seriesChartTypes: model.seriesChartTypes
        };
        var getCellRange = function (cellRangeParams) {
            return _this.rangeService
                ? _this.rangeService.createCellRangeFromCellRangeParams(cellRangeParams)
                : undefined;
        };
        if (model.modelType === 'pivot') {
            // if required enter pivot mode
            if (!this.columnModel.isPivotMode()) {
                this.columnModel.setPivotMode(true, "pivotChart");
            }
            // pivot chart range contains all visible column without a row range to include all rows
            var columns = this.columnModel.getAllDisplayedColumns().map(function (col) { return col.getColId(); });
            var chartAllRangeParams = {
                rowStartIndex: null,
                rowStartPinned: undefined,
                rowEndIndex: null,
                rowEndPinned: undefined,
                columns: columns
            };
            var cellRange_1 = getCellRange(chartAllRangeParams);
            if (!cellRange_1) {
                console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
                return;
            }
            return this.createChart(cellRange_1, params.chartType, params.chartThemeName, true, true, params.chartContainer, undefined, undefined, params.unlinkChart, false, model.chartOptions);
        }
        var cellRange = getCellRange(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, params.suppressChartRanges, params.chartContainer, params.aggFunc, undefined, params.unlinkChart, false, model.chartOptions, model.chartPalette, params.seriesChartTypes);
    };
    ChartService.prototype.createRangeChart = function (params) {
        var _a;
        var cellRange = (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.createCellRangeFromCellRangeParams(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, params.suppressChartRanges, params.chartContainer, params.aggFunc, params.chartThemeOverrides, params.unlinkChart, undefined, undefined, undefined, params.seriesChartTypes);
    };
    ChartService.prototype.createPivotChart = function (params) {
        // if required enter pivot mode
        if (!this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(true, "pivotChart");
        }
        // pivot chart range contains all visible column without a row range to include all rows
        var chartAllRangeParams = {
            rowStartIndex: null,
            rowStartPinned: undefined,
            rowEndIndex: null,
            rowEndPinned: undefined,
            columns: this.columnModel.getAllDisplayedColumns().map(function (col) { return col.getColId(); })
        };
        var cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(chartAllRangeParams)
            : undefined;
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, true, true, params.chartContainer, undefined, params.chartThemeOverrides, params.unlinkChart);
    };
    ChartService.prototype.createCrossFilterChart = function (params) {
        var _a;
        var cellRange = (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.createCellRangeFromCellRangeParams(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        var crossFiltering = true;
        var suppressChartRangesSupplied = typeof params.suppressChartRanges !== 'undefined' && params.suppressChartRanges !== null;
        var suppressChartRanges = suppressChartRangesSupplied ? params.suppressChartRanges : true;
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, suppressChartRanges, params.chartContainer, params.aggFunc, params.chartThemeOverrides, params.unlinkChart, crossFiltering);
    };
    ChartService.prototype.createChart = function (cellRange, chartType, chartThemeName, pivotChart, suppressChartRanges, container, aggFunc, chartThemeOverrides, unlinkChart, crossFiltering, chartOptionsToRestore, chartPaletteToRestore, seriesChartTypes) {
        var _this = this;
        if (pivotChart === void 0) { pivotChart = false; }
        if (suppressChartRanges === void 0) { suppressChartRanges = false; }
        if (unlinkChart === void 0) { unlinkChart = false; }
        if (crossFiltering === void 0) { crossFiltering = false; }
        var createChartContainerFunc = this.gridOptionsService.getCallback('createChartContainer');
        var params = {
            chartId: this.generateId(),
            pivotChart: pivotChart,
            cellRange: cellRange,
            chartType: chartType,
            chartThemeName: chartThemeName,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges: suppressChartRanges,
            aggFunc: aggFunc,
            chartThemeOverrides: chartThemeOverrides,
            unlinkChart: unlinkChart,
            crossFiltering: crossFiltering,
            crossFilteringContext: this.crossFilteringContext,
            chartOptionsToRestore: chartOptionsToRestore,
            chartPaletteToRestore: chartPaletteToRestore,
            seriesChartTypes: seriesChartTypes,
            crossFilteringResetCallback: function () { return _this.activeChartComps.forEach(function (c) { return c.crossFilteringReset(); }); }
        };
        var chartComp = new GridChartComp(params);
        this.context.createBean(chartComp);
        var chartRef = this.createChartRef(chartComp);
        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());
            // if the chart container was placed outside an element that
            // has the grid's theme, we manually add the current theme to
            // make sure all styles for the chartMenu are rendered correctly
            var theme = this.environment.getTheme();
            if (theme.el && !theme.el.contains(container)) {
                container.classList.add(theme.theme);
            }
        }
        else if (createChartContainerFunc) {
            // otherwise, user created chart via grid UI, check if developer provides containers (e.g. if the application
            // is using its own dialogs rather than the grid provided dialogs)
            createChartContainerFunc(chartRef);
        }
        else {
            // add listener to remove from active charts list when charts are destroyed, e.g. closing chart dialog
            chartComp.addEventListener(GridChartComp.EVENT_DESTROYED, function () {
                _this.activeChartComps.delete(chartComp);
                _this.activeCharts.delete(chartRef);
            });
        }
        return chartRef;
    };
    ChartService.prototype.createChartRef = function (chartComp) {
        var _this = this;
        var chartRef = {
            destroyChart: function () {
                if (_this.activeCharts.has(chartRef)) {
                    _this.context.destroyBean(chartComp);
                    _this.activeChartComps.delete(chartComp);
                    _this.activeCharts.delete(chartRef);
                }
            },
            chartElement: chartComp.getGui(),
            chart: chartComp.getUnderlyingChart(),
            chartId: chartComp.getChartModel().chartId
        };
        this.activeCharts.add(chartRef);
        this.activeChartComps.add(chartComp);
        return chartRef;
    };
    ChartService.prototype.getSelectedRange = function () {
        var ranges = this.rangeService.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {};
    };
    ChartService.prototype.generateId = function () {
        return "id-" + Math.random().toString(36).substring(2, 18);
    };
    ChartService.prototype.destroyAllActiveCharts = function () {
        this.activeCharts.forEach(function (chart) { return chart.destroyChart(); });
    };
    ChartService.CHARTS_VERSION = CHARTS_VERSION;
    __decorate([
        Optional('rangeService')
    ], ChartService.prototype, "rangeService", void 0);
    __decorate([
        Autowired('columnModel')
    ], ChartService.prototype, "columnModel", void 0);
    __decorate([
        PreDestroy
    ], ChartService.prototype, "destroyAllActiveCharts", null);
    ChartService = __decorate([
        Bean('chartService')
    ], ChartService);
    return ChartService;
}(BeanStub));
export { ChartService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBZ0JSLFFBQVEsRUFDUixVQUFVLEVBR2IsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQThDLE9BQU8sSUFBSSxjQUFjLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RyxPQUFPLEVBQUUsYUFBYSxFQUFtQixNQUFNLDJCQUEyQixDQUFDO0FBQzNFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxPQUFPLElBQUksWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBT3JEO0lBQWtDLGdDQUFRO0lBQTFDO1FBQUEscUVBK1dDO1FBeFdHLCtHQUErRztRQUMvRywwQ0FBMEM7UUFDbEMsa0JBQVksR0FBRyxJQUFJLEdBQUcsRUFBWSxDQUFDO1FBQ25DLHNCQUFnQixHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBRXBELHFGQUFxRjtRQUM3RSwyQkFBcUIsR0FBMEI7WUFDbkQsbUJBQW1CLEVBQUUsRUFBRTtTQUMxQixDQUFDOztJQWdXTixDQUFDO0lBOVZVLGtDQUFXLEdBQWxCLFVBQW1CLE1BQXlCO1FBQ3hDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ3RELE9BQU87U0FDVjtRQUVELElBQU0sU0FBUyxHQUFHLHlCQUFJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRSxJQUFJLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxTQUFT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