import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, NewFiltersToolPanelState } from 'ag-grid-community';
import { enableDevValidations, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('new filters tool panel setFilters', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        { name: 'Alice', age: 30, country: 'UK' },
        { name: 'Bob', age: 25, country: 'US' },
        { name: 'Carol', age: 30, country: 'US' },
    ];

    const COLUMN_DEFS: ColDef[] = [
        { field: 'name', filter: 'agTextColumnFilter' },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'country', filter: 'agSetColumnFilter' },
    ];

    function createGrid(
        filters: NewFiltersToolPanelState['filters'],
        options: Partial<GridOptions> = {},
        columnDefs: ColDef[] = COLUMN_DEFS
    ): GridApi {
        return gridsManager.createGrid('myGrid', {
            columnDefs,
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
            ...options,
        });
    }

    /** Reads each filter card's title and expanded state, in display order. */
    function getCards(api: GridApi): [string, boolean][] {
        return Array.from(getGridElement(api)!.querySelectorAll('.ag-filter-card:not(.ag-filter-card-add)'), (card) => [
            card.querySelector('.ag-filter-card-title')!.textContent!,
            card.querySelector('.ag-filter-card-expand')!.getAttribute('aria-expanded') === 'true',
        ]);
    }

    async function waitForCards(api: GridApi, expected: [string, boolean][]): Promise<void> {
        await waitFor(() => expect(getCards(api)).toEqual(expected));
    }

    function toolPanel(api: GridApi) {
        return api.getToolPanelInstance('filters-new')!;
    }

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('an empty array removes every card and clears their filters', async () => {
        const api = createGrid([{ colId: 'name' }, { colId: 'age', expanded: true }]);
        api.setColumnFilterModel('age', { filterType: 'number', type: 'equals', filter: 30 });
        api.onFilterChanged();
        await waitForCards(api, [
            ['Name', false],
            ['Age', true],
        ]);
        expect(api.getDisplayedRowCount()).toBe(2);

        toolPanel(api).setFilters([]);
        await waitForCards(api, []);
        await asyncSetTimeout(0);

        expect(getCards(api)).toEqual([]);
        expect(api.getFilterModel()).toEqual({});
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(toolPanel(api).getState()).toEqual({ filters: [] });
    });

    test('shows cards in the requested order, keeping the expanded state of existing cards', async () => {
        const api = createGrid([{ colId: 'name' }, { colId: 'age', expanded: true }, { colId: 'country' }]);
        await waitForCards(api, [
            ['Name', false],
            ['Age', true],
            ['Country', false],
        ]);
        const ageInput = getGridElement(api)!.querySelector('.ag-filter-card:not(.ag-filter-card-add) input');
        expect(ageInput).toBeTruthy();

        toolPanel(api).setFilters(['country', 'age', 'name']);
        await waitForCards(api, [
            ['Country', false],
            ['Age', true],
            ['Name', false],
        ]);

        expect(getGridElement(api)!.querySelector('.ag-filter-card:not(.ag-filter-card-add) input')).toBe(ageInput);
        expect(api.getState().sideBar?.toolPanels['filters-new']).toEqual({
            filters: [
                { colId: 'country', expanded: false },
                { colId: 'age', expanded: true },
                { colId: 'name', expanded: false },
            ],
        });
    });

    test('adds missing cards collapsed and removes cards not listed', async () => {
        const api = createGrid([{ colId: 'name', expanded: true }, { colId: 'age' }]);
        await waitForCards(api, [
            ['Name', true],
            ['Age', false],
        ]);

        toolPanel(api).setFilters(['name', 'country']);
        await waitForCards(api, [
            ['Name', true],
            ['Country', false],
        ]);
    });

    test('removing a card clears only that column filter, the same as setState', async () => {
        const filterModel = {
            age: { filterType: 'number', type: 'equals', filter: 30 },
            name: { filterType: 'text', type: 'equals', filter: 'Alice' },
        };
        const filters = [{ colId: 'name' }, { colId: 'age' }];

        const api = createGrid(filters, {});
        api.setFilterModel(filterModel);
        await waitForCards(api, [
            ['Name', false],
            ['Age', false],
        ]);
        expect(api.getDisplayedRowCount()).toBe(1);

        toolPanel(api).setFilters(['name']);
        await waitForCards(api, [['Name', false]]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('age')).toBeNull();
        expect(api.getFilterModel()).toEqual({ name: filterModel.name });
        expect(getCards(api)).toEqual([['Name', false]]);

        const viaState = gridsManager.createGrid('otherGrid', {
            columnDefs: COLUMN_DEFS,
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
        viaState.setFilterModel(filterModel);
        await waitForCards(viaState, [
            ['Name', false],
            ['Age', false],
        ]);
        const state = viaState.getState();
        viaState.setState(
            {
                ...state,
                sideBar: { ...state.sideBar!, toolPanels: { 'filters-new': { filters: [{ colId: 'name' }] } } },
            },
            ['filter']
        );
        await waitForCards(viaState, [['Name', false]]);
        await asyncSetTimeout(0);

        expect(viaState.getFilterModel()).toEqual(api.getFilterModel());
    });

    test('the documented recipe removes only the cards with no active filter', async () => {
        const api = createGrid([{ colId: 'name' }, { colId: 'age', expanded: true }, { colId: 'country' }]);
        await waitForCards(api, [
            ['Name', false],
            ['Age', true],
            ['Country', false],
        ]);
        toolPanel(api).expandFilters(['country']);
        api.setColumnFilterModel('age', { filterType: 'number', type: 'equals', filter: 30 });
        api.onFilterChanged();
        await waitForCards(api, [
            ['Name', false],
            ['Age', true],
            ['Country', true],
        ]);

        const colIds = (toolPanel(api).getState().filters ?? []).map(({ colId }) => colId);
        toolPanel(api).setFilters(
            colIds.filter(
                (colId) => api.getColumnFilterModel(colId) != null || api.getColumnFilterModel(colId, true) != null
            )
        );

        await waitForCards(api, [['Age', true]]);
        await asyncSetTimeout(0);
        expect(getCards(api)).toEqual([['Age', true]]);
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('ignores duplicates, and only warns for ids that are not columns', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [336] });
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid([], {}, [
            { field: 'name' },
            { field: 'age' },
            { field: 'country', suppressFiltersToolPanel: true },
            { field: 'noFilter', filter: false },
        ]);
        await waitForCards(api, []);

        toolPanel(api).setFilters(['age', 'name', 'age', 'country', 'noFilter', 'unknown']);
        await waitForCards(api, [
            ['Age', false],
            ['Name', false],
        ]);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy.mock.calls[0].join(' ')).toContain('warning #336');
        expect(consoleWarnSpy.mock.calls[0].join(' ')).toContain('`unknown`');
    });

    test('cards removed by setFilters can be re-added, and the order stays correct after a later removal', async () => {
        const api = createGrid([{ colId: 'name' }, { colId: 'age' }, { colId: 'country' }]);
        await waitForCards(api, [
            ['Name', false],
            ['Age', false],
            ['Country', false],
        ]);

        toolPanel(api).setFilters([]);
        toolPanel(api).setFilters(['age']);
        await waitForCards(api, [['Age', false]]);

        toolPanel(api).setFilters(['country', 'name', 'age']);
        await waitForCards(api, [
            ['Country', false],
            ['Name', false],
            ['Age', false],
        ]);

        getGridElement(api)!
            .querySelectorAll<HTMLElement>('.ag-filter-card:not(.ag-filter-card-add)')[1]
            .querySelector<HTMLElement>('.ag-filter-card-delete')!
            .click();
        await waitForCards(api, [
            ['Country', false],
            ['Age', false],
        ]);
    });

    test('applies to a tool panel that has not been opened', async () => {
        const api = createGrid([], { initialState: undefined });

        toolPanel(api).setFilters(['age', 'name']);
        expect(toolPanel(api).getState()).toEqual({
            filters: [
                { colId: 'age', expanded: false },
                { colId: 'name', expanded: false },
            ],
        });

        api.openToolPanel('filters-new');
        await waitForCards(api, [
            ['Age', false],
            ['Name', false],
        ]);
    });
});
