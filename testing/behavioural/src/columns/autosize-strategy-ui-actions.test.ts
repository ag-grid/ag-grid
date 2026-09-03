/**
 * `autoSizeStrategy.applyToUiActions` — the Column Menu and Context Menu auto-size actions reusing
 * the configured strategy's options.
 *
 * Cell content is measured in a container happy-dom sizes at 0 px, so a content fit lands each column
 * on its effective minimum: `defaultMinWidth` and `columnLimits` are what separates an opted-in
 * action from the default one, which sizes to the column's own `minWidth`.
 *
 * Options derived from the grid's own width — `scaleUpToFitGridWidth`, and the width-based
 * strategies — resolve zero without `mockGridLayout.useRealOffsetDimensions`, so those cases turn
 * it on. It stays scoped to them: enabling it for the whole file leaks into other suites.
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, mockGridLayout, openMenuOption, polyfillOffsetParent } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('autoSizeStrategy applyToUiActions', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        mockGridLayout.useRealOffsetDimensions = false;
    });

    const makeColumnDefs = () => [
        { field: 'athlete', minWidth: 100, width: 300 },
        { field: 'country', minWidth: 100, width: 300 },
    ];

    const rowData = [{ athlete: 'Michael Phelps', country: 'United States' }];

    const widths = (api: GridApi): number[] => api.getAllDisplayedColumns().map((col) => col.getActualWidth());

    const totalWidth = (api: GridApi): number => widths(api).reduce((sum, w) => sum + w, 0);

    /**
     * Every strategy also applies on first data render. Wait for that to land, then reset widths,
     * so whatever the assertion sees afterwards is the work of the menu action alone.
     */
    const settleThenReset = async (api: GridApi, afterInitialRun: number[]): Promise<void> => {
        await waitFor(() => expect(widths(api)).toEqual(afterInitialRun));
        api.setColumnWidths(api.getAllDisplayedColumns().map((col) => ({ key: col, newWidth: 300 })));
    };

    const clickMenuOption = async (name: string): Promise<void> => {
        const option = await openMenuOption(name);
        await userEvent.click(option);
    };

    describe('fitCellContents', () => {
        test('column menu autosize-all reuses the strategy when opted in', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 250, applyToUiActions: true },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([250, 250]);
        });

        test('column menu autosize-all ignores the strategy by default', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 250 },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([100, 100]);
        });

        test('column menu autosize-this reuses the strategy when opted in', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 250, applyToUiActions: true },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize This Column');

            expect(widths(api)).toEqual([250, 300]);
        });

        test('column menu autosize-this ignores the strategy by default', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 250 },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize This Column');

            expect(widths(api)).toEqual([100, 300]);
        });

        test('context menu autosize-all reuses the strategy when opted in', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 250, applyToUiActions: true },
                getContextMenuItems: () => ['autoSizeAll'],
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showContextMenu({
                rowNode: api.getDisplayedRowAtIndex(0),
                column: api.getColumn('athlete'),
                value: 'Michael Phelps',
                source: 'ui',
            });
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([250, 250]);
        });

        test('context menu autosize-all ignores the strategy by default', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 250 },
                getContextMenuItems: () => ['autoSizeAll'],
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showContextMenu({
                rowNode: api.getDisplayedRowAtIndex(0),
                column: api.getColumn('athlete'),
                value: 'Michael Phelps',
                source: 'ui',
            });
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([100, 100]);
        });

        test('per-column limits from the strategy are honoured', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    defaultMinWidth: 250,
                    columnLimits: [{ colId: 'country', minWidth: 400 }],
                    applyToUiActions: true,
                },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 400]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([250, 400]);
        });

        test('scaleUpToFitGridWidth from the strategy is honoured', async () => {
            mockGridLayout.useRealOffsetDimensions = true;
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    scaleUpToFitGridWidth: true,
                    applyToUiActions: true,
                },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await waitFor(() => expect(totalWidth(api)).toBeGreaterThan(mockGridLayout.gridWidth * 0.9));

            api.setColumnWidths(api.getAllDisplayedColumns().map((col) => ({ key: col, newWidth: 100 })));
            expect(totalWidth(api)).toBe(200);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            // scaled back up to fill the grid rather than left at the content width
            await waitFor(() => expect(totalWidth(api)).toBeGreaterThan(mockGridLayout.gridWidth * 0.9));
        });

        test('skipHeaderOnAutoSize still applies when the strategy does not set skipHeader', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                skipHeaderOnAutoSize: true,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 250, applyToUiActions: true },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            // the strategy contributes defaultMinWidth without clobbering skipHeaderOnAutoSize
            expect(widths(api)).toEqual([250, 250]);
            expect(api.getGridOption('skipHeaderOnAutoSize')).toBe(true);
        });

        test('the strategy skipHeader takes precedence over skipHeaderOnAutoSize', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                skipHeaderOnAutoSize: true,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    skipHeader: false,
                    defaultMinWidth: 250,
                    applyToUiActions: true,
                },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 250]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([250, 250]);
        });

        test('the strategy colIds do not restrict which columns a UI action sizes', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    defaultMinWidth: 250,
                    colIds: ['athlete'],
                    applyToUiActions: true,
                },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [250, 300]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([250, 250]);
        });
    });

    // The flag lives on `fitCellContents`, the only strategy whose options the menus can reuse.
    // These assert the width-based strategies leave the menu actions exactly as they are today.
    describe('width-based strategies', () => {
        beforeEach(() => {
            mockGridLayout.useRealOffsetDimensions = true;
        });

        test('fitGridWidth leaves the menu action at default content sizing', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitGridWidth', defaultMinWidth: 250 },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [500, 500]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([100, 100]);
        });

        test('fitProvidedWidth leaves the menu action at default content sizing', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: makeColumnDefs(),
                rowData,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900 },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [450, 450]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([100, 100]);
        });
    });
});
