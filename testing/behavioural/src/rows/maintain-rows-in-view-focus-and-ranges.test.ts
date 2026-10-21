import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    NumberEditorModule,
    PinnedRowModule,
    ScrollApiModule,
} from 'ag-grid-community';
import { CellSelectionModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    a: number;
    b: number;
}

const ROW_HEIGHT = 50;
const SCROLL_TOP = 1000; // row 20 at the top of the viewport

const createRows = (prefix: string, count: number): Row[] =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, a: i, b: i }));

describe('maintainRowsInViewOnDataUpdate focused cell and cell ranges', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ScrollApiModule,
            PinnedRowModule,
            NumberEditorModule,
            CellSelectionModule,
        ],
    });

    beforeEach(() => {
        // gives the viewport its height, so every row in view is anchored
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterEach(() => {
        gridsManager.reset();
        mockGridLayout.resetOptions();
    });

    const scrollTo = (api: GridApi, top: number) => {
        TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!.scrollTop = top;
        expect(api.getVerticalPixelRange().top).toBe(top);
    };

    /** The ID of the row the focused cell is on. */
    const getFocusedRowId = (api: GridApi) => api.getDisplayedRowAtIndex(api.getFocusedCell()!.rowIndex)!.id;

    /** The IDs of the first and last rows of the only cell range. */
    const getRangeRowIds = (api: GridApi) => {
        const [{ startRow, endRow }] = api.getCellRanges()!;
        return [api.getDisplayedRowAtIndex(startRow!.rowIndex)!.id, api.getDisplayedRowAtIndex(endRow!.rowIndex)!.id];
    };

    describe('client-side row model', () => {
        const createGrid = (options?: GridOptions<Row>) =>
            gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'a', editable: true }, { field: 'b' }],
                rowData: createRows('r', 200),
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                cellSelection: true,
                maintainRowsInViewOnDataUpdate: true,
                ...options,
            });

        test('does not move the focused cell or cell ranges when the option is off', () => {
            const api = createGrid({ maintainRowsInViewOnDataUpdate: undefined });
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');
            api.addCellRange({ rowStartIndex: 21, rowEndIndex: 24, columns: ['a'] });

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(api.getFocusedCell()!.rowIndex).toBe(22);
            expect(getRangeRowIds(api)).toEqual(['r18', 'r21']);
        });

        test('keeps the focused cell on its row when a transaction adds rows above it, without a focus event', async () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');
            const onCellFocused = vitest.fn();
            api.addEventListener('cellFocused', onCellFocused);

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });
            await asyncSetTimeout(0); // grid events reach API listeners asynchronously

            expect(api.getFocusedCell()).toMatchObject({ rowIndex: 25, rowPinned: null });
            expect(getFocusedRowId(api)).toBe('r22');
            expect(onCellFocused).not.toHaveBeenCalled();
            const focusedCells = TestGridsManager.getHTMLElement(api)!.querySelectorAll('.ag-cell-focus');
            expect([...focusedCells].map((cell) => cell.closest('[row-id]')!.getAttribute('row-id'))).toEqual(['r22']);
        });

        test('keeps the focused cell on its row while scrolled to the top', () => {
            const api = createGrid();
            api.setFocusedCell(2, 'a');

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getFocusedRowId(api)).toBe('r2');
        });

        test('keeps the focused cell on its row when a transaction removes rows above it', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r1' }] as Row[] });

            expect(api.getFocusedCell()!.rowIndex).toBe(20);
            expect(getFocusedRowId(api)).toBe('r22');
        });

        test('keeps the focused cell on its row when async transactions add rows above it', async () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');
            api.addCellRange({ rowStartIndex: 21, rowEndIndex: 24, columns: ['a'] });

            api.applyTransactionAsync({ add: createRows('a', 2), addIndex: 0 });
            api.applyTransactionAsync({ add: createRows('b', 1), addIndex: 0 });
            await waitForEvent('asyncTransactionsFlushed', api);

            expect(getFocusedRowId(api)).toBe('r22');
            expect(getRangeRowIds(api)).toEqual(['r21', 'r24']);
        });

        test('keeps the focused cell on its row when updated row data adds rows above it', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');

            api.setGridOption('rowData', [...createRows('new', 3), ...createRows('r', 200)]);

            expect(getFocusedRowId(api)).toBe('r22');
        });

        test('moves the focused cell to the row that takes the place of its removed row', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r22' }] as Row[] });

            expect(getFocusedRowId(api)).toBe('r23');
        });

        test('moves the focused cell to the row above when its removed row was the last row', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(199, 'a');

            api.applyTransaction({ remove: [{ id: 'r199' }] as Row[] });

            expect(getFocusedRowId(api)).toBe('r198');
        });

        test('moves the focused cell after the row above that is left when the rows next to its row are removed too', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r21' }, { id: 'r22' }] as Row[] });

            expect(api.getFocusedCell()!.rowIndex).toBe(20);
            expect(getFocusedRowId(api)).toBe('r23');
        });

        test('moves the focused cell to the last row left when the last rows are removed', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(199, 'a');

            api.applyTransaction({ remove: [{ id: 'r198' }, { id: 'r199' }] as Row[] });

            expect(api.getFocusedCell()!.rowIndex).toBe(197);
            expect(getFocusedRowId(api)).toBe('r197');
        });

        test('moves the focused cell to the row below that is left when every row above its row is removed', () => {
            const api = createGrid({ rowData: createRows('r', 50) });
            api.setFocusedCell(2, 'a');

            api.applyTransaction({
                add: createRows('new', 3),
                addIndex: 0,
                remove: [{ id: 'r0' }, { id: 'r1' }, { id: 'r2' }] as Row[],
            });

            expect(getFocusedRowId(api)).toBe('r3');
        });

        test.each([true, undefined])(
            'leaves the focused cell and cell ranges where they were when every row is removed, option %s',
            (maintainRowsInViewOnDataUpdate) => {
                const api = createGrid({ rowData: createRows('r', 50), maintainRowsInViewOnDataUpdate });
                api.setFocusedCell(22, 'a');
                api.addCellRange({ rowStartIndex: 21, rowEndIndex: 24, columns: ['a'] });

                api.applyTransaction({ remove: createRows('r', 50) });

                expect(api.getFocusedCell()!.rowIndex).toBe(22);
                const { startRow, endRow } = api.getCellRanges()![0];
                expect([startRow!.rowIndex, endRow!.rowIndex]).toEqual([21, 24]);
            }
        );

        test('does not move the focused cell of a pinned row', () => {
            const api = createGrid({ pinnedTopRowData: createRows('top', 1) });
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(0, 'a', 'top');

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(api.getFocusedCell()).toMatchObject({ rowIndex: 0, rowPinned: 'top' });
        });

        test('navigates from the row the focused cell followed', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });
            api.tabToNextCell();

            expect(api.getFocusedCell()).toMatchObject({ rowIndex: 25, column: api.getColumn('b') });
        });

        test.each(['fullRow', undefined] as const)(
            'keeps editing the cell the focused cell followed, edit type %s',
            (editType) => {
                const api = createGrid({ editType });
                scrollTo(api, SCROLL_TOP);
                api.setFocusedCell(22, 'a');
                api.startEditingCell({ rowIndex: 22, colKey: 'a' });

                api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

                expect(getFocusedRowId(api)).toBe('r22');
                expect(api.getEditingCells()).toEqual([expect.objectContaining({ rowIndex: 25, colId: 'a' })]);
            }
        );

        test('keeps a cell range on its rows when a transaction adds rows above it, with a change event', async () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.addCellRange({ rowStartIndex: 21, rowEndIndex: 24, columns: ['a', 'b'] });
            const onCellSelectionChanged = vitest.fn();
            api.addEventListener('cellSelectionChanged', onCellSelectionChanged);

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });
            await asyncSetTimeout(0); // grid events reach API listeners asynchronously

            expect(getRangeRowIds(api)).toEqual(['r21', 'r24']);
            expect(onCellSelectionChanged).toHaveBeenCalledWith(expect.objectContaining({ finished: true }));
        });

        test('grows a cell range by the rows added inside it', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.addCellRange({ rowStartIndex: 21, rowEndIndex: 24, columns: ['a'] });

            api.applyTransaction({ add: createRows('new', 2), addIndex: 23 });

            expect(getRangeRowIds(api)).toEqual(['r21', 'r24']);
            expect(api.getCellRanges()![0].endRow!.rowIndex).toBe(26);
        });

        test('keeps a cell range drawn upwards on its rows', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.addCellRange({ rowStartIndex: 24, rowEndIndex: 21, columns: ['a'] });

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getRangeRowIds(api)).toEqual(['r24', 'r21']);
        });

        test('moves the start of a cell range to the row that takes the place of its removed row', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.addCellRange({ rowStartIndex: 21, rowEndIndex: 24, columns: ['a'] });

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r21' }] as Row[] });

            expect(getRangeRowIds(api)).toEqual(['r22', 'r24']);
        });

        test('moves the end of a cell range after the row above that is left when the rows next to it are removed too', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.addCellRange({ rowStartIndex: 18, rowEndIndex: 22, columns: ['a'] });

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r21' }, { id: 'r22' }] as Row[] });

            expect(getRangeRowIds(api)).toEqual(['r18', 'r23']);
        });

        test('keeps the end of a cell range in the rows left when the last rows are removed', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            api.addCellRange({ rowStartIndex: 190, rowEndIndex: 199, columns: ['a'] });

            api.applyTransaction({ remove: [{ id: 'r198' }, { id: 'r199' }] as Row[] });

            expect(api.getCellRanges()![0].endRow!.rowIndex).toBe(197);
            expect(getRangeRowIds(api)).toEqual(['r190', 'r197']);
        });
    });

    describe('server-side row model', () => {
        const createGrid = async () => {
            const rowData = createRows('r', 60);
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                cellSelection: true,
                maintainRowsInViewOnDataUpdate: true,
                serverSideDatasource: {
                    getRows: ({ request, success }) =>
                        success({ rowData: rowData.slice(request.startRow, request.endRow), rowCount: rowData.length }),
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            return api;
        };

        test('keeps the focused cell and cell ranges on their rows when a transaction adds rows above them', async () => {
            const api = await createGrid();
            scrollTo(api, SCROLL_TOP);
            api.setFocusedCell(22, 'a');
            api.addCellRange({ rowStartIndex: 21, rowEndIndex: 24, columns: ['a'] });

            api.applyServerSideTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getFocusedRowId(api)).toBe('r22');
            expect(getRangeRowIds(api)).toEqual(['r21', 'r24']);
        });
    });
});
