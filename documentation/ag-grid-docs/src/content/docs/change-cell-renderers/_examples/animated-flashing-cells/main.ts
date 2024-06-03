import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

let gridApi: GridApi;

function formatNumber(number: number) {
    return Math.floor(number).toLocaleString();
}

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'a', enableCellChangeFlash: true },
        { field: 'b', enableCellChangeFlash: true },
        { field: 'c', cellRenderer: 'agAnimateShowChangeCellRenderer' },
        { field: 'd', cellRenderer: 'agAnimateShowChangeCellRenderer' },
        { field: 'e', cellRenderer: 'agAnimateSlideCellRenderer' },
        { field: 'f', cellRenderer: 'agAnimateSlideCellRenderer' },
    ],
    defaultColDef: {
        flex: 1,
        cellClass: 'align-right',
        valueFormatter: (params) => {
            return formatNumber(params.value);
        },
    },
    rowData: createRowData(),
    onGridReady: () => {
        const updateValues = () => {
            var rowCount = gridApi!.getDisplayedRowCount();
            // pick 2 cells at random to update
            for (var i = 0; i < 2; i++) {
                var row = Math.floor(Math.random() * rowCount);
                var rowNode = gridApi!.getDisplayedRowAtIndex(row)!;
                var col = ['a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 6)];
                rowNode.setDataValue(col, Math.floor(Math.random() * 10000));
            }
        };

        setInterval(updateValues, 250);
    },
};

function createRowData() {
    var rowData = [];

    for (var i = 0; i < 20; i++) {
        rowData.push({
            a: Math.floor(((i + 323) * 145045) % 10000),
            b: Math.floor(((i + 323) * 543020) % 10000),
            c: Math.floor(((i + 323) * 305920) % 10000),
            d: Math.floor(((i + 323) * 204950) % 10000),
            e: Math.floor(((i + 323) * 103059) % 10000),
            f: Math.floor(((i + 323) * 468276) % 10000),
        });
    }

    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
