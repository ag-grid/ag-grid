/**
 * `autoSizeStrategy.applyToUiActions` — the built-in auto-size UI actions reuse the configured
 * strategy instead of auto-sizing with default options. Covers the column menu, the context menu
 * and header double-click.
 *
 * jsdom returns 0 px for the fixed-position autosize dummy container, so `autoWidthCalc` falls back
 * to each column's `minWidth`. With explicit `minWidth`s the content pass is deterministic.
 * `mockGridLayout` gives the grid root a 1000 px width, so the `scaleUpToFitGridWidth` second pass
 * has a real grid width to spread into.
 *
 * Each test resets the widths after grid creation, because the initial strategy run has already
 * applied the same options — without the reset a broken UI action would still look correct.
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ValidationModule,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

import {
    ALL_SEVERITIES,
    GridColumns,
    TestGridsManager,
    mockGridLayout,
    openMenuOption,
    polyfillOffsetParent,
} from '../test-utils';

const RESET_WIDTH = 220;

describe('autoSizeStrategy applyToUiActions', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnAutoSizeModule,
            ColumnMenuModule,
            ContextMenuModule,
            ValidationModule,
        ],
    });

    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    const rowData = [{ a: 'x', b: 'y', c: 'z' }];

    const columnDefs = [
        { colId: 'a', field: 'a', minWidth: 100 },
        { colId: 'b', field: 'b', minWidth: 100 },
        { colId: 'c', field: 'c', minWidth: 100 },
    ];

    const totalWidth = (api: GridApi): number =>
        api.getAllDisplayedColumns().reduce((total, col) => total + col.getActualWidth(), 0);

    /** Puts every column at a width no auto-size pass would produce, so a no-op is visible. */
    const resetWidths = (api: GridApi): void => {
        api.setColumnWidths(columnDefs.map(({ colId }) => ({ key: colId, newWidth: RESET_WIDTH })));
    };

    describe('column menu', () => {
        test('Autosize All Columns honours scaleUpToFitGridWidth', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true, applyToUiActions: true },
            });
            resetWidths(api);

            api.showColumnMenu('a');
            await userEvent.click(await openMenuOption('Autosize All Columns'));

            // the content pass shrinks each col to its 100 px minWidth, then the scale-up pass fills the grid
            await waitFor(() => expect(totalWidth(api)).toBe(mockGridLayout.gridWidth));
            await new GridColumns(api, 'column menu autosize all scaled up to grid width').checkColumns(`
                CENTER
                ├── a "A" width:334
                ├── b "B" width:333
                └── c "C" width:333
            `);
        });

        test('Autosize All Columns honours columnLimits and defaultMinWidth', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    applyToUiActions: true,
                    defaultMinWidth: 150,
                    columnLimits: [{ colId: 'b', minWidth: 400 }],
                },
            });
            resetWidths(api);

            api.showColumnMenu('a');
            await userEvent.click(await openMenuOption('Autosize All Columns'));

            await waitFor(() => expect(api.getColumn('b')!.getActualWidth()).toBe(400));
            expect(api.getColumn('a')!.getActualWidth()).toBe(150);
            expect(api.getColumn('c')!.getActualWidth()).toBe(150);
        });

        test('Autosize This Column applies the strategy to the clicked column only', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    applyToUiActions: true,
                    defaultMinWidth: 250,
                    // colIds targets the initial run; a single-column UI action sizes what was clicked
                    colIds: ['c'],
                },
            });
            // the initial run targets `colIds` asynchronously — let it land before resetting
            await waitFor(() => expect(api.getColumn('c')!.getActualWidth()).toBe(250));
            resetWidths(api);

            api.showColumnMenu('a');
            await userEvent.click(await openMenuOption('Autosize This Column'));

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(250));
            expect(api.getColumn('b')!.getActualWidth()).toBe(RESET_WIDTH);
            expect(api.getColumn('c')!.getActualWidth()).toBe(RESET_WIDTH);
        });

        test('Autosize This Column does not absorb the grid width', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true, applyToUiActions: true },
            });
            await waitFor(() => expect(totalWidth(api)).toBe(mockGridLayout.gridWidth));
            resetWidths(api);

            api.showColumnMenu('a');
            await userEvent.click(await openMenuOption('Autosize This Column'));

            // sized to its content, not stretched over the space the other columns leave
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
            expect(api.getColumn('b')!.getActualWidth()).toBe(RESET_WIDTH);
        });

        test('widths match the default auto-size when applyToUiActions is not set', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true, defaultMinWidth: 150 },
            });
            resetWidths(api);

            api.showColumnMenu('a');
            await userEvent.click(await openMenuOption('Autosize All Columns'));

            // plain content fit: each col at its own 100 px minWidth — no scale-up, no defaultMinWidth
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
            expect(totalWidth(api)).toBe(300);
        });
    });

    describe('context menu', () => {
        test('Autosize All Columns honours the strategy options', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                // the default context menu has no autosize items
                getContextMenuItems: () => ['autoSizeAll'],
                autoSizeStrategy: { type: 'fitCellContents', applyToUiActions: true, defaultMinWidth: 300 },
            });
            resetWidths(api);

            api.showContextMenu({
                rowNode: api.getDisplayedRowAtIndex(0)!,
                column: api.getColumn('a')!,
                value: 'x',
                source: 'api',
            });
            await userEvent.click(await openMenuOption('Autosize All Columns'));

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(300));
            expect(totalWidth(api)).toBe(900);
        });
    });

    describe('header double-click', () => {
        test('honours the strategy options', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', applyToUiActions: true, defaultMinWidth: 300 },
            });
            resetWidths(api);

            const resizeHandle = document.querySelector<HTMLElement>(
                '.ag-header-cell[col-id="a"] .ag-header-cell-resize'
            )!;
            resizeHandle.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(300));
            expect(api.getColumn('b')!.getActualWidth()).toBe(RESET_WIDTH);
        });
    });

    describe('the auto-size API is unaffected', () => {
        test('autoSizeAllColumns uses only the params it was given', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', applyToUiActions: true, defaultMinWidth: 300 },
            });
            resetWidths(api);

            api.autoSizeAllColumns({});

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
        });
    });

    describe('validation', () => {
        test('applyToUiActions on a non-fitCellContents strategy warns and leaves UI actions alone', async () => {
            // this test deliberately misconfigures the strategy, which warns #318
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [318] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                // deliberately not valid TypeScript — this guards the JavaScript path
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 600, applyToUiActions: true } as any,
            });

            expect(warn.mock.calls.flat().join(' ')).toContain('applyToUiActions');
            resetWidths(api);

            api.showColumnMenu('a');
            await userEvent.click(await openMenuOption('Autosize All Columns'));

            // plain content fit, not a re-run of fitProvidedWidth
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
            expect(totalWidth(api)).toBe(300);
        });
    });
});
