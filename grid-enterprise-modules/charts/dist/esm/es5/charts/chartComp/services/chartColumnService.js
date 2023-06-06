var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub } from "@ag-grid-community/core";
var ChartColumnService = /** @class */ (function (_super) {
    __extends(ChartColumnService, _super);
    function ChartColumnService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartColumnService.prototype.getColumn = function (colId) {
        return this.columnModel.getPrimaryColumn(colId);
    };
    ChartColumnService.prototype.getAllDisplayedColumns = function () {
        return this.columnModel.getAllDisplayedColumns();
    };
    ChartColumnService.prototype.getColDisplayName = function (col) {
        return this.columnModel.getDisplayNameForColumn(col, 'chart');
    };
    ChartColumnService.prototype.getRowGroupColumns = function () {
        return this.columnModel.getRowGroupColumns();
    };
    ChartColumnService.prototype.getGroupDisplayColumns = function () {
        return this.columnModel.getGroupDisplayColumns();
    };
    ChartColumnService.prototype.isPivotMode = function () {
        return this.columnModel.isPivotMode();
    };
    ChartColumnService.prototype.isPivotActive = function () {
        return this.columnModel.isPivotActive();
    };
    ChartColumnService.prototype.getChartColumns = function () {
        var _this = this;
        var displayedCols = this.columnModel.getAllDisplayedColumns();
        var dimensionCols = new Set();
        var valueCols = new Set();
        displayedCols.forEach(function (col) {
            var colDef = col.getColDef();
            var chartDataType = colDef.chartDataType;
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
                        console.warn("AG Grid: unexpected chartDataType value '" + chartDataType + "' supplied, instead use 'category', 'series' or 'excluded'");
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
            (_this.isNumberCol(col) ? valueCols : dimensionCols).add(col);
        });
        return { dimensionCols: dimensionCols, valueCols: valueCols };
    };
    ChartColumnService.prototype.isNumberCol = function (col) {
        if (col.getColId() === 'ag-Grid-AutoColumn') {
            return false;
        }
        var row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: null });
        if (!row) {
            return false;
        }
        var cellValue = this.valueService.getValue(col, row);
        if (cellValue == null) {
            cellValue = this.extractLeafData(row, col);
        }
        if (cellValue != null && typeof cellValue.toNumber === 'function') {
            cellValue = cellValue.toNumber();
        }
        return typeof cellValue === 'number';
    };
    ChartColumnService.prototype.extractLeafData = function (row, col) {
        if (!row.allLeafChildren) {
            return null;
        }
        for (var i = 0; i < row.allLeafChildren.length; i++) {
            var childRow = row.allLeafChildren[i];
            var value = this.valueService.getValue(col, childRow);
            if (value != null) {
                return value;
            }
        }
        return null;
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
    return ChartColumnService;
}(BeanStub));
export { ChartColumnService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRDb2x1bW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvc2VydmljZXMvY2hhcnRDb2x1bW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFNWCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDO0lBQXdDLHNDQUFRO0lBQWhEOztJQW1IQSxDQUFDO0lBN0dVLHNDQUFTLEdBQWhCLFVBQWlCLEtBQWE7UUFDMUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSxtREFBc0IsR0FBN0I7UUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRU0sOENBQWlCLEdBQXhCLFVBQXlCLEdBQVc7UUFDaEMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRU0sK0NBQWtCLEdBQXpCO1FBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDakQsQ0FBQztJQUVNLG1EQUFzQixHQUE3QjtRQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ3JELENBQUM7SUFFTSx3Q0FBVyxHQUFsQjtRQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRU0sMENBQWEsR0FBcEI7UUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVNLDRDQUFlLEdBQXRCO1FBQUEsaUJBMkNDO1FBMUNHLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUVoRSxJQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ3hDLElBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFcEMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7WUFDckIsSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQy9CLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFFM0MsSUFBSSxhQUFhLEVBQUU7Z0JBQ2YsMkNBQTJDO2dCQUMzQyxRQUFRLGFBQWEsRUFBRTtvQkFDbkIsS0FBSyxVQUFVLENBQUM7b0JBQ2hCLEtBQUssTUFBTTt3QkFDUCxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUN2QixPQUFPO29CQUNYLEtBQUssUUFBUTt3QkFDVCxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNuQixPQUFPO29CQUNYLEtBQUssVUFBVTt3QkFDWCxPQUFPO29CQUNYO3dCQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsOENBQTRDLGFBQWEsK0RBQTRELENBQUMsQ0FBQzt3QkFDcEksTUFBTTtpQkFDYjthQUNKO1lBRUQsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLG9CQUFvQixFQUFFO2dCQUN2QyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QixPQUFPO2FBQ1Y7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUNsQixTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixPQUFPO2FBQ1Y7WUFFRCx1RkFBdUY7WUFDdkYsQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRSxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sRUFBRSxhQUFhLGVBQUEsRUFBRSxTQUFTLFdBQUEsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFTyx3Q0FBVyxHQUFuQixVQUFvQixHQUFXO1FBQzNCLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLG9CQUFvQixFQUFFO1lBQ3pDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRTFFLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztTQUFFO1FBRTNCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVyRCxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDbkIsU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLE9BQU8sU0FBUyxDQUFDLFFBQVEsS0FBSyxVQUFVLEVBQUU7WUFDL0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNwQztRQUVELE9BQU8sT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDO0lBQ3pDLENBQUM7SUFFTyw0Q0FBZSxHQUF2QixVQUF3QixHQUFZLEVBQUUsR0FBVztRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFFMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2pELElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRXhELElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtnQkFDZixPQUFPLEtBQUssQ0FBQzthQUNoQjtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQWhIeUI7UUFBekIsU0FBUyxDQUFDLGFBQWEsQ0FBQzsyREFBMkM7SUFDekM7UUFBMUIsU0FBUyxDQUFDLGNBQWMsQ0FBQzs0REFBNkM7SUFDN0M7UUFBekIsU0FBUyxDQUFDLGFBQWEsQ0FBQzsyREFBMkM7SUFKM0Qsa0JBQWtCO1FBRDlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztPQUNkLGtCQUFrQixDQW1IOUI7SUFBRCx5QkFBQztDQUFBLEFBbkhELENBQXdDLFFBQVEsR0FtSC9DO1NBbkhZLGtCQUFrQiJ9