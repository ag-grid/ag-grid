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

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const columnDefs: ColDef[] = [
    {
        field: 'country',
        rowGroup: true,
        hide: true,
    },
    {
        field: 'year',
        rowGroup: true,
        hide: true,
    },
    {
        field: 'athlete',
    },
    {
        field: 'total',
        aggFunc: 'sum',
    },
];

const autoGroupColumnDef: ColDef = {
    cellRenderer: CustomGroupCellRenderer,
};

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    autoGroupColumnDef: autoGroupColumnDef,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    groupDefaultExpanded: 1,
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
    groupDisplayType: 'multipleColumns',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
