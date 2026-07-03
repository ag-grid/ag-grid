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
import { RichSelectModule } from 'ag-grid-enterprise';

import { getData } from './data';
import { PhoneEditor } from './phoneEditor_typescript';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RichSelectModule,
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
]);

const columnDefs: ColDef[] = [
    { field: 'name' },
    {
        field: 'phone',
        headerName: 'Custom Phone Editor',
        cellEditor: PhoneEditor,
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
