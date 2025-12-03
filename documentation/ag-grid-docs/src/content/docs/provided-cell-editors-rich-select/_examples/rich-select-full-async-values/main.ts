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
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    TextEditorModule,
    ClientSideRowModelModule,
    RichSelectModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const languages = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

function getRandomNumber(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getValueFromServer(params: RichCellEditorValuesCallbackParams): Promise<string[]> {
    const search = params.search?.toLowerCase() ?? '';
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
        headerName: 'Async Filtering',
        field: 'language',
        cellEditor: 'agRichSelectCellEditor',
        width: 300,
        cellEditorParams: {
            allowTyping: true,
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
