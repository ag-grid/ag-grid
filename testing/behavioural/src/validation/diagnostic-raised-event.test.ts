import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { DiagnosticRaisedEvent, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule, enableDevValidations } from 'ag-grid-community';

describe('diagnosticRaised event', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ValidationModule],
    });
    const columnDefs = [{ field: 'athlete' }];
    const rowData = [{ athlete: 'Michael Phelps' }];
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    // A grid option that is not a recognised property; emits warning #307 at init.
    const withUnknownOption = (extra: GridOptions): GridOptions =>
        ({ columnDefs, rowData, thisOptionDoesNotExist: true, ...extra }) as unknown as GridOptions;

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('fires the onDiagnosticRaised callback with id, severity and message', () => {
        enableDevValidations({ showOverlayOn: [] });
        const onDiagnosticRaised = vitest.fn();
        gridsManager.createGrid('myGrid', withUnknownOption({ onDiagnosticRaised }));

        expect(onDiagnosticRaised).toHaveBeenCalled();
        const event: DiagnosticRaisedEvent = onDiagnosticRaised.mock.calls[0][0];
        expect(event.type).toBe('diagnosticRaised');
        expect(event.id).toBe(307);
        expect(event.severity).toBe('warning');
        expect(event.message).toContain('thisOptionDoesNotExist');
        expect(event.attributedToThisGrid).toBe(true);
        expect(event.api).toBeDefined();
    });

    test('fires via api.addEventListener', () => {
        enableDevValidations({ showOverlayOn: [] });
        const listener = vitest.fn();
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        api.addEventListener('diagnosticRaised', listener);

        // An out-of-range page size raises warning #317 after the grid is up.
        api.setGridOption('paginationPageSize', 0);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toMatchObject({
            type: 'diagnosticRaised',
            id: 317,
            severity: 'warning',
            attributedToThisGrid: true,
        });
    });

    test('fires for a severity the overlay is filtering out', () => {
        enableDevValidations({ showOverlayOn: ['error'] });
        const onDiagnosticRaised = vitest.fn();
        gridsManager.createGrid('myGrid', withUnknownOption({ onDiagnosticRaised }));

        const severities = onDiagnosticRaised.mock.calls.map((call) => call[0].severity);
        expect(severities).toContain('warning');
    });

    test('fires before a throwOn throw', () => {
        enableDevValidations({ showOverlayOn: [] });
        const seen: number[] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            onDiagnosticRaised: (e) => seen.push(e.id as number),
        });

        enableDevValidations({ showOverlayOn: [], throwOn: ALL_SEVERITIES });
        expect(() => api.setGridOption('paginationPageSize', 0)).toThrow();

        expect(seen.length).toBeGreaterThan(0);
    });

    // A diagnostic raised before the ValidationModule's beans exist is buffered for the console and the
    // bootstrap panel, but there is no grid to dispatch an event from - the same limitation as a
    // pre-init diagnostic.
    test('does not fire for a diagnostic that aborts grid creation', () => {
        enableDevValidations({ showOverlayOn: [], throwOn: ALL_SEVERITIES });
        const onDiagnosticRaised = vitest.fn();

        expect(() => gridsManager.createGrid('myGrid', withUnknownOption({ onDiagnosticRaised }))).toThrow();

        expect(onDiagnosticRaised).not.toHaveBeenCalled();
    });

    test('is silenced for a suppressed id', () => {
        // An unrecognised option raises both the per-property warning (307) and the summary (310).
        enableDevValidations({ showOverlayOn: [], suppress: [307, 310] });
        const onDiagnosticRaised = vitest.fn();
        gridsManager.createGrid('myGrid', withUnknownOption({ onDiagnosticRaised }));

        expect(onDiagnosticRaised).not.toHaveBeenCalled();
    });

    test('a throwing handler does not break the raising code path, and is reported', () => {
        enableDevValidations({ showOverlayOn: [] });
        const onDiagnosticRaised = vitest.fn(() => {
            throw new Error('handler blew up');
        });

        expect(() => gridsManager.createGrid('myGrid', withUnknownOption({ onDiagnosticRaised }))).not.toThrow();
        expect(onDiagnosticRaised).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls.some((call) => call.join(' ').includes('#330'))).toBe(true);
    });

    test('a handler that itself raises a diagnostic does not recurse', () => {
        enableDevValidations({ showOverlayOn: [] });
        let calls = 0;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            onDiagnosticRaised: () => {
                calls++;
                // Raises another diagnostic from inside the handler.
                api.setGridOption('paginationPageSize', 0);
            },
        });

        api.setGridOption('paginationPageSize', 0);

        // The nested diagnostic is dropped rather than re-entering, so one raise is one call.
        expect(calls).toBe(1);
    });

    test('reports a throwing handler without throwing, under throwOn', () => {
        enableDevValidations({ showOverlayOn: [], throwOn: ALL_SEVERITIES });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            onDiagnosticRaised: () => {
                throw new Error('handler blew up');
            },
        });

        // The caller sees the diagnostic's own throw, not the handler's - reporting the handler failure
        // as a diagnostic would throw first, from inside the listener loop.
        expect(() => api.setGridOption('paginationPageSize', 0)).toThrow(/#317/);
        expect(consoleErrorSpy.mock.calls.some((call) => call.join(' ').includes('#330'))).toBe(true);
    });

    // An API call on a destroyed grid is raised with no grid attribution, so it reaches every live
    // grid's listener. The flag is what lets a consumer tell it apart from this grid's own problems.
    test('flags a diagnostic that is not attributed to this grid', () => {
        enableDevValidations({ showOverlayOn: [] });
        const onDiagnosticRaised = vitest.fn();
        const destroyedApi = gridsManager.createGrid('doomedGrid', { columnDefs, rowData });
        gridsManager.createGrid('survivingGrid', { columnDefs, rowData, onDiagnosticRaised });

        destroyedApi.destroy();
        onDiagnosticRaised.mockClear();
        destroyedApi.getDisplayedRowCount();

        expect(onDiagnosticRaised).toHaveBeenCalledTimes(1);
        expect(onDiagnosticRaised.mock.calls[0][0]).toMatchObject({
            id: 26,
            attributedToThisGrid: false,
        });
    });

    // Buffered diagnostics are replayed to each listener as it attaches. A grid only ever replays its
    // own and unattributed ones, so a later grid never inherits another grid's problems.
    test('replays only unattributed diagnostics to a grid created later', () => {
        enableDevValidations({ showOverlayOn: [] });
        gridsManager.createGrid('firstGrid', withUnknownOption({}));

        const onDiagnosticRaised = vitest.fn();
        gridsManager.createGrid('laterGrid', { columnDefs, rowData, onDiagnosticRaised });

        const ids = onDiagnosticRaised.mock.calls.map((call) => call[0].id);
        expect(ids).not.toContain(307);
        expect(ids).not.toContain(310);
    });
});
