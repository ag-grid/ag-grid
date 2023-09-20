import { Grid, GridOptions, GridReadyEvent } from '@ag-grid-community/core';

import { getData, TAthlete } from './data';

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'name', headerName: 'Athlete', width: 250 },
        { field: 'person.country', headerName: 'Country' },
        { field: 'person.age', headerName: 'Age' },
        { field: 'medals.gold', headerName: 'Gold Medals' },
        { field: 'medals.silver', headerName: 'Silver Medals' },
        { field: 'medals.bronze', headerName: 'Bronze Medals' },
    ],
    rowData: getData(),
    rowSelection: 'multiple',
    onGridReady: (params: GridReadyEvent<TAthlete>) => {
        const checkbox = document.querySelector<HTMLInputElement>('#pinFirstColumnOnLoad')!;
        const shouldPinFirstColumn = checkbox && checkbox.checked;
        if (shouldPinFirstColumn) {
            params.columnApi.applyColumnState({
                state: [
                    { colId: 'name', pinned: 'left' },
                ],
            });
        }
    },
};

function reloadGrid() {
    if (gridOptions.api) {
        gridOptions.api.destroy();
    }

    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions);
}

const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
new Grid(gridDiv, gridOptions);
