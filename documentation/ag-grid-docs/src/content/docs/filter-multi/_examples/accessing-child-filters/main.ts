import type {
    FilterWrapperParams,
    GridApi,
    GridOptions,
    IMultiFilter,
    IMultiFilterParams,
    SetFilterUi,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    MultiFilterModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    MultiFilterModule,
    SetFilterModule,
    TextFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                    },
                    {
                        filter: 'agSetColumnFilter',
                    },
                ],
                buttons: ['apply', 'clear'],
            } as IMultiFilterParams & FilterWrapperParams,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        suppressHeaderMenuButton: true,
        suppressHeaderContextMenu: true,
    },
    enableFilterHandlers: true,
};

function getSetMiniFilter() {
    gridApi!.getColumnFilterInstance<IMultiFilter>('athlete').then((multiFilterInstance) => {
        const setFilter = multiFilterInstance!.getChildFilterInstance<SetFilterUi>(1)!;
        console.log('Current Set Filter search text: ', setFilter.getMiniFilter());
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
