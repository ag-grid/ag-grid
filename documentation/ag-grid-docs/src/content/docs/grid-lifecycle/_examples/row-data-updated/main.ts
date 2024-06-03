import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { FirstDataRenderedEvent, GridApi, GridOptions, RowDataUpdatedEvent, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

import { TAthlete, getData } from './data';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const updateRowCount = (id: string) => {
    const element = document.querySelector(`#${id} > .value`);
    element!.textContent = `${new Date().toLocaleTimeString()}`;
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'name', headerName: 'Athlete' },
        { field: 'person.age', headerName: 'Age' },
        { field: 'medals.gold', headerName: 'Gold Medals' },
    ],
    rowData: getData(),
    onFirstDataRendered: (event: FirstDataRenderedEvent) => {
        updateRowCount('firstDataRendered');
        console.log('First Data Rendered');
    },
    onRowDataUpdated: (event: RowDataUpdatedEvent<TAthlete>) => {
        updateRowCount('rowDataUpdated');
        console.log('Row Data Updated');
    },
};

function loadData() {
    gridApi!.setGridOption('rowData', getData());
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
