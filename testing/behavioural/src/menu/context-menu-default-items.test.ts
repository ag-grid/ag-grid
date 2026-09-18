import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, fireGridPointerDown, openMenuEntries, polyfillOffsetParent } from 'ag-test-utils';

import type { DefaultMenuItem, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, CsvExportModule, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule, ContextMenuModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

function cell(gridDiv: HTMLElement, rowIndex: number, colId: string): HTMLElement {
    const el = gridDiv.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`);
    if (!el) {
        throw new Error(`No cell rendered at row ${rowIndex}, column ${colId}`);
    }
    return el;
}

function rightClick(element: HTMLElement): void {
    fireGridPointerDown(element, { button: 2, buttons: 2 });
    element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
const rowData = [
    { athlete: 'Michael Phelps', age: 23 },
    { athlete: 'Natalie Coughlin', age: 25 },
];

const CLIPBOARD_ITEMS: DefaultMenuItem[] = [
    'cut',
    'copy',
    'copyWithHeaders',
    'copyWithGroupHeaders',
    'paste',
    'separator',
];
const CLIPBOARD_ENTRIES = ['Cut', 'Copy', 'Copy with Headers', 'Copy with Group Headers', 'Paste', 'separator'];

/**
 * Pins the stock context-menu items a right-click offers by default, and how they render, for each feature that
 * contributes items. The menu code is being refactored so that each feature owns its items; these assertions are
 * the behaviour that refactor must preserve.
 */
describe('Context menu default items', () => {
    const enterpriseGrids = new TestGridsManager({ modules: [AllEnterpriseModule.with(AgChartsEnterpriseModule)] });
    const communityGrids = new TestGridsManager({
        modules: [ClientSideRowModelModule, ContextMenuModule, CsvExportModule],
    });

    afterEach(() => {
        enterpriseGrids.reset();
        communityGrids.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    /** Right-clicks the first athlete cell and resolves with the `defaultItems` the grid offered. */
    async function defaultItemsFor(
        grids: TestGridsManager,
        id: string,
        options: GridOptions,
        modules?: Module[]
    ): Promise<{ defaultItems: DefaultMenuItem[] | undefined; entries: () => string[] }> {
        let seen: DefaultMenuItem[] | undefined;
        let called = false;
        const api = await grids.createGridAndWait(
            id,
            {
                columnDefs,
                rowData,
                ...options,
                getContextMenuItems: (params) => {
                    seen = params.defaultItems;
                    called = true;
                    return params.defaultItems ?? [];
                },
            },
            { modules }
        );
        restoreOffsetParent = polyfillOffsetParent();
        rightClick(cell(getGridElement(api)! as HTMLElement, 0, 'athlete'));
        await waitFor(() => expect(called).toBe(true));
        return { defaultItems: seen, entries: openMenuEntries };
    }

    test('a cell offers the clipboard items and export', async () => {
        const { defaultItems, entries } = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsCell', {});
        expect(defaultItems).toEqual([...CLIPBOARD_ITEMS, 'export']);
        await waitFor(() => expect(entries()).toEqual([...CLIPBOARD_ENTRIES, 'Export']));
    });

    test('suppressCutToClipboard drops only cut', async () => {
        const { defaultItems } = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsNoCut', {
            suppressCutToClipboard: true,
        });
        expect(defaultItems).toEqual([...CLIPBOARD_ITEMS.slice(1), 'export']);
    });

    test('suppressing every export format drops the export item', async () => {
        const { defaultItems } = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsNoExport', {
            suppressCsvExport: true,
            suppressExcelExport: true,
            suppressPdfExport: true,
        });
        expect(defaultItems).toEqual(CLIPBOARD_ITEMS);
    });

    test('without the clipboard module only export remains, offering the registered formats', async () => {
        const { defaultItems, entries } = await defaultItemsFor(communityGrids, 'ctxDefaultsCommunity', {});
        expect(defaultItems).toEqual(['export']);
        await waitFor(() => expect(entries()).toEqual(['Export']));
    });

    test('a calculated column cell offers removal between separators', async () => {
        const { defaultItems, entries } = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsCalculated', {
            calculatedColumns: true,
            // the right-clicked 'athlete' column is the calculated one
            columnDefs: [
                { field: 'age' },
                { colId: 'athlete', headerName: 'Twice', calculatedExpression: '[age] * 2' },
            ],
        });
        expect(defaultItems).toEqual([
            ...CLIPBOARD_ITEMS,
            'separator',
            'removeCalculatedColumn',
            'separator',
            'export',
        ]);
        await waitFor(() =>
            expect(entries()).toEqual([...CLIPBOARD_ENTRIES, 'Remove Calculated Column', 'separator', 'Export'])
        );
    });

    test('a notes data source adds the note item, rendered as its own group', async () => {
        const { defaultItems, entries } = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsNotes', {
            getRowId: ({ data }) => data.athlete,
            notesDataSource: { getNote: () => undefined, setNote: () => {} },
        });
        expect(defaultItems).toEqual([...CLIPBOARD_ITEMS, 'note', 'export']);
        await waitFor(() => expect(entries()).toEqual([...CLIPBOARD_ENTRIES, 'Add Note', 'separator', 'Export']));
    });

    test('enableRowPinning adds the pin row sub menu unless isRowPinnable declines', async () => {
        const pinnable = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsPinnable', { enableRowPinning: true });
        expect(pinnable.defaultItems).toEqual([...CLIPBOARD_ITEMS, 'pinRowSubMenu', 'export']);
        await waitFor(() => expect(pinnable.entries()).toEqual([...CLIPBOARD_ENTRIES, 'Pin Row', 'Export']));
        enterpriseGrids.reset();

        const declined = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsNotPinnable', {
            enableRowPinning: true,
            isRowPinnable: () => false,
        });
        expect(declined.defaultItems).toEqual([...CLIPBOARD_ITEMS, 'export']);
    });

    test('enableCharts adds the chart range item when the right-click selects a range', async () => {
        const withRange = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsChartsRange', {
            enableCharts: true,
            cellSelection: true,
        });
        expect(withRange.defaultItems).toEqual([...CLIPBOARD_ITEMS, 'chartRange', 'export']);
        await waitFor(() => expect(withRange.entries()).toEqual([...CLIPBOARD_ENTRIES, 'Chart Range', 'Export']));
        enterpriseGrids.reset();

        // without cell selection the right-click selects nothing, so there is no range to chart
        const noRange = await defaultItemsFor(enterpriseGrids, 'ctxDefaultsChartsNoRange', { enableCharts: true });
        expect(noRange.defaultItems).toEqual([...CLIPBOARD_ITEMS, 'export']);
    });

    test('a column-level contextMenuItems array replaces the default items', async () => {
        const api = await enterpriseGrids.createGridAndWait('ctxDefaultsColumnOverride', {
            columnDefs: [{ field: 'athlete', contextMenuItems: ['copy', 'export'] }, { field: 'age' }],
            rowData,
        });
        restoreOffsetParent = polyfillOffsetParent();
        rightClick(cell(getGridElement(api)! as HTMLElement, 0, 'athlete'));
        await waitFor(() => expect(openMenuEntries()).toEqual(['Copy', 'Export']));
    });
});
