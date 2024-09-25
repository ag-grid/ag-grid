import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellEditRequestEvent, GetRowIdParams, GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicDataWithId>;

const gridOptions: GridOptions<IOlympicDataWithId> = {
    columnDefs: [
        { field: 'athlete', minWidth: 160 },
        { field: 'age' },
        { field: 'country', minWidth: 140 },
        { field: 'year' },
        { field: 'date', minWidth: 140 },
        { field: 'sport', minWidth: 160 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        editable: true,
    },
    getRowId: (params: GetRowIdParams) => params.data.id,
    readOnlyEdit: true,
    onCellEditRequest: onCellEditRequest,
};

function onCellEditRequest(event: CellEditRequestEvent) {
    const oldData = event.data;
    const field = event.colDef.field;
    const newValue = event.newValue;
    const newData = { ...oldData };
    newData[field!] = event.newValue;

    console.log('onCellEditRequest, updating ' + field + ' to ' + newValue);

    const tx = {
        update: [newData],
    };
    event.api.applyTransaction(tx);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: any[]) => {
            data.forEach((item, index) => (item.id = String(index)));
            gridApi!.setGridOption('rowData', data);
        });
});
