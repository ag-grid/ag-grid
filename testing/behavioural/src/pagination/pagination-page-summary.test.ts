import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, getGridElement } from 'ag-grid-community';

const COLUMN_DEFS = [{ field: 'name' }];

function createGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: false,
        ...options,
    });
}

function makeRowData(count: number) {
    return Array.from({ length: count }, (_, i) => ({ name: `Row ${i + 1}` }));
}

function getPageInput(api: GridApi): HTMLInputElement {
    return getGridElement(api)!.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;
}

function getTotalPagesText(api: GridApi): string | null {
    const [, lbTotal] = getGridElement(api)!.querySelectorAll('.ag-paging-page-summary-panel .ag-paging-number');
    return lbTotal.textContent;
}

describe('pagination page summary', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('no rows', () => {
        test('shows page 0 of 0', () => {
            const api = createGrid(gridsManager, { rowData: [] });

            expect(getPageInput(api).value).toBe('0');
            expect(getTotalPagesText(api)).toBe('0');
        });

        test('page input allows 0 as its minimum', () => {
            const api = createGrid(gridsManager, { rowData: [] });
            const input = getPageInput(api);

            expect(input.min).toBe('0');
            expect(input.max).toBe('0');
            expect(input.getAttribute('aria-valuenow')).toBe('0');
            expect(input.getAttribute('aria-valuemin')).toBe('0');
            expect(input.getAttribute('aria-valuemax')).toBe('0');
        });

        test('an invalid page entry reverts to 0 rather than 1', async () => {
            const api = createGrid(gridsManager, { rowData: [] });
            const input = getPageInput(api);

            await userEvent.clear(input);
            await userEvent.type(input, '1{enter}');

            expect(input.value).toBe('0');
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('clearing the page input reverts to 0', async () => {
            const api = createGrid(gridsManager, { rowData: [] });
            const input = getPageInput(api);

            await userEvent.clear(input);
            await userEvent.type(input, '{enter}');

            expect(input.value).toBe('0');
        });

        test('page number returns to 1 once rows arrive', () => {
            const api = createGrid(gridsManager, { rowData: [] });
            expect(getPageInput(api).value).toBe('0');

            api.setGridOption('rowData', makeRowData(25));

            expect(getPageInput(api).value).toBe('1');
            expect(getTotalPagesText(api)).toBe('3');
        });

        test('page number returns to 0 once the rows are removed again', () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(25) });
            api.paginationGoToLastPage();
            expect(getPageInput(api).value).toBe('3');

            api.setGridOption('rowData', []);

            expect(getPageInput(api).value).toBe('0');
            expect(getTotalPagesText(api)).toBe('0');
        });
    });

    describe('with rows', () => {
        test('an out-of-range page entry reverts to the current page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(25) });
            api.paginationGoToPage(1);
            const input = getPageInput(api);
            expect(input.value).toBe('2');

            await userEvent.clear(input);
            await userEvent.type(input, '99{enter}');

            expect(input.value).toBe('2');
            expect(api.paginationGetCurrentPage()).toBe(1);
        });

        test('a non-integer page entry reverts to the current page', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(25) });
            const input = getPageInput(api);

            await userEvent.clear(input);
            await userEvent.type(input, '2.5{enter}');

            expect(input.value).toBe('1');
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('a valid page entry navigates', async () => {
            const api = createGrid(gridsManager, { rowData: makeRowData(25) });
            const input = getPageInput(api);

            await userEvent.clear(input);
            await userEvent.type(input, '3{enter}');

            expect(input.value).toBe('3');
            expect(api.paginationGetCurrentPage()).toBe(2);
        });
    });
});
