import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
    themeQuartz,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const ROW_COUNT = 200;

let getRowHeightCalls = 0;

const gridOptions: GridOptions = {
    theme: themeQuartz.withParams({
        autoHeightMinBodyHeight: 0,
        autoHeightMaxBodyHeight: 250,
    }),
    domLayout: 'autoHeight',
    columnDefs: [{ field: 'id' }],
    defaultColDef: { flex: 1 },
    rowData: Array.from({ length: ROW_COUNT }, (_, i) => ({ id: 'D' + (1000 + i) })),
    getRowHeight: () => {
        getRowHeightCalls++;
        return 25;
    },
};

// The container never enters the document, so the grid has nothing to measure.
const eGridDiv = document.createElement('div');
createGrid(eGridDiv, gridOptions);

// The grid subtree is not in the document, so the row count has to be read from the detached
// element itself rather than queried from the page.
function onMeasure() {
    const rendered = eGridDiv.querySelectorAll('.ag-grid-scrolling-container .ag-row').length;
    document.querySelector<HTMLElement>('#count')!.textContent = `${rendered}`;
    document.querySelector<HTMLElement>('#heightCalls')!.textContent = `${getRowHeightCalls}`;
}
