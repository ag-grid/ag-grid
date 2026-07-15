import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
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

/**
 * Black-box coverage for editing/displaying floating filters (floatingFilter:true) across text,
 * number, date and set columns: typing updates model + rows, API writeback updates the display,
 * read-only filters (set, range) show a summary, and clearing. Driven via GridApi + real DOM only.
 */

/** The `.ag-floating-filter-body` for a column's floating filter row. */
function floatingBody(api: GridApi, colId: string): HTMLElement {
    const gridDiv = getGridElement(api)! as HTMLElement;
    // The body carries `ag-floating-filter-body`, or `ag-floating-filter-full-body` when the
    // floating-filter button is suppressed and the whole cell is the filter body.
    const body = gridDiv.querySelector<HTMLElement>(
        `.ag-header-cell.ag-floating-filter[col-id="${colId}"] .ag-floating-filter-body, ` +
            `.ag-header-cell.ag-floating-filter[col-id="${colId}"] .ag-floating-filter-full-body`
    );
    if (!body) {
        throw new Error(`No floating filter body for "${colId}"`);
    }
    return body;
}

/** The single visible (non-hidden) input inside a column's floating filter. */
function floatingInput(api: GridApi, colId: string): HTMLInputElement {
    const inputs = Array.from(floatingBody(api, colId).querySelectorAll<HTMLInputElement>('input')).filter(
        (input) => !input.closest('.ag-hidden')
    );
    if (!inputs.length) {
        throw new Error(`No visible floating filter input for "${colId}"`);
    }
    return inputs[0];
}

/** Sets a native input's value and fires input+change so the widget's listeners run. */
function typeInto(input: HTMLInputElement, value: string): void {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('Floating filter editing', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, DateFilterModule, SetFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    // --- Text ---

    test('text: typing filters (contains), API writeback updates display, clearing resets', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    filterParams: { debounceMs: 0 },
                    floatingFilter: true,
                },
            ],
            rowData: [{ country: 'Ireland' }, { country: 'Italy' }, { country: 'Australia' }],
        });
        await asyncSetTimeout(0);

        // Starts empty, no model, all rows.
        expect(floatingInput(api, 'country').value).toBe('');
        expect(api.getColumnFilterModel('country')).toBeNull();

        // Type into the floating filter → default option is `contains`.
        typeInto(floatingInput(api, 'country'), 'ital');
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'text', type: 'contains', filter: 'ital' });
        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'text typed contains').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 country:"Italy"
        `);

        // Setting a different model via API writes back to the floating display.
        await api.setColumnFilterModel('country', { filterType: 'text', type: 'contains', filter: 'aus' });
        await api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(floatingInput(api, 'country').value).toBe('aus');
        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'text api writeback').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 country:"Australia"
        `);
        await new FilterDom(api, 'text floating editable', { mode: 'floating-filter', colId: 'country' })
            .checkFilterDom(`
            FLOATING FILTER country
            input: "aus"
            active: true
            model:
              filterType: "text"
              type: "contains"
              filter: "aus"
        `);

        // Clearing the floating input clears the model and restores all rows.
        typeInto(floatingInput(api, 'country'), '');
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(3);
        await new GridRows(api, 'text cleared restores all').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Ireland"
            ├── LEAF id:1 country:"Italy"
            └── LEAF id:2 country:"Australia"
        `);
    });

    test('text: a combined (two-condition) model set via API renders read-only with a summary', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    filterParams: { debounceMs: 0 },
                    floatingFilter: true,
                },
            ],
            rowData: [{ country: 'Ireland' }, { country: 'Italy' }, { country: 'Iceland' }, { country: 'France' }],
        });
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('country', {
            filterType: 'text',
            operator: 'OR',
            conditions: [
                { filterType: 'text', type: 'contains', filter: 'ita' },
                { filterType: 'text', type: 'contains', filter: 'ice' },
            ],
        });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        // A combined model is never editable in the floating filter: input is disabled and shows a summary.
        const input = floatingInput(api, 'country');
        expect(input.disabled).toBe(true);
        expect(input.value).toBe('ita OR ice');
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'text combined rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:"Italy"
            └── LEAF id:2 country:"Iceland"
        `);
        await new FilterDom(api, 'text floating read-only', { mode: 'floating-filter', colId: 'country' })
            .checkFilterDom(`
            FLOATING FILTER country
            input: "ita OR ice" ⊘
            active: true
            model:
              filterType: "text"
              operator: "OR"
              conditions:
                - filterType: "text"
                  type: "contains"
                  filter: "ita"
                - filterType: "text"
                  type: "contains"
                  filter: "ice"
        `);
    });

    // --- Number ---

    test('number: typing filters (equals), API writeback updates display, clearing resets', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 }, floatingFilter: true },
            ],
            rowData: [{ age: 10 }, { age: 20 }, { age: 30 }],
        });
        await asyncSetTimeout(0);

        expect(floatingInput(api, 'age').value).toBe('');

        // Type `20` → default option is `equals`.
        typeInto(floatingInput(api, 'age'), '20');
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'equals', filter: 20 });
        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'number typed equals').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:20
        `);

        // API writeback to a different equals value.
        await api.setColumnFilterModel('age', { filterType: 'number', type: 'equals', filter: 30 });
        await api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(floatingInput(api, 'age').value).toBe('30');
        await new GridRows(api, 'number api writeback').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 age:30
        `);

        // Clear.
        typeInto(floatingInput(api, 'age'), '');
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('age')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(3);
        await new GridRows(api, 'number cleared restores all').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:10
            ├── LEAF id:1 age:20
            └── LEAF id:2 age:30
        `);
    });

    test('number: a range (inRange) model set via API renders read-only in the floating filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 }, floatingFilter: true },
            ],
            rowData: [{ age: 10 }, { age: 25 }, { age: 40 }],
        });
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'inRange', filter: 20, filterTo: 35 });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        // A 2-input option is not editable in the floating filter: the single input is disabled and
        // shows the range summary rather than an editable value.
        const input = floatingInput(api, 'age');
        expect(input.disabled).toBe(true);
        expect(input.value).toContain('20');
        expect(input.value).toContain('35');
        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'number inRange rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:25
        `);
        await new FilterDom(api, 'number floating read-only', { mode: 'floating-filter', colId: 'age' })
            .checkFilterDom(`
            FLOATING FILTER age
            input: "20-35" ⊘
            active: true
            model:
              filterType: "number"
              type: "inRange"
              filter: 20
              filterTo: 35
        `);
    });

    test('number: non-numeric typing produces no model and leaves all rows', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 }, floatingFilter: true },
            ],
            rowData: [{ age: 10 }, { age: 20 }, { age: 30 }],
        });
        await asyncSetTimeout(0);

        // input[type=number] discards non-numeric text, so the parsed value stays empty → no model.
        typeInto(floatingInput(api, 'age'), 'abc');
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('age')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(3);
        await new GridRows(api, 'number non-numeric unchanged').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:10
            ├── LEAF id:1 age:20
            └── LEAF id:2 age:30
        `);
    });

    // --- Date ---

    test('date: editable equals input types a date and filters rows', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 }, floatingFilter: true },
            ],
            rowData: [{ date: '2024-01-01' }, { date: '2024-05-01' }, { date: '2024-09-01' }],
        });
        await asyncSetTimeout(0);

        // Default equals option → an editable date input is shown.
        const input = floatingInput(api, 'date');
        expect(input.type).toBe('date');
        expect(input.disabled).toBe(false);

        typeInto(input, '2024-05-01');
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        const model = api.getColumnFilterModel<{ type: string; dateFrom: string }>('date');
        expect(model?.type).toBe('equals');
        expect(model?.dateFrom).toContain('2024-05-01');
        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'date typed equals').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2024-05-01"
        `);
    });

    test('date: a single equals model set via API writes back into the editable date input', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 }, floatingFilter: true },
            ],
            rowData: [{ date: '2024-01-01' }, { date: '2024-05-01' }, { date: '2024-09-01' }],
        });
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('date', {
            filterType: 'date',
            type: 'equals',
            dateFrom: '2024-09-01',
            dateTo: null,
        });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        // Single-input equals stays editable: the date input (not the read-only text) shows the value.
        const input = floatingInput(api, 'date');
        expect(input.type).toBe('date');
        expect(input.disabled).toBe(false);
        expect(input.value).toBe('2024-09-01');
        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'date api writeback rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 date:"2024-09-01"
        `);
        await new FilterDom(api, 'date floating editable', { mode: 'floating-filter', colId: 'date' }).checkFilterDom(`
            FLOATING FILTER date
            input [date]: "2024-09-01"
            active: true
            model:
              filterType: "date"
              type: "equals"
              dateFrom: "2024-09-01"
              dateTo: null
        `);
    });

    test('date: a range (inRange) model set via API renders the read-only summary and hides the date input', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 }, floatingFilter: true },
            ],
            rowData: [{ date: '2024-01-01' }, { date: '2024-05-01' }, { date: '2024-09-01' }],
        });
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('date', {
            filterType: 'date',
            type: 'inRange',
            dateFrom: '2024-03-15',
            dateTo: '2024-06-30',
        });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        // Read-only: the visible input is the disabled summary text, not the editable date input.
        const input = floatingInput(api, 'date');
        expect(input.type).toBe('text');
        expect(input.disabled).toBe(true);
        expect(input.value).toContain('2024-03-15');
        expect(input.value).toContain('2024-06-30');

        // The editable date input is hidden while read-only.
        const dateInput = floatingBody(api, 'date').querySelector<HTMLInputElement>('input[type="date"]');
        expect(dateInput?.closest('.ag-hidden')).not.toBeNull();

        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'date inRange rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2024-05-01"
        `);
        await new FilterDom(api, 'date floating read-only', { mode: 'floating-filter', colId: 'date' }).checkFilterDom(`
            FLOATING FILTER date
            input: "2024-03-15-2024-06-30" ⊘
            active: true
            model:
              filterType: "date"
              type: "inRange"
              dateFrom: "2024-03-15"
              dateTo: "2024-06-30"
        `);
    });

    // --- Set (read-only floating filter, enterprise) ---

    describe.each([false, true])('set (enableFilterHandlers: %s)', (enableFilterHandlers) => {
        test('read-only floating filter shows the selection summary and clears', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', floatingFilter: true }],
                rowData: [
                    { country: 'Italy' },
                    { country: 'Australia' },
                    { country: 'France' },
                    { country: 'Australia' },
                ],
            });
            await asyncSetTimeout(0);

            // No model → the read-only input is empty and disabled.
            const input = floatingInput(api, 'country');
            expect(input.disabled).toBe(true);
            expect(input.value).toBe('');

            // Single value selected via API → `(1) Australia`.
            await api.setColumnFilterModel('country', { filterType: 'set', values: ['Australia'] });
            await api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(floatingInput(api, 'country').value).toBe('(1) Australia');
            expect(api.getDisplayedRowCount()).toBe(2);
            await new GridRows(api, `set one value ${enableFilterHandlers}`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Australia"
                └── LEAF id:3 country:"Australia"
            `);

            // Two values → `(2) Australia,France`.
            await api.setColumnFilterModel('country', { filterType: 'set', values: ['Australia', 'France'] });
            await api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(floatingInput(api, 'country').value).toBe('(2) Australia,France');
            expect(api.getDisplayedRowCount()).toBe(3);
            await new GridRows(api, `set two values ${enableFilterHandlers}`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 country:"Australia"
                ├── LEAF id:2 country:"France"
                └── LEAF id:3 country:"Australia"
            `);
            await new FilterDom(api, `set floating summary ${enableFilterHandlers}`, {
                mode: 'floating-filter',
                colId: 'country',
            }).checkFilterDom(`
                FLOATING FILTER country
                input: "(2) Australia,France" ⊘
                active: true
                model:
                  filterType: "set"
                  values:
                    - "Australia"
                    - "France"
            `);

            // Clearing the model empties the summary and restores all rows.
            await api.setColumnFilterModel('country', null);
            await api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(floatingInput(api, 'country').value).toBe('');
            expect(api.getDisplayedRowCount()).toBe(4);
            await new GridRows(api, `set cleared ${enableFilterHandlers}`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"Italy"
                ├── LEAF id:1 country:"Australia"
                ├── LEAF id:2 country:"France"
                └── LEAF id:3 country:"Australia"
            `);
        });

        test('selecting items in the popup writes the summary into the read-only floating filter', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                // suppressFloatingFilterButton keeps the popup on the header button so the harness can open it,
                // while the floating filter row (and its read-only summary) still renders.
                columnDefs: [
                    {
                        field: 'country',
                        filter: 'agSetColumnFilter',
                        floatingFilter: true,
                        suppressFloatingFilterButton: true,
                    },
                ],
                rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
            });
            await asyncSetTimeout(0);

            // Deselect everything except Italy through the real popup (user "selecting").
            const filter = await ColumnFilterHarness.open(api, 'country');
            await filter.toggleSetItem('Australia');
            await filter.toggleSetItem('France');
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Italy'] });
            expect(floatingInput(api, 'country').value).toBe('(1) Italy');
            expect(api.getDisplayedRowCount()).toBe(2);
            await new GridRows(api, `set popup select ${enableFilterHandlers}`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"Italy"
                └── LEAF id:3 country:"Italy"
            `);
        });
    });
});
