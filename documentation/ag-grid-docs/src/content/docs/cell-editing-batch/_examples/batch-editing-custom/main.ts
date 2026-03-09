import type { CellEditingStartedEvent, CellEditingStoppedEvent, ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { BatchEditModule, ClipboardModule, RichSelectModule } from 'ag-grid-enterprise';

import { getData } from './data';
import { GenderRenderer } from './genderRenderer_typescript';
import { MoodEditor } from './moodEditor_typescript';
import { MoodRenderer } from './moodRenderer_typescript';
import { SimpleTextEditor } from './simpleTextEditor_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RichSelectModule,
    BatchEditModule,
    ClipboardModule,
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
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
    onCellEditingStarted: (event: CellEditingStartedEvent) => {
        updateEditCount(event.api);
    },
    onCellEditingStopped: (event: CellEditingStoppedEvent) => {
        updateEditCount(event.api);
    },
};

function updateEditCount(api: GridApi) {
    if (api.isBatchEditing()) {
        const pendingEditCount = api.getEditingCells().length;
        const el = document.querySelector<HTMLElement>('#batchStatusValue');
        if (el) {
            el.textContent = `Active (${pendingEditCount} edit${pendingEditCount !== 1 ? 's' : ''})`;
        }
    }
}

function getEditingCells() {
    const cells = gridApi!.getEditingCells();
    console.log('Editing cells:', cells);
}

function startBatchEdit() {
    gridApi!.startBatchEdit();
    const el = document.querySelector<HTMLElement>('#batchStatusValue');
    if (el) el.textContent = 'Active (0 edits)';
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
