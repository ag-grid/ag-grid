import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import { getData } from './data';
import { GenderRenderer } from './genderRenderer_typescript';
import { MoodEditor } from './moodEditor_typescript';
import { MoodRenderer } from './moodRenderer_typescript';
import { SimpleTextEditor } from './simpleTextEditor_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RichSelectModule,
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
};

function getEditingCells() {
    const cells = gridApi!.getEditingCells();
    console.log('Editing cells:', cells);
}

function startBatchEdit() {
    gridApi!.startBatchEdit();
}

function commitBatchEdit() {
    gridApi!.commitBatchEdit();
}

function cancelBatchEdit() {
    gridApi!.cancelBatchEdit();
}

function startEdit() {
    gridApi!.startEditingCell({
        rowIndex: 0,
        colKey: 'first_name',
    });
}

function cancelEdit() {
    gridApi!.stopEditing(true);
}

function stopEdit() {
    gridApi!.stopEditing();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
