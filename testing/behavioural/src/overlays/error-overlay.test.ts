import { waitFor } from '@testing-library/dom';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('error overlay', () => {
    // Deliberately omit the ServerSideRowModelModule so that rowModelType: 'serverSide'
    // cannot be satisfied and the grid must fall back to the client-side row model.
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ValidationModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
    const rowData = [
        { athlete: 'Michael Phelps', age: 23 },
        { athlete: 'Natalie Coughlin', age: 25 },
    ];

    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    function hasErrorOverlay() {
        return isAgHtmlElementVisible('.ag-overlay-error-wrapper');
    }

    beforeEach(() => {
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('missing row model module falls back to client-side and shows the error overlay', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, rowModelType: 'serverSide' });

        // Grid still instantiates and behaves as the client-side row model.
        expect(api).toBeDefined();
        expect(api.isDestroyed()).toBe(false);
        expect(api.getDisplayedRowCount()).toBe(rowData.length);

        // The error is still reported to the console.
        expect(consoleErrorSpy).toHaveBeenCalled();

        await waitFor(() => expect(hasErrorOverlay()).toBe(true));

        const message = document.querySelector('.ag-overlay-error-message')?.textContent ?? '';
        expect(message).toContain('ServerSideRowModel');
        expect(document.querySelector<HTMLAnchorElement>('.ag-overlay-error-link')?.href).toContain('/errors/200');
    });

    test('unknown rowModelType falls back to client-side and shows the error overlay', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            rowModelType: 'banana' as any,
        });

        // Grid still instantiates as the client-side row model.
        expect(api.isDestroyed()).toBe(false);
        expect(api.getDisplayedRowCount()).toBe(rowData.length);
        expect(consoleErrorSpy).toHaveBeenCalled();

        await waitFor(() => expect(hasErrorOverlay()).toBe(true));

        const message = document.querySelector('.ag-overlay-error-message')?.textContent ?? '';
        expect(message).toContain('banana');
        expect(document.querySelector<HTMLAnchorElement>('.ag-overlay-error-link')?.href).toContain('/errors/201');
    });

    test('datasource provided without matching rowModelType shows the error overlay', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            // No rowModelType set, but providing a serverSideDatasource signals the intended row
            // model. The ServerSideRowModelModule is deliberately not registered.
            serverSideDatasource: { getRows: () => {} } as any,
        });

        expect(api.isDestroyed()).toBe(false);
        expect(api.getDisplayedRowCount()).toBe(rowData.length);
        expect(consoleErrorSpy).toHaveBeenCalled();

        await waitFor(() => expect(hasErrorOverlay()).toBe(true));

        const message = document.querySelector('.ag-overlay-error-message')?.textContent ?? '';
        expect(message).toContain('ServerSideRowModel');
        expect(document.querySelector<HTMLAnchorElement>('.ag-overlay-error-link')?.href).toContain('/errors/275');
    });

    test('dismissing the error overlay hides it', async () => {
        gridsManager.createGrid('myGrid', { columnDefs, rowData, rowModelType: 'serverSide' });

        await waitFor(() => expect(hasErrorOverlay()).toBe(true));

        document.querySelector<HTMLButtonElement>('.ag-overlay-error-dismiss')?.click();

        await waitFor(() => expect(hasErrorOverlay()).toBe(false));
    });

    test('runtime missing-module error surfaces in the error overlay', async () => {
        // NumberFilterModule is deliberately not registered; the floating filter forces the column
        // filter to be created during render, which logs a runtime missing-module error (#200).
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'age', filter: 'agNumberColumnFilter', floatingFilter: true }],
            rowData,
        });

        expect(api.isDestroyed()).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();

        await waitFor(() => expect(hasErrorOverlay()).toBe(true));

        const message = document.querySelector('.ag-overlay-error-message')?.textContent ?? '';
        expect(message).toContain('NumberFilterModule');
        expect(document.querySelector<HTMLAnchorElement>('.ag-overlay-error-link')?.href).toContain('/errors/200');
    });

    test('error overlay is suppressed via suppressOverlays', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            rowModelType: 'serverSide',
            suppressOverlays: ['error'],
        });

        expect(api.getDisplayedRowCount()).toBe(rowData.length);
        // Error is still logged even though the overlay is suppressed.
        expect(consoleErrorSpy).toHaveBeenCalled();

        // Give the overlay a chance to (not) appear.
        await Promise.resolve();
        expect(hasErrorOverlay()).toBe(false);
    });

    test('valid configuration shows no error overlay', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });

        expect(api.getDisplayedRowCount()).toBe(rowData.length);
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        await Promise.resolve();
        expect(hasErrorOverlay()).toBe(false);
    });
});
