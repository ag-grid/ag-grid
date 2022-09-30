"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const chartDataModel_1 = require("./chartDataModel");
const ag_charts_community_1 = require("ag-charts-community");
const seriesTypeMapper_1 = require("./utils/seriesTypeMapper");
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
    updateForGridChange() {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateCellRanges();
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
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    }
    getChartUpdateParams() {
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
            seriesChartTypes: this.getSeriesChartTypes()
        };
    }
    getChartModel() {
        const modelType = this.model.pivotChart ? 'pivot' : 'range';
        const seriesChartTypes = this.isComboChart() ? this.model.seriesChartTypes : undefined;
        return {
            modelType,
            chartId: this.model.chartId,
            chartType: this.model.chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions(),
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
        this.model.updateSeriesChartTypes();
        this.raiseChartModelUpdateEvent();
        this.raiseChartOptionsChangedEvent();
    }
    setChartThemeName(chartThemeName) {
        this.model.chartThemeName = chartThemeName;
        this.raiseChartModelUpdateEvent();
        this.raiseChartOptionsChangedEvent();
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
    getThemes() {
        return this.gridOptionsWrapper.getChartThemes();
    }
    getPalettes() {
        const themeNames = this.gridOptionsWrapper.getChartThemes();
        return themeNames.map(themeName => {
            const stockTheme = this.chartProxy.isStockTheme(themeName);
            const theme = stockTheme ? themeName : this.chartProxy.lookupCustomChartTheme(themeName);
            return ag_charts_community_1.getChartTheme(theme).palette;
        });
    }
    getValueColState() {
        return this.model.valueColState.map(this.displayNameMapper.bind(this));
    }
    getSelectedValueColState() {
        return this.getValueColState().filter(cs => cs.selected);
    }
    getDimensionColState() {
        return this.model.dimensionColState;
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
    isDefaultCategorySelected() {
        return this.model.getSelectedDimension().colId === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY;
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
        return this.model.savedCustomSeriesChartTypes && this.model.savedCustomSeriesChartTypes.length > 0;
    }
    getSeriesChartTypes() {
        return this.model.seriesChartTypes;
    }
    isComboChart() {
        return this.model.isComboChart();
    }
    updateSeriesChartType(colId, chartType, secondaryAxis) {
        const seriesChartType = this.model.seriesChartTypes.find(s => s.colId === colId);
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
            this.model.savedCustomSeriesChartTypes = this.model.seriesChartTypes;
            // series chart types can be modified, i.e. column chart types should be moved to primary axis
            this.model.updateSeriesChartTypes();
            this.updateForDataChange();
            if (updateChartType) {
                // update the settings panel by raising an EVENT_CHART_TYPE_CHANGED event
                this.dispatchEvent(Object.freeze({
                    type: ChartController.EVENT_CHART_TYPE_CHANGED
                }));
            }
            if (prevSeriesChartType !== chartType) {
                // update the format panel by raising an EVENT_CHART_SERIES_CHART_TYPE_CHANGED event
                this.dispatchEvent(Object.freeze({
                    type: ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED
                }));
            }
        }
    }
    getActiveSeriesChartTypes() {
        const selectedColIds = this.getSelectedValueColState().map(c => c.colId);
        return this.getSeriesChartTypes().filter(s => selectedColIds.includes(s.colId));
    }
    getChartSeriesTypes() {
        const supportedComboSeriesTypes = ['line', 'column', 'area'];
        return this.isComboChart() ? supportedComboSeriesTypes : [seriesTypeMapper_1.getSeriesType(this.getChartType())];
    }
    getCellRanges() {
        return [this.model.dimensionCellRange, this.model.valueCellRange].filter(r => r);
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
        const event = Object.freeze({
            type: ChartController.EVENT_CHART_MODEL_UPDATE
        });
        this.dispatchEvent(event);
    }
    raiseChartUpdatedEvent() {
        const event = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
        });
        this.dispatchEvent(event);
    }
    raiseChartOptionsChangedEvent() {
        const { chartId, chartType } = this.getChartModel();
        const event = Object.freeze({
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId,
            chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions()
        });
        this.eventService.dispatchEvent(event);
    }
    raiseChartRangeSelectionChangedEvent() {
        const event = Object.freeze({
            type: core_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.chartId,
            chartId: this.model.chartId,
            cellRange: this.getCellRangeParams()
        });
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
ChartController.EVENT_CHART_MODEL_UPDATE = 'chartModelUpdate';
ChartController.EVENT_CHART_TYPE_CHANGED = 'chartTypeChanged';
ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED = 'chartSeriesChartTypeChanged';
__decorate([
    core_1.Autowired('rangeService')
], ChartController.prototype, "rangeService", void 0);
__decorate([
    core_1.PostConstruct
], ChartController.prototype, "init", null);
exports.ChartController = ChartController;
