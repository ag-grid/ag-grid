import type { GridApi, GridOptions, NewFiltersToolPanelState } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations, themeQuartz } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

const myTheme = themeQuartz.withParams({
    scrollbarThumbColor: '#9696C8',
    scrollbarTrackColor: 'transparent',
    scrollbarWidth: 'thin',
    bodyScrollbarBorder: { color: '#9696C8' },
});

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    theme: myTheme,
    columnDefs: [
        { field: 'athlete', minWidth: 170 },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        filter: true,
    },
    sideBar: 'filters-new',
    enableFilterHandlers: true,
    initialState: {
        sideBar: {
            visible: true,
            position: 'right',
            openToolPanel: 'filters-new',
            toolPanels: {
                'filters-new': {
                    filters: [{ colId: 'country', expanded: true }],
                } as NewFiltersToolPanelState,
            },
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
