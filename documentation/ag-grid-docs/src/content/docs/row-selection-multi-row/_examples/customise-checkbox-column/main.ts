import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { createGrid } from '@ag-grid-community/core';
import type { GridApi, GridOptions, IRowNode } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 300 },
        { field: 'country', minWidth: 200 },
        { field: 'sport', minWidth: 200 },
        { field: 'year' },
        { field: 'date', minWidth: 200 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowSelection: { mode: 'multiRow' },
    selectionColumnDef: {
        sortable: true,
        resizable: true,
        width: 120,
        suppressHeaderMenuButton: false,
        pinned: 'left',
    },
    onFirstDataRendered: (params) => {
        const nodesToSelect: IRowNode[] = [];
        params.api.forEachNode((node) => {
            if (node.rowIndex && node.rowIndex >= 3 && node.rowIndex <= 8) {
                nodesToSelect.push(node);
            }
        });
        params.api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
