import type {
    ColDef,
    GridApi,
    GridOptions,
    IRichCellEditorParams,
    RichCellEditorValuesCallbackParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([TextEditorModule, ClientSideRowModelModule, RichSelectModule]);

const languages = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

function getRandomNumber(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getValueFromServer(_params: RichCellEditorValuesCallbackParams): Promise<string[]> {
    // simulates an async request to a server
    return new Promise((resolve) => {
        setTimeout(() => resolve(languages), 1000);
    });
}

const columnDefs: ColDef[] = [
    {
        field: 'language',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: getValueFromServer,
        } as IRichCellEditorParams,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 200,
        editable: true,
    },
    columnDefs: columnDefs,
    rowData: new Array(100).fill(null).map(() => ({ language: languages[getRandomNumber(0, 4)] })),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
