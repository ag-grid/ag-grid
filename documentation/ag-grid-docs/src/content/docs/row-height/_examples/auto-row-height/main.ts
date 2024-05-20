import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Row #',
            field: 'rowNumber',
            width: 120,
        },
        {
            field: 'autoA',
            width: 300,
            wrapText: true,
            autoHeight: true,
            headerName: 'A) Auto Height',
        },
        {
            width: 300,
            field: 'autoB',
            wrapText: true,
            headerName: 'B) Normal Height',
        },
    ],
    onGridReady: (params) => {
        // in this example, the CSS styles are loaded AFTER the grid is created,
        // so we put this in a timeout, so height is calculated after styles are applied.
        setTimeout(() => {
            params.api.setGridOption('rowData', getData());
        }, 500);
    },
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                    suppressRowGroups: true,
                    suppressValues: true,
                    suppressPivots: true,
                    suppressPivotMode: true,
                    suppressSideButtons: true,
                    suppressColumnFilter: true,
                    suppressColumnSelectAll: true,
                    suppressColumnExpandAll: true,
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
