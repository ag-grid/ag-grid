import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    GridApi,
    GridOptions,
    ISetFilterParams,
    KeyCreatorParams,
    ValueFormatterParams,
    ValueGetterParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

var valueGetter = function (params: ValueGetterParams) {
    return params.data['animalsString'].split('|');
};

var valueFormatter = function (params: ValueFormatterParams) {
    return params.value
        .map(function (animal: any) {
            return animal.name;
        })
        .join(', ');
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Animals (array)',
            field: 'animalsArray',
            filter: 'agSetColumnFilter',
        },
        {
            headerName: 'Animals (string)',
            filter: 'agSetColumnFilter',
            valueGetter: valueGetter,
        },
        {
            headerName: 'Animals (objects)',
            field: 'animalsObjects',
            filter: 'agSetColumnFilter',
            valueFormatter: valueFormatter,
            keyCreator: (params: KeyCreatorParams) => params.value.name,
            filterParams: {
                valueFormatter: (params: ValueFormatterParams) => (params.value ? params.value.name : '(Blanks)'),
            } as ISetFilterParams,
        },
    ],
    defaultColDef: {
        flex: 1,
        cellDataType: false,
    },
    rowData: getData(),
    sideBar: 'filters',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
