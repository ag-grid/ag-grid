import { ClientSideRowModelModule } from 'ag-grid-community';
import { FirstDataRenderedEvent, GridApi, GridOptions, ISetFilterParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

var listOfDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

var daysValuesNotProvidedFilterParams: ISetFilterParams = {
    comparator: (a: string | null, b: string | null) => {
        var aIndex = a == null ? -1 : listOfDays.indexOf(a);
        var bIndex = b == null ? -1 : listOfDays.indexOf(b);
        if (aIndex === bIndex) return 0;
        return aIndex > bIndex ? 1 : -1;
    },
};

var daysValuesProvidedFilterParams: ISetFilterParams = {
    values: listOfDays,
    suppressSorting: true, // use provided order
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Days (Values Not Provided)',
            field: 'days',
            filter: 'agSetColumnFilter',
            filterParams: daysValuesNotProvidedFilterParams,
        },
        {
            headerName: 'Days (Values Provided)',
            field: 'days',
            filter: 'agSetColumnFilter',
            filterParams: daysValuesProvidedFilterParams,
        },
    ],
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    sideBar: 'filters',
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function getRowData() {
    var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    var rows = [];
    for (var i = 0; i < 200; i++) {
        var index = Math.floor(Math.random() * 5);
        rows.push({ days: weekdays[index] });
    }

    return rows;
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
