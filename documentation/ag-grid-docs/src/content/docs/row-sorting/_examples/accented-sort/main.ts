import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'a', width: 150 }],
    rowData: [...'äáaäàáaáàäaàäá'].map((a, i) => ({ a: `${a} ${i + 1}` })),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    createGrid(document.querySelector<HTMLElement>('#accentedfalse')!, {
        ...gridOptions,
        accentedSort: false,
    });
    createGrid(document.querySelector<HTMLElement>('#accentedtrue')!, {
        ...gridOptions,
        accentedSort: true, // this makes all A-s equal regardless of accent
    });
});
``;
