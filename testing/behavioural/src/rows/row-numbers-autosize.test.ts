import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { ColumnResizedEvent, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ROW_NUMBERS_COLUMN_ID } from 'ag-grid-community';
import { RowNumbersModule } from 'ag-grid-enterprise';

interface RowData {
    id: string;
}

const PX_PER_CHAR = 30;
const PADDING = 2;
const widthFor = (text: string) => text.length * PX_PER_CHAR + PADDING;

const makeRows = (count: number, start = 0): RowData[] =>
    Array.from({ length: count }, (_, i) => ({ id: String(start + i) }));

describe('Row numbers column autosize', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, RowNumbersModule] });
    let measure: MockInstance<(this: HTMLFormElement) => number>;

    beforeEach(() => {
        // happy-dom has no text layout, so make the autosize container's measured width depend on its text length
        measure = vi.fn(function (this: HTMLFormElement) {
            return (this.textContent?.length ?? 0) * PX_PER_CHAR;
        });
        Object.defineProperty(HTMLFormElement.prototype, 'offsetWidth', { configurable: true, get: measure });
    });

    afterEach(() => {
        gridMgr.reset();
        delete (HTMLFormElement.prototype as Partial<HTMLFormElement>).offsetWidth;
    });

    const createGrid = async (rowCount: number, gridOptions?: GridOptions<RowData>): Promise<GridApi<RowData>> => {
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }],
            rowData: makeRows(rowCount),
            rowNumbers: true,
            getRowId: ({ data }) => data.id,
            ...gridOptions,
        });
        await waitForEvent('firstDataRendered', api);
        await pastDebounce();
        return api;
    };

    // eslint-disable-next-line no-restricted-syntax -- samples past the 10ms row-numbers modelUpdated debounce (rowNumbersService.ts)
    const pastDebounce = () => asyncSetTimeout(20);

    const expectWidth = (api: GridApi, text: string) => waitFor(() => expect(rowNumberWidth(api)).toBe(widthFor(text)));

    const rowNumberWidth = (api: GridApi) => api.getColumn(ROW_NUMBERS_COLUMN_ID)!.getActualWidth();

    test('widens when applyTransaction adds rows past a digit boundary', async () => {
        const api = await createGrid(97);
        expect(rowNumberWidth(api)).toBe(widthFor('98'));

        api.applyTransaction({ add: makeRows(3, 97) });
        await expectWidth(api, '101');

        api.applyTransaction({ add: makeRows(900, 100) });
        await expectWidth(api, '1001');
    });

    test('widens when applyTransactionAsync adds rows past a digit boundary', async () => {
        const api = await createGrid(97);

        api.applyTransactionAsync({ add: makeRows(3, 97) });
        api.flushAsyncTransactions();
        await expectWidth(api, '101');
    });

    test('widens when immutable rowData grows past a digit boundary', async () => {
        const api = await createGrid(97);

        api.setGridOption('rowData', makeRows(100));
        await expectWidth(api, '101');
    });

    test('keeps the widest width when rows are removed below a digit boundary', async () => {
        const api = await createGrid(100);
        expect(rowNumberWidth(api)).toBe(widthFor('101'));
        measure.mockClear();

        api.applyTransaction({ remove: makeRows(3, 97) });
        await pastDebounce();

        expect(api.getDisplayedRowCount()).toBe(97);
        expect(rowNumberWidth(api)).toBe(widthFor('101'));
        expect(measure).not.toHaveBeenCalled();

        api.applyTransaction({ add: makeRows(3, 97) });
        await pastDebounce();

        expect(rowNumberWidth(api)).toBe(widthFor('101'));
        expect(measure).not.toHaveBeenCalled();
    });

    test('does not re-measure or resize on transactions that keep the digit count', async () => {
        const api = await createGrid(100);
        const resizes: ColumnResizedEvent[] = [];
        api.addEventListener('columnResized', (e) => {
            if (e.source === 'rowNumbersService') {
                resizes.push(e);
            }
        });
        measure.mockClear();

        api.applyTransaction({ add: makeRows(1, 100) });
        await pastDebounce();
        api.applyTransaction({ remove: makeRows(1, 100) });
        await pastDebounce();

        expect(measure).not.toHaveBeenCalled();
        expect(resizes).toEqual([]);
        expect(rowNumberWidth(api)).toBe(widthFor('101'));
    });

    test('a full rowData reset still re-sizes to fit, including shrinking', async () => {
        const api = await createGrid(100, { getRowId: undefined });

        api.setGridOption('rowData', makeRows(97));
        await expectWidth(api, '98');
    });

    test('a full rowData reset followed by a transaction within the debounce window still autosizes', async () => {
        const api = await createGrid(100, { getRowId: undefined });
        const removed: RowData[] = [];
        api.forEachNode((node) => {
            if (node.rowIndex! >= 97) {
                removed.push(node.data!);
            }
        });
        api.applyTransaction({ remove: removed });
        await pastDebounce();
        expect(rowNumberWidth(api)).toBe(widthFor('101'));

        api.setGridOption('rowData', makeRows(96));
        api.applyTransaction({ add: [{ id: 'extra' }] });
        await expectWidth(api, '98');
    });
});
