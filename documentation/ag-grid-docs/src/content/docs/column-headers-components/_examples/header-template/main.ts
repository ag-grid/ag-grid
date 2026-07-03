import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([TextFilterModule, NumberFilterModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { headerName: 'Athlete Name', field: 'athlete', suppressHeaderFilterButton: true },
    { field: 'age', sortable: false },
    { field: 'country', suppressHeaderFilterButton: true },
    { field: 'year', sortable: false },
    { field: 'date', suppressHeaderFilterButton: true, sortable: false },
    { field: 'sport', sortable: false },
    { field: 'gold' },
    { field: 'silver', sortable: false },
    { field: 'bronze', suppressHeaderFilterButton: true },
    { field: 'total', sortable: false },
    { field: 'prevYearTotalDiff', sort: { type: 'absolute', direction: null } },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        filter: true,
        width: 150,
        headerComponentParams: {
            template: `<div class="ag-cell-label-container" role="presentation">
                    <span data-ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
                    <span data-ref="eFilterButton" class="ag-header-icon ag-header-cell-filter-button"></span>
                    <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
                        <span data-ref="eSortOrder" class="ag-header-icon ag-sort-order ag-hidden"></span>
                        <span data-ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon ag-hidden"></span>
                        <span data-ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon ag-hidden"></span>
                        <span data-ref="eSortAbsoluteAsc" class="ag-header-icon ag-sort-absolute-ascending-icon ag-hidden"></span>
                        <span data-ref="eSortAbsoluteDesc" class="ag-header-icon ag-sort-absolute-descending-icon ag-hidden"></span>
                        <span data-ref="eSortMixed" class="ag-header-icon ag-sort-mixed-icon ag-hidden"></span>
                        <span data-ref="eSortNone" class="ag-header-icon ag-sort-none-icon ag-hidden"></span>
                        ** <span data-ref="eText" class="ag-header-cell-text" role="columnheader"></span>
                        <span data-ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
                    </div>
                </div>`,
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((d) => ({
                    ...d,
                    prevYearTotalDiff: Math.floor((2 * window.agRandom() - 1) * d.total),
                }))
            )
        );
});
