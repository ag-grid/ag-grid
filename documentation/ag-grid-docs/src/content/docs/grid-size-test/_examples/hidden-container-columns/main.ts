import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const COLUMN_COUNT = 400;

const columnDefs: ColDef[] = Array.from({ length: COLUMN_COUNT }, (_, i) => ({ field: `c${i}`, width: 120 }));

const rowData = Array.from({ length: 5 }, (_, row) => {
    const data: Record<string, string> = {};
    for (let i = 0; i < COLUMN_COUNT; i++) {
        data[`c${i}`] = `r${row}c${i}`;
    }
    return data;
});

const gridOptions: GridOptions = { columnDefs, rowData };

// A tab panel is `display: none` while another tab is active, so the grid has nothing to measure.
const eTabPanel = document.querySelector<HTMLElement>('#tabPanel')!;
createGrid(document.querySelector<HTMLElement>('#hiddenGrid')!, gridOptions);

// The same path, reached without any styling: this container never enters the document.
const eDetachedGrid = document.createElement('div');
eDetachedGrid.style.width = '800px';
eDetachedGrid.style.height = '300px';
createGrid(eDetachedGrid, gridOptions);

function headerCells(root: HTMLElement): number {
    return root.querySelectorAll('.ag-header-cell').length;
}

function onMeasure() {
    document.querySelector<HTMLElement>('#hiddenCount')!.textContent = `${headerCells(eTabPanel)}`;
    // Not queried from the page: the detached grid's subtree is not in the document.
    document.querySelector<HTMLElement>('#detachedCount')!.textContent = `${headerCells(eDetachedGrid)}`;
}

function onShow() {
    eTabPanel.style.display = 'block';
    onMeasure();
}

function onHide() {
    eTabPanel.style.display = 'none';
    onMeasure();
}

onMeasure();
