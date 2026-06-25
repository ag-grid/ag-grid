import type {
    GridApi,
    GridOptions,
    IMultiFilter,
    IMultiFilterParams,
    ITextFilterParams,
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

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
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
                        filterParams: {
                            buttons: ['apply', 'clear'],
                        } as ITextFilterParams,
                    },
                    {
                        filter: 'agSetColumnFilter',
                    },
                ],
            } as IMultiFilterParams,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        suppressHeaderMenuButton: true,
        suppressHeaderContextMenu: true,
    },
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
