import type {
    FindChangedEvent,
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetFindMatchesParams,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IDetailCellRendererParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: getData(),
    columnDefs: [{ field: 'a1', cellRenderer: 'agGroupCellRenderer' }, { field: 'b1' }],
    defaultColDef: {
        flex: 1,
    },
    masterDetail: true,
    getRowId: (params: GetRowIdParams) => params.data.a1,
    findOptions: {
        searchDetail: true,
    },
    detailCellRendererParams: {
        // level 2 grid options
        detailGridOptions: {
            columnDefs: [{ field: 'a2', cellRenderer: 'agGroupCellRenderer' }, { field: 'b2' }],
            defaultColDef: {
                flex: 1,
            },
            masterDetail: true,
            detailRowHeight: 240,
            getRowId: (params: GetRowIdParams) => params.data.a2,
            findOptions: {
                searchDetail: true,
            },
            detailCellRendererParams: {
                // level 3 grid options
                detailGridOptions: {
                    columnDefs: [{ field: 'a3', cellRenderer: 'agGroupCellRenderer' }, { field: 'b3' }],
                    defaultColDef: {
                        flex: 1,
                    },
                    getRowId: (params: GetRowIdParams) => params.data.a3,
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.children);
                },
                getFindMatches,
            } as IDetailCellRendererParams,
        },
        getDetailRowData: (params: GetDetailRowDataParams) => {
            params.successCallback(params.data.children);
        },
        getFindMatches,
    } as IDetailCellRendererParams,
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

function getFindMatches(params: GetFindMatchesParams) {
    const getMatchesForValue = params.getMatchesForValue;
    let numMatches = 0;
    const checkRow = (row: any) => {
        for (const key of Object.keys(row)) {
            if (key === 'children') {
                row.children.forEach((child: any) => checkRow(child));
            } else {
                numMatches += getMatchesForValue(row[key]);
            }
        }
    };
    params.data.children.forEach(checkRow);
    return numMatches;
}

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
    gridApi!.findGoTo(num, true);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

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
