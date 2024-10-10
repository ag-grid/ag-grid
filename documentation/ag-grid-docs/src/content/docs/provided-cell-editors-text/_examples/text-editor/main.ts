import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridOptions, ITextCellEditorParams } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

import { colors } from './colors';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        field: 'color',
        cellEditor: 'agTextCellEditor',
        cellEditorParams: {
            maxLength: 20,
        } as ITextCellEditorParams,
    },
    {
        field: 'value',
        valueFormatter: (params) => `£ ${params.value}`,
        cellEditor: 'agTextCellEditor',
        cellEditorParams: {
            maxLength: 20,
        } as ITextCellEditorParams,
    },
];

function getRandomNumber(min: number, max: number) {
    // min and max included
    return Math.floor(pRandom() * (max - min + 1) + min);
}

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

const data = Array.from(Array(20).keys()).map(() => {
    const color = colors[getRandomNumber(0, colors.length - 1)];
    return {
        color: color,
        value: getRandomNumber(0, 1000),
    };
});

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
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
