"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
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
            this.updateFilters(filterModel, event);
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
    ChartCrossFilterService.prototype.updateFilters = function (filterModel, event) {
        var _a;
        var dataKey = ChartCrossFilterService_1.extractFilterColId(event);
        var rawValue = event.datum[dataKey];
        if (rawValue === undefined) {
            return;
        }
        var selectedValue = rawValue.toString();
        var filterColId = dataKey.replace('-filtered-out', '');
        if (event.event.metaKey || event.event.ctrlKey) {
            var existingGridValues = this.getCurrentGridValuesForCategory(filterColId);
            var valueAlreadyExists = core_1._.includes(existingGridValues, selectedValue);
            var updatedValues = void 0;
            if (valueAlreadyExists) {
                updatedValues = existingGridValues.filter(function (v) { return v !== selectedValue; });
            }
            else {
                updatedValues = existingGridValues;
                updatedValues.push(selectedValue);
            }
            filterModel[filterColId] = this.getUpdatedFilterModel(filterColId, updatedValues);
        }
        else {
            var updatedValues = [selectedValue];
            filterModel = (_a = {}, _a[filterColId] = this.getUpdatedFilterModel(filterColId, updatedValues), _a);
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
    ChartCrossFilterService.prototype.getCurrentGridValuesForCategory = function (dataKey) {
        var filteredValues = [];
        var gridContainsValue = core_1._.includes;
        this.gridApi.forEachNodeAfterFilter(function (rowNode) {
            if (!rowNode.group) {
                var value = rowNode.data[dataKey] + '';
                if (!gridContainsValue(filteredValues, value)) {
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
        return core_1._.includes(['agSetColumnFilter', 'agMultiColumnFilter'], filterType);
    };
    ChartCrossFilterService.prototype.getColumnFilterType = function (colId) {
        var gridColumn = this.columnModel.getGridColumn(colId);
        if (!gridColumn) {
            return;
        }
        var colDef = gridColumn.getColDef();
        return colDef.filter != null ? colDef.filter : colDef.filterFramework;
    };
    var ChartCrossFilterService_1;
    __decorate([
        core_1.Autowired('gridApi')
    ], ChartCrossFilterService.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], ChartCrossFilterService.prototype, "columnModel", void 0);
    ChartCrossFilterService = ChartCrossFilterService_1 = __decorate([
        core_1.Bean("chartCrossFilterService")
    ], ChartCrossFilterService);
    return ChartCrossFilterService;
}(core_1.BeanStub));
exports.ChartCrossFilterService = ChartCrossFilterService;
//# sourceMappingURL=chartCrossFilterService.js.map