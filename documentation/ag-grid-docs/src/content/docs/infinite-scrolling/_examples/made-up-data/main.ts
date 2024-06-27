import {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IDatasource,
    IGetRowsParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';

ModuleRegistry.registerModules([InfiniteRowModelModule]);

var ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

function getColumnDefs() {
    const columnDefs: ColDef[] = [
        { checkboxSelection: true, headerName: '', width: 60 },
        { headerName: '#', width: 80, valueGetter: 'node.rowIndex' },
    ];

    ALPHABET.forEach((letter) => {
        columnDefs.push({
            headerName: letter.toUpperCase(),
            field: letter,
            width: 150,
        });
    });
    return columnDefs;
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: getColumnDefs(),
    rowModelType: 'infinite',
    rowSelection: 'multiple',
    maxBlocksInCache: 2,
    suppressRowClickSelection: true,
    getRowId: (params: GetRowIdParams) => {
        return params.data.a;
    },
    datasource: getDataSource(100),
    defaultColDef: {
        sortable: false,
    },
};

function getDataSource(count: number) {
    const dataSource: IDatasource = {
        rowCount: count,
        getRows: (params: IGetRowsParams) => {
            var rowsThisPage: any[] = [];

            for (var rowIndex = params.startRow; rowIndex < params.endRow; rowIndex++) {
                var record: Record<string, string> = {};
                ALPHABET.forEach(function (letter, colIndex) {
                    var randomNumber = 17 + rowIndex + colIndex;
                    var cellKey = letter.toUpperCase() + (rowIndex + 1);
                    record[letter] = cellKey + ' = ' + randomNumber;
                });
                rowsThisPage.push(record);
            }

            // to mimic server call, we reply after a short delay
            setTimeout(() => {
                // no need to pass the second 'rowCount' parameter as we have already provided it
                params.successCallback(rowsThisPage);
            }, 100);
        },
    };
    return dataSource;
}

document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
