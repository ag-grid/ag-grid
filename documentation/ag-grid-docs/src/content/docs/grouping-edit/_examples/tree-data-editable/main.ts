import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingEditModule, TreeDataModule } from 'ag-grid-enterprise';

import type { BudgetRecord } from './data';
import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule, RowGroupingEditModule, NumberEditorModule]);

let gridApi: GridApi<BudgetRecord>;

const gridOptions: GridOptions<BudgetRecord> = {
    columnDefs: [
        {
            headerName: 'Budget',
            field: 'budget',
            aggFunc: 'sum',
            editable: true,

            // Enable editing on group (department/team) rows.
            // The built-in distribution divides the new budget equally among
            // children, cascading through the full tree hierarchy.
            groupRowEditable: true,
            groupRowValueSetter: { precision: 0 },
        },
    ],
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        headerName: 'Department / Team / Employee',
        field: 'name',
        minWidth: 280,
        cellRendererParams: { suppressCount: true },
    },
    treeData: true,
    treeDataChildrenField: 'children',
    groupDefaultExpanded: -1,
    getRowId: ({ data }) => data.name,
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
