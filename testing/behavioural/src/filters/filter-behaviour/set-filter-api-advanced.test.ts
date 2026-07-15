import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type {
    GridApi,
    ISetFilterCellRendererParams,
    ISetFilterParams,
    KeyCreatorParams,
    SetFilterHandler,
    SetFilterValuesFuncParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, TooltipModule, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/** Set-filter handler (non-deprecated public path). Warns nothing, unlike the ISetFilter instance methods. */
function handler(api: GridApi, colId: string): SetFilterHandler {
    const h = api.getColumnFilterHandler<SetFilterHandler>(colId);
    if (!h) {
        throw new Error(`No SetFilterHandler for "${colId}"`);
    }
    return h;
}

describe('Set Filter — handler value manipulation API', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('getFilterKeys / getFilterValues expose the derived list', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'Italy' }, { country: 'France' }],
        });

        const h = handler(api, 'country');
        // getFilterKeys/getFilterValues return de-duplicated values in SOURCE order (not sorted).
        expect(h.getFilterKeys()).toEqual(['Italy', 'Australia', 'France']);
        expect(h.getFilterValues()).toEqual(['Italy', 'Australia', 'France']);

        // The rendered list, by contrast, is sorted by the default comparator.
        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Italy']);
    });

    test('setFilterValues overrides the derived list; a stale model value yields no rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        // Replace the grid-derived list with a fixed provided list (includes 'Germany', absent from data).
        handler(api, 'country').setFilterValues(['Germany', 'Italy']);
        await asyncSetTimeout(0);
        expect(handler(api, 'country').getFilterKeys()).toEqual(['Germany', 'Italy']);

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Germany', 'Italy']);
        await new FilterDom(api, 'setFilterValues list', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Germany
            ☑ Italy
            model: null
        `);

        // Keep only 'Germany' — present in the list but not the data → zero rows.
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Germany'] });
        await new GridRows(api, 'setFilterValues germany-only rows').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('resetFilterValues restores the grid-derived list after an override', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        handler(api, 'country').setFilterValues(['Germany', 'Spain']);
        await asyncSetTimeout(0);
        expect(handler(api, 'country').getFilterKeys()).toEqual(['Germany', 'Spain']);

        handler(api, 'country').resetFilterValues();
        await asyncSetTimeout(0);
        // Back to the grid-derived values, in source (row) order.
        expect(handler(api, 'country').getFilterKeys()).toEqual(['Italy', 'Australia', 'France']);

        await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'resetFilterValues list', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            model: null
        `);
    });

    test('refreshFilterValues re-runs the values callback and re-derives the list', async () => {
        let batch = ['France', 'Germany'];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: (params: SetFilterValuesFuncParams) => params.success(batch),
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'France' }, { country: 'Germany' }],
        });

        // Opening the filter runs the values callback for the first time.
        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'France', 'Germany']);
        expect(handler(api, 'country').getFilterKeys()).toEqual(['France', 'Germany']);

        // Next callback invocation returns a different set.
        batch = ['Italy', 'Spain'];
        handler(api, 'country').refreshFilterValues();
        await asyncSetTimeout(0);
        expect(handler(api, 'country').getFilterKeys()).toEqual(['Italy', 'Spain']);

        // Reuse the already-open popup — re-clicking the header button while it is open would toggle
        // it closed. The open list reflects the re-derived values in place.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Italy', 'Spain']);
        await new FilterDom(api, 'refreshFilterValues list', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Italy
            ☑ Spain
            model: null
        `);
    });
});

describe('Set Filter — value ordering', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('comparator controls the list order (descending)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        comparator: (a: string | null, b: string | null) => (b ?? '').localeCompare(a ?? ''),
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'Italy' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Reverse-alphabetical because of the custom comparator.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Italy', 'France', 'Australia']);
        await new FilterDom(api, 'comparator descending list', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Italy
            ☑ France
            ☑ Australia
            model: null
        `);

        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        // Model values follow the (descending) display order.
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['France', 'Australia'] });
        await new GridRows(api, 'comparator descending rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            └── LEAF id:2 country:"France"
        `);
    });

    test('suppressSorting keeps provided values in insertion order', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        suppressSorting: true,
                        values: ['Italy', 'Australia', 'France'],
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'Italy' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Order matches the provided array, not alphabetical.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Italy', 'Australia', 'France']);
        expect(handler(api, 'country').getFilterKeys()).toEqual(['Italy', 'Australia', 'France']);
        await new FilterDom(api, 'suppressSorting list', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Italy
            ☑ Australia
            ☑ France
            model: null
        `);
    });
});

describe('Set Filter — keyCreator + valueFormatter + textFormatter', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('textFormatter makes the mini-filter accent-insensitive over formatted labels', async () => {
        const keyCreator = (params: KeyCreatorParams): string => params.value.code;
        const valueFormatter = (params: ValueFormatterParams): string => params.value?.name ?? '';
        const textFormatter = (from: string): string => from.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'city',
                    filter: 'agSetColumnFilter',
                    keyCreator,
                    valueFormatter,
                    filterParams: { keyCreator, valueFormatter, textFormatter } as ISetFilterParams,
                },
            ],
            rowData: [
                { city: { code: 'MAL', name: 'Málaga' } },
                { city: { code: 'MAD', name: 'Madrid' } },
                { city: { code: 'PAR', name: 'Paris' } },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'city');
        // List shows formatted (accented) names, sorted; model will carry the keyCreator codes.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Madrid', 'Málaga', 'Paris']);

        // Unaccented query matches the accented label because textFormatter strips diacritics on both sides.
        await filter.miniFilterSearch('mala');
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Málaga']);
        await new FilterDom(api, 'textFormatter accent-insensitive', { colId: 'city' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "mala"
            ☑ (Select All)
            ☑ Málaga
            model: null
        `);

        // Clear the search, keep only Málaga → model carries its key 'MAL'.
        await filter.miniFilterSearch('');
        await asyncSetTimeout(0);
        await filter.toggleSetItem('Madrid');
        await filter.toggleSetItem('Paris');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['MAL'] });
        await new GridRows(api, 'textFormatter málaga-only rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 city:"Málaga"
        `);
    });
});

describe('Set Filter — excelMode button semantics', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    /** Clicks an apply-panel button by its visible label (harness only exposes Apply/Clear/Reset). */
    async function clickButton(label: string): Promise<void> {
        const menu = document.querySelector<HTMLElement>('.ag-filter-menu')!;
        const button = Array.from(menu.querySelectorAll<HTMLElement>('.ag-filter-apply-panel button')).find(
            (b) => b.textContent?.trim() === label
        );
        if (!button) {
            throw new Error(`Filter button "${label}" not found`);
        }
        button.click();
        await asyncSetTimeout(0);
    }

    test('windows: Apply defers the model then closeOnApply shuts the popup; Cancel discards pending', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'windows' } }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        let filter = await ColumnFilterHarness.open(api, 'country');
        // Windows defers to Apply: toggling France + Italy off does not change the model yet.
        await filter.toggleSetItem('France');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();

        await filter.apply();
        await asyncSetTimeout(0);
        // Apply commits the model; closeOnApply (windows default) shuts the popup.
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Australia'] });
        expect(document.querySelector('.ag-filter-menu')).toBeNull();
        await new GridRows(api, 'excel windows applied rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 country:"Australia"
        `);

        // Re-open, change the pending selection, then Cancel → discards, model unchanged.
        filter = await ColumnFilterHarness.open(api, 'country');
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        await clickButton('Cancel');
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Australia'] });
        await new GridRows(api, 'excel windows cancel unchanged rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 country:"Australia"
        `);

        // Re-opening shows the reverted UI (only Australia checked).
        await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'excel windows cancel reverted panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ Australia
            ☐ France
            ☐ Italy
            buttons: Apply | Cancel
            model:
              values:
                - "Australia"
              filterType: "set"
        `);
    });

    test('mac: toggling defers the model; Reset clears an active filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'mac' } }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        // Seed an active filter via the API so Reset has something to clear.
        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Australia'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'excel mac seeded rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 country:"Australia"
        `);

        const filter = await ColumnFilterHarness.open(api, 'country');
        // mac has only a Reset button; toggling a list item does not commit the model while open.
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Australia'] });

        // Reset clears both the pending form and the active model.
        await clickButton('Reset');
        expect(filter.getModel()).toBeNull();
        await new GridRows(api, 'excel mac after reset rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            ├── LEAF id:1 country:"Australia"
            └── LEAF id:2 country:"France"
        `);

        await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'excel mac reset panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            buttons: Reset
            model: null
        `);
    });
});

describe('Set Filter — selection defaults interplay', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('defaultToNothingSelected: (Select All) checks everything as an explicit all-values model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { defaultToNothingSelected: true } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Select a subset first.
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy'] });
        await new GridRows(api, 'defaultToNothing subset rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);

        // Under defaultToNothingSelected, checking (Select All) yields an explicit all-values model
        // (not null), so every row is displayed but the filter model is not cleared.
        await filter.toggleSetItem('(Select All)');
        await asyncSetTimeout(0);
        // The all-values model is emitted in source order, not the sorted display order.
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy', 'Australia', 'France'] });
        await new FilterDom(api, 'defaultToNothing select-all panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            model:
              values:
                - "Italy"
                - "Australia"
                - "France"
              filterType: "set"
        `);
        await new GridRows(api, 'defaultToNothing select-all rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            ├── LEAF id:1 country:"Australia"
            └── LEAF id:2 country:"France"
        `);
    });

    test('suppressSelectAll: toggling items builds and applies the model directly', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { suppressSelectAll: true } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // No (Select All) row; all items start checked.
        expect(filter.setFilterItemLabels()).toEqual(['Australia', 'France', 'Italy']);

        await filter.toggleSetItem('Australia');
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy'] });
        await new FilterDom(api, 'suppressSelectAll model panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☐ Australia
            ☐ France
            ☑ Italy
            model:
              values:
                - "Italy"
              filterType: "set"
        `);
        await new GridRows(api, 'suppressSelectAll rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });
});

describe('Set Filter — list rendering', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule, TooltipModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('cellRenderer customises each list item while keys/model are unchanged', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        cellRenderer: (params: ISetFilterCellRendererParams) =>
                            `<span class="cr-item">[${params.value ?? '(blank)'}]</span>`,
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await asyncSetTimeout(0);
        const rendered = Array.from(document.querySelectorAll<HTMLElement>('.ag-filter-menu .cr-item')).map(
            (el) => el.textContent
        );
        // The custom renderer runs for every row, including the (Select All) row.
        expect(rendered).toEqual(['[(Select All)]', '[Australia]', '[Italy]']);

        // The rendered markup becomes the checkbox label, so items are matched by the rendered text.
        await filter.toggleSetItem('[Australia]');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy'] });
        await new GridRows(api, 'cellRenderer rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('showTooltips shows the value in a tooltip on hover', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { showTooltips: true } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'Italy' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;
        expect(gridDiv).toBeTruthy();
        const label = Array.from(document.querySelectorAll<HTMLElement>('.ag-filter-menu .ag-set-filter-item')).find(
            (el) => el.querySelector('.ag-checkbox-label')?.textContent?.trim() === 'Italy'
        )!;
        expect(label).toBeTruthy();

        await userEvent.hover(label);
        await asyncSetTimeout(250);
        await waitFor(
            () => expect(document.querySelectorAll('.ag-tooltip, .ag-tooltip-custom').length).toBeGreaterThan(0),
            { timeout: 2000 }
        );
        const tooltip = document.querySelector<HTMLElement>('.ag-tooltip, .ag-tooltip-custom');
        expect(tooltip?.textContent).toContain('Italy');
    });
});
