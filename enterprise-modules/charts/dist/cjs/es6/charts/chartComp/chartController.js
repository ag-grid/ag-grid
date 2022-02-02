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
        this.raiseChartUpdatedEvent();
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
    getChartModel() {
        const modelType = this.model.pivotChart ? 'pivot' : 'range';
        return {
            modelType,
            chartId: this.model.chartId,
            chartType: this.model.chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.getCellRangeParams(),
            suppressChartRanges: this.model.suppressChartRanges,
            aggFunc: this.model.aggFunc,
            unlinkChart: this.model.unlinked,
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
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }
    setChartThemeName(chartThemeName) {
        this.model.chartThemeName = chartThemeName;
        this.raiseChartUpdatedEvent();
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
            this.raiseChartUpdatedEvent();
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
            chartOptions: this.chartProxy.getChartOptions(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    }
    raiseChartRangeSelectionChangedEvent() {
        const event = Object.freeze({
            type: core_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.chartId,
            chartId: this.model.chartId,
            cellRange: this.getCellRangeParams(),
            api: this.gridApi,
            columnApi: this.columnApi,
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
ChartController.EVENT_CHART_TYPE_CHANGED = 'chartTypeChanged';
__decorate([
    core_1.Autowired('rangeService')
], ChartController.prototype, "rangeService", void 0);
__decorate([
    core_1.Autowired('gridApi')
], ChartController.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired('columnApi')
], ChartController.prototype, "columnApi", void 0);
__decorate([
    core_1.PostConstruct
], ChartController.prototype, "init", null);
exports.ChartController = ChartController;
//# sourceMappingURL=chartController.js.map