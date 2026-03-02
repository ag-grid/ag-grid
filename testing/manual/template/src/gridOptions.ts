import type { ColDef, GridOptions } from 'ag-grid-community';

export interface RowData {
    make: string;
    model: string;
    price: number;
}

export const columnDefs: ColDef<RowData>[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

export const rowData: RowData[] = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'BMW', model: '5 Series', price: 59000 },
    { make: 'Mercedes', model: 'AMG', price: 96000 },
];

export const gridOptions: GridOptions<RowData> = {
    columnDefs,
    rowData,
    sideBar: true,
};
