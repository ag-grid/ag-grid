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
import { _, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
var ChartCrossFilterService = /** @class */ (function (_super) {
    __extends(ChartCrossFilterService, _super);
    function ChartCrossFilterService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartCrossFilterService_1 = ChartCrossFilterService;
    ChartCrossFilterService.prototype.filter = function (event, reset) {
        if (reset === void 0) { reset = false; }
        var filterModel = this.gridApi.getFilterModel();
        // filters should be reset when user clicks on canvas background
        if (reset) {
            this.resetFilters(filterModel);
            return;
        }
        var colId = ChartCrossFilterService_1.extractFilterColId(event);
        if (this.isValidColumnFilter(colId)) {
            // update filters based on current chart selections
            this.updateFilters(filterModel, event, colId);
        }
        else {
            console.warn("AG Grid: cross filtering requires a 'agSetColumnFilter' or 'agMultiColumnFilter' " +
                "to be defined on the column with id: '" + colId + "'");
        }
    };
    ChartCrossFilterService.prototype.resetFilters = function (filterModel) {
        var filtersExist = Object.keys(filterModel).length > 0;
        if (filtersExist) {
            // only reset filters / charts when necessary to prevent undesirable flickering effect
            this.gridApi.setFilterModel(null);
            this.gridApi.onFilterChanged();
        }
    };
    ChartCrossFilterService.prototype.updateFilters = function (filterModel, event, colId) {
        var _a;
        var dataKey = ChartCrossFilterService_1.extractFilterColId(event);
        var rawValue = event.datum[dataKey];
        if (rawValue === undefined) {
            return;
        }
        var selectedValue = rawValue.toString();
        if (event.event.metaKey || event.event.ctrlKey) {
            var existingGridValues = this.getCurrentGridValuesForCategory(colId);
            var valueAlreadyExists = _.includes(existingGridValues, selectedValue);
            var updatedValues = void 0;
            if (valueAlreadyExists) {
                updatedValues = existingGridValues.filter(function (v) { return v !== selectedValue; });
            }
            else {
                updatedValues = existingGridValues;
                updatedValues.push(selectedValue);
            }
            filterModel[colId] = this.getUpdatedFilterModel(colId, updatedValues);
        }
        else {
            var updatedValues = [selectedValue];
            filterModel = (_a = {}, _a[colId] = this.getUpdatedFilterModel(colId, updatedValues), _a);
        }
        this.gridApi.setFilterModel(filterModel);
    };
    ChartCrossFilterService.prototype.getUpdatedFilterModel = function (colId, updatedValues) {
        var columnFilterType = this.getColumnFilterType(colId);
        if (columnFilterType === 'agMultiColumnFilter') {
            return { filterType: 'multi', filterModels: [null, { filterType: 'set', values: updatedValues }] };
        }
        return { filterType: 'set', values: updatedValues };
    };
    ChartCrossFilterService.prototype.getCurrentGridValuesForCategory = function (colId) {
        var _this = this;
        var filteredValues = [];
        var column = this.getColumnById(colId);
        this.gridApi.forEachNodeAfterFilter(function (rowNode) {
            if (column && !rowNode.group) {
                var value = _this.valueService.getValue(column, rowNode) + '';
                if (!filteredValues.includes(value)) {
                    filteredValues.push(value);
                }
            }
        });
        return filteredValues;
    };
    ChartCrossFilterService.extractFilterColId = function (event) {
        return event.xKey || event.calloutLabelKey;
    };
    ChartCrossFilterService.prototype.isValidColumnFilter = function (colId) {
        if (colId.indexOf('-filtered-out')) {
            colId = colId.replace('-filtered-out', '');
        }
        var filterType = this.getColumnFilterType(colId);
        if (typeof filterType === 'boolean') {
            return filterType;
        }
        return _.includes(['agSetColumnFilter', 'agMultiColumnFilter'], filterType);
    };
    ChartCrossFilterService.prototype.getColumnFilterType = function (colId) {
        var gridColumn = this.getColumnById(colId);
        if (gridColumn) {
            var colDef = gridColumn.getColDef();
            return colDef.filter;
        }
    };
    ChartCrossFilterService.prototype.getColumnById = function (colId) {
        return this.columnModel.getGridColumn(colId);
    };
    var ChartCrossFilterService_1;
    __decorate([
        Autowired('gridApi')
    ], ChartCrossFilterService.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnModel')
    ], ChartCrossFilterService.prototype, "columnModel", void 0);
    __decorate([
        Autowired('valueService')
    ], ChartCrossFilterService.prototype, "valueService", void 0);
    ChartCrossFilterService = ChartCrossFilterService_1 = __decorate([
        Bean("chartCrossFilterService")
    ], ChartCrossFilterService);
    return ChartCrossFilterService;
}(BeanStub));
export { ChartCrossFilterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRDcm9zc0ZpbHRlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9zZXJ2aWNlcy9jaGFydENyb3NzRmlsdGVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQU1YLE1BQU0seUJBQXlCLENBQUM7QUFHakM7SUFBNkMsMkNBQVE7SUFBckQ7O0lBa0hBLENBQUM7Z0NBbEhZLHVCQUF1QjtJQU16Qix3Q0FBTSxHQUFiLFVBQWMsS0FBVSxFQUFFLEtBQXNCO1FBQXRCLHNCQUFBLEVBQUEsYUFBc0I7UUFDNUMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVsRCxnRUFBZ0U7UUFDaEUsSUFBSSxLQUFLLEVBQUU7WUFDUCxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9CLE9BQU87U0FDVjtRQUVELElBQUksS0FBSyxHQUFHLHlCQUF1QixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLG1EQUFtRDtZQUNuRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDakQ7YUFBTTtZQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsbUZBQW1GO2dCQUM1Rix3Q0FBd0MsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDL0Q7SUFDTCxDQUFDO0lBRU8sOENBQVksR0FBcEIsVUFBcUIsV0FBZ0I7UUFDakMsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFN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