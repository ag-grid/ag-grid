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

function getValueFromServer(params: RichCellEditorValuesCallbackParams): Promise<string[]> {
    const search = params.search?.toLowerCase() ?? '';
    // Simulates an async request to a server
    return new Promise((resolve) => {
        console.log(`Grid requested \`${search}\` from server.`);
        setTimeout(() => {
            const entries = languages.filter((l) => l.toLowerCase().includes(search));
            console.log(`Server response for \`${search}\`: ${entries.length} hit${entries.length === 1 ? '' : 's'}.`);
            resolve(entries);
        }, 1000);
    });
}

const columnDefs: ColDef[] = [
    {
        field: 'language',
        cellEditor: 'agRichSelectCellEditor',
        width: 300,
        cellEditorParams: {
            allowTyping: true,
            filterList: true,
            values: getValueFromServer,
            filterListAsync: true,
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
