import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { ColumnResizedEvent, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ExternalFilterModule,
    ROW_NUMBERS_COLUMN_ID,
    getGridElement,
} from 'ag-grid-community';
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
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ExternalFilterModule, RowNumbersModule],
    });
    let measure: MockInstance<(form: HTMLFormElement) => number>;

    beforeEach(() => {
        // happy-dom has no text layout, so make the autosize container's measured width depend on its text length
        const fn = vi.fn((form: HTMLFormElement) => (form.textContent?.length ?? 0) * PX_PER_CHAR);
        measure = fn;
        Object.defineProperty(HTMLFormElement.prototype, 'offsetWidth', {
            configurable: true,
            get(this: HTMLFormElement) {
                return fn(this);
            },
        });
    });

    afterEach(() => {
        gridMgr.reset();
        Reflect.deleteProperty(HTMLFormElement.prototype, 'offsetWidth');
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
    const rowNumberHeaderWidth = (api: GridApi) =>
        getGridElement(api)!.querySelector<HTMLElement>(`.ag-header-cell[col-id="${ROW_NUMBERS_COLUMN_ID}"]`)!.style
            .width;

    test('widens when applyTransaction adds rows past a digit boundary', async () => {
        const api = await createGrid(97);
        expect(rowNumberWidth(api)).toBe(widthFor('98'));

        api.applyTransaction({ add: makeRows(3, 97) });
        await expectWidth(api, '101');

        api.applyTransaction({ add: makeRows(900, 100) });
        await expectWidth(api, '1001');
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

    test('keeps the widest width when a filter drops the row count below a digit boundary', async () => {
        let filtering = false;
        const api = await createGrid(100, {
            isExternalFilterPresent: () => filtering,
            doesExternalFilterPass: (node) => Number(node.data!.id) < 97,
        });
        measure.mockClear();

        filtering = true;
        api.onFilterChanged();
        await pastDebounce();

        expect(api.getDisplayedRowCount()).toBe(97);
        expect(rowNumberWidth(api)).toBe(widthFor('101'));

        filtering = false;
        api.onFilterChanged();
        await pastDebounce();

        expect(api.getDisplayedRowCount()).toBe(100);
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

    test('tolerates a valueFormatter that returns nothing for the data-less measurement row', async () => {
        const api = await createGrid(97, {
            rowNumbers: { valueFormatter: ({ data }) => data?.id as string },
        });
        expect(rowNumberWidth(api)).toBe(60);

        api.applyTransaction({ add: makeRows(3, 97) });
        await pastDebounce();
        expect(rowNumberWidth(api)).toBe(60);
    });

    test('sizes and latches on the valueFormatter output, not the bare row number', async () => {
        const api = await createGrid(97, {
            rowNumbers: { valueFormatter: ({ value }) => `Row ${value}` },
        });
        expect(rowNumberWidth(api)).toBe(widthFor('Row 98'));

        api.applyTransaction({ add: makeRows(1, 97) });
        await pastDebounce();
        expect(rowNumberWidth(api)).toBe(widthFor('Row 98'));

        api.applyTransaction({ add: makeRows(2, 98) });
        await expectWidth(api, 'Row 101');

        api.applyTransaction({ remove: makeRows(5, 95) });
        await pastDebounce();
        expect(rowNumberWidth(api)).toBe(widthFor('Row 101'));
    });

    test('a full rowData reset still re-sizes to fit, including shrinking', async () => {
        const api = await createGrid(100, { getRowId: undefined });

        api.setGridOption('rowData', makeRows(97));
        await expectWidth(api, '98');
    });

    test('a user-sized column is never autosized, including on a full rowData reset', async () => {
        const api = await createGrid(97, { getRowId: undefined, rowNumbers: { resizable: true } });
        // same source the header drag and keyboard resize use
        api.setColumnWidths([{ key: ROW_NUMBERS_COLUMN_ID, newWidth: 70 }], true, 'uiColumnResized');
        expect(rowNumberWidth(api)).toBe(70);
        measure.mockClear();

        api.applyTransaction({ add: makeRows(3, 97) });
        await pastDebounce();
        api.setGridOption('rowData', makeRows(1000));
        await pastDebounce();

        expect(api.getDisplayedRowCount()).toBe(1000);
        expect(rowNumberWidth(api)).toBe(70);
        expect(measure).not.toHaveBeenCalled();
    });

    test('changing rowNumbers options hands the column width back to autosize', async () => {
        const api = await createGrid(97, { rowNumbers: { resizable: true } });
        api.setColumnWidths([{ key: ROW_NUMBERS_COLUMN_ID, newWidth: 70 }], true, 'uiColumnResized');

        // re-applies the colDef width of 60, replacing the user's width
        api.setGridOption('rowNumbers', { resizable: true, minWidth: 40 });
        api.applyTransaction({ add: makeRows(3, 97) });
        await expectWidth(api, '101');
    });

    test('resetting column state hands a user-sized column back to autosize', async () => {
        const api = await createGrid(97, { rowNumbers: { resizable: true } });
        api.setColumnWidths([{ key: ROW_NUMBERS_COLUMN_ID, newWidth: 70 }], true, 'uiColumnResized');

        expect(rowNumberHeaderWidth(api)).toBe('70px');
        const rowNumberCol = api.getColumn(ROW_NUMBERS_COLUMN_ID)!;
        const told: string[] = [];
        rowNumberCol.addEventListener('widthChanged', (event) =>
            told.push(`${rowNumberCol.getActualWidth()}:${event.source}`)
        );

        api.resetColumnState();
        expect(told).toEqual(['60:api']);
        expect(rowNumberWidth(api)).toBe(60);
        expect(rowNumberHeaderWidth(api)).toBe('60px');

        api.applyTransaction({ add: makeRows(3, 97) });
        await expectWidth(api, '101');
    });

    test('resetting column state re-measures on the next transaction, even within the same digit count', async () => {
        const api = await createGrid(100);

        api.resetColumnState();
        expect(rowNumberWidth(api)).toBe(60);

        api.applyTransaction({ add: makeRows(1, 100) });
        await expectWidth(api, '102');
    });
});
