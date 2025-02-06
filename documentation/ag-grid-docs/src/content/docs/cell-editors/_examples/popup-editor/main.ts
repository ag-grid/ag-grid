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
import { MoodEditor } from './moodEditor_typescript';
import { MoodRenderer } from './moodRenderer_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RichSelectModule,
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
    ValidationModule /* Development Only */,
]);

const columnDefs: ColDef[] = [
    {
        field: 'mood',
        headerName: 'Inline',
        cellRenderer: MoodRenderer,
        cellEditor: MoodEditor,
    },
    {
        field: 'mood',
        headerName: 'Popup Over',
        cellRenderer: MoodRenderer,
        cellEditor: MoodEditor,
        cellEditorPopup: true,
    },
    {
        field: 'mood',
        headerName: 'Popup Under',
        cellRenderer: MoodRenderer,
        cellEditor: MoodEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
