import type { FirstDataRenderedEvent, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ColumnMenuModule,
    FiltersToolPanelModule,
    NewFiltersToolPanelModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FiltersToolPanelModule,
    NewFiltersToolPanelModule,
    ColumnMenuModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;
let allData: IOlympicData[] = [];

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 180 },
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                preservePreviousValues: true,
                preservePreviousValuesLabel: '(not in rows)',
            },
            floatingFilter: true,
            minWidth: 200,
        },
        { field: 'sport' },
        { field: 'year' },
    ],
    defaultColDef: {
        flex: 1,
    },
    enableFilterHandlers: true,
    sideBar: {
        toolPanels: [
            'filters',
            {
                id: 'filters-new',
                labelDefault: 'Filter Summaries',
                labelKey: 'filterSummaries',
                iconKey: 'filter',
                toolPanel: 'agNewFiltersToolPanel',
            },
        ],
        defaultToolPanel: 'filters',
    },
    onFirstDataRendered: onFirstDataRendered,
};

function rowsOfYear(year: number) {
    return allData.filter((row) => row.year === year);
}

function showYear(year: number) {
    gridApi!.setGridOption('rowData', rowsOfYear(year));
}

function selectAlgeriaAndArgentina() {
    gridApi!.setFilterModel({ country: { filterType: 'set', values: ['Algeria', 'Argentina'] } });
}

function clearPreservedValues() {
    gridApi!.doFilterAction({ colId: 'country', action: 'clearPreservedValues' });
}

function reset() {
    gridApi!.setFilterModel(null);
    gridApi!.setGridOption('rowData', rowsOfYear(2008));
    gridApi!.doFilterAction({ colId: 'country', action: 'clearPreservedValues' });
}

function onFirstDataRendered(params: FirstDataRenderedEvent<IOlympicData>) {
    params.api.getToolPanelInstance('filters')!.expandFilters(['country']);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            allData = data;
            gridApi!.setGridOption('rowData', rowsOfYear(2008));
        });
});
