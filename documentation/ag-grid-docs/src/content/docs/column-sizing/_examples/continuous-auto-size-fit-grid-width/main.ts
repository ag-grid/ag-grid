import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnAutoSizeModule, ClientSideRowModelModule]);

type IRow = Record<string, string>;

const INITIAL_COLUMNS = 5;
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 12;

const INITIAL_ROWS = 4;
const MIN_ROWS = 0;
const MAX_ROWS = 40;
const ROW_STEP = 8;

let columnCount = INITIAL_COLUMNS;
let rowCount = INITIAL_ROWS;

let gridApi: GridApi<IRow>;

function field(index: number): string {
    return `column${index + 1}`;
}

function buildColumnDefs(count: number): ColDef<IRow>[] {
    return Array.from({ length: count }, (_, index) => ({
        field: field(index),
        headerName: `Column ${index + 1}`,
    }));
}

function buildRows(count: number): IRow[] {
    return Array.from({ length: count }, (_, rowIndex) =>
        Object.fromEntries(
            Array.from({ length: MAX_COLUMNS }, (_, columnIndex) => [
                field(columnIndex),
                `R${rowIndex + 1} C${columnIndex + 1}`,
            ])
        )
    );
}

const gridOptions: GridOptions<IRow> = {
    columnDefs: buildColumnDefs(columnCount),
    rowData: buildRows(rowCount),
    autoSizeStrategy: {
        type: 'fitGridWidth',
        continuous: true,
    },
    animateColumnResizing: true,
};

function setColumnCount(count: number) {
    columnCount = Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, count));
    gridApi!.setGridOption('columnDefs', buildColumnDefs(columnCount));
}

function addColumn() {
    setColumnCount(columnCount + 1);
}

function removeColumn() {
    setColumnCount(columnCount - 1);
}

function setRowCount(count: number) {
    rowCount = Math.min(MAX_ROWS, Math.max(MIN_ROWS, count));
    gridApi!.setGridOption('rowData', buildRows(rowCount));
}

function addRows() {
    setRowCount(rowCount + ROW_STEP);
}

function removeRows() {
    setRowCount(rowCount - ROW_STEP);
}

const MIN_WIDTH_PERCENT = 55;
const MAX_WIDTH_PERCENT = 100;
const WIDTH_STEP = 15;

let widthPercent = MAX_WIDTH_PERCENT;

function setGridWidth(percent: number) {
    widthPercent = Math.min(MAX_WIDTH_PERCENT, Math.max(MIN_WIDTH_PERCENT, percent));
    document.querySelector<HTMLElement>('#gridSizer')!.style.width = `${widthPercent}%`;
}

function narrower() {
    setGridWidth(widthPercent - WIDTH_STEP);
}

function wider() {
    setGridWidth(widthPercent + WIDTH_STEP);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
