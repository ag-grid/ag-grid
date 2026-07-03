import type {
    ColDef,
    GridApi,
    GridOptions,
    IRichCellEditorParams,
    RichCellEditorValuesPageParams,
    RichCellEditorValuesPageResult,
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

const languages = new Array(20000).fill(null).map((_, index) => `Language ${index + 1}`);

function getRandomNumber(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getFilteredValuePageFromServer(
    params: RichCellEditorValuesPageParams
): Promise<RichCellEditorValuesPageResult<string>> {
    const search = params.search.toLowerCase();

    // Simulates an async request to a server
    return new Promise((resolve) => {
        setTimeout(() => {
            const filtered = search
                ? languages.filter((language) => language.toLowerCase().includes(search))
                : languages;
            const pageValues = filtered.slice(params.startRow, params.endRow);
            const nextOffset = params.endRow < filtered.length ? String(params.endRow) : null;

            resolve({
                values: pageValues,
                lastRow: filtered.length,
                cursor: nextOffset,
            });
        }, 300);
    });
}

function getInitialStartRowForValue(value: string | null | undefined): number {
    if (!value) {
        return 0;
    }

    const match = /^Language (\d+)$/.exec(value);
    if (!match) {
        return 0;
    }

    const selectedIndex = Number(match[1]) - 1;
    return Math.max(selectedIndex - 40, 0);
}

const columnDefs: ColDef[] = [
    {
        field: 'language',
        width: 320,
        editable: true,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
            valuesPage: getFilteredValuePageFromServer,
            valuesPageInitialStartRow: (value: string | null | undefined) => getInitialStartRowForValue(value),
            valuesPageSize: 80,
            valuesPageLoadThreshold: 8,
        } as IRichCellEditorParams,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 220,
        editable: true,
    },
    columnDefs,
    rowData: new Array(100).fill(null).map(() => ({ language: languages[getRandomNumber(0, languages.length - 1)] })),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
