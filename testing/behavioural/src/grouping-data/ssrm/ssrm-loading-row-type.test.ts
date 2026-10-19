import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { IServerSideDatasource } from 'ag-grid-community';
import { ValidationModule, enableDevValidations } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

const columnDefs = [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }];

/** Never responds, so rows stay in their loading state. */
function createHangingDatasource(): IServerSideDatasource {
    return { getRows: () => {} };
}

function getLoadingRowKinds(): { fullWidth: number; cell: number } {
    const loadingRows = Array.from(document.querySelectorAll<HTMLElement>('.ag-row-loading'));
    const fullWidth = loadingRows.filter((row) => row.classList.contains('ag-full-width-row')).length;
    return { fullWidth, cell: loadingRows.length - fullWidth };
}

describe('SSRM serverSideLoadingRowType', () => {
    const gridManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, RowGroupingModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridManager.reset();
        consoleWarnSpy.mockRestore();
    });

    function expectDeprecationWarning(called: boolean) {
        const deprecationCalls = consoleWarnSpy.mock.calls.filter((args) =>
            args.some((arg) => String(arg).includes('suppressServerSideFullWidthLoadingRow'))
        );
        expect(deprecationCalls.length > 0).toBe(called);
    }

    test("defaults to 'fullWidth' loading rows", () => {
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideDatasource: createHangingDatasource(),
        });

        expect(api.getGridOption('serverSideLoadingRowType')).toBe('fullWidth');
        expect(getLoadingRowKinds()).toEqual({ fullWidth: 1, cell: 0 });
    });

    test("'cell' renders loading rows as normal rows with per-cell loading renderers", async () => {
        gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideLoadingRowType: 'cell',
            serverSideDatasource: createHangingDatasource(),
        });

        expect(getLoadingRowKinds()).toEqual({ fullWidth: 0, cell: 1 });
        await waitFor(() =>
            expect(document.querySelectorAll('.ag-row-loading .ag-skeleton-container').length).toBeGreaterThan(0)
        );
    });

    test('changing the option at runtime redraws loading rows', () => {
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideDatasource: createHangingDatasource(),
        });
        expect(getLoadingRowKinds()).toEqual({ fullWidth: 1, cell: 0 });

        api.setGridOption('serverSideLoadingRowType', 'cell');
        expect(getLoadingRowKinds()).toEqual({ fullWidth: 0, cell: 1 });

        api.setGridOption('serverSideLoadingRowType', 'fullWidth');
        expect(getLoadingRowKinds()).toEqual({ fullWidth: 1, cell: 0 });
    });

    test("deprecated suppressServerSideFullWidthLoadingRow still selects 'cell' when the new option is unset", () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [306] });
        gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            suppressServerSideFullWidthLoadingRow: true,
            serverSideDatasource: createHangingDatasource(),
        });

        expect(getLoadingRowKinds()).toEqual({ fullWidth: 0, cell: 1 });
        expectDeprecationWarning(true);
    });

    test('serverSideLoadingRowType takes precedence over the deprecated option', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [306] });
        gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideLoadingRowType: 'fullWidth',
            suppressServerSideFullWidthLoadingRow: true,
            serverSideDatasource: createHangingDatasource(),
        });

        expect(getLoadingRowKinds()).toEqual({ fullWidth: 1, cell: 0 });
    });

    test('warns about an invalid value', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [320] });
        gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideLoadingRowType: 'none' as any,
            serverSideDatasource: createHangingDatasource(),
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #320'),
            expect.stringContaining('serverSideLoadingRowType'),
            expect.anything()
        );
        expectDeprecationWarning(false);
    });
});
