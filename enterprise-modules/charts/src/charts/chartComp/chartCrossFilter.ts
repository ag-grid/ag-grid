import { _, Autowired, Bean, BeanStub, ColumnController, GridApi, RowNode } from "@ag-grid-community/core";

@Bean("chartCrossFilter")
export class ChartCrossFilter extends BeanStub {

    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnController') private readonly columnController: ColumnController;

    public filter(event: any, reset: boolean = false): void {
        const filterModel = this.gridApi.getFilterModel();

        let colId = ChartCrossFilter.extractFilterColId(event);
        if (!this.isValidColumnFilter(colId)) {
            console.warn("ag-Grid: cross filtering requires a 'agSetColumnFilter' or 'agMultiColumnFilter' " +
                "to be defined on the column with id: '" + colId + "'");
            return;
        }

        if (reset) {
            // filters should be reset when user clicks on canvas background
            this.resetFilters(filterModel);
        } else {
            // update filters based on current chart selections
            this.updateFilters(filterModel, event);
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
        let dataKey = ChartCrossFilter.extractFilterColId(event);
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

            filterModel[filterColId] = this.getUpdatedFilterModel(filterColId, updatedValues);
        } else {
            const updatedValues = [selectedValue];
            filterModel = {[filterColId]: this.getUpdatedFilterModel(filterColId, updatedValues)};
        }

        this.gridApi.setFilterModel(filterModel);
        this.gridApi.onFilterChanged();
    }

    private getUpdatedFilterModel(colId: any, updatedValues: any[]) {
        let columnFilterType = this.getColumnFilterType(colId);
        if (columnFilterType === 'agSetColumnFilter') {
            return {filterType: 'set', values: updatedValues};
        }

        if (columnFilterType === 'agMultiColumnFilter') {
            return {filterType: 'multi', filterModels: [null, {filterType: 'set', values: updatedValues}]};
        }
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

    private static extractFilterColId(event: any): string {
        return event.xKey ? event.xKey : event.labelKey;
    }

    private isValidColumnFilter(colId: any) {
        return _.includes(['agSetColumnFilter', 'agMultiColumnFilter'], this.getColumnFilterType(colId));
    }

    private getColumnFilterType(colId: any) {
        let gridColumn = this.columnController.getGridColumn(colId);
        return gridColumn ? gridColumn.getColDef().filter : undefined;
    }
}
