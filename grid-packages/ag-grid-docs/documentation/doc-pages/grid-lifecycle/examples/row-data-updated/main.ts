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

let api: GridApi;

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
    api!.setRowData(getDataSetA());
}

function loadDataSetB() {
    api!.setRowData(getDataSetB());
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    api = createGrid(gridDiv, gridOptions);;
});
