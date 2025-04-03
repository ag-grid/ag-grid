import type {
    FindChangedEvent,
    FindDetailCellRendererParams,
    FirstDataRenderedEvent,
    GetFindMatchesParams,
    GridApi,
    GridOptions,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';

import { DetailCellRenderer } from './detailCellRenderer';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
    ],
    masterDetail: true,
    detailCellRenderer: DetailCellRenderer,
    detailCellRendererParams: {
        getFindMatches: (params: GetFindMatchesParams) => {
            return params.getMatchesForValue('My Custom Detail');
        },
    } as FindDetailCellRendererParams,
    detailRowHeight: 100,
    findOptions: {
        searchDetail: true,
    },
    onFindChanged: (event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        (document.getElementById('activeMatchNum') as HTMLElement).textContent = findSearchValue?.length
            ? `${activeMatch?.numOverall ?? 0}/${totalMatches}`
            : '';
    },
    onFirstDataRendered: (event: FirstDataRenderedEvent) => {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    },
};

function next() {
    gridApi!.findNext();
}

function previous() {
    gridApi!.findPrevious();
}

function goToFind() {
    const num = Number((document.getElementById('find-goto') as HTMLInputElement).value);
    if (isNaN(num) || num < 0) {
        return;
    }
    gridApi!.findGoTo(num);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
        .then((response) => response.json())
        .then((data: IAccount[]) => gridApi!.setGridOption('rowData', data));

    const findInput = document.getElementById('find-text-box') as HTMLInputElement;
    findInput.addEventListener('input', (event) => {
        gridApi.setGridOption('findSearchValue', (event.target as HTMLInputElement).value);
    });
    findInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const backwards = event.shiftKey;
            if (backwards) {
                previous();
            } else {
                next();
            }
        }
    });
});
