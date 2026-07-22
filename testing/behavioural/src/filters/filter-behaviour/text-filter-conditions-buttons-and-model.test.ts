import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    firePointerLikeClick,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/** Clicks an apply-panel button by label (harness only exposes Apply/Clear; Reset needs this). */
async function clickPanelButton(label: string): Promise<void> {
    const button = Array.from(document.querySelectorAll<HTMLButtonElement>('.ag-filter-apply-panel button')).find(
        (b) => b.textContent?.trim() === label
    );
    if (!button) {
        throw new Error(`Apply-panel button "${label}" not found`);
    }
    await firePointerLikeClick(button);
    await asyncSetTimeout(0);
}

/**
 * Black-box coverage for agTextColumnFilter model lifecycle: apply/clear/reset buttons defer and reset
 * the model, and setColumnFilterModel / getColumnFilterModel round-trip drives the panel and filters rows.
 */
describe('Text Filter — buttons & model round-trip', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('buttons defer the model until Apply; Clear wipes the form but keeps the active filter, Reset removes it', async () => {
        // No debounceMs: it is ignored (and warns) when an apply button is present.
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agTextColumnFilter',
                    filterParams: { maxNumConditions: 1, buttons: ['apply', 'clear', 'reset'] },
                },
            ],
            rowData: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Contains');
        await filter.setText('an');
        await asyncSetTimeout(0);

        // Typed but not applied: model stays null and rows are unfiltered.
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'buttons before apply', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "an"
            buttons: Apply | Clear | Reset
            model: null
        `);
        await new GridRows(api, 'buttons before apply rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            ├── LEAF id:1 name:"Banana"
            └── LEAF id:2 name:"Cherry"
        `);

        await filter.apply();
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'an' });
        await new GridRows(api, 'buttons after apply rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Banana"
        `);

        // Clear wipes the form UI only — the active filter (and filtered rows) remain.
        await filter.clear();
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'an' });
        await new FilterDom(api, 'buttons after clear', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: ""
            buttons: Apply | Clear | Reset
            model:
              filterType: "text"
              type: "contains"
              filter: "an"
        `);
        await new GridRows(api, 'buttons after clear rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Banana"
        `);

        // Re-apply, then Reset — Reset clears both the form and the active filter.
        await filter.setText('an');
        await asyncSetTimeout(0);
        await filter.apply();
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'an' });

        await clickPanelButton('Reset');
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'buttons after reset', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: ""
            buttons: Apply | Clear | Reset
            model: null
        `);
        await new GridRows(api, 'buttons after reset rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            ├── LEAF id:1 name:"Banana"
            └── LEAF id:2 name:"Cherry"
        `);
    });

    test('model round-trip: setColumnFilterModel drives the panel and filters rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
            ],
            rowData: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }, { name: 'apple pie' }],
        });

        await api.setColumnFilterModel('name', { filterType: 'text', type: 'startsWith', filter: 'app' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('name')).toEqual({ filterType: 'text', type: 'startsWith', filter: 'app' });

        const filter = await ColumnFilterHarness.open(api, 'name');
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'startsWith', filter: 'app' });
        await new FilterDom(api, 'roundtrip panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Begins with"
            input: "app"
            model:
              filterType: "text"
              type: "startsWith"
              filter: "app"
        `);
        await new GridRows(api, 'roundtrip rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            └── LEAF id:3 name:"apple pie"
        `);
    });

    test('model round-trip: combined AND model drives a two-condition panel', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Alice' }, { name: 'Albert' }, { name: 'Charlie' }, { name: 'Bob' }],
        });

        await api.setColumnFilterModel('name', {
            filterType: 'text',
            operator: 'AND',
            conditions: [
                { filterType: 'text', type: 'contains', filter: 'a' },
                { filterType: 'text', type: 'endsWith', filter: 'e' },
            ],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'name');
        expect(filter.getModel()).toEqual({
            filterType: 'text',
            operator: 'AND',
            conditions: [
                { filterType: 'text', type: 'contains', filter: 'a' },
                { filterType: 'text', type: 'endsWith', filter: 'e' },
            ],
        });
        await new FilterDom(api, 'combined roundtrip panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "a"
            AND
            operator: "Ends with"
            input: "e"
            model:
              filterType: "text"
              operator: "AND"
              conditions:
                - filterType: "text"
                  type: "contains"
                  filter: "a"
                - filterType: "text"
                  type: "endsWith"
                  filter: "e"
        `);
        await new GridRows(api, 'combined roundtrip rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:2 name:"Charlie"
        `);
    });
});
