import { _, Autowired, Bean, BeanStub, ColumnController, GridApi, RowNode } from "@ag-grid-community/core";

@Bean("chartCrossFilter")
export class ChartCrossFilter extends BeanStub {

    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnController') private readonly columnController: ColumnController;

    public filter(event: any, reset: boolean = false): void {
        const filterModel = this.gridApi.getFilterModel();

        // const passValidation = this.validateColumnFilter(filterModel, event);
        // if (!passValidation) { return; }

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

        let filterColId = dataKey;

        //TODO - handle more than one group level, currently missing context in chart event
        if (dataKey === 'ag-Grid-AutoColumn') {
            let rowGroupColumns = this.columnController.getRowGroupColumns();
            filterColId = rowGroupColumns[0].getColId();
        }

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

            filterModel[filterColId] = {filterType: 'multi', filterModels: [null, {filterType: 'set', values: updatedValues}]};
        } else {
            const values = [selectedValue];
            filterModel = {[filterColId]: {filterType: 'multi', filterModels: [null, {filterType: 'set', values}]}};
        }

        this.gridApi.setFilterModel(filterModel);
        this.gridApi.onFilterChanged();
    }

    private getCurrentGridValuesForCategory(dataKey: any) {
        let filteredValues: any[] = [];
        const gridContainsValue = _.includes;
        this.gridApi.forEachNodeAfterFilter((rowNode: RowNode, _) => {
            if (!rowNode.group) {
                const value = rowNode.data[dataKey];
                if (!gridContainsValue(filteredValues, value)) {
                    filteredValues.push(value);
                }
            }
        });
        return filteredValues;
    }

    private validateColumnFilter(filterModel: any, event: any): boolean {
        let dataKey = ChartCrossFilter.extractDataKey(event);
        if (!_.includes(['set', 'multi'], filterModel[dataKey])) {
            console.warn("ag-Grid: cross filtering requires 'set' or 'multi' filter to be configured on a column:  " + event.xKey);
            return false;
        }
        return true;
    }

    private static extractDataKey(event: any) {
        return event.xKey ? event.xKey : event.labelKey;
    }
}
