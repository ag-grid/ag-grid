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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRDb2x1bW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvc2VydmljZXMvY2hhcnRDb2x1bW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFNWCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLElBQWEsa0JBQWtCLEdBQS9CLE1BQWEsa0JBQW1CLFNBQVEsUUFBUTtJQU1yQyxTQUFTLENBQUMsS0FBYTtRQUMxQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLHNCQUFzQjtRQUN6QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRU0saUJBQWlCLENBQUMsR0FBVztRQUNoQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDakQsQ0FBQztJQUVNLHNCQUFzQjtRQUN6QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRU0sYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVNLGVBQWU7UUFDbEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRWhFLE1BQU0sYUFB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