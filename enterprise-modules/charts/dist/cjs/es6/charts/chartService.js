"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const gridChartComp_1 = require("./chartComp/gridChartComp");
const chartModelMigration_1 = require("./chartModelMigration");
let ChartService = class ChartService extends core_1.BeanStub {
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
    getChartModels() {
        const models = [];
        const versionedModel = (c) => {
            return Object.assign(Object.assign({}, c), { version: chartModelMigration_1.CURRENT_VERSION });
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
    getChartImageDataURL(params) {
        let url;
        this.activeChartComps.forEach(c => {
            if (c.getChartId() === params.chartId) {
                url = c.getChartImageDataURL(params.fileFormat);
            }
        });
        return url;
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
        if (model.version !== chartModelMigration_1.CURRENT_VERSION) {
            model = chartModelMigration_1.upgradeChartModel(model);
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
        const cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(params.cellRange)
            : undefined;
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
        const cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(params.cellRange)
            : undefined;
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
        const createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();
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
        const chartComp = new gridChartComp_1.GridChartComp(params);
        this.context.createBean(chartComp);
        const chartRef = this.createChartRef(chartComp);
        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());
            // if the chart container was placed outside of an element that
            // has the grid's theme, we manually add the current theme to
            // make sure all styles for the chartMenu are rendered correctly
            const theme = this.environment.getTheme();
            if (theme.el && !theme.el.contains(container)) {
                container.classList.add(theme.theme);
            }
        }
        else if (createChartContainerFunc) {
            // otherwise user created chart via grid UI, check if developer provides containers (eg if the application
            // is using its own dialogs rather than the grid provided dialogs)
            createChartContainerFunc(chartRef);
        }
        else {
            // add listener to remove from active charts list when charts are destroyed, e.g. closing chart dialog
            chartComp.addEventListener(gridChartComp_1.GridChartComp.EVENT_DESTROYED, () => {
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
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }
    destroyAllActiveCharts() {
        this.activeCharts.forEach(chart => chart.destroyChart());
    }
};
__decorate([
    core_1.Optional('rangeService')
], ChartService.prototype, "rangeService", void 0);
__decorate([
    core_1.Autowired('columnModel')
], ChartService.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('environment')
], ChartService.prototype, "environment", void 0);
__decorate([
    core_1.PreDestroy
], ChartService.prototype, "destroyAllActiveCharts", null);
ChartService = __decorate([
    core_1.Bean('chartService')
], ChartService);
exports.ChartService = ChartService;
