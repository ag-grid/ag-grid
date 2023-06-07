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
            this.updateFilters(filterModel, event, colId);
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
    updateFilters(filterModel, event, colId) {
        let dataKey = ChartCrossFilterService_1.extractFilterColId(event);
        let rawValue = event.datum[dataKey];
        if (rawValue === undefined) {
            return;
        }
        let selectedValue = rawValue.toString();
        if (event.event.metaKey || event.event.ctrlKey) {
            const existingGridValues = this.getCurrentGridValuesForCategory(colId);
            const valueAlreadyExists = _.includes(existingGridValues, selectedValue);
            let updatedValues;
            if (valueAlreadyExists) {
                updatedValues = existingGridValues.filter((v) => v !== selectedValue);
            }
            else {
                updatedValues = existingGridValues;
                updatedValues.push(selectedValue);
            }
            filterModel[colId] = this.getUpdatedFilterModel(colId, updatedValues);
        }
        else {
            const updatedValues = [selectedValue];
            filterModel = { [colId]: this.getUpdatedFilterModel(colId, updatedValues) };
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
    getCurrentGridValuesForCategory(colId) {
        let filteredValues = [];
        const column = this.getColumnById(colId);
        this.gridApi.forEachNodeAfterFilter((rowNode) => {
            if (column && !rowNode.group) {
                const value = this.valueService.getValue(column, rowNode) + '';
                if (!filteredValues.includes(value)) {
                    filteredValues.push(value);
                }
            }
        });
        return filteredValues;
    }
    static extractFilterColId(event) {
        return event.xKey || event.calloutLabelKey;
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
        let gridColumn = this.getColumnById(colId);
        if (gridColumn) {
            const colDef = gridColumn.getColDef();
            return colDef.filter;
        }
    }
    getColumnById(colId) {
        return this.columnModel.getGridColumn(colId);
    }
};
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
export { ChartCrossFilterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRDcm9zc0ZpbHRlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9zZXJ2aWNlcy9jaGFydENyb3NzRmlsdGVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFNWCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLElBQWEsdUJBQXVCLCtCQUFwQyxNQUFhLHVCQUF3QixTQUFRLFFBQVE7SUFNMUMsTUFBTSxDQUFDLEtBQVUsRUFBRSxRQUFpQixLQUFLO1FBQzVDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFbEQsZ0VBQWdFO1FBQ2hFLElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMvQixPQUFPO1NBQ1Y7UUFFRCxJQUFJLEtBQUssR0FBRyx5QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5RCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQyxtREFBbUQ7WUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2pEO2FBQU07WUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLG1GQUFtRjtnQkFDNUYsd0NBQXdDLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQy9EO0lBQ0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxXQUFnQjtRQUNqQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDekQsSUFBSSxZQUFZLEVBQUU7WUFDZCxzRkFBc0Y7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