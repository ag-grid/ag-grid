import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TooltipModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule, FormulaModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    CellSelectionModule,
    ClientSideRowModelModule,
    FormulaModule,
    TextEditorModule,
    TooltipModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<any>;

const rowData = [
    { rid: '1', A: 1, B: 1, C: 1, D: 1, E: 1, F: 1, G: 1, H: 1, I: 1 },
    {
        rid: '2',
        A: 1,
        B: '=SUM($A2:A2, B$1:B1)',
        C: '=SUM($A2:B2, C$1:C1)',
        D: '=SUM($A2:C2, D$1:D1)',
        E: '=SUM($A2:D2, E$1:E1)',
        F: '=SUM($A2:E2, F$1:F1)',
        G: '=SUM($A2:F2, G$1:G1)',
        H: '=SUM($A2:G2, H$1:H1)',
        I: '=SUM($A2:H2, I$1:I1)',
    },
    {
        rid: '3',
        A: 1,
        B: '=SUM($A3:A3, B$1:B2)',
        C: '=SUM($A3:B3, C$1:C2)',
        D: '=SUM($A3:C3, D$1:D2)',
        E: '=SUM($A3:D3, E$1:E2)',
        F: '=SUM($A3:E3, F$1:F2)',
        G: '=SUM($A3:F3, G$1:G2)',
        H: '=SUM($A3:G3, H$1:H2)',
        I: '=SUM($A3:H3, I$1:I2)',
    },
    {
        rid: '4',
        A: 1,
        B: '=SUM($A4:A4, B$1:B3)',
        C: '=SUM($A4:B4, C$1:C3)',
        D: '=SUM($A4:C4, D$1:D3)',
        E: '=SUM($A4:D4, E$1:E3)',
        F: '=SUM($A4:E4, F$1:F3)',
        G: '=SUM($A4:F4, G$1:G3)',
        H: '=SUM($A4:G4, H$1:H3)',
        I: '=SUM($A4:H4, I$1:I3)',
    },
    {
        rid: '5',
        A: 1,
        B: '=SUM($A5:A5, B$1:B4)',
        C: '=SUM($A5:B5, C$1:C4)',
        D: '=SUM($A5:C5, D$1:D4)',
        E: '=SUM($A5:D5, E$1:E4)',
        F: '=SUM($A5:E5, F$1:F4)',
        G: '=SUM($A5:F5, G$1:G4)',
        H: '=SUM($A5:G5, H$1:H4)',
        I: '=SUM($A5:H5, I$1:I4)',
    },
    {
        rid: '6',
        A: 1,
        B: '=SUM($A6:A6, B$1:B5)',
        C: '=SUM($A6:B6, C$1:C5)',
        D: '=SUM($A6:C6, D$1:D5)',
        E: '=SUM($A6:D6, E$1:E5)',
        F: '=SUM($A6:E6, F$1:F5)',
        G: '=SUM($A6:F6, G$1:G5)',
        H: '=SUM($A6:G6, H$1:H5)',
        I: '=SUM($A6:H6, I$1:I5)',
    },
    {
        rid: '7',
        A: 1,
        B: '=SUM($A7:A7, B$1:B6)',
        C: '=SUM($A7:B7, C$1:C6)',
        D: '=SUM($A7:C7, D$1:D6)',
        E: '=SUM($A7:D7, E$1:E6)',
        F: '=SUM($A7:E7, F$1:F6)',
        G: '=SUM($A7:F7, G$1:G6)',
        H: '=SUM($A7:G7, H$1:H6)',
        I: '=SUM($A7:H7, I$1:I6)',
    },
    {
        rid: '8',
        A: 1,
        B: '=SUM($A8:A8, B$1:B7)',
        C: '=SUM($A8:B8, C$1:C7)',
        D: '=SUM($A8:C8, D$1:D7)',
        E: '=SUM($A8:D8, E$1:E7)',
        F: '=SUM($A8:E8, F$1:F7)',
        G: '=SUM($A8:F8, G$1:G7)',
        H: '=SUM($A8:G8, H$1:H7)',
        I: '=SUM($A8:H8, I$1:I7)',
    },
    {
        rid: '9',
        A: 1,
        B: '=SUM($A9:A9, B$1:B8)',
        C: '=SUM($A9:B9, C$1:C8)',
        D: '=SUM($A9:C9, D$1:D8)',
        E: '=SUM($A9:D9, E$1:E8)',
        F: '=SUM($A9:E9, F$1:F8)',
        G: '=SUM($A9:F9, G$1:G8)',
        H: '=SUM($A9:G9, H$1:H8)',
        I: '=SUM($A9:H9, I$1:I8)',
    },
];

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'A', colId: '0' },
        { field: 'B', colId: '1' },
        { field: 'C', colId: '2' },
        { field: 'D', colId: '3' },
        { field: 'E', colId: '4' },
        { field: 'F', colId: '5' },
        { field: 'G', colId: '6' },
        { field: 'H', colId: '7' },
        { field: 'I', colId: '8' },
    ],
    getRowId: (params) => String(params.data.rid),
    enableFormulas: true,
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    defaultColDef: {
        headerName: '',
        editable: true,
        flex: 1,
    },
    rowData,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
