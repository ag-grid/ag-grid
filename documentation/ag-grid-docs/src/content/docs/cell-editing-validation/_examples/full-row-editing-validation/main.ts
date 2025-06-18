import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    SelectEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SelectEditorModule,
    TextEditorModule,
    NumberEditorModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'name',
        },
        {
            field: 'weight',
            headerName: 'Weight (kg)',
            cellDataType: 'number',
            cellEditorParams: {
                min: 0,
                max: 500,
            },
        },
        {
            field: 'height',
            headerName: 'Height (cm)',
            cellDataType: 'number',
            cellEditorParams: {
                min: 0,
                max: 300,
            },
        },
        {
            headerName: 'BMI',
            cellDataType: 'number',
            valueGetter: (params) => {
                const { weight, height } = params.data ?? {};
                if (!weight || !height) return null;
                const heightM = height / 100;
                return weight / (heightM * heightM);
            },
            valueFormatter: (params) => params.value?.toFixed(2),
            editable: false,
        },
    ],
    defaultColDef: {
        flex: 1,
        editable: true,
        cellDataType: false,
    },
    editType: 'fullRow',
    rowData: getRowData(),
    cellEditingInvalidCommitType: 'block',
    getFullRowEditValidationErrors: ({ editorsState }) => {
        const values = Object.fromEntries(editorsState.map(({ colId, newValue }) => [colId, newValue]));

        const weight = parseFloat(values['weight']);
        const height = parseFloat(values['height']);

        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);

        const errors: string[] = [];

        if (bmi < 10 || bmi > 80) {
            errors.push(`BMI value of ${bmi.toFixed(2)} is not realistic. Please verify the input.`);
        }

        return errors.length ? errors : null;
    },
};

function getRowData() {
    const rowData = [
        { name: 'Alice', weight: 68, height: 165 },
        { name: 'Bob', weight: 85, height: 178 },
        { name: 'Charlie', weight: 72, height: 172 },
        { name: 'Diana', weight: 54, height: 160 },
        { name: 'Ethan', weight: 90, height: 182 },
        { name: 'Fiona', weight: 63, height: 168 },
        { name: 'George', weight: 77, height: 175 },
        { name: 'Hannah', weight: 59, height: 162 },
        { name: 'Ian', weight: 95, height: 185 },
        { name: 'Julia', weight: 70, height: 170 },
    ];

    return rowData;
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
