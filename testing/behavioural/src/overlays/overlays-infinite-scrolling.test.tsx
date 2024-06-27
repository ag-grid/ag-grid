import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';

describe('ag-grid overlays infinite scrolling state', () => {
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    let consoleWarnSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    function hasLoadingOverlay() {
        return !!document.querySelector('.ag-overlay-loading-center');
    }

    function hasNoRowsOverlay() {
        return !!document.querySelector('.ag-overlay-no-rows-center');
    }

    beforeAll(() => {
        ModuleRegistry.register(InfiniteRowModelModule);
    });

    beforeEach(() => {
        resetGrids();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    test('does not shows no-rows when using InfiniteRowModelModule', () => {
        const pendingGetRows: (() => void)[] = [];

        createMyGrid({
            columnDefs,
            rowModelType: 'infinite',
            datasource: { getRows: (params) => pendingGetRows.push(() => params.successCallback([], 0)) },
        });

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);

        for (const pending of pendingGetRows) {
            pending();
        }

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('it does show loading if forced', () => {
        createMyGrid({
            columnDefs,
            rowModelType: 'infinite',
            datasource: { getRows: () => {} },
            loading: true,
        });

        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);
    });
});
