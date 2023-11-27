var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let ChartColumnService = class ChartColumnService extends BeanStub {
    getColumn(colId) {
        return this.columnModel.getPrimaryColumn(colId);
    }
    getAllDisplayedColumns() {
        return this.columnModel.getAllDisplayedColumns();
    }
    getColDisplayName(col) {
        return this.columnModel.getDisplayNameForColumn(col, 'chart');
    }
    getRowGroupColumns() {
        return this.columnModel.getRowGroupColumns();
    }
    getGroupDisplayColumns() {
        return this.columnModel.getGroupDisplayColumns();
    }
    isPivotMode() {
        return this.columnModel.isPivotMode();
    }
    isPivotActive() {
        return this.columnModel.isPivotActive();
    }
    getChartColumns() {
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
};
__decorate([
    Autowired('columnModel')
], ChartColumnService.prototype, "columnModel", void 0);
__decorate([
    Autowired('valueService')
], ChartColumnService.prototype, "valueService", void 0);
__decorate([
    Autowired('rowRenderer')
], ChartColumnService.prototype, "rowRenderer", void 0);
ChartColumnService = __decorate([
    Bean("chartColumnService")
], ChartColumnService);
export { ChartColumnService };
