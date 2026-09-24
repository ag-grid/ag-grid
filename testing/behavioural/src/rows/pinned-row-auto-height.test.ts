import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver, triggerResizeObservers } from 'ag-test-utils/polyfills/mockResizeObserver';

import type { GridApi, GridOptions, IViewportDatasourceParams } from 'ag-grid-community';
import {
    InfiniteRowModelModule,
    PinnedRowModule,
    RowApiModule,
    RowAutoHeightModule,
    enableDevValidations,
} from 'ag-grid-community';
import { ViewportRowModelModule } from 'ag-grid-enterprise';

/** happy-dom lays nothing out, so every height the grid measures comes from {@link cellHeights}, keyed
 *  `rowIndex:colId` (or `*:colId` for every row). */
describe('Auto height of pinned rows in the infinite and viewport row models', () => {
    const gridsManager = new TestGridsManager({
        modules: [InfiniteRowModelModule, PinnedRowModule, RowApiModule, RowAutoHeightModule, ViewportRowModelModule],
    });

    const DEFAULT_ROW_HEIGHT = 42;

    const cellHeights = new Map<string, number>();

    let uninstallResizeObserver: () => void;
    let warn: ReturnType<typeof vi.spyOn>;

    beforeAll(() => {
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) => {
            if (!el.classList.contains('ag-cell-wrapper') || !el.isConnected) {
                return undefined;
            }
            const colId = el.closest('.ag-cell')?.getAttribute('col-id');
            const rowIndex = el.closest('.ag-row')?.getAttribute('row-index');
            return cellHeights.get(`${rowIndex}:${colId}`) ?? cellHeights.get(`*:${colId}`);
        };
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.elementHeightOverride = undefined;
    });

    beforeEach(() => {
        uninstallResizeObserver = installMockResizeObserver();
        // Deliberate: auto height is not supported by either model, which warning 309 says.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [309] });
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        expect(warn.mock.calls.flat().join(' ')).toContain('warning #309');
        warn.mockRestore();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        uninstallResizeObserver();
        cellHeights.clear();
        gridsManager.reset();
    });

    const rowData = (count: number): { a: string; b: string }[] =>
        Array.from({ length: count }, (_, i) => ({ a: `a${i}`, b: `b${i}` }));

    const baseOptions: GridOptions = {
        columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
        pinnedTopRowData: [
            { a: 'p0', b: 'p0' },
            { a: 'p1', b: 'p1' },
        ],
    };

    const settle = async (): Promise<void> => {
        await asyncSetTimeout(0);
        await nextAnimationFrame();
        await asyncSetTimeout(0);
    };

    /** The body rows sit at fixed offsets and are never sized, so only the pinned rows restack. */
    const expectSecondPinnedRowAt = (api: GridApi, top: number): void => {
        expect(api.getPinnedTopRow(1)!.rowTop).toBe(top);
        const eRow = document.querySelector<HTMLElement>('.ag-row[row-index="t-1"]')!;
        expect(eRow.style.transform || eRow.style.top).toContain(`${top}px`);
    };

    const expectPinnedRowsRestackWhenOneGrows = async (api: GridApi): Promise<void> => {
        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.data).toBeDefined());
        await waitFor(() => expect(api.getPinnedTopRow(0)!.rowHeight).toBe(90));
        await settle();
        expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(DEFAULT_ROW_HEIGHT);
        expectSecondPinnedRowAt(api, 90);

        // Grown once nothing else will redraw: the pinned row below still has to move down.
        cellHeights.set('t-0:b', 130);
        triggerResizeObservers();
        await waitFor(() => expect(api.getPinnedTopRow(0)!.rowHeight).toBe(130));
        await settle();

        expectSecondPinnedRowAt(api, 130);
    };

    test('a pinned row grown by auto height moves the pinned rows below it, infinite row model', async () => {
        cellHeights.set('*:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            ...baseOptions,
            rowModelType: 'infinite',
            datasource: { getRows: (params) => params.successCallback(rowData(5), 5) },
        });

        await expectPinnedRowsRestackWhenOneGrows(api);
    });

    test('a pinned row grown by auto height moves the pinned rows below it, viewport row model', async () => {
        cellHeights.set('*:b', 90);
        let ds: IViewportDatasourceParams;
        const api = gridsManager.createGrid('myGrid', {
            ...baseOptions,
            rowModelType: 'viewport',
            viewportDatasource: {
                init: (params) => {
                    ds = params;
                    params.setRowCount(5);
                },
                setViewportRange: (firstRow, lastRow) => {
                    const data: Record<number, { a: string; b: string }> = {};
                    for (let i = firstRow; i <= lastRow; i++) {
                        data[i] = { a: `a${i}`, b: `b${i}` };
                    }
                    ds.setRowData(data);
                },
            },
        });

        await expectPinnedRowsRestackWhenOneGrows(api);
    });
});
