import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    ValueFormatterParams,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    SetFilterModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import { getData } from './data';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    TreeDataModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'created' },
        { field: 'modified' },
        {
            field: 'size',
            aggFunc: 'sum',
            filter: 'agSetColumnFilter',
            filterParams: {
                valueFormatter: (params: ValueFormatterParams) => {
                    if (params.value == null) {
                        return ''; // params.value can be null/undefined here (e.g. no size for this row)
                    }

                    const sizeInKb = params.value / 1024;

                    if (sizeInKb > 1024) {
                        return `${+(sizeInKb / 1024).toFixed(2)} MB`;
                    } else {
                        return `${+sizeInKb.toFixed(2)} KB`;
                    }
                },
            },
            valueFormatter: (params) => {
                if (params.value == null) {
                    return ''; // params.value can be null/undefined here (e.g. no size for this row)
                }

                const sizeInKb = params.value / 1024;

                if (sizeInKb > 1024) {
                    return `${+(sizeInKb / 1024).toFixed(2)} MB`;
                } else {
                    return `${+sizeInKb.toFixed(2)} KB`;
                }
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
    },
    autoGroupColumnDef: {
        cellRendererParams: {
            suppressCount: true,
        },
    },
    treeData: true,
    groupDefaultExpanded: -1,
    groupAggFiltering: true,
    getDataPath: (data: any) => data.path,
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
