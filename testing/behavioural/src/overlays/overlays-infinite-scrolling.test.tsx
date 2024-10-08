import type { MockInstance } from 'vitest';

import { InfiniteRowModelModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('ag-grid overlays infinite scrolling state', () => {
    const gridsManager = new TestGridsManager({
        modules: [InfiniteRowModelModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    let consoleWarnSpy: MockInstance | undefined;

    function hasLoadingOverlay() {
        return !!document.querySelector('.ag-overlay-loading-center');
    }

    function hasNoRowsOverlay() {
        return !!document.querySelector('.ag-overlay-no-rows-center');
    }

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
    });

    test('does not shows no-rows when using InfiniteRowModelModule', () => {
        const pendingGetRows: (() => void)[] = [];

        const api = gridsManager.createGrid('myGrid', {
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

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        api.setGridOption('rowData', []);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "AG Grid: rowData is not supported with the 'infinite' row model. It is only valid with: clientSide."
        );

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('it does show loading if forced', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'infinite',
            datasource: { getRows: () => {} },
            loading: true,
        });

        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);
    });
});
