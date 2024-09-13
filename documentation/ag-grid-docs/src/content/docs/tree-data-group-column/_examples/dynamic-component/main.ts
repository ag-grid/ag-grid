import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    CellDoubleClickedEvent,
    CellKeyDownEvent,
    ColDef,
    GridApi,
    GridOptions,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { CustomGroupCellRenderer } from './customGroupCellRenderer_typescript';
import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const columnDefs: ColDef[] = [
    { field: 'created' },
    { field: 'modified' },
    {
        field: 'size',
        aggFunc: 'sum',
        valueFormatter: (params) => {
            const sizeInKb = params.value / 1024;

            if (sizeInKb > 1024) {
                return `${+(sizeInKb / 1024).toFixed(2)} MB`;
            } else {
                return `${+sizeInKb.toFixed(2)} KB`;
            }
        },
    },
];

const autoGroupColumnDef: ColDef = {
    cellRendererSelector: (params) => {
        if (params.node.level === 0) {
            return {
                component: 'agGroupCellRenderer',
            };
        }
        return {
            component: CustomGroupCellRenderer,
        };
    },
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    treeData: true,
    getDataPath: (data) => data.path,
    columnDefs: columnDefs,
    autoGroupColumnDef: autoGroupColumnDef,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    groupDefaultExpanded: -1,
    rowData: getData(),
    onCellDoubleClicked: (params: CellDoubleClickedEvent<IOlympicData, any>) => {
        if (params.colDef.showRowGroup) {
            params.node.setExpanded(!params.node.expanded);
        }
    },
    onCellKeyDown: (params: CellKeyDownEvent<IOlympicData, any>) => {
        if (!('colDef' in params)) {
            return;
        }
        if (!(params.event instanceof KeyboardEvent)) {
            return;
        }
        if (params.event.code !== 'Enter') {
            return;
        }
        if (params.colDef.showRowGroup) {
            params.node.setExpanded(!params.node.expanded);
        }
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
