import { _, Autowired, Bean, BeanStub, GridApi, RowNode } from "@ag-grid-community/core";

@Bean("chartCrossFilter")
export class ChartCrossFilter extends BeanStub {

    @Autowired('gridApi') private readonly gridApi: GridApi;

    public filter(event: any, reset: boolean = false): void {
        const filterModel = this.gridApi.getFilterModel();

        if (reset) {
            // filter reset is performed when user clicks on canvas
            this.resetFilters(filterModel);
        } else {
            // otherwise update filters based on current chart selections
            this.updateFilters(filterModel, event);
        }
    }

    private resetFilters(filterModel: any) {
        const filtersExist = Object.keys(filterModel).length > 0;
        if (filtersExist) {
            // only reset filters / charts when necessary to prevent flickering
            this.gridApi.setFilterModel(null);
            this.gridApi.onFilterChanged();
        }
    }

    private updateFilters(filterModel: any, event: any) {
        let dataKey = ChartCrossFilter.extractDataKey(event);
        let selectedValue = event.datum[dataKey].toString();

        if (event.event.metaKey) {
            const existingGridValues = this.getCurrentGridValuesForCategory(dataKey);
            const valueAlreadyExists = _.includes(existingGridValues, selectedValue);

            let updatedValues;
            if (valueAlreadyExists) {
                updatedValues = existingGridValues.filter((v: any) => v !== selectedValue);
            } else {
                updatedValues = existingGridValues;
                updatedValues.push(selectedValue);
            }

            filterModel[dataKey] = {filterType: 'multi', filterModels: [null, {filterType: 'set', values: updatedValues}]};
        } else {
            const values = [selectedValue];
            filterModel = {[dataKey]: {filterType: 'multi', filterModels: [null, {filterType: 'set', values}]}};
        }

        this.gridApi.setFilterModel(filterModel);
        this.gridApi.onFilterChanged();
    }

    private getCurrentGridValuesForCategory(dataKey: any) {
        let filteredValues: any[] = [];
        const gridContainsValue = _.includes;
        this.gridApi.forEachNodeAfterFilter((rowNode: RowNode, _) => {
            const value = rowNode.data[dataKey]; //TODO use value service
            if (!gridContainsValue(filteredValues, value)) {
                filteredValues.push(value);
            }
        });
        return filteredValues;
    }

    private static extractDataKey(event: any) {
        return event.xKey ? event.xKey : event.labelKey;
    }

}
