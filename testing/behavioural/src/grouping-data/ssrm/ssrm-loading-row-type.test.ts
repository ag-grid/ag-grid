import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { ValidationModule, enableDevValidations } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

const columnDefs = [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }];

/** Never responds, so rows stay in their loading state. */
function createHangingDatasource(): IServerSideDatasource {
    return { getRows: () => {} };
}

/** Responds to the top level at once, and holds child level requests until the test resolves them. */
function createGroupDatasource(childRequests: IServerSideGetRowsParams[]): IServerSideDatasource {
    return {
        getRows: (params) => {
            if (params.request.groupKeys.length) {
                childRequests.push(params);
                return;
            }
            params.success({ rowData: [{ country: 'UK' }, { country: 'US' }], rowCount: 2 });
        },
    };
}

const getRowId = ({ data }: { data: any }) => data.id ?? `group-${data.country}`;

function getLoadingRowKinds(): { fullWidth: number; cell: number } {
    const loadingRows = Array.from(document.querySelectorAll<HTMLElement>('.ag-row-loading'));
    const fullWidth = loadingRows.filter((row) => row.classList.contains('ag-full-width-row')).length;
    return { fullWidth, cell: loadingRows.length - fullWidth };
}

function expectEmptyLoadingRows(count: number) {
    const loadingRows = Array.from(document.querySelectorAll<HTMLElement>('.ag-row-loading'));
    expect(loadingRows).toHaveLength(count);
    for (const row of loadingRows) {
        expect(row.classList.contains('ag-full-width-row')).toBe(false);
        expect(row.querySelector('.ag-skeleton-container, .ag-loading')).toBeNull();
        expect(row.textContent?.trim()).toBe('');
    }
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

    test("'none' renders loading rows as empty rows that keep their height", async () => {
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            rowHeight: 30,
            serverSideInitialRowCount: 3,
            serverSideLoadingRowType: 'none',
            serverSideDatasource: createHangingDatasource(),
        });

        await waitFor(() => expect(document.querySelectorAll('.ag-row-loading .ag-cell').length).toBeGreaterThan(0));
        // give any cell renderer a chance to mount before asserting nothing was rendered
        await asyncSetTimeout(0);

        expectEmptyLoadingRows(3);
        for (const row of document.querySelectorAll<HTMLElement>('.ag-row-loading')) {
            expect(row.style.height).toBe('30px');
        }
        expect(api.getDisplayedRowAtIndex(2)?.rowTop).toBe(60);
    });

    test("'none' shows no placeholder row in an expanded group until its children load", async () => {
        const childRequests: IServerSideGetRowsParams[] = [];
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideLoadingRowType: 'none',
            getRowId,
            serverSideDatasource: createGroupDatasource(childRequests),
        });
        await waitFor(() => expect(api.getRowNode('group-UK')).toBeDefined());

        api.getRowNode('group-UK')!.setExpanded(true);
        expect(api.getDisplayedRowCount()).toBe(2);

        // the children are still requested, with nothing displayed in their place
        await waitFor(() => expect(childRequests).toHaveLength(1));
        expect(childRequests[0].request.groupKeys).toEqual(['UK']);
        expect(api.getDisplayedRowCount()).toBe(2);
        expect(document.querySelectorAll('.ag-row-loading')).toHaveLength(0);

        childRequests[0].success({
            rowData: [
                { id: 'uk-1', country: 'UK', medals: 1 },
                { id: 'uk-2', country: 'UK', medals: 2 },
            ],
            rowCount: 2,
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(4));
        const displayedIds = [0, 1, 2, 3].map((index) => api.getDisplayedRowAtIndex(index)?.id);
        expect(displayedIds).toEqual(['group-UK', 'uk-1', 'uk-2', 'group-US']);
    });

    test("'fullWidth' shows a placeholder row in an expanded group until its children load", async () => {
        const childRequests: IServerSideGetRowsParams[] = [];
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            getRowId,
            serverSideDatasource: createGroupDatasource(childRequests),
        });
        await waitFor(() => expect(api.getRowNode('group-UK')).toBeDefined());

        api.getRowNode('group-UK')!.setExpanded(true);

        expect(api.getDisplayedRowCount()).toBe(3);
        expect(api.getDisplayedRowAtIndex(1)?.stub).toBe(true);
        await waitFor(() => expect(childRequests).toHaveLength(1));
    });

    test("'none' restores the placeholder row when the first child block fails, so it can be retried", async () => {
        const childRequests: IServerSideGetRowsParams[] = [];
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideLoadingRowType: 'none',
            getRowId,
            serverSideDatasource: createGroupDatasource(childRequests),
        });
        await waitFor(() => expect(api.getRowNode('group-UK')).toBeDefined());

        api.getRowNode('group-UK')!.setExpanded(true);
        await waitFor(() => expect(childRequests).toHaveLength(1));
        childRequests[0].fail();

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        expect(api.getDisplayedRowAtIndex(1)?.failedLoad).toBe(true);
        // a failed block is not requested again until retried
        // eslint-disable-next-line no-restricted-syntax -- negative assertion: samples past the chained load check and blockLoadDebounceMillis timers that would issue a repeat request
        await asyncSetTimeout(20);
        expect(childRequests).toHaveLength(1);
    });

    test("switching to and from 'none' at runtime redraws loading rows", async () => {
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideDatasource: createHangingDatasource(),
        });
        expect(getLoadingRowKinds()).toEqual({ fullWidth: 1, cell: 0 });

        api.setGridOption('serverSideLoadingRowType', 'none');
        await asyncSetTimeout(0);
        expectEmptyLoadingRows(1);

        api.setGridOption('serverSideLoadingRowType', 'fullWidth');
        expect(getLoadingRowKinds()).toEqual({ fullWidth: 1, cell: 0 });
    });

    test("switching from 'none' restores the placeholder row of a group awaiting its children", async () => {
        const childRequests: IServerSideGetRowsParams[] = [];
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideLoadingRowType: 'none',
            getRowId,
            serverSideDatasource: createGroupDatasource(childRequests),
        });
        await waitFor(() => expect(api.getRowNode('group-UK')).toBeDefined());
        api.getRowNode('group-UK')!.setExpanded(true);
        await waitFor(() => expect(childRequests).toHaveLength(1));
        expect(api.getDisplayedRowCount()).toBe(2);

        api.setGridOption('serverSideLoadingRowType', 'fullWidth');

        expect(api.getDisplayedRowCount()).toBe(3);
        expect(api.getDisplayedRowAtIndex(1)?.stub).toBe(true);
        expect(getLoadingRowKinds()).toEqual({ fullWidth: 1, cell: 0 });

        childRequests[0].success({ rowData: [{ id: 'uk-1', country: 'UK', medals: 1 }], rowCount: 1 });
        await waitFor(() => expect(api.getDisplayedRowAtIndex(1)?.id).toBe('uk-1'));
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(childRequests).toHaveLength(1);
    });

    test("switching to 'none' drops the placeholder row of a group awaiting its children", async () => {
        const childRequests: IServerSideGetRowsParams[] = [];
        const api = gridManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideLoadingRowType: 'cell',
            getRowId,
            serverSideDatasource: createGroupDatasource(childRequests),
        });
        await waitFor(() => expect(api.getRowNode('group-UK')).toBeDefined());
        api.getRowNode('group-UK')!.setExpanded(true);
        await waitFor(() => expect(childRequests).toHaveLength(1));
        expect(api.getDisplayedRowCount()).toBe(3);

        api.setGridOption('serverSideLoadingRowType', 'none');

        expect(api.getDisplayedRowCount()).toBe(2);
        expect(document.querySelectorAll('.ag-row-loading')).toHaveLength(0);

        childRequests[0].success({ rowData: [{ id: 'uk-1', country: 'UK', medals: 1 }], rowCount: 1 });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        expect(api.getDisplayedRowAtIndex(1)?.id).toBe('uk-1');
        expect(childRequests).toHaveLength(1);
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
            serverSideLoadingRowType: 'skeleton' as any,
            serverSideDatasource: createHangingDatasource(),
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #320'),
            expect.stringContaining('`serverSideLoadingRowType` must be one of `[fullWidth, cell, none]`'),
            expect.anything()
        );
        expectDeprecationWarning(false);
    });
});
