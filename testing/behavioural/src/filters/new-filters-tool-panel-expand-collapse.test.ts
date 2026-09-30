import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';

import type { GridApi, NewFiltersToolPanelState } from 'ag-grid-community';
import { enableDevValidations, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('new filters tool panel expandFilters / collapseFilters', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        { name: 'Alice', age: 30, country: 'UK' },
        { name: 'Bob', age: 25, country: 'US' },
    ];

    function createGrid(filters: NewFiltersToolPanelState['filters']): GridApi {
        return gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }, { field: 'age' }, { field: 'country' }],
            defaultColDef: { filter: true },
            rowData,
            sideBar: 'filters-new',
            enableFilterHandlers: true,
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: { 'filters-new': { filters } },
                },
            },
        });
    }

    /** Reads the expanded state of each filter card, keyed by card title. */
    function getCardExpandedStates(api: GridApi): Record<string, boolean> {
        const states: Record<string, boolean> = {};
        for (const card of getGridElement(api)!.querySelectorAll('.ag-filter-card:not(.ag-filter-card-add)')) {
            const title = card.querySelector('.ag-filter-card-title')!.textContent!;
            states[title] = card.querySelector('.ag-filter-card-expand')!.getAttribute('aria-expanded') === 'true';
        }
        return states;
    }

    async function waitForCards(api: GridApi, expected: Record<string, boolean>): Promise<void> {
        await waitFor(() => expect(getCardExpandedStates(api)).toEqual(expected));
    }

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('expandFilters() and collapseFilters() with no colIds apply to every card', async () => {
        const api = createGrid([{ colId: 'name' }, { colId: 'age' }, { colId: 'country', expanded: true }]);
        await waitForCards(api, { Name: false, Age: false, Country: true });

        api.getToolPanelInstance('filters-new')!.expandFilters();
        await waitForCards(api, { Name: true, Age: true, Country: true });
        expect(api.getState().sideBar?.toolPanels['filters-new']).toEqual({
            filters: [
                { colId: 'name', expanded: true },
                { colId: 'age', expanded: true },
                { colId: 'country', expanded: true },
            ],
        });

        api.getToolPanelInstance('filters-new')!.collapseFilters();
        await waitForCards(api, { Name: false, Age: false, Country: false });
    });

    test('expandFilters(colIds) and collapseFilters(colIds) only apply to the supplied cards', async () => {
        const api = createGrid([{ colId: 'name' }, { colId: 'age' }, { colId: 'country' }]);
        await waitForCards(api, { Name: false, Age: false, Country: false });

        api.getToolPanelInstance('filters-new')!.expandFilters(['name', 'country']);
        await waitForCards(api, { Name: true, Age: false, Country: true });

        api.getToolPanelInstance('filters-new')!.collapseFilters(['country']);
        await waitForCards(api, { Name: true, Age: false, Country: false });
    });

    test('keeps the existing filter instance for cards already in the requested state', async () => {
        const api = createGrid([{ colId: 'name', expanded: true }, { colId: 'age' }]);
        await waitForCards(api, { Name: true, Age: false });
        const nameInput = getGridElement(api)!.querySelector('.ag-filter-card:not(.ag-filter-card-add) input');
        expect(nameInput).toBeTruthy();

        api.getToolPanelInstance('filters-new')!.expandFilters();
        await waitForCards(api, { Name: true, Age: true });

        expect(getGridElement(api)!.querySelector('.ag-filter-card:not(.ag-filter-card-add) input')).toBe(nameInput);
    });

    test('warns #167 for colIds without a card and does not add a card for them', async () => {
        // This test deliberately supplies colIds without a card, which warns #167.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [167] });
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid([{ colId: 'name' }]);
        await waitForCards(api, { Name: false });

        api.getToolPanelInstance('filters-new')!.expandFilters(['name', 'age', 'unknown']);
        await waitForCards(api, { Name: true });

        const warnings = consoleWarnSpy.mock.calls.filter((call) => String(call[0]).includes('warning #167'));
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContainEqual(['age', 'unknown']);
    });
});
