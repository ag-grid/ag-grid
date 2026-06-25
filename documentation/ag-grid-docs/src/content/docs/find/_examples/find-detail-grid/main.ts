import type {
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetFindMatchesParams,
    GetRowIdParams,
    GridOptions,
    IDetailCellRendererParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';

import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule, MasterDetailModule, RowApiModule]);

const gridOptions: GridOptions = {
    rowData: getData(),
    columnDefs: [{ field: 'a1', cellRenderer: 'agGroupCellRenderer' }, { field: 'b1' }],
    defaultColDef: {
        flex: 1,
    },
    masterDetail: true,
    getRowId: (params: GetRowIdParams) => params.data.a1,
    toolbar: {
        items: ['agFindToolbarItem'],
    },
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

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
