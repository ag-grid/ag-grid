import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, InfiniteRowModelModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, setRowDataChecked } from '../test-utils';

describe('ag-grid overlays infinite scrolling state', () => {
    const gridsManager = new TestGridsManager({
        modules: [InfiniteRowModelModule, ClientSideRowModelModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    let consoleWarnSpy: MockInstance | undefined;
    let consoleErrSpy: MockInstance | undefined;

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
        consoleErrSpy?.mockRestore();
    });

    test('does not shows no-rows when using InfiniteRowModelModule', async () => {
        const pendingGetRows: (() => void)[] = [];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'infinite',
            datasource: { getRows: (params) => pendingGetRows.push(() => params.successCallback([], 0)) },
        });
        await new GridColumns(api, `does not shows no-rows when using InfiniteRowModelModule setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(api, `does not shows no-rows when using InfiniteRowModelModule setup`).check(`
            [no root row]
            └── filler id:rowIndex:0
        `);

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);

        for (const pending of pendingGetRows) {
            pending();
        }

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        setRowDataChecked(api, []);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: warning #309',
            '`rowData` is not supported with the `infinite` row model. It is only valid with: clientSide.',
            expect.any(String)
        );

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);
        await new GridRows(api, `does not shows no-rows when using InfiniteRowModelModule final state`).check(`
            [no root row]
            └── filler id:rowIndex:0
        `);
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
