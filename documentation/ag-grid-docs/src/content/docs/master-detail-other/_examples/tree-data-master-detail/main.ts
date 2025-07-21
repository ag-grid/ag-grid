import type { GridApi, GridOptions, IDetailCellRendererParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    MasterDetailModule,
    SetFilterModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import type { Fact, VegetableNode } from './data';
import { vegetablesData } from './data';

ModuleRegistry.registerModules([
    RowApiModule,
    ClientSideRowModelModule,
    TreeDataModule,
    MasterDetailModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<VegetableNode>;

const gridOptions: GridOptions<VegetableNode> = {
    columnDefs: [{ field: 'origin' }],
    rowData: vegetablesData,
    treeData: true,
    treeDataChildrenField: 'children',
    autoGroupColumnDef: {
        headerName: 'Category',
        field: 'name',
        flex: 1,
        cellRendererParams: {
            suppressCount: true,
        },
    },
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [{ field: 'description', flex: 1 }, { field: 'importance' }],
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.facts ?? []);
        },
    } as IDetailCellRendererParams<VegetableNode, Fact>,
    isRowMaster: (dataItem: VegetableNode) => !!dataItem.facts?.length,
    groupDefaultExpanded: 1,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
