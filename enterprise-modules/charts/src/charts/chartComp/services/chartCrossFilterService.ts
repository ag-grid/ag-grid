import { _, Autowired, Bean, BeanStub, ColumnModel, GridApi, RowNode } from "@ag-grid-community/core";

@Bean("chartCrossFilterService")
export class ChartCrossFilterService extends BeanStub {

    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    public filter(event: any, reset: boolean = false): void {
        const filterModel = this.gridApi.getFilterModel();

        // filters should be reset when user clicks on canvas background
        if (reset) {
            this.resetFilters(filterModel);
            return;
        }

        let colId = ChartCrossFilterService.extractFilterColId(event);
        if (this.isValidColumnFilter(colId)) {
            // update filters based on current chart selections
            this.updateFilters(filterModel, event);
        } else {
            console.warn("AG Grid: cross filtering requires a 'agSetColumnFilter' or 'agMultiColumnFilter' " +
                "to be defined on the column with id: '" + colId + "'");
        }
    }

    private resetFilters(filterModel: any) {
        const filtersExist = Object.keys(filterModel).length > 0;
        if (filtersExist) {
            // only reset filters / charts when necessary to prevent undesirable flickering effect
            this.gridApi.setFilterModel(null);
            this.gridApi.onFilterChanged();
        }
    }

    private updateFilters(filterModel: any, event: any) {
        let dataKey = ChartCrossFilterService.extractFilterColId(event);
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
                updatedValues = existingGridValues.filter((v: any) => v !== selectedValue);
            } else {
                updatedValues = existingGridValues;
                updatedValues.push(selectedValue);
            }

            filterModel[filterColId] = this.getUpdatedFilterModel(filterColId, updatedValues);
        } else {
            const updatedValues = [selectedValue];
            filterModel = {[filterColId]: this.getUpdatedFilterModel(filterColId, updatedValues)};
        }

        this.gridApi.setFilterModel(filterModel);
    }

    private getUpdatedFilterModel(colId: any, updatedValues: any[]) {
        let columnFilterType = this.getColumnFilterType(colId);
        if (columnFilterType === 'agMultiColumnFilter') {
            return {filterType: 'multi', filterModels: [null, {filterType: 'set', values: updatedValues}]};
        }
        return {filterType: 'set', values: updatedValues};
    }

    private getCurrentGridValuesForCategory(dataKey: any) {
        let filteredValues: any[] = [];
        const gridContainsValue = _.includes;
        this.gridApi.forEachNodeAfterFilter((rowNode: RowNode) => {
            if (!rowNode.group) {
                const value = rowNode.data[dataKey] + '';
                if (!gridContainsValue(filteredValues, value)) {
                    filteredValues.push(value);
                }
            }
        });
        return filteredValues;
    }

    private static extractFilterColId(event: any): string {
        return event.xKey ? event.xKey : event.labelKey;
    }

    private isValidColumnFilter(colId: any) {
        if (colId.indexOf('-filtered-out')) {
            colId = colId.replace('-filtered-out', '');
        }

        let filterType = this.getColumnFilterType(colId);
        if (typeof filterType === 'boolean') {
            return filterType;
        }

        return _.includes(['agSetColumnFilter', 'agMultiColumnFilter'], filterType);
    }

    private getColumnFilterType(colId: any) {
        let gridColumn = this.columnModel.getGridColumn(colId);
        if (!gridColumn) { return; }

        const colDef = gridColumn.getColDef();

        return colDef.filter!=null ? colDef.filter : colDef.filterFramework;
    }
}
