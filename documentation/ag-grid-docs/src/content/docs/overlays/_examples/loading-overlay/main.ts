import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import type { GridApi, GridOptions } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAthlete {
    athlete: string;
    country: string;
}

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    loading: true,
    columnDefs: [{ field: 'athlete' }, { field: 'country' }],
    overlayLoadingTemplate: '<button>loading</button>',
    overlayNoRowsTemplate: '<button>no rows</button>',
};

function setLoading(value: boolean) {
    gridApi!.setGridOption('loading', value);
}

function onBtnClearRowData() {
    gridApi!.setGridOption('rowData', []);
}

function onBtnSetRowData() {
    gridApi!.setGridOption('rowData', [{ athlete: 'Michael Phelps', country: 'US' }]);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'l') {
        setLoading(true);
    } else if (e.key === 'u') {
        setLoading(false);
    } else if (e.key === 'c') {
        onBtnClearRowData();
    } else if (e.key === 's') {
        onBtnSetRowData();
    }
});
