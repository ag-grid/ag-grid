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
    {
        rid: 1,
        A: 1,
        B: 1,
        C: 1,
        D: 1,
        E: 1,
        F: 1,
        G: 1,
        H: 1,
        I: 1,
    },
    {
        rid: 2,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("0"),ROW("2")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("1")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("1"),ROW("2")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("1")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("2"),ROW("2")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("1")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("3"),ROW("2")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("1")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("4"),ROW("2")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("1")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("5"),ROW("2")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("1")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("6"),ROW("2")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("1")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("2"),COLUMN("7"),ROW("2")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("1")))',
    },
    {
        rid: 3,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("0"),ROW("3")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("2")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("1"),ROW("3")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("2")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("2"),ROW("3")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("2")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("3"),ROW("3")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("2")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("4"),ROW("3")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("2")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("5"),ROW("3")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("2")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("6"),ROW("3")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("2")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("3"),COLUMN("7"),ROW("3")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("2")))',
    },
    {
        rid: 4,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("0"),ROW("4")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("3")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("1"),ROW("4")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("3")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("2"),ROW("4")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("3")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("3"),ROW("4")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("3")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("4"),ROW("4")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("3")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("5"),ROW("4")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("3")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("6"),ROW("4")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("3")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("4"),COLUMN("7"),ROW("4")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("3")))',
    },
    {
        rid: 5,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("0"),ROW("5")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("4")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("1"),ROW("5")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("4")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("2"),ROW("5")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("4")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("3"),ROW("5")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("4")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("4"),ROW("5")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("4")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("5"),ROW("5")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("4")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("6"),ROW("5")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("4")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("5"),COLUMN("7"),ROW("5")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("4")))',
    },
    {
        rid: 6,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("0"),ROW("6")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("5")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("1"),ROW("6")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("5")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("2"),ROW("6")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("5")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("3"),ROW("6")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("5")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("4"),ROW("6")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("5")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("5"),ROW("6")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("5")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("6"),ROW("6")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("5")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("6"),COLUMN("7"),ROW("6")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("5")))',
    },
    {
        rid: 7,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("0"),ROW("7")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("6")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("1"),ROW("7")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("6")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("2"),ROW("7")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("6")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("3"),ROW("7")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("6")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("4"),ROW("7")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("6")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("5"),ROW("7")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("6")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("6"),ROW("7")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("6")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("7"),COLUMN("7"),ROW("7")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("6")))',
    },
    {
        rid: 8,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("0"),ROW("8")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("7")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("1"),ROW("8")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("7")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("2"),ROW("8")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("7")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("3"),ROW("8")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("7")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("4"),ROW("8")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("7")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("5"),ROW("8")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("7")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("6"),ROW("8")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("7")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("8"),COLUMN("7"),ROW("8")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("7")))',
    },
    {
        rid: 9,
        A: 1,
        B: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("0"),ROW("9")),REF(COLUMN("1"),ROW("1",true),COLUMN("1"),ROW("8")))',
        C: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("1"),ROW("9")),REF(COLUMN("2"),ROW("1",true),COLUMN("2"),ROW("8")))',
        D: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("2"),ROW("9")),REF(COLUMN("3"),ROW("1",true),COLUMN("3"),ROW("8")))',
        E: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("3"),ROW("9")),REF(COLUMN("4"),ROW("1",true),COLUMN("4"),ROW("8")))',
        F: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("4"),ROW("9")),REF(COLUMN("5"),ROW("1",true),COLUMN("5"),ROW("8")))',
        G: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("5"),ROW("9")),REF(COLUMN("6"),ROW("1",true),COLUMN("6"),ROW("8")))',
        H: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("6"),ROW("9")),REF(COLUMN("7"),ROW("1",true),COLUMN("7"),ROW("8")))',
        I: '=SUM(REF(COLUMN("A",true),ROW("9"),COLUMN("7"),ROW("9")),REF(COLUMN("8"),ROW("1",true),COLUMN("8"),ROW("8")))',
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
