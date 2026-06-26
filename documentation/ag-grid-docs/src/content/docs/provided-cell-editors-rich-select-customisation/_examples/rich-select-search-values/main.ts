import type { ColDef, GridApi, GridOptions, IRichCellEditorParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import { colors } from './colors';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([TextEditorModule, ClientSideRowModelModule, RichSelectModule]);

const columnDefs: ColDef[] = [
    {
        headerName: 'Fuzzy Search',
        field: 'color',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: colors,
        } as IRichCellEditorParams,
    },
    {
        headerName: 'Match Search',
        field: 'color',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: colors,
            searchType: 'match',
        } as IRichCellEditorParams,
    },
    {
        headerName: 'Match Any Search',
        field: 'color',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: colors,
            searchType: 'matchAny',
        } as IRichCellEditorParams,
    },
];

function getRandomNumber(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const data = Array.from(Array(20).keys()).map(() => {
    const color = colors[getRandomNumber(0, colors.length - 1)];
    return { color };
});

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 200,
        editable: true,
    },
    columnDefs: columnDefs,
    rowData: data,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
