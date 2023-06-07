var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
import { _Theme } from "ag-charts-community";
import { getSeriesType } from "./utils/seriesTypeMapper";
import { isStockTheme } from "./chartProxies/chartTheme";
import { UpdateParamsValidator } from "./utils/UpdateParamsValidator";
export const DEFAULT_THEMES = ['ag-default', 'ag-material', 'ag-pastel', 'ag-vivid', 'ag-solar'];
export class ChartController extends BeanStub {
    constructor(model) {
        super();
        this.model = model;
    }
    init() {
        this.setChartRange();
        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, event => {
            if (event.id && event.id === this.model.chartId) {
                this.updateForRangeChange();
            }
        });
        if (this.model.unlinked) {
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    }
    update(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!this.validUpdateType(params) || !UpdateParamsValidator.validateChartParams(params)) {
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
    isCrossFilterChart() {
        return this.model.crossFiltering;
    }
    getThemes() {
        return this.gridOptionsService.get('chartThemes') || DEFAULT_THEMES;
    }
    getPalettes() {
        const themeNames = this.getThemes();
        return themeNames.map(themeName => {
            const stockTheme = isStockTheme(themeName);
            const theme = stockTheme ? themeName : this.chartProxy.lookupCustomChartTheme(themeName);
            return _Theme.getChartTheme(theme).palette;
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
        return _.includes(['scatter', 'bubble'], this.getChartType());
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
        return this.isComboChart() ? supportedComboSeriesTypes : [getSeriesType(this.getChartType())];
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
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId,
            chartType,
            chartThemeName: this.getChartThemeName(),
            chartOptions: this.chartProxy.getChartThemeOverrides()
        };
        this.eventService.dispatchEvent(event);
    }
    raiseChartRangeSelectionChangedEvent() {
        const event = {
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
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
    Autowired('rangeService')
], ChartController.prototype, "rangeService", void 0);
__decorate([
    PostConstruct
], ChartController.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvY2hhcnRDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULFFBQVEsRUFRUixNQUFNLEVBRU4sYUFBYSxFQU9oQixNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE9BQU8sRUFBRSxNQUFNLEVBQXVCLE1BQU0scUJBQXFCLENBQUM7QUFDbEUsT0FBTyxFQUFtQixhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFdEUsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRWpHLE1BQU0sT0FBTyxlQUFnQixTQUFRLFFBQVE7SUFZekMsWUFBb0MsS0FBcUI7UUFDckQsS0FBSyxFQUFFLENBQUM7UUFEd0IsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7SUFFekQsQ0FBQztJQUdPLElBQUk7UUFDUixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3JGLElBQUksS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzthQUMvQjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMs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