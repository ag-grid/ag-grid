"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartController = exports.DEFAULT_THEMES = void 0;
const core_1 = require("@ag-grid-community/core");
const ag_charts_community_1 = require("ag-charts-community");
const seriesTypeMapper_1 = require("./utils/seriesTypeMapper");
const chartTheme_1 = require("./chartProxies/chartTheme");
const UpdateParamsValidator_1 = require("./utils/UpdateParamsValidator");
exports.DEFAULT_THEMES = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
class ChartController extends core_1.BeanStub {
    constructor(model) {
        super();
        this.model = model;
    }
    init() {
        this.setChartRange();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_RANGE_SELECTION_CHANGED, event => {
            if (event.id && event.id === this.model.chartId) {
                this.updateForRangeChange();
            }
        });
        if (this.model.unlinked) {
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    }
    update(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!this.validUpdateType(params) || !UpdateParamsValidator_1.UpdateParamsValidator.validateChartParams(params)) {
            return false;
        }
        const { chartId, chartType, chartThemeName, unlinkChart } = params;
        // create a common base for the chart model parameters (this covers pivot chart updates)
        const common = {
            chartId: chartId,
            pivotChart: this.model.pivotChart,
            chartType: chartType !== null && chartType !== void 0 ? chartType : this.model.chartType,
            chartThemeName: chartThemeName !== null && chartThemeName !== void 0 ? chartThemeName : this.model.chartThemeName,
            unlinkChart: unlinkChart !== null && unlinkChart !== void 0 ? unlinkChart : this.model.unlinked,
            cellRange: this.model.suppliedCellRange,
            aggFunc: this.model.aggFunc,
            seriesChartTypes: undefined,
            suppressChartRanges: false,
            crossFiltering: false
        };
        let chartModelParams = Object.assign({}, common);
        // modify the chart model properties based on the type of update
        switch (params.type) {
            case 'rangeChartUpdate':
                chartModelParams.cellRange = (_a = this.createCellRange(params)) !== null && _a !== void 0 ? _a : this.model.suppliedCellRange;
                chartModelParams.aggFunc = (_b = params.aggFunc) !== null && _b !== void 0 ? _b : this.model.aggFunc;
                chartModelParams.seriesChartTypes = params.seriesChartTypes;
                chartModelParams.suppressChartRanges = (_c = params.suppressChartRanges) !== null && _c !== void 0 ? _c : this.model.suppressChartRanges;
                break;
            case 'crossFilterChartUpdate':
                chartModelParams.cellRange = (_d = this.createCellRange(params)) !== null && _d !== void 0 ? _d : this.model.suppliedCellRange;
                chartModelParams.aggFunc = (_e = params.aggFunc) !== null && _e !== void 0 ? _e : this.model.aggFunc;
                chartModelParams.crossFiltering = true;
                chartModelParams.suppressChartRanges = (_f = params.suppressChartRanges) !== null && _f !== void 0 ? _f : this.model.suppressChartRanges;
                break;
        }
        this.model.updateModel(chartModelParams);
        // if the chart should be unlinked or chart ranges suppressed, remove all cell ranges; otherwise, set the chart range
        const removeChartCellRanges = chartModelParams.unlinkChart || chartModelParams.suppressChartRanges;
        removeChartCellRanges ? (_g = this.rangeService) === null || _g === void 0 ? void 0 : _g.setCellRanges([]) : this.setChartRange();
        return true;
    }
    updateForGridChange() {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateCellRanges();
        this.model.updateData();
        this.setChartRange();
    }
    updateForDataChange() {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateData();
        this.raiseChartModelUpdateEvent();
    }
    updateForRangeChange() {
        this.updateForGridChange();
        this.raiseChartRangeSelectionChangedEvent();
    }
    updateForPanelChange(updatedCol) {
        this.model.updateCellRanges(updatedCol);
        this.model.updateData();
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    }
    getChartUpdateParams(updatedOverrides) {
        const selectedCols = this.getSelectedValueColState();
        const fields = selectedCols.map(c => ({ colId: c.colId, displayName: c.displayName }));
        const data = this.getChartData();
        const selectedDimension = this.getSelectedDimension();
        return {
            data,
            grouping: this.isGrouping(),
            category: {
                id: selectedDimension.colId,
                name: selectedDimension.displayName,
                chartDataType: this.model.getChartDataType(selectedDimension.colId)
            },
            fields,
            chartId: this.getChartId(),
            getCrossFilteringContext: () => ({ lastSelectedChartId: 'xxx' }),
            seriesChartTypes: this.getSeriesChartTypes(),
            updatedOverrides: updatedOverrides
        };
    }
    getChartModel() {
        const modelType = this.model.pivotChart ? 'pivot' : 'range';
        const seriesChartTypes = this.isComboChart() ? this.model.comboChartModel.seriesChartTypes : undefined;
        return {
            modelType,
            chartId: this.model.chartId,
            chartType: this.model.chartType,
            chartThemeName: this.getChartThemeName(),
            chartOptions: this.chartProxy.getChartThemeOverrides(),
            chartPalette: this.chartProxy.getChartPalette(),
            cellRange: this.getCellRangeParams(),
            suppressChartRanges: this.model.suppressChartRanges,
            aggFunc: this.model.aggFunc,
            unlinkChart: this.model.unlinked,
            seriesChartTypes
        };
    }
    getChartId() {
        return this.model.chartId;
    }
    getChartData() {
        return this.model.chartData;
    }
    getChartType() {
        return this.model.chartType;
    }
    setChartType(chartType) {
        this.model.chartType = chartType;
        this.model.comboChartModel.updateSeriesChartTypes();
        this.raiseChartModelUpdateEvent();
        this.raiseChartOptionsChangedEvent();
    }
    setChartThemeName(chartThemeName, silent) {
        this.model.chartThemeName = chartThemeName;
        if (!silent) {
            this.raiseChartModelUpdateEvent();
            this.raiseChartOptionsChangedEvent();
        }
    }
    getChartThemeName() {
        return this.model.chartThemeName;
    }
    isPivotChart() {
        return this.model.pivotChart;
    }
    isPivotMode() {
        return this.model.isPivotMode();
    }
    isGrouping() {
        return this.model.isGrouping();
    }
    isCrossFilterChart() {
        return this.model.crossFiltering;
    }
    getThemes() {
        return this.gridOptionsService.get('chartThemes') || exports.DEFAULT_THEMES;
    }
    getPalettes() {
        const themeNames = this.getThemes();
        return themeNames.map(themeName => {
            const stockTheme = (0, chartTheme_1.isStockTheme)(themeName);
            const theme = stockTheme ? themeName : this.chartProxy.lookupCustomChartTheme(themeName);
            return ag_charts_community_1._Theme.getChartTheme(theme).palette;
        });
    }
    getValueColState() {
        return this.model.valueColState.map(this.displayNameMapper.bind(this));
    }
    getSelectedValueColState() {
        return this.getValueColState().filter(cs => cs.selected);
    }
    getSelectedDimension() {
        return this.model.getSelectedDimension();
    }
    displayNameMapper(col) {
        const columnNames = this.model.columnNames[col.colId];
        col.displayName = columnNames ? columnNames.join(' - ') : this.model.getColDisplayName(col.column);
        return col;
    }
    getColStateForMenu() {
        return { dimensionCols: this.model.dimensionColState, valueCols: this.getValueColState() };
    }
    setChartRange(silent = false) {
        if (this.rangeService && !this.model.suppressChartRanges && !this.model.unlinked) {
            this.rangeService.setCellRanges(this.getCellRanges());
        }
        if (!silent) {
            this.raiseChartModelUpdateEvent();
        }
    }
    detachChartRange() {
        // when chart is detached it won't listen to changes from the grid
        this.model.unlinked = !this.model.unlinked;
        if (this.model.unlinked) {
            // remove range from grid
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        else {
            // update chart data may have changed
            this.updateForGridChange();
        }
    }
    setChartProxy(chartProxy) {
        this.chartProxy = chartProxy;
    }
    getChartProxy() {
        return this.chartProxy;
    }
    isActiveXYChart() {
        return core_1._.includes(['scatter', 'bubble'], this.getChartType());
    }
    isChartLinked() {
        return !this.model.unlinked;
    }
    customComboExists() {
        const savedCustomSeriesChartTypes = this.model.comboChartModel.savedCustomSeriesChartTypes;
        return savedCustomSeriesChartTypes && savedCustomSeriesChartTypes.length > 0;
    }
    getSeriesChartTypes() {
        return this.model.comboChartModel.seriesChartTypes;
    }
    isComboChart() {
        return this.model.isComboChart();
    }
    updateSeriesChartType(colId, chartType, secondaryAxis) {
        const seriesChartType = this.model.comboChartModel.seriesChartTypes.find(s => s.colId === colId);
        if (seriesChartType) {
            // once a combo chart has been modified it is now a 'customCombo' chart
            const updateChartType = this.model.chartType !== 'customCombo';
            if (updateChartType) {
                this.model.chartType = 'customCombo';
            }
            const prevSeriesChartType = seriesChartType.chartType;
            if (chartType != null) {
                seriesChartType.chartType = chartType;
            }
            if (secondaryAxis != null) {
                seriesChartType.secondaryAxis = secondaryAxis;
            }
            // replace existing custom series types with this latest version
            this.model.comboChartModel.savedCustomSeriesChartTypes = this.model.comboChartModel.seriesChartTypes;
            // series chart types can be modified, i.e. column chart types should be moved to primary axis
            this.model.comboChartModel.updateSeriesChartTypes();
            this.updateForDataChange();
            if (updateChartType) {
                // update the settings panel by raising an EVENT_CHART_TYPE_CHANGED event
                this.dispatchEvent({
                    type: ChartController.EVENT_CHART_TYPE_CHANGED
                });
            }
            if (prevSeriesChartType !== chartType) {
                // update the format panel by raising an EVENT_CHART_SERIES_CHART_TYPE_CHANGED event
                this.dispatchEvent({
                    type: ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED
                });
            }
            this.raiseChartOptionsChangedEvent();
        }
    }
    getActiveSeriesChartTypes() {
        const selectedColIds = this.getSelectedValueColState().map(c => c.colId);
        return this.getSeriesChartTypes().filter(s => selectedColIds.includes(s.colId));
    }
    getChartSeriesTypes() {
        const supportedComboSeriesTypes = ['line', 'column', 'area'];
        return this.isComboChart() ? supportedComboSeriesTypes : [(0, seriesTypeMapper_1.getSeriesType)(this.getChartType())];
    }
    getCellRanges() {
        return [this.model.dimensionCellRange, this.model.valueCellRange].filter(r => r);
    }
    createCellRange(params) {
        var _a;
        return params.cellRange && ((_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.createCellRangeFromCellRangeParams(params.cellRange));
    }
    validUpdateType(params) {
        var _a;
        if (!params.type) {
            console.warn(`AG Grid - Unable to update chart as the 'type' is missing. It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'.`);
            return false;
        }
        const chartTypeMap = {
            'Range Chart': () => !this.isPivotChart() && !this.isCrossFilterChart(),
            'Pivot Chart': () => this.isPivotChart(),
            'Cross Filter Chart': () => this.isCrossFilterChart()
        };
        const currentChartType = (_a = Object.keys(chartTypeMap).find(type => chartTypeMap[type]())) !== null && _a !== void 0 ? _a : 'Range Chart';
        const valid = params.type ===
            `${currentChartType[0].toLowerCase()}${currentChartType.slice(1).replace(/ /g, '')}Update`;
        if (!valid) {
            console.warn(`AG Grid - Unable to update chart as a '${params.type}' update type is not permitted on a ${currentChartType}.`);
        }
        return valid;
    }
    getCellRangeParams() {
        const cellRanges = this.getCellRanges();
        const firstCellRange = cellRanges[0];
        const startRow = (firstCellRange && firstCellRange.startRow) || null;
        const endRow = (firstCellRange && firstCellRange.endRow) || null;
        return {
            rowStartIndex: startRow && startRow.rowIndex,
            rowStartPinned: startRow && startRow.rowPinned,
            rowEndIndex: endRow && endRow.rowIndex,
            rowEndPinned: endRow && endRow.rowPinned,
            columns: cellRanges.reduce((columns, value) => columns.concat(value.columns.map(c => c.getId())), [])
        };
    }
    raiseChartModelUpdateEvent() {
        const event = {
            type: ChartController.EVENT_CHART_MODEL_UPDATE
        };
        this.dispatchEvent(event);
    }
    raiseChartUpdatedEvent() {
        const event = {
            type: ChartController.EVENT_CHART_UPDATED
        };
        this.dispatchEvent(event);
    }
    raiseChartApiUpdateEvent() {
        const event = {
            type: ChartController.EVENT_CHART_API_UPDATE
        };
        this.dispatchEvent(event);
    }
    raiseChartOptionsChangedEvent() {
        const { chartId, chartType } = this.getChartModel();
        const event = {
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId,
            chartType,
            chartThemeName: this.getChartThemeName(),
            chartOptions: this.chartProxy.getChartThemeOverrides()
        };
        this.eventService.dispatchEvent(event);
    }
    raiseChartRangeSelectionChangedEvent() {
        const event = {
            type: core_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.chartId,
            chartId: this.model.chartId,
            cellRange: this.getCellRangeParams()
        };
        this.eventService.dispatchEvent(event);
    }
    destroy() {
        super.destroy();
        if (this.rangeService) {
            this.rangeService.setCellRanges([]);
        }
    }
}
ChartController.EVENT_CHART_UPDATED = 'chartUpdated';
ChartController.EVENT_CHART_API_UPDATE = 'chartApiUpdate';
ChartController.EVENT_CHART_MODEL_UPDATE = 'chartModelUpdate';
ChartController.EVENT_CHART_TYPE_CHANGED = 'chartTypeChanged';
ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED = 'chartSeriesChartTypeChanged';
__decorate([
    (0, core_1.Autowired)('rangeService')
], ChartController.prototype, "rangeService", void 0);
__decorate([
    core_1.PostConstruct
], ChartController.prototype, "init", null);
exports.ChartController = ChartController;
