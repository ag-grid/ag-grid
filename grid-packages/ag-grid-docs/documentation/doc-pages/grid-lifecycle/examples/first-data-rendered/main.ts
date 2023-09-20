import { Grid, GridApi, ColumnApi, GridOptions, GridReadyEvent, FirstDataRenderedEvent, ValueGetterParams } from '@ag-grid-community/core';

import { getData, TAthlete } from './data';

const setCol1SizeInfoOnGridReady = (value?: string | number) => {
    const element = document.querySelector<HTMLElement>('#athleteDescriptionColWidthOnReady');
    element!.innerHTML = value !== undefined ? `${value.toString()}px` : '-';
};

const setCol1SizeInfOnFirstDataRendered = (value?: string | number) => {
    const element = document.querySelector<HTMLElement>('#athleteDescriptionColWidthOnFirstDataRendered');
    element!.innerHTML = value !== undefined ? `${value.toString()}px` : '-';
};

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'athleteDescription',
            headerName: 'Athlete Description',
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
    onGridReady: (params: GridReadyEvent<TAthlete>) => {
        const column = gridOptions.columnApi?.getColumn('athleteDescription');
        if (column) {
            gridOptions.columnApi?.autoSizeColumns([column.getId()]);
            setCol1SizeInfoOnGridReady(column.getActualWidth());
        }

        console.warn('AG Grid: onGridReady event triggered');
    },
    onFirstDataRendered: (params: FirstDataRenderedEvent<TAthlete>) => {
        const { columnApi } = params;
        const column = columnApi.getColumn('athleteDescription');

        if (column) {
            columnApi?.autoSizeColumns([column.getId()]);
            setCol1SizeInfOnFirstDataRendered(column.getActualWidth());
        }

        console.warn('AG Grid: onFirstDataRendered event triggered');
    }
};

function loadGridData() {
    gridOptions.api?.setRowData(getData());
    document.querySelector<HTMLElement>('#loadGridDataButton')!.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions);
});
