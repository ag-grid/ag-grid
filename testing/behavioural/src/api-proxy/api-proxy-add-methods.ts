import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

describe('ag-grid api proxy', () => {
    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeEach(() => {
        resetGrids();
    });

    test('ModuleRegistry add methods, and keep the same reference', () => {
        const gridApi = createMyGrid({});

        const keysBefore = Object.keys(gridApi);
        const applyTransactionBefore = gridApi.applyTransaction;
        expect(typeof applyTransactionBefore).toBe('function');

        expect('applyTransaction' in gridApi).toBe(false);
        expect(keysBefore.includes('applyTransaction')).toBe(false);

        ModuleRegistry.register(ClientSideRowModelModule);

        expect('applyTransaction' in gridApi).toBe(true);
        expect(typeof gridApi.applyTransaction).toBe('function');
        expect(gridApi.applyTransaction).toBe(gridApi.applyTransaction);
        expect(applyTransactionBefore).toBe(gridApi.applyTransaction);

        const keysAfter = Object.keys(gridApi);

        expect(keysAfter.includes('applyTransaction')).toBe(true);
    });
});
