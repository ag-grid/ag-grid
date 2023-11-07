import {
    GridApi,
    createGrid,
    GridOptions,
    FirstDataRenderedEvent,
    RowDataUpdatedEvent,
} from '@ag-grid-community/core';
import { getDataSetA, getDataSetB, TAthlete } from './data';

const updateRowCount = (value?: string | number) => {
    const element = document.querySelector('#rowCount > .value');
    element!.innerHTML = value !== undefined ? value.toString() : '-';
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'name', headerName: 'Athlete' },
        { field: 'medals.gold', headerName: 'Gold Medals' },
        { field: 'person.age', headerName: 'Age' },
    ],
    rowData: getDataSetA(),
    onFirstDataRendered: (event: FirstDataRenderedEvent) => {
        updateRowCount(event.api.getDisplayedRowCount());
    },
    onRowDataUpdated: (event: RowDataUpdatedEvent<TAthlete>) => {
        updateRowCount(event.api.getDisplayedRowCount());
    },
};

function loadDataSetA() {
    gridApi!.setGridOption('rowData', getDataSetA());
}

function loadDataSetB() {
    gridApi!.setGridOption('rowData', getDataSetB());
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
