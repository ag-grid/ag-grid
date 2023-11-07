import {
    GridApi,
    createGrid,
    GridOptions,
    GridReadyEvent,
    FirstDataRenderedEvent,
    ValueGetterParams,
} from '@ag-grid-community/core';

import { getData, TAthlete } from './data';

const setCol1SizeInfoOnGridReady = (value?: string | number) => {
    const element = document.querySelector<HTMLElement>('#athleteDescriptionColWidthOnReady');
    element!.innerHTML = value !== undefined ? `${value.toString()}px` : '-';
};

const setCol1SizeInfOnFirstDataRendered = (value?: string | number) => {
    const element = document.querySelector<HTMLElement>('#athleteDescriptionColWidthOnFirstDataRendered');
    element!.innerHTML = value !== undefined ? `${value.toString()}px` : '-';
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'athleteDescription',
            valueGetter: (params: ValueGetterParams) => {
                const { data } = params;
                const { person } = data;
                return `The ${person.age} years old ${data.name} from ${person.country}`
            },
        },
        { field: 'medals.gold', headerName: 'Gold Medals' },
        { field: 'person.age', headerName: 'Age' },
    ],
    defaultColDef: {
        minWidth: 150,
    },
    suppressLoadingOverlay: true,
    autoSizeStrategy: {
        type: 'fitCellContents',
        colIds: ['athleteDescription']
    },
    onGridReady: (params: GridReadyEvent<TAthlete>) => {
        const column = params.api.getColumn('athleteDescription');
        if (column) {
            setCol1SizeInfoOnGridReady(column.getActualWidth());
        }

        console.log('AG Grid: onGridReady event triggered');
    },
    onFirstDataRendered: (params: FirstDataRenderedEvent<TAthlete>) => {
        const column = params.api.getColumn('athleteDescription');

        if (column) {
            setCol1SizeInfOnFirstDataRendered(column.getActualWidth());
        }

        console.log('AG Grid: onFirstDataRendered event triggered');
    }
};

function loadGridData() {
    gridApi?.setGridOption('rowData', getData());
    document.querySelector<HTMLElement>('#loadGridDataButton')!.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
