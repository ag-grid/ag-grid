/**
 * `autoSizeStrategy.applyToUiActions` — the Column Menu and Context Menu auto-size actions reusing
 * the configured strategy's options.
 *
 * jsdom reports 0 px for the autosize measuring container, so a content fit lands each column on
 * its effective minimum. That makes the strategy's `defaultMinWidth` and `columnLimits` the
 * observable difference between an opted-in action and the default one, which sizes to the
 * column's own `minWidth`.
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, openMenuOption, polyfillOffsetParent } from '../test-utils';

describe('autoSizeStrategy applyToUiActions', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    let restoreOffsetParent: (() => void) | undefined;

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    const columnDefs = [
        { field: 'athlete', minWidth: 100, width: 300 },
        { field: 'country', minWidth: 100, width: 300 },
    ];

    const rowData = [{ athlete: 'Michael Phelps', country: 'United States' }];

    const widths = (api: GridApi): number[] => api.getAllDisplayedColumns().map((col) => col.getActualWidth());

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
                columnDefs,
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
                columnDefs,
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
                columnDefs,
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
                columnDefs,
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
                columnDefs,
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
                columnDefs,
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
                columnDefs,
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

        test('the strategy colIds do not restrict which columns a UI action sizes', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
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
        test('fitGridWidth leaves the menu action at default content sizing', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitGridWidth', defaultMinWidth: 250 },
            });
            restoreOffsetParent = polyfillOffsetParent();
            await settleThenReset(api, [300, 300]);

            api.showColumnMenu('athlete');
            await clickMenuOption('Autosize All Columns');

            expect(widths(api)).toEqual([100, 100]);
        });

        test('fitProvidedWidth leaves the menu action at default content sizing', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
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
