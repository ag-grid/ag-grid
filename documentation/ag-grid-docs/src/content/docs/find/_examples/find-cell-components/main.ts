import type { FindChangedEvent, GetFindTextParams, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

import { FindRenderer } from './findRenderer_typescript';

ModuleRegistry.registerModules([FindModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        {
            field: 'year',
            cellRenderer: FindRenderer,
            getFindText: (params: GetFindTextParams) => {
                const cellValue = params.getValueFormatted() ?? params.value?.toString();
                if (!cellValue?.length) {
                    return null;
                }
                return `Year is ${cellValue}`;
            },
        },
    ],
    onFindChanged: (event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = findSearchValue?.length
            ? `${activeMatch?.numOverall ?? 0}/${totalMatches}`
            : '';
    },
    onGridReady: () => {
        (document.getElementById('find-text-box') as HTMLInputElement).addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                find();
                const backwards = event.shiftKey;
                if (backwards) {
                    previous();
                } else {
                    next();
                }
            }
        });
    },
    onFirstDataRendered: () => {
        find();
        next();
    },
};

function find() {
    const findSearchValue = (document.getElementById('find-text-box') as HTMLInputElement).value;
    if (findSearchValue !== gridApi.getGridOption('findSearchValue')) {
        gridApi!.setGridOption('findSearchValue', findSearchValue);
    }
}

function next() {
    gridApi!.findNext();
}

function previous() {
    gridApi!.findPrevious();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
