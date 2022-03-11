var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ChartCrossFilterService_1;
import { _, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let ChartCrossFilterService = ChartCrossFilterService_1 = class ChartCrossFilterService extends BeanStub {
    filter(event, reset = false) {
        const filterModel = this.gridApi.getFilterModel();
        // filters should be reset when user clicks on canvas background
        if (reset) {
            this.resetFilters(filterModel);
            return;
        }
        let colId = ChartCrossFilterService_1.extractFilterColId(event);
        if (this.isValidColumnFilter(colId)) {
            // update filters based on current chart selections
            this.updateFilters(filterModel, event);
        }
        else {
            console.warn("AG Grid: cross filtering requires a 'agSetColumnFilter' or 'agMultiColumnFilter' " +
                "to be defined on the column with id: '" + colId + "'");
        }
    }
    resetFilters(filterModel) {
        const filtersExist = Object.keys(filterModel).length > 0;
        if (filtersExist) {
            // only reset filters / charts when necessary to prevent undesirable flickering effect
            this.gridApi.setFilterModel(null);
            this.gridApi.onFilterChanged();
        }
    }
    updateFilters(filterModel, event) {
        let dataKey = ChartCrossFilterService_1.extractFilterColId(event);
        let rawValue = event.datum[dataKey];
        if (rawValue === undefined) {
            return;
        }
        let selectedValue = rawValue.toString();
        let filterColId = dataKey.replace('-filtered-out', '');
        if (event.event.metaKey || event.event.ctrlKey) {
            const existingGridValues = this.getCurrentGridValuesForCategory(filterColId);
            const valueAlreadyExists = _.includes(existingGridValues, selectedValue);
            let updatedValues;
            if (valueAlreadyExists) {
                updatedValues = existingGridValues.filter((v) => v !== selectedValue);
            }
            else {
                updatedValues = existingGridValues;
                updatedValues.push(selectedValue);
            }
            filterModel[filterColId] = this.getUpdatedFilterModel(filterColId, updatedValues);
        }
        else {
            const updatedValues = [selectedValue];
            filterModel = { [filterColId]: this.getUpdatedFilterModel(filterColId, updatedValues) };
        }
        this.gridApi.setFilterModel(filterModel);
    }
    getUpdatedFilterModel(colId, updatedValues) {
        let columnFilterType = this.getColumnFilterType(colId);
        if (columnFilterType === 'agMultiColumnFilter') {
            return { filterType: 'multi', filterModels: [null, { filterType: 'set', values: updatedValues }] };
        }
        return { filterType: 'set', values: updatedValues };
    }
    getCurrentGridValuesForCategory(dataKey) {
        let filteredValues = [];
        const gridContainsValue = _.includes;
        this.gridApi.forEachNodeAfterFilter((rowNode) => {
            if (!rowNode.group) {
                const value = rowNode.data[dataKey] + '';
                if (!gridContainsValue(filteredValues, value)) {
                    filteredValues.push(value);
                }
            }
        });
        return filteredValues;
    }
    static extractFilterColId(event) {
        return event.xKey ? event.xKey : event.labelKey;
    }
    isValidColumnFilter(colId) {
        if (colId.indexOf('-filtered-out')) {
            colId = colId.replace('-filtered-out', '');
        }
        let filterType = this.getColumnFilterType(colId);
        if (typeof filterType === 'boolean') {
            return filterType;
        }
        return _.includes(['agSetColumnFilter', 'agMultiColumnFilter'], filterType);
    }
    getColumnFilterType(colId) {
        let gridColumn = this.columnModel.getGridColumn(colId);
        if (!gridColumn) {
            return;
        }
        const colDef = gridColumn.getColDef();
        return colDef.filter != null ? colDef.filter : colDef.filterFramework;
    }
};
__decorate([
    Autowired('gridApi')
], ChartCrossFilterService.prototype, "gridApi", void 0);
__decorate([
    Autowired('columnModel')
], ChartCrossFilterService.prototype, "columnModel", void 0);
ChartCrossFilterService = ChartCrossFilterService_1 = __decorate([
    Bean("chartCrossFilterService")
], ChartCrossFilterService);
export { ChartCrossFilterService };
//# sourceMappingURL=chartCrossFilterService.js.map