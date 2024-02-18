var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, BeanStub, CellRangeType, PostConstruct, } from "@ag-grid-community/core";
import { ChartDatasource } from "../datasource/chartDatasource.mjs";
import { ChartColumnService } from "../services/chartColumnService.mjs";
import { ComboChartModel } from "./comboChartModel.mjs";
import { isHierarchical } from "../utils/seriesTypeMapper.mjs";
export class ChartDataModel extends BeanStub {
    constructor(params) {
        super();
        this.unlinked = false;
        this.chartData = [];
        this.valueColState = [];
        this.dimensionColState = [];
        this.columnNames = {};
        this.crossFiltering = false;
        this.grouping = false;
        this.params = params;
        this.chartId = params.chartId;
        this.chartType = params.chartType;
        this.pivotChart = params.pivotChart;
        this.chartThemeName = params.chartThemeName;
        this.aggFunc = params.aggFunc;
        this.referenceCellRange = params.cellRange;
        this.suppliedCellRange = params.cellRange;
        this.suppressChartRanges = params.suppressChartRanges;
        this.unlinked = !!params.unlinkChart;
        this.crossFiltering = !!params.crossFiltering;
    }
    init() {
        this.datasource = this.createManagedBean(new ChartDatasource());
        this.chartColumnService = this.createManagedBean(new ChartColumnService());
        this.comboChartModel = this.createManagedBean(new ComboChartModel(this));
        this.updateCellRanges();
        this.updateData();
    }
    updateModel(params) {
        const { cellRange, chartType, pivotChart, chartThemeName, aggFunc, suppressChartRanges, unlinkChart, crossFiltering, seriesChartTypes } = params;
        if (cellRange !== this.suppliedCellRange) {
            this.dimensionCellRange = undefined;
            this.valueCellRange = undefined;
        }
        this.chartType = chartType;
        this.pivotChart = pivotChart;
        this.chartThemeName = chartThemeName;
        this.aggFunc = aggFunc;
        this.referenceCellRange = cellRange;
        this.suppliedCellRange = cellRange;
        this.suppressChartRanges = suppressChartRanges;
        this.unlinked = !!unlinkChart;
        this.crossFiltering = !!crossFiltering;
        this.updateSelectedDimension(cellRange === null || cellRange === void 0 ? void 0 : cellRange.columns);
        this.updateCellRanges();
        const shouldUpdateComboModel = this.isComboChart() || seriesChartTypes;
        if (shouldUpdateComboModel) {
            this.comboChartModel.update(seriesChartTypes);
        }
        if (!this.unlinked) {
            this.updateData();
        }
    }
    updateCellRanges(updatedColState) {
        if (this.valueCellRange) {
            this.referenceCellRange = this.valueCellRange;
        }
        const { dimensionCols, valueCols } = this.chartColumnService.getChartColumns();
        const allColsFromRanges = this.getAllColumnsFromRanges();
        if (updatedColState) {
            this.updateColumnState(updatedColState);
        }
        this.setDimensionCellRange(dimensionCols, allColsFromRanges, updatedColState);
        this.setValueCellRange(valueCols, allColsFromRanges, updatedColState);
        if (!updatedColState) {
            this.resetColumnState();
            // dimension / category cell range could be out of sync after resetting column state when row grouping
            this.syncDimensionCellRange();
        }
        this.comboChartModel.updateSeriesChartTypes();
    }
    updateData() {
        const { startRow, endRow } = this.getRowIndexes();
        if (this.pivotChart) {
            this.resetColumnState();
        }
        this.grouping = this.isGrouping();
        const params = {
            aggFunc: this.aggFunc,
            dimensionCols: this.getSelectedDimensions(),
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            crossFiltering: this.crossFiltering,
            valueCols: this.getSelectedValueCols(),
            startRow,
            endRow,
            isScatter: _.includes(['scatter', 'bubble'], this.chartType)
        };
        const { chartData, columnNames } = this.datasource.getData(params);
        this.chartData = chartData;
        this.columnNames = columnNames;
    }
    isGrouping() {
        const usingTreeData = this.gridOptionsService.get('treeData');
        const groupedCols = usingTreeData ? null : this.chartColumnService.getRowGroupColumns();
        const isGroupActive = usingTreeData || (groupedCols && groupedCols.length > 0);
        // charts only group when the selected category is a group column
        const colIds = this.getSelectedDimensions().map(({ colId }) => colId);
        const displayedGroupCols = this.chartColumnService.getGroupDisplayColumns();
        const groupDimensionSelected = displayedGroupCols.map(col => col.getColId()).some(id => colIds.includes(id));
        return !!isGroupActive && groupDimensionSelected;
    }
    getSelectedValueCols() {
        return this.valueColState.filter(cs => cs.selected).map(cs => cs.column);
    }
    getSelectedDimensions() {
        return this.dimensionColState.filter(cs => cs.selected);
    }
    getColDisplayName(col) {
        return this.chartColumnService.getColDisplayName(col);
    }
    isPivotMode() {
        return this.chartColumnService.isPivotMode();
    }
    getChartDataType(colId) {
        const column = this.chartColumnService.getColumn(colId);
        return column ? column.getColDef().chartDataType : undefined;
    }
    isPivotActive() {
        return this.chartColumnService.isPivotActive();
    }
    createCellRange(type, ...columns) {
        return {
            id: this.chartId,
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns,
            startColumn: type === CellRangeType.DIMENSION ? columns[0] : this.referenceCellRange.startColumn,
            type
        };
    }
    getAllColumnsFromRanges() {
        if (this.pivotChart) {
            return _.convertToSet(this.chartColumnService.getAllDisplayedColumns());
        }
        const columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;
        if (this.dimensionCellRange) {
            columns.push(...this.dimensionCellRange.columns);
        }
        if (this.valueCellRange) {
            columns.push(...this.valueCellRange.columns);
        }
        return _.convertToSet(columns);
    }
    getRowIndexes() {
        let startRow = 0, endRow = 0;
        const { rangeService, valueCellRange, dimensionCellRange } = this;
        // Not all chart types require a value series (e.g. hierarchical charts),
        // so fall back to using the dimension cell range for inferring row indices
        const cellRange = valueCellRange || dimensionCellRange;
        if (rangeService && cellRange) {
            startRow = rangeService.getRangeStartRow(cellRange).rowIndex;
            // when the last row the cell range is a pinned 'bottom' row, the `endRow` index is set to -1 which results
            // in the ChartDatasource processing all non pinned rows from the `startRow` index.
            const endRowPosition = rangeService.getRangeEndRow(cellRange);
            endRow = endRowPosition.rowPinned === 'bottom' ? -1 : endRowPosition.rowIndex;
        }
        return { startRow, endRow };
    }
    resetColumnState() {
        const { dimensionCols, valueCols } = this.chartColumnService.getChartColumns();
        const allCols = this.getAllColumnsFromRanges();
        const isInitialising = this.valueColState.length < 1;
        this.dimensionColState = [];
        this.valueColState = [];
        const supportsMultipleDimensions = isHierarchical(this.chartType);
        let hasSelectedDimension = false;
        let order = 1;
        const aggFuncDimension = this.suppliedCellRange.columns[0]; //TODO
        dimensionCols.forEach(column => {
            const isAutoGroupCol = column.getColId() === 'ag-Grid-AutoColumn';
            let selected = false;
            if (this.crossFiltering && this.aggFunc) {
                if (aggFuncDimension.getColId() === column.getColId()) {
                    selected = true;
                }
            }
            else {
                selected = isAutoGroupCol ? true : (!hasSelectedDimension || supportsMultipleDimensions) && allCols.has(column);
            }
            this.dimensionColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected,
                order: order++
            });
            if (selected) {
                hasSelectedDimension = true;
            }
        });
        const defaultCategory = {
            colId: ChartDataModel.DEFAULT_CATEGORY,
            displayName: this.chartTranslationService.translate('defaultCategory'),
            selected: !hasSelectedDimension,
            order: 0
        };
        this.dimensionColState.unshift(defaultCategory);
        const valueColumnsFromReferenceRange = this.referenceCellRange.columns.filter(c => valueCols.has(c));
        valueCols.forEach(column => {
            // first time the value cell range is set, preserve the column order from the supplied range
            if (isInitialising && _.includes(this.referenceCellRange.columns, column)) {
                column = valueColumnsFromReferenceRange.shift();
            }
            this.valueColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected: allCols.has(column),
                order: order++
            });
        });
    }
    updateColumnState(updatedCol) {
        const idsMatch = (cs) => cs.colId === updatedCol.colId;
        const { dimensionColState, valueColState } = this;
        // Determine whether the specified column is a dimension or value column
        const matchedDimensionColState = dimensionColState.find(idsMatch);
        const matchedValueColState = valueColState.find(idsMatch);
        if (matchedDimensionColState) {
            // For non-hierarchical chart types, only one dimension can be selected
            const supportsMultipleDimensions = isHierarchical(this.chartType);
            if (!supportsMultipleDimensions) {
                // Determine which column should end up selected, if any
                const selectedColumnState = updatedCol.selected
                    ? matchedDimensionColState
                    : dimensionColState
                        .filter((cs) => cs !== matchedDimensionColState)
                        .find(({ selected }) => selected);
                // Update the selection state of all dimension columns
                dimensionColState.forEach(cs => cs.selected = (cs === selectedColumnState));
            }
            else {
                // Update the selection state of the specified dimension column
                matchedDimensionColState.selected = updatedCol.selected;
            }
        }
        else if (matchedValueColState) {
            // Update the selection state of the specified value column
            matchedValueColState.selected = updatedCol.selected;
        }
        const allColumns = [...dimensionColState, ...valueColState];
        const orderedColIds = [];
        // calculate new order
        allColumns.forEach((col, i) => {
            if (i === updatedCol.order) {
                orderedColIds.push(updatedCol.colId);
            }
            if (col.colId !== updatedCol.colId) {
                orderedColIds.push(col.colId);
            }
        });
        // update col state with new order
        allColumns.forEach(col => {
            const order = orderedColIds.indexOf(col.colId);
            col.order = order >= 0 ? orderedColIds.indexOf(col.colId) : allColumns.length - 1;
        });
        this.reorderColState();
    }
    reorderColState() {
        const ascColStateOrder = (a, b) => a.order - b.order;
        this.dimensionColState.sort(ascColStateOrder);
        this.valueColState.sort(ascColStateOrder);
    }
    setDimensionCellRange(dimensionCols, colsInRange, updatedColState) {
        this.dimensionCellRange = undefined;
        if (!updatedColState && !this.dimensionColState.length) {
            const supportsMultipleDimensions = isHierarchical(this.chartType);
            const selectedCols = new Array();
            // use first dimension column in range by default, or all dimension columns for hierarchical charts
            dimensionCols.forEach(col => {
                if ((selectedCols.length > 0 && !supportsMultipleDimensions) || !colsInRange.has(col)) {
                    return;
                }
                selectedCols.push(col);
            });
            if (selectedCols.length > 0) {
                this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, ...selectedCols);
            }
            return;
        }
        let selectedDimensionColStates = updatedColState ? [updatedColState] : [];
        if (this.crossFiltering && this.aggFunc) {
            const aggFuncDimension = this.suppliedCellRange.columns[0]; //TODO
            selectedDimensionColStates = this.dimensionColState.filter(cs => cs.colId === aggFuncDimension.getColId());
        }
        else if (selectedDimensionColStates.length === 0 || selectedDimensionColStates.some(({ column }) => !column || !dimensionCols.has(column))) {
            selectedDimensionColStates = this.dimensionColState.filter(cs => cs.selected);
        }
        const isDefaultCategory = selectedDimensionColStates.length === 1
            ? selectedDimensionColStates[0].colId === ChartDataModel.DEFAULT_CATEGORY
            : false;
        const selectedColumns = selectedDimensionColStates.map(({ column }) => column)
            .filter((value) => value != null);
        if (selectedColumns.length > 0 && !isDefaultCategory) {
            this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, ...selectedColumns);
        }
    }
    setValueCellRange(valueCols, colsInRange, updatedColState) {
        this.valueCellRange = undefined;
        const selectedValueCols = [];
        valueCols.forEach(col => {
            if (updatedColState && updatedColState.colId === col.getColId()) {
                if (updatedColState.selected) {
                    selectedValueCols.push(updatedColState.column);
                }
            }
            else if (colsInRange.has(col)) {
                selectedValueCols.push(col);
            }
        });
        if (selectedValueCols.length > 0) {
            let orderedColIds = [];
            if (this.valueColState.length > 0) {
                orderedColIds = this.valueColState.map(c => c.colId);
            }
            else {
                colsInRange.forEach(c => orderedColIds.push(c.getColId()));
            }
            selectedValueCols.sort((a, b) => orderedColIds.indexOf(a.getColId()) - orderedColIds.indexOf(b.getColId()));
            this.valueCellRange = this.createCellRange(CellRangeType.VALUE, ...selectedValueCols);
        }
    }
    updateSelectedDimension(columns) {
        const colIdSet = new Set(columns.map((column) => column.getColId()));
        // if no dimension found in supplied columns use the default category (always index = 0)
        const foundColState = this.dimensionColState.find((colState) => colIdSet.has(colState.colId)) || this.dimensionColState[0];
        this.dimensionColState = this.dimensionColState.map((colState) => (Object.assign(Object.assign({}, colState), { selected: colState.colId === foundColState.colId })));
    }
    syncDimensionCellRange() {
        const selectedDimensions = this.getSelectedDimensions();
        if (selectedDimensions.length === 0)
            return;
        const selectedCols = selectedDimensions.map(({ column }) => column)
            .filter((value) => value != null);
        if (selectedCols.length > 0) {
            this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, ...selectedCols);
        }
    }
    isComboChart() {
        return ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(this.chartType);
    }
}
ChartDataModel.DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
__decorate([
    Autowired('rangeService')
], ChartDataModel.prototype, "rangeService", void 0);
__decorate([
    Autowired('chartTranslationService')
], ChartDataModel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], ChartDataModel.prototype, "init", null);
