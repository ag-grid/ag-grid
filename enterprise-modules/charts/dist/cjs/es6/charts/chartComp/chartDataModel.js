"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const chartDatasource_1 = require("./chartDatasource");
class ChartDataModel extends core_1.BeanStub {
    constructor(params) {
        super();
        this.unlinked = false;
        this.chartData = [];
        this.valueColState = [];
        this.dimensionColState = [];
        this.columnNames = {};
        this.grouping = false;
        this.crossFiltering = false;
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
        this.datasource = this.createManagedBean(new chartDatasource_1.ChartDatasource());
        this.updateCellRanges();
    }
    updateCellRanges(updatedColState) {
        if (this.valueCellRange) {
            this.referenceCellRange = this.valueCellRange;
        }
        const { dimensionCols, valueCols } = this.getAllChartColumns();
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
        this.updateData();
    }
    updateData() {
        const { startRow, endRow } = this.getRowIndexes();
        if (this.pivotChart) {
            this.resetColumnState();
        }
        this.grouping = this.isGrouping();
        const params = {
            aggFunc: this.aggFunc,
            dimensionCols: [this.getSelectedDimension()],
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            crossFiltering: this.crossFiltering,
            valueCols: this.getSelectedValueCols(),
            startRow,
            endRow,
            isScatter: core_1._.includes(['scatter', 'bubble'], this.chartType)
        };
        const { chartData, columnNames } = this.datasource.getData(params);
        this.chartData = chartData;
        this.columnNames = columnNames;
    }
    isGrouping() {
        const usingTreeData = this.gridOptionsWrapper.isTreeData();
        const groupedCols = usingTreeData ? null : this.columnModel.getRowGroupColumns();
        const isGroupActive = usingTreeData || (groupedCols && groupedCols.length > 0);
        // charts only group when the selected category is a group column
        const colId = this.getSelectedDimension().colId;
        const displayedGroupCols = this.columnModel.getGroupDisplayColumns();
        const groupDimensionSelected = displayedGroupCols.map(col => col.getColId()).some(id => id === colId);
        return !!isGroupActive && groupDimensionSelected;
    }
    getSelectedValueCols() {
        return this.valueColState.filter(cs => cs.selected).map(cs => cs.column);
    }
    getSelectedDimension() {
        return this.dimensionColState.filter(cs => cs.selected)[0];
    }
    getColDisplayName(col) {
        return this.columnModel.getDisplayNameForColumn(col, 'chart');
    }
    isPivotMode() {
        return this.columnModel.isPivotMode();
    }
    isPivotActive() {
        return this.columnModel.isPivotActive();
    }
    createCellRange(type, ...columns) {
        return {
            id: this.chartId,
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns,
            startColumn: type === core_1.CellRangeType.DIMENSION ? columns[0] : this.referenceCellRange.startColumn,
            type
        };
    }
    getAllColumnsFromRanges() {
        if (this.pivotChart) {
            return core_1._.convertToSet(this.columnModel.getAllDisplayedColumns());
        }
        const columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;
        if (this.dimensionCellRange) {
            columns.push(...this.dimensionCellRange.columns);
        }
        if (this.valueCellRange) {
            columns.push(...this.valueCellRange.columns);
        }
        return core_1._.convertToSet(columns);
    }
    getRowIndexes() {
        let startRow = 0, endRow = 0;
        const { rangeService } = this;
        const { valueCellRange: range } = this;
        if (rangeService && range) {
            startRow = rangeService.getRangeStartRow(range).rowIndex;
            // when the last row the cell range is a pinned 'bottom' row, the `endRow` index is set to -1 which results
            // in the ChartDatasource processing all non pinned rows from the `startRow` index.
            const endRowPosition = rangeService.getRangeEndRow(range);
            endRow = endRowPosition.rowPinned === core_1.Constants.PINNED_BOTTOM ? -1 : endRowPosition.rowIndex;
        }
        return { startRow, endRow };
    }
    getAllChartColumns() {
        const displayedCols = this.columnModel.getAllDisplayedColumns();
        const dimensionCols = new Set();
        const valueCols = new Set();
        displayedCols.forEach(col => {
            const colDef = col.getColDef();
            const chartDataType = colDef.chartDataType;
            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                    case 'time':
                        dimensionCols.add(col);
                        return;
                    case 'series':
                        valueCols.add(col);
                        return;
                    case 'excluded':
                        return;
                    default:
                        console.warn(`AG Grid: unexpected chartDataType value '${chartDataType}' supplied, instead use 'category', 'series' or 'excluded'`);
                        break;
                }
            }
            if (colDef.colId === 'ag-Grid-AutoColumn') {
                dimensionCols.add(col);
                return;
            }
            if (!col.isPrimary()) {
                valueCols.add(col);
                return;
            }
            // if 'chartDataType' is not provided then infer type based data contained in first row
            (this.isNumberCol(col) ? valueCols : dimensionCols).add(col);
        });
        return { dimensionCols, valueCols };
    }
    isNumberCol(col) {
        if (col.getColId() === 'ag-Grid-AutoColumn') {
            return false;
        }
        const row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: null });
        if (!row) {
            return false;
        }
        let cellValue = this.valueService.getValue(col, row);
        if (cellValue == null) {
            cellValue = this.extractLeafData(row, col);
        }
        if (cellValue != null && typeof cellValue.toNumber === 'function') {
            cellValue = cellValue.toNumber();
        }
        return typeof cellValue === 'number';
    }
    extractLeafData(row, col) {
        if (!row.allLeafChildren) {
            return null;
        }
        for (let i = 0; i < row.allLeafChildren.length; i++) {
            const childRow = row.allLeafChildren[i];
            const value = this.valueService.getValue(col, childRow);
            if (value != null) {
                return value;
            }
        }
        return null;
    }
    resetColumnState() {
        const { dimensionCols, valueCols } = this.getAllChartColumns();
        const allCols = this.getAllColumnsFromRanges();
        const isInitialising = this.valueColState.length < 1;
        this.dimensionColState = [];
        this.valueColState = [];
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
                selected = isAutoGroupCol ? true : !hasSelectedDimension && allCols.has(column);
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
            if (isInitialising && core_1._.includes(this.referenceCellRange.columns, column)) {
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
        if (dimensionColState.filter(idsMatch).length > 0) {
            // only one dimension should be selected
            dimensionColState.forEach(cs => cs.selected = idsMatch(cs));
        }
        else {
            // just update the selected value on the supplied value column
            valueColState.filter(idsMatch).forEach(cs => cs.selected = updatedCol.selected);
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
            // use first dimension column in range by default
            dimensionCols.forEach(col => {
                if (this.dimensionCellRange || !colsInRange.has(col)) {
                    return;
                }
                this.dimensionCellRange = this.createCellRange(core_1.CellRangeType.DIMENSION, col);
            });
            return;
        }
        let selectedDimensionColState = updatedColState;
        if (this.crossFiltering && this.aggFunc) {
            const aggFuncDimension = this.suppliedCellRange.columns[0]; //TODO
            selectedDimensionColState = this.dimensionColState.filter(cs => cs.colId === aggFuncDimension.getColId())[0];
        }
        else if (!selectedDimensionColState || !dimensionCols.has(selectedDimensionColState.column)) {
            selectedDimensionColState = this.dimensionColState.filter(cs => cs.selected)[0];
        }
        if (selectedDimensionColState && selectedDimensionColState.colId !== ChartDataModel.DEFAULT_CATEGORY) {
            this.dimensionCellRange = this.createCellRange(core_1.CellRangeType.DIMENSION, selectedDimensionColState.column);
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
            this.valueCellRange = this.createCellRange(core_1.CellRangeType.VALUE, ...selectedValueCols);
        }
    }
    syncDimensionCellRange() {
        const selectedDimension = this.getSelectedDimension();
        if (selectedDimension && selectedDimension.column) {
            this.dimensionCellRange = this.createCellRange(core_1.CellRangeType.DIMENSION, selectedDimension.column);
        }
    }
}
ChartDataModel.DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
__decorate([
    core_1.Autowired('columnModel')
], ChartDataModel.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('valueService')
], ChartDataModel.prototype, "valueService", void 0);
__decorate([
    core_1.Autowired('rangeService')
], ChartDataModel.prototype, "rangeService", void 0);
__decorate([
    core_1.Autowired('rowRenderer')
], ChartDataModel.prototype, "rowRenderer", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], ChartDataModel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], ChartDataModel.prototype, "init", null);
exports.ChartDataModel = ChartDataModel;
//# sourceMappingURL=chartDataModel.js.map