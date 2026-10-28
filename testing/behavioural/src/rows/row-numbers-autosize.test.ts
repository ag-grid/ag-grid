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

    test("widening takes nothing from the next column under colResizeDefault 'shift'", async () => {
        const api = await createGrid(97, { colResizeDefault: 'shift' });
        const idWidth = api.getColumn('id')!.getActualWidth();

        api.applyTransaction({ add: makeRows(3, 97) });
        await expectWidth(api, '101');

        expect(api.getColumn('id')!.getActualWidth()).toBe(idWidth);
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

    test('a full rowData reset still re-sizes to fit, shrinking down to the minimum width', async () => {
        const api = await createGrid(100, { getRowId: undefined });

        api.setGridOption('rowData', makeRows(97));
        await expectWidth(api, '98');

        // '4' measures under the column's 60px minWidth, so the column stops there, as on a grid that opened with 3 rows
        api.setGridOption('rowData', makeRows(3));
        await waitFor(() => expect(rowNumberWidth(api)).toBe(60));
        const resizes: string[] = [];
        api.addEventListener('columnResized', (e) => resizes.push(e.source));

        api.setGridOption('rowData', makeRows(2));
        await pastDebounce();

        expect(rowNumberWidth(api)).toBe(60);
        expect(resizes).toEqual([]);
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

    test('the autosize stays between the configured width and maxWidth', async () => {
        const api = await createGrid(97, { getRowId: undefined, rowNumbers: { width: 90, maxWidth: 100 } });
        // '98' measures 62
        expect(rowNumberWidth(api)).toBe(90);

        // '1001' measures 122
        api.setGridOption('rowData', makeRows(1000));
        await waitFor(() => expect(rowNumberWidth(api)).toBe(100));

        api.setGridOption('rowData', makeRows(3));
        await waitFor(() => expect(rowNumberWidth(api)).toBe(90));
    });

    test('with only minWidth lowered, the autosize fits the row numbers below the default width', async () => {
        const api = await createGrid(3, { getRowId: undefined, rowNumbers: { minWidth: 30 } });

        expect(rowNumberWidth(api)).toBe(widthFor('4'));
    });

    test('lowering minWidth at runtime fits the row numbers below the old minimum at once', async () => {
        const api = await createGrid(3, { getRowId: undefined });
        expect(rowNumberWidth(api)).toBe(60);

        api.setGridOption('rowNumbers', { minWidth: 30 });
        expect(rowNumberWidth(api)).toBe(widthFor('4'));
    });

    test('a minWidth above maxWidth settles on maxWidth, so a fresh autosize raises no resize', async () => {
        const api = await createGrid(97, { getRowId: undefined, rowNumbers: { minWidth: 120, maxWidth: 100 } });
        expect(rowNumberWidth(api)).toBe(100);
        const resizes: string[] = [];
        api.addEventListener('columnResized', (e) => resizes.push(e.source));

        api.setGridOption('rowData', makeRows(97));
        await pastDebounce();

        expect(resizes).toEqual([]);
    });

    test('changing rowNumbers options without a width keeps the column width, a user-sized one too', async () => {
        const api = await createGrid(97, { rowNumbers: { resizable: true } });
        api.setGridOption('rowNumbers', { resizable: true, minWidth: 40 });
        expect(rowNumberWidth(api)).toBe(widthFor('98'));
        api.applyTransaction({ add: makeRows(3, 97) });
        await expectWidth(api, '101');

        api.setColumnWidths([{ key: ROW_NUMBERS_COLUMN_ID, newWidth: 70 }], true, 'uiColumnResized');
        api.setGridOption('rowNumbers', { resizable: true, minWidth: 30 });
        expect(rowNumberWidth(api)).toBe(70);

        api.applyTransaction({ add: makeRows(900, 100) });
        await pastDebounce();
        expect(api.getDisplayedRowCount()).toBe(1000);
        expect(rowNumberWidth(api)).toBe(70);
    });

    test('a rowNumbers change without a width keeps the column width within its new minWidth and maxWidth', async () => {
        const api = await createGrid(97, { rowNumbers: { resizable: true } });
        api.setGridOption('rowNumbers', { resizable: true, maxWidth: 61 });
        expect(rowNumberWidth(api)).toBe(61);

        api.setGridOption('rowNumbers', { resizable: true });
        expect(rowNumberWidth(api)).toBe(widthFor('98'));
        api.setColumnWidths([{ key: ROW_NUMBERS_COLUMN_ID, newWidth: 70 }], true, 'uiColumnResized');
        api.setGridOption('rowNumbers', { resizable: true, minWidth: 100 });
        expect(rowNumberWidth(api)).toBe(100);
        expect(rowNumberHeaderWidth(api)).toBe('100px');
    });

    test('a new rowNumbers width replaces a user-sized width and still fits the rows; an unchanged, removed or below-minWidth one keeps it', async () => {
        const api = await createGrid(97, { rowNumbers: { resizable: true } });
        api.setColumnWidths([{ key: ROW_NUMBERS_COLUMN_ID, newWidth: 70 }], true, 'uiColumnResized');

        api.setGridOption('rowNumbers', { resizable: true, width: 80 });
        expect(rowNumberWidth(api)).toBe(80);
        api.setGridOption('rowData', makeRows(1000));
        await expectWidth(api, '1000');

        api.setGridOption('rowNumbers', { resizable: true, width: 61 });
        expect(rowNumberWidth(api)).toBe(widthFor('1000'));

        api.setColumnWidths([{ key: ROW_NUMBERS_COLUMN_ID, newWidth: 120 }], true, 'uiColumnResized');
        api.setGridOption('rowNumbers', { resizable: true, width: 61, minWidth: 40 });
        expect(rowNumberWidth(api)).toBe(120);
        api.setGridOption('rowNumbers', { resizable: true });
        expect(rowNumberWidth(api)).toBe(120);
        api.setGridOption('rowNumbers', { resizable: true, width: 30 });
        expect(rowNumberWidth(api)).toBe(120);

        api.setGridOption('rowData', makeRows(10000));
        await pastDebounce();
        expect(api.getDisplayedRowCount()).toBe(10000);
        expect(rowNumberWidth(api)).toBe(120);

        api.setGridOption('rowNumbers', { resizable: true, width: 60 });
        expect(rowNumberWidth(api)).toBe(widthFor('10000'));
    });

    test('a rowNumbers update keeps the widest width unless it changes what the fit reads, as a new valueFormatter does', async () => {
        let external = false;
        const api = await createGrid(100, {
            rowNumbers: { resizable: true },
            isExternalFilterPresent: () => external,
            doesExternalFilterPass: (node) => Number(node.data!.id) < 97,
        });
        external = true;
        api.onFilterChanged();
        await pastDebounce();
        expect(api.getDisplayedRowCount()).toBe(97);
        expect(rowNumberWidth(api)).toBe(widthFor('101'));

        api.setGridOption('rowNumbers', { resizable: true });
        expect(rowNumberWidth(api)).toBe(widthFor('101'));
        api.applyTransaction({ add: makeRows(1, 200) });
        await pastDebounce();
        expect(api.getDisplayedRowCount()).toBe(97);
        expect(rowNumberWidth(api)).toBe(widthFor('101'));

        api.setGridOption('rowNumbers', { resizable: false, minWidth: 60 });
        expect(rowNumberWidth(api)).toBe(widthFor('101'));

        api.setGridOption('rowNumbers', { resizable: true, valueFormatter: (params) => `Row ${params.value}` });
        expect(rowNumberWidth(api)).toBe(widthFor('Row 98'));
    });

    test('turning rowNumbers off and on again fits the new column to the rows', async () => {
        const api = await createGrid(1000);
        expect(rowNumberWidth(api)).toBe(widthFor('1001'));

        api.setGridOption('rowNumbers', false);
        api.setGridOption('rowNumbers', true);
        await expectWidth(api, '1001');
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
