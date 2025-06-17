import type { GridApi, GridOptions, SelectableFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, NewFiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    NumberFilterModule,
    DateFilterModule,
    ClientSideRowModelModule,
    NewFiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'date', minWidth: 180 },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: 'agSelectableColumnFilter',
        filterParams: {
            defaultFilterParams: {
                buttons: ['apply'], // set all filters to use buttons
            },
        } as SelectableFilterParams,
    },
    sideBar: {
        toolPanels: [
            {
                id: 'filters-new',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agNewFiltersToolPanel',
                toolPanelParams: {
                    buttons: ['cancel', 'apply'],
                },
            },
        ],
        defaultToolPanel: 'filters-new',
    },
    enableFilterHandlers: true,
    suppressSetFilterByDefault: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((rowData) => {
                    const dateParts = rowData.date.split('/');
                    const [year, month, day] = dateParts.reverse().map((e) => parseInt(e, 10));
                    const paddedDateTimeStrings = [month, day].map((e) => e.toString().padStart(2, '0'));
                    const date = `${year}-${paddedDateTimeStrings[0]}-${paddedDateTimeStrings[1]}`;
                    return {
                        ...rowData,
                        date,
                    };
                })
            )
        );
});
