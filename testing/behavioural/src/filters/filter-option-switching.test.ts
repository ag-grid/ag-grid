import { fireEvent, waitFor } from '@testing-library/dom';
import {
    ColumnFilterHarness,
    FilterDom,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GetLocaleTextParams, GridApi, IFilterPlaceholderFunctionParams } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

/**
 * Cases the provided filters get wrong when an option's arity or the applied model diverges from the
 * column's default option. Driven through the public API and real DOM only.
 */
describe('Filter option switching and floating filter sync', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            TextFilterModule,
            NumberFilterModule,
            BigIntFilterModule,
            DateFilterModule,
            LocaleModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const datePicker = (api: GridApi) =>
        getGridElement(api)!.querySelector<HTMLInputElement>(
            '.ag-header-cell.ag-floating-filter[col-id="date"] input[type="date"]'
        )!;

    test('a date picked in the floating filter applies even when an apply button is configured', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    floatingFilter: true,
                    filterParams: { buttons: ['apply'] },
                },
            ],
            rowData: [{ date: new Date(2024, 0, 1) }, { date: new Date(2024, 5, 1) }],
        });
        await asyncSetTimeout(0);

        const picker = datePicker(api);
        fireEvent.input(picker, { target: { value: '2024-01-01' } });
        fireEvent.change(picker, { target: { value: '2024-01-01' } });

        // A picker reports a whole date, so there is no half-typed value for the apply button to wait out.
        await waitFor(() =>
            expect(api.getColumnFilterModel('date')).toEqual({
                filterType: 'date',
                type: 'equals',
                dateFrom: '2024-01-01',
                dateTo: null,
            })
        );
        await new GridRows(api, 'a date picked with an apply button configured').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 date:"2024-01-01"
        `);
    });

    test.each([
        ['agTextColumnFilter', 'Ada', { filterType: 'text', type: 'contains', filter: 'Ada' }],
        ['agNumberColumnFilter', '25', { filterType: 'number', type: 'equals', filter: 25 }],
        ['agBigIntColumnFilter', '25', { filterType: 'bigint', type: 'equals', filter: '25' }],
    ])(
        'a typed %s floating filter waits for Enter when an apply button is configured',
        async (filter, typed, applied) => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'value', filter, floatingFilter: true, filterParams: { buttons: ['apply'] } }],
                rowData: [{ value: 'Ada' }, { value: 'Bolt' }],
            });
            await asyncSetTimeout(0);

            const floating = FloatingFilterHarness.get(api, 'value');
            await floating.setValue(typed);
            // Typing is a value on its way to being finished, which is what the apply button waits out.
            await asyncSetTimeout(0);
            expect(api.getColumnFilterModel('value')).toBeNull();

            fireEvent.keyDown(floating.input(), { key: 'Enter' });
            await waitFor(() => expect(api.getColumnFilterModel('value')).toEqual(applied));
        }
    );

    test('a floating filter showing a read-only summary keeps it when the column definitions change', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'date', filter: 'agDateColumnFilter', floatingFilter: true, filterParams: { debounceMs: 0 } },
            ],
            rowData: [{ date: new Date(2024, 0, 1) }, { date: new Date(2024, 5, 1) }],
        });
        await asyncSetTimeout(0);

        await api.setColumnFilterModel('date', {
            filterType: 'date',
            type: 'inRange',
            dateFrom: '2024-01-01',
            dateTo: '2024-03-01',
        });
        await api.onFilterChanged();

        const floating = FloatingFilterHarness.get(api, 'date');
        await waitFor(() => expect(floating.inputs()[0].value).toBe('2024-01-01-2024-03-01'));
        expect(datePicker(api).closest('.ag-hidden')).toBeTruthy();

        api.setGridOption('columnDefs', [
            {
                field: 'date',
                filter: 'agDateColumnFilter',
                floatingFilter: true,
                filterParams: { debounceMs: 0, filterOptions: ['equals', 'greaterThan', 'inRange'] },
            },
        ]);
        await asyncSetTimeout(0);

        // `inRange` takes two values, so the header cell shows the summary rather than an editor - whatever
        // the column's default option happens to be.
        const after = FloatingFilterHarness.get(api, 'date');
        expect(after.inputs()[0].value).toBe('2024-01-01-2024-03-01');
        expect(datePicker(api).closest('.ag-hidden')).toBeTruthy();
        expect(api.getColumnFilterModel('date')).toEqual({
            filterType: 'date',
            type: 'inRange',
            dateFrom: '2024-01-01',
            dateTo: '2024-03-01',
        });
        await new FilterDom(api, 'summary kept across a colDef change', { colId: 'date' }).checkFilterDom(`
            FLOATING FILTER date
            input: "2024-01-01-2024-03-01" ⊘
            active: true
            model:
              filterType: "date"
              type: "inRange"
              dateFrom: "2024-01-01"
              dateTo: "2024-03-01"
        `);
    });

    test('`filterPlaceholder` is given the custom option localised, as the dropdown label is', async () => {
        const seen: { filterOptionKey: string; filterOption: string }[] = [];
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: [
                            'equals',
                            {
                                displayKey: 'withinOf',
                                displayName: 'Within Of',
                                numberOfInputs: 1,
                                predicate: ([target]: unknown[], cellValue: unknown) => cellValue === target,
                            },
                        ],
                        filterPlaceholder: ({
                            filterOptionKey,
                            filterOption,
                            placeholder,
                        }: IFilterPlaceholderFunctionParams) => {
                            seen.push({ filterOptionKey, filterOption });
                            return placeholder;
                        },
                        debounceMs: 0,
                        maxNumConditions: 1,
                    },
                },
            ],
            // The `displayKey` is the locale key, so an override reaches the dropdown and the callback alike.
            getLocaleText: ({ key, defaultValue }: GetLocaleTextParams) =>
                key === 'withinOf' ? 'Dentro De' : defaultValue,
            rowData: [{ age: 25 }, { age: 40 }],
        });

        const harness = await ColumnFilterHarness.open(api, 'age');
        expect(await harness.operatorOptions()).toEqual(['Equals', 'Dentro De']);
        await harness.selectOperator('Dentro De');

        expect(seen).toContainEqual({ filterOptionKey: 'withinOf', filterOption: 'Dentro De' });
    });

    test('an out-of-order range does not block the narrower option chosen after it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'gold', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 10 }],
        });
        await asyncSetTimeout(0);

        const harness = await ColumnFilterHarness.open(api, 'gold');
        await harness.selectOperator('Between');
        // Length first, so a pair that lost an input fails as that rather than as a crash.
        expect(harness.inputs('number', 0)).toHaveLength(2);
        const [from, to] = harness.inputs('number', 0);
        fireEvent.input(from, { target: { value: '10' } });
        fireEvent.input(to, { target: { value: '5' } });
        await waitFor(() => expect(to.validity.valid).toBe(false));

        await harness.selectOperator('Equals');
        // A different value from the one the range left behind, so applying the retained 10 would not pass.
        fireEvent.input(harness.inputs('number', 0)[0], { target: { value: '8' } });

        // The `to` input is not part of the condition, so the error it reported cannot hold it back.
        await waitFor(() =>
            expect(api.getColumnFilterModel('gold')).toEqual({ filterType: 'number', type: 'equals', filter: 8 })
        );
        await new FilterDom(api, 'the abandoned range leaves no message', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "8"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "equals"
              filter: 8
        `);
        await new GridRows(api, 'equals applies after an abandoned range').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 gold:8
        `);
    });

    test('a floating filter applies over a range message the popup left behind', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            // `suppressFloatingFilterButton` keeps the popup on the header button, so both can be driven.
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    suppressFloatingFilterButton: true,
                    filterParams: { debounceMs: 0 },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 10 }],
        });
        await asyncSetTimeout(0);

        const harness = await ColumnFilterHarness.open(api, 'gold');
        await harness.selectOperator('Between');
        // Length first, so a pair that lost an input fails as that rather than as a crash.
        expect(harness.inputs('number', 0)).toHaveLength(2);
        const [from, to] = harness.inputs('number', 0);
        fireEvent.input(from, { target: { value: '10' } });
        fireEvent.input(to, { target: { value: '5' } });
        await waitFor(() => expect(to.validity.valid).toBe(false));

        api.hidePopupMenu();
        await asyncSetTimeout(0);

        // The floating filter writes a one-input option, so the abandoned range is no longer the condition
        // being applied and the message it left cannot hold the new value back.
        await FloatingFilterHarness.get(api, 'gold').setValue('8');
        await waitFor(() =>
            expect(api.getColumnFilterModel('gold')).toEqual({ filterType: 'number', type: 'equals', filter: 8 })
        );
        await new GridRows(api, 'the floating filter applies over an abandoned range').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 gold:8
        `);
    });

    // The sibling above leaves the message on `to`, which the floating filter clears along with that input.
    // `from` is the end it writes to, so a message there is the one that would otherwise survive.
    test('a floating filter applies over a range message left on the from input', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    suppressFloatingFilterButton: true,
                    filterParams: { debounceMs: 0 },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 10 }],
        });
        await asyncSetTimeout(0);

        const harness = await ColumnFilterHarness.open(api, 'gold');
        await harness.selectOperator('Between');
        const [from, to] = harness.inputs('number', 0);
        // `from` last, so it is the end the out-of-order message lands on.
        fireEvent.input(to, { target: { value: '5' } });
        fireEvent.input(from, { target: { value: '10' } });
        await waitFor(() => expect(from.validity.valid).toBe(false));

        api.hidePopupMenu();
        await asyncSetTimeout(0);

        await FloatingFilterHarness.get(api, 'gold').setValue('8');
        await waitFor(() =>
            expect(api.getColumnFilterModel('gold')).toEqual({ filterType: 'number', type: 'equals', filter: 8 })
        );
        await new GridRows(api, 'the floating filter applies over a message left on from').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 gold:8
        `);
    });

    test('a model with fewer conditions drops the extra ones even while another holds an error', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'gold', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 10 }],
        });
        await asyncSetTimeout(0);

        const harness = await ColumnFilterHarness.open(api, 'gold');
        await harness.selectOperator('Equals');
        fireEvent.input(harness.inputs('number', 0)[0], { target: { value: '8' } });
        await harness.selectOperator('Between', 1);
        // Length first, so a pair that lost an input fails as that rather than as a crash.
        expect(harness.inputs('number', 1)).toHaveLength(2);
        const [from, to] = harness.inputs('number', 1);
        fireEvent.input(from, { target: { value: '10' } });
        fireEvent.input(to, { target: { value: '5' } });
        await waitFor(() => expect(to.validity.valid).toBe(false));

        await api.setColumnFilterModel('gold', { filterType: 'number', type: 'equals', filter: 10 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The error belongs to a condition the model replaced, so it is not the user's half-finished edit.
        await new FilterDom(api, 'one condition from the model', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "10"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "equals"
              filter: 10
        `);
        // Named rather than counted: the `equals 8` the test started from also leaves one row.
        await new GridRows(api, 'the model from the API replaced the edited conditions').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 gold:10
        `);
    });
});
