import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingEditModule, TreeDataModule } from 'ag-grid-enterprise';

import type { FileRecord } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TreeDataModule,
    RowGroupingEditModule,
    NumberEditorModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<FileRecord>;

const gridOptions: GridOptions<FileRecord> = {
    columnDefs: [
        {
            headerName: 'Size (KB)',
            field: 'size',
            aggFunc: 'sum',
            editable: true,

            // Enable editing on group (folder) rows.
            // The built-in distribution divides the new total equally among
            // children, cascading through the full tree hierarchy.
            groupRowEditable: true,
            groupRowValueSetter: { precision: 0 },
        },
    ],
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        headerName: 'Name',
        field: 'name',
        minWidth: 250,
        cellRendererParams: { suppressCount: true },
    },
    treeData: true,
    treeDataChildrenField: 'children',
    groupDefaultExpanded: -1,
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
