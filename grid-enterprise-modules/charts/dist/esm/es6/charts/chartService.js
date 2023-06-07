var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Optional, PreDestroy } from "@ag-grid-community/core";
import { VERSION as CHARTS_VERSION } from "ag-charts-community";
import { GridChartComp } from "./chartComp/gridChartComp";
import { upgradeChartModel } from "./chartModelMigration";
import { VERSION as GRID_VERSION } from "../version";
let ChartService = class ChartService extends BeanStub {
    constructor() {
        super(...arguments);
        // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
        // those in developer provided containers.
        this.activeCharts = new Set();
        this.activeChartComps = new Set();
        // this shared (singleton) context is used by cross filtering in line and area charts
        this.crossFilteringContext = {
            lastSelectedChartId: '',
        };
    }
    updateChart(params) {
        if (this.activeChartComps.size === 0) {
            console.warn(`AG Grid - No active charts to update.`);
            return;
        }
        const chartComp = [...this.activeChartComps].find(chartComp => chartComp.getChartId() === params.chartId);
        if (!chartComp) {
            console.warn(`AG Grid - Unable to update chart. No active chart found with ID: ${params.chartId}.`);
            return;
        }
        chartComp.update(params);
    }
    getChartModels() {
        const models = [];
        const versionedModel = (c) => {
            return Object.assign(Object.assign({}, c), { version: GRID_VERSION });
        };
        this.activeChartComps.forEach(c => models.push(versionedModel(c.getChartModel())));
        return models;
    }
    getChartRef(chartId) {
        let chartRef;
        this.activeCharts.forEach(cr => {
            if (cr.chartId === chartId) {
                chartRef = cr;
            }
        });
        return chartRef;
    }
    getChartComp(chartId) {
        let chartComp;
        this.activeChartComps.forEach(comp => {
            if (comp.getChartId() === chartId) {
                chartComp = comp;
            }
        });
        return chartComp;
    }
    getChartImageDataURL(params) {
        let url;
        this.activeChartComps.forEach(c => {
            if (c.getChartId() === params.chartId) {
                url = c.getChartImageDataURL(params.fileFormat);
            }
        });
        return url;
    }
    downloadChart(params) {
        const chartComp = Array.from(this.activeChartComps).find(c => c.getChartId() === params.chartId);
        chartComp === null || chartComp === void 0 ? void 0 : chartComp.downloadChart(params.dimensions, params.fileName, params.fileFormat);
    }
    openChartToolPanel(params) {
        const chartComp = Array.from(this.activeChartComps).find(c => c.getChartId() === params.chartId);
        chartComp === null || chartComp === void 0 ? void 0 : chartComp.openChartToolPanel(params.panel);
    }
    closeChartToolPanel(chartId) {
        const chartComp = Array.from(this.activeChartComps).find(c => c.getChartId() === chartId);
        chartComp === null || chartComp === void 0 ? void 0 : chartComp.closeChartToolPanel();
    }
    createChartFromCurrentRange(chartType = 'groupedColumn') {
        const selectedRange = this.getSelectedRange();
        return this.createChart(selectedRange, chartType);
    }
    restoreChart(model, chartContainer) {
        if (!model) {
            console.warn("AG Grid - unable to restore chart as no chart model is provided");
            return;
        }
        if (model.version !== GRID_VERSION) {
            model = upgradeChartModel(model);
        }
        const params = {
            cellRange: model.cellRange,
            chartType: model.chartType,
            chartThemeName: model.chartThemeName,
            chartContainer: chartContainer,
            suppressChartRanges: model.suppressChartRanges,
            aggFunc: model.aggFunc,
            unlinkChart: model.unlinkChart,
            seriesChartTypes: model.seriesChartTypes
        };
        const getCellRange = (cellRangeParams) => {
            return this.rangeService
                ? this.rangeService.createCellRangeFromCellRangeParams(cellRangeParams)
                : undefined;
        };
        if (model.modelType === 'pivot') {
            // if required enter pivot mode
            if (!this.columnModel.isPivotMode()) {
                this.columnModel.setPivotMode(true, "pivotChart");
            }
            // pivot chart range contains all visible column without a row range to include all rows
            const columns = this.columnModel.getAllDisplayedColumns().map(col => col.getColId());
            const chartAllRangeParams = {
                rowStartIndex: null,
                rowStartPinned: undefined,
                rowEndIndex: null,
                rowEndPinned: undefined,
                columns
            };
            const cellRange = getCellRange(chartAllRangeParams);
            if (!cellRange) {
                console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
                return;
            }
            return this.createChart(cellRange, params.chartType, params.chartThemeName, true, true, params.chartContainer, undefined, undefined, params.unlinkChart, false, model.chartOptions);
        }
        const cellRange = getCellRange(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, params.suppressChartRanges, params.chartContainer, params.aggFunc, undefined, params.unlinkChart, false, model.chartOptions, model.chartPalette, params.seriesChartTypes);
    }
    createRangeChart(params) {
        var _a;
        const cellRange = (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.createCellRangeFromCellRangeParams(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, params.suppressChartRanges, params.chartContainer, params.aggFunc, params.chartThemeOverrides, params.unlinkChart, undefined, undefined, undefined, params.seriesChartTypes);
    }
    createPivotChart(params) {
        // if required enter pivot mode
        if (!this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(true, "pivotChart");
        }
        // pivot chart range contains all visible column without a row range to include all rows
        const chartAllRangeParams = {
            rowStartIndex: null,
            rowStartPinned: undefined,
            rowEndIndex: null,
            rowEndPinned: undefined,
            columns: this.columnModel.getAllDisplayedColumns().map(col => col.getColId())
        };
        const cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(chartAllRangeParams)
            : undefined;
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, true, true, params.chartContainer, undefined, params.chartThemeOverrides, params.unlinkChart);
    }
    createCrossFilterChart(params) {
        var _a;
        const cellRange = (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.createCellRangeFromCellRangeParams(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        const crossFiltering = true;
        const suppressChartRangesSupplied = typeof params.suppressChartRanges !== 'undefined' && params.suppressChartRanges !== null;
        const suppressChartRanges = suppressChartRangesSupplied ? params.suppressChartRanges : true;
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, suppressChartRanges, params.chartContainer, params.aggFunc, params.chartThemeOverrides, params.unlinkChart, crossFiltering);
    }
    createChart(cellRange, chartType, chartThemeName, pivotChart = false, suppressChartRanges = false, container, aggFunc, chartThemeOverrides, unlinkChart = false, crossFiltering = false, chartOptionsToRestore, chartPaletteToRestore, seriesChartTypes) {
        const createChartContainerFunc = this.gridOptionsService.getCallback('createChartContainer');
        const params = {
            chartId: this.generateId(),
            pivotChart,
            cellRange,
            chartType,
            chartThemeName,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges,
            aggFunc,
            chartThemeOverrides,
            unlinkChart,
            crossFiltering,
            crossFilteringContext: this.crossFilteringContext,
            chartOptionsToRestore,
            chartPaletteToRestore,
            seriesChartTypes,
            crossFilteringResetCallback: () => this.activeChartComps.forEach(c => c.crossFilteringReset())
        };
        const chartComp = new GridChartComp(params);
        this.context.createBean(chartComp);
        const chartRef = this.createChartRef(chartComp);
        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());
            // if the chart container was placed outside an element that
            // has the grid's theme, we manually add the current theme to
            // make sure all styles for the chartMenu are rendered correctly
            const theme = this.environment.getTheme();
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
            chartComp.addEventListener(GridChartComp.EVENT_DESTROYED, () => {
                this.activeChartComps.delete(chartComp);
                this.activeCharts.delete(chartRef);
            });
        }
        return chartRef;
    }
    createChartRef(chartComp) {
        const chartRef = {
            destroyChart: () => {
                if (this.activeCharts.has(chartRef)) {
                    this.context.destroyBean(chartComp);
                    this.activeChartComps.delete(chartComp);
                    this.activeCharts.delete(chartRef);
                }
            },
            chartElement: chartComp.getGui(),
            chart: chartComp.getUnderlyingChart(),
            chartId: chartComp.getChartModel().chartId
        };
        this.activeCharts.add(chartRef);
        this.activeChartComps.add(chartComp);
        return chartRef;
    }
    getSelectedRange() {
        const ranges = this.rangeService.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {};
    }
    generateId() {
        return `id-${Math.random().toString(36).substring(2, 18)}`;
    }
    destroyAllActiveCharts() {
        this.activeCharts.forEach(chart => chart.destroyChart());
    }
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
export { ChartService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQWdCUixRQUFRLEVBQ1IsVUFBVSxFQUdiLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUE4QyxPQUFPLElBQUksY0FBYyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDNUcsT0FBTyxFQUFFLGFBQWEsRUFBbUIsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsT0FBTyxJQUFJLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQU9yRCxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsUUFBUTtJQUExQzs7UUFPSSwrR0FBK0c7UUFDL0csMENBQTBDO1FBQ2xDLGlCQUFZLEdBQUcsSUFBSSxHQUFHLEVBQVksQ0FBQztRQUNuQyxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBaUIsQ0FBQztRQUVwRCxxRkFBcUY7UUFDN0UsMEJBQXFCLEdBQTBCO1lBQ25ELG1CQUFtQixFQUFFLEVBQUU7U0FDMUIsQ0FBQztJQWdXTixDQUFDO0lBOVZVLFdBQVcsQ0FBQyxNQUF5QjtRQUN4QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUN0RCxPQUFPO1NBQ1Y7UUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLE1BQU0sQ0FBQyxPQUFP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