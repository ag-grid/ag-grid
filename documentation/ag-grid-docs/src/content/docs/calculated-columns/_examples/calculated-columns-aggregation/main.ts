import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    RowGroupingModule,
]);

type SalesRow = {
    productType: string;
    product: string;
    revenue: number;
    cost: number;
};

const columnDefs: ColDef<SalesRow>[] = [
    { field: 'productType', rowGroup: true, hide: true },
    { field: 'product', flex: 1.4 },
    { field: 'revenue', aggFunc: 'sum' },
    { field: 'cost', aggFunc: 'sum' },
];

const rowData: SalesRow[] = [
    { productType: 'Solar', product: 'Solar panel kit', revenue: 142000, cost: 96000 },
    { productType: 'Solar', product: 'Smart thermostat', revenue: 78000, cost: 52000 },
    { productType: 'Charging', product: 'Battery pack', revenue: 126000, cost: 101000 },
    { productType: 'Charging', product: 'EV charger', revenue: 92000, cost: 61000 },
    { productType: 'Heating', product: 'Heat pump', revenue: 168000, cost: 119000 },
    { productType: 'Heating', product: 'Hybrid boiler', revenue: 156000, cost: 117000 },
    { productType: 'Heating', product: 'Heat recovery unit', revenue: 124000, cost: 88000 },
    { productType: 'Storage', product: 'Storage cabinet', revenue: 71000, cost: 52000 },
    { productType: 'Storage', product: 'Lithium rack', revenue: 143000, cost: 112000 },
    { productType: 'Storage', product: 'Flow battery', revenue: 187000, cost: 149000 },
    { productType: 'Wind', product: 'Wind turbine kit', revenue: 232000, cost: 171000 },
    { productType: 'Wind', product: 'Micro turbine', revenue: 76000, cost: 49000 },
];

const gridOptions: GridOptions<SalesRow> = {
    columnDefs,
    rowData,
    calculatedColumns: true,
    defaultColDef: {
        flex: 1,
        minWidth: 130,
        // Lets users choose an aggregation for every column, including calculated columns created in the dialog.
        enableValue: true,
        allowedAggFuncs: ['sum', 'avg', 'min', 'max'],
    },
    autoGroupColumnDef: {
        headerName: 'Product Type',
        minWidth: 180,
    },
    sideBar: 'columns',
    groupDefaultExpanded: -1,
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
