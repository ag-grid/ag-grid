import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { BatchEditModule, ClipboardModule, RichSelectModule } from 'ag-grid-enterprise';

import { getData } from './data';
import { GenderRenderer } from './genderRenderer_typescript';
import { MoodEditor } from './moodEditor_typescript';
import { MoodRenderer } from './moodRenderer_typescript';
import { SimpleTextEditor } from './simpleTextEditor_typescript';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RichSelectModule,
    BatchEditModule,
    ClipboardModule,
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
]);

const columnDefs: ColDef[] = [
    { field: 'first_name', headerName: 'Provided Text' },
    {
        field: 'last_name',
        headerName: 'Custom Text',
        cellEditor: SimpleTextEditor,
    },
    {
        field: 'age',
        headerName: 'Provided Number',
        cellEditor: 'agNumberCellEditor',
    },
    {
        field: 'gender',
        headerName: 'Provided Rich Select',
        cellRenderer: GenderRenderer,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            cellRenderer: GenderRenderer,
            values: ['Male', 'Female'],
        },
    },
    {
        field: 'mood',
        headerName: 'Custom Mood',
        cellRenderer: MoodRenderer,
        cellEditor: MoodEditor,
        cellEditorPopup: true,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    rowData: getData(),
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
    },
};

function getEditingCells() {
    const cells = gridApi!.getEditingCells();
    console.log('Editing cells:', cells);
}

function startBatchEdit() {
    gridApi!.startBatchEdit();
    const el = document.querySelector<HTMLElement>('#batchStatusValue');
    if (el) el.textContent = 'Active';
}

function commitBatchEdit() {
    gridApi!.commitBatchEdit();
    const el = document.querySelector<HTMLElement>('#batchStatusValue');
    if (el) el.textContent = 'Inactive';
}

function cancelBatchEdit() {
    gridApi!.cancelBatchEdit();
    const el = document.querySelector<HTMLElement>('#batchStatusValue');
    if (el) el.textContent = 'Inactive';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
