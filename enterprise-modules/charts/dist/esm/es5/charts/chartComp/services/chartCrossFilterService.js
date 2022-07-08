var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
        return event.xKey ? event.xKey : event.labelKey;
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
            return colDef.filter != null ? colDef.filter : colDef.filterFramework;
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
