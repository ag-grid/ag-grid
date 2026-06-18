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

        // The reason and module names within the prose are wrapped in inline code blocks to stand out.
        const inlineCode = Array.from(
            document.querySelectorAll('.ag-overlay-error-message .ag-overlay-error-inline-code')
        );
        expect(inlineCode.some((el) => el.textContent === 'ServerSideRowModelModule')).toBe(true);
        expect(inlineCode.every((el) => el.tagName === 'CODE')).toBe(true);
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

    test('explicit rowModelType is used for datasource validation, not the fallback value', async () => {
        // The user correctly set rowModelType + datasource but is missing the module. The grid falls
        // back to client-side, but the misleading "serverSideDatasource is not supported with the
        // 'clientSide' row model" warning must NOT fire - they configured a valid pairing.
        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            rowModelType: 'serverSide',
            serverSideDatasource: { getRows: () => {} } as any,
        });

        await waitFor(() => expect(hasErrorOverlay()).toBe(true));

        const incompatibilityWarning = consoleWarnSpy.mock.calls.some((call) =>
            call.some(
                (arg) => typeof arg === 'string' && arg.includes("is not supported with the 'clientSide' row model")
            )
        );
        expect(incompatibilityWarning).toBe(false);
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

    test('multiple missing-module errors all surface in the error overlay', async () => {
        // sideBar (a grid option) and rowGroup (a colDef) are validated at different points, so the
        // two missing-module errors are added to the overlay separately. Both must be shown, and the
        // header count must reflect the total - not just the first error captured.
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'athlete', rowGroup: true }, { field: 'age' }],
            rowData,
            sideBar: true,
        });

        await waitFor(() => expect(hasErrorOverlay()).toBe(true));

        await waitFor(() => expect(document.querySelectorAll('.ag-overlay-error-item').length).toBe(2));

        const title = document.querySelector('.ag-overlay-error-title')?.textContent ?? '';
        expect(title).toBe('AG Grid found 2 configuration errors');

        const messages = Array.from(document.querySelectorAll('.ag-overlay-error-message')).map(
            (el) => el.textContent ?? ''
        );
        expect(messages.some((message) => message.includes('RowGroupingModule'))).toBe(true);
        expect(messages.some((message) => message.includes('SideBarModule'))).toBe(true);
    });

    test('valid configuration shows no error overlay', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });

        expect(api.getDisplayedRowCount()).toBe(rowData.length);
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        await Promise.resolve();
        expect(hasErrorOverlay()).toBe(false);
    });
});

describe('error overlay without the ValidationModule', () => {
    // The ValidationModule provides the full text for most errors. Module-registration errors must
    // remain fully actionable without it, so a developer (or their agent) can fix them directly.
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
    const rowData = [{ athlete: 'Michael Phelps', age: 23 }];

    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleErrorSpy.mockRestore();
    });

    test('missing module error shows the full registration guidance in console and overlay', async () => {
        gridsManager.createGrid('myGrid', { columnDefs, rowData, rowModelType: 'serverSide' });

        await waitFor(() => expect(isAgHtmlElementVisible('.ag-overlay-error-wrapper')).toBe(true));

        const message = document.querySelector('.ag-overlay-error-message')?.textContent ?? '';
        // Full, actionable text rather than the minified "register the ValidationModule" stub.
        expect(message).toContain('ServerSideRowModelModule');
        expect(message).toContain('is not registered');
        expect(message).not.toContain('register the ValidationModule');
        // The modules-docs reference is rendered as its own link, not left inline in the snippet.
        expect(message).not.toContain('For more info see');
        // The registration snippet is split into its own code block, not mixed into the explanation prose.
        expect(message).not.toContain('import {');
        const code = document.querySelector('.ag-overlay-error-code')?.textContent ?? '';
        expect(code).toContain("import { ModuleRegistry } from 'ag-grid-community';");
        expect(code).toContain('ModuleRegistry.registerModules([ ServerSideRowModelModule ]);');
        expect(code).not.toContain('Check if you have registered the module');

        const links = document.querySelectorAll<HTMLAnchorElement>('.ag-overlay-error-link');
        expect(links[0]?.href).toContain('/errors/');
        expect(links[1]?.textContent).toBe('Modules Documentation');
        expect(links[1]?.href).toContain('/modules/');

        const loggedFullText = consoleErrorSpy.mock.calls.some((call) =>
            call.some((arg) => typeof arg === 'string' && arg.includes('ServerSideRowModelModule'))
        );
        expect(loggedFullText).toBe(true);
    });
});
