import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('sort priority announcements', () => {
    const grids = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const rowData = [{ gold: 2, total: 3, athlete: 'Alice', country: 'Ireland' }];
    const shortcuts = 'Press ENTER to sort. Press ALT DOWN to open column menu';

    afterEach(() => grids.reset());

    async function expectAnnouncement(api: GridApi, expected: string): Promise<void> {
        await waitFor(() => {
            const text = getGridElement(api)!.querySelector('.ag-aria-description-container')?.textContent;
            expect(text?.replace(/\u200B/g, '')).toBe(expected);
        });
    }

    test('announces priority before shortcuts when navigating between sorted headers', async () => {
        const api = await grids.createGridAndWait('sort-aria', {
            columnDefs: [{ field: 'gold', sort: 'desc' }, { field: 'total', sort: 'asc' }, { field: 'athlete' }],
            rowData,
        });

        api.setFocusedHeader('gold');
        await expectAnnouncement(api, `Sort priority 1 of 2. ${shortcuts}`);
        expect(document.activeElement?.getAttribute('aria-sort')).toBe('descending');

        await userEvent.keyboard('{ArrowRight}');
        await expectAnnouncement(api, `Sort priority 2 of 2. ${shortcuts}`);
        expect(document.activeElement?.getAttribute('col-id')).toBe('total');
        expect(document.activeElement?.getAttribute('aria-sort')).toBe('ascending');

        await userEvent.keyboard('{ArrowRight}');
        await expectAnnouncement(api, shortcuts);
        expect(document.activeElement?.getAttribute('aria-sort')).toBe('none');
    });

    test('updates priorities after column state reorders, adds and removes sort keys', async () => {
        const api = await grids.createGridAndWait('sort-state-aria', {
            columnDefs: [
                { field: 'gold', sort: 'desc', sortIndex: 1 },
                { field: 'total', sort: 'asc', sortIndex: 0 },
                { field: 'athlete' },
            ],
            rowData,
        });

        api.setFocusedHeader('gold');
        await expectAnnouncement(api, `Sort priority 2 of 2. ${shortcuts}`);

        api.applyColumnState({
            state: [
                { colId: 'gold', sortIndex: 0 },
                { colId: 'total', sortIndex: 1 },
                { colId: 'athlete', sort: 'asc', sortIndex: 2 },
            ],
        });
        api.setFocusedHeader('total');
        await expectAnnouncement(api, `Sort priority 2 of 3. ${shortcuts}`);
        api.setFocusedHeader('gold');
        await expectAnnouncement(api, `Sort priority 1 of 3. ${shortcuts}`);

        api.applyColumnState({ state: [{ colId: 'total', sort: null }] });
        api.setFocusedHeader('athlete');
        await expectAnnouncement(api, `Sort priority 2 of 2. ${shortcuts}`);

        api.applyColumnState({ state: [{ colId: 'athlete', sort: null }] });
        api.setFocusedHeader('gold');
        await expectAnnouncement(api, shortcuts);
        expect(document.activeElement?.getAttribute('aria-sort')).toBe('descending');
    });

    test('announces priority changes from Shift+Enter without moving focus', async () => {
        const api = await grids.createGridAndWait('sort-keyboard-aria', {
            columnDefs: [{ field: 'gold', sort: 'desc' }, { field: 'total' }],
            rowData,
        });

        api.setFocusedHeader('total');
        await expectAnnouncement(api, shortcuts);
        const header = document.activeElement;

        await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
        await expectAnnouncement(api, `Sort priority 2 of 2. ${shortcuts}`);
        expect(document.activeElement).toBe(header);
        expect(header?.getAttribute('aria-sort')).toBe('ascending');

        await userEvent.keyboard('{Shift>}{Enter}{Enter}{/Shift}');
        await expectAnnouncement(api, shortcuts);
        expect(document.activeElement).toBe(header);
        expect(header?.getAttribute('aria-sort')).toBe('none');
    });

    test('announces API priority changes without moving focus', async () => {
        const api = await grids.createGridAndWait('sort-focused-state-aria', {
            columnDefs: [
                { field: 'gold', sort: 'desc', sortIndex: 0 },
                { field: 'total', sort: 'asc', sortIndex: 1 },
            ],
            rowData,
        });

        api.setFocusedHeader('gold');
        await expectAnnouncement(api, `Sort priority 1 of 2. ${shortcuts}`);
        const header = document.activeElement;

        api.applyColumnState({
            state: [
                { colId: 'gold', sortIndex: 1 },
                { colId: 'total', sortIndex: 0 },
            ],
        });
        await expectAnnouncement(api, `Sort priority 2 of 2. ${shortcuts}`);
        expect(document.activeElement).toBe(header);

        api.applyColumnState({ state: [{ colId: 'total', sort: null }] });
        await expectAnnouncement(api, shortcuts);
        expect(document.activeElement).toBe(header);
    });

    test.each(['initial', 'API'] as const)('announces %s sort priorities on non-sortable columns', async (source) => {
        const api = await grids.createGridAndWait('sort-fixed-aria', {
            columnDefs: [
                { field: 'gold', sort: source === 'initial' ? 'desc' : undefined },
                { field: 'total', sort: source === 'initial' ? 'asc' : undefined },
            ],
            defaultColDef: { sortable: false },
            rowData,
        });

        if (source === 'API') {
            api.applyColumnState({
                state: [
                    { colId: 'gold', sort: 'desc', sortIndex: 0 },
                    { colId: 'total', sort: 'asc', sortIndex: 1 },
                ],
            });
        }

        api.setFocusedHeader('gold');
        await expectAnnouncement(api, 'Sort priority 1 of 2. Press ALT DOWN to open column menu');
        await userEvent.keyboard('{ArrowRight}');
        await expectAnnouncement(api, 'Sort priority 2 of 2. Press ALT DOWN to open column menu');
    });

    test('supports reordered locale placeholders and the column-selection sort shortcut', async () => {
        const api = await grids.createGridAndWait('sort-locale-aria', {
            columnDefs: [
                { field: 'gold', sort: 'desc' },
                { field: 'total', sort: 'asc' },
            ],
            rowData,
            cellSelection: { enableColumnSelection: true },
            localeText: { ariaSortPriority: 'Of ${count} sort keys, priority ${priority}' },
        });

        api.setFocusedHeader('gold');
        await expectAnnouncement(
            api,
            'Of 2 sort keys, priority 1. Press ALT ENTER to sort. Press ALT DOWN to open column menu. ' +
                'Press Enter to toggle selection for all visible cells in this column'
        );
    });

    test('provides priority and count to the locale callback', async () => {
        const api = await grids.createGridAndWait('sort-callback-aria', {
            columnDefs: [
                { field: 'gold', sort: 'desc' },
                { field: 'total', sort: 'asc' },
            ],
            rowData,
            getLocaleText: ({ key, defaultValue, variableValues }) =>
                key === 'ariaSortPriority'
                    ? `Of ${variableValues![1]} sort keys, priority ${variableValues![0]}`
                    : defaultValue,
        });

        api.setFocusedHeader('total');
        await expectAnnouncement(api, `Of 2 sort keys, priority 2. ${shortcuts}`);
    });

    test('counts a coupled group column and its source as one display priority', async () => {
        const api = await grids.createGridAndWait('sort-group-aria', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sort: 'asc', sortIndex: 0 },
                { field: 'gold', sort: 'desc', sortIndex: 1 },
            ],
            rowData,
        });

        const groupColumn = api.getAllDisplayedColumns()[0];
        api.setFocusedHeader(groupColumn);
        await expectAnnouncement(api, `Sort priority 1 of 2. ${shortcuts}`);
        expect(document.activeElement?.querySelector('.ag-sort-order')?.textContent).toBe('1');
        api.setFocusedHeader('gold');
        await expectAnnouncement(api, `Sort priority 2 of 2. ${shortcuts}`);
        expect(document.activeElement?.querySelector('.ag-sort-order')?.textContent).toBe('2');
    });
});
