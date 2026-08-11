import { fireEvent, waitFor } from '@testing-library/dom';

import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../test-utils';

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

    const datePicker = (api: any) =>
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
        ['agTextColumnFilter', 'text', 'Ada'],
        ['agNumberColumnFilter', 'number', '25'],
        ['agBigIntColumnFilter', 'bigint', '25'],
    ])('a typed %s floating filter waits for Enter when an apply button is configured', async (filter, _key, typed) => {
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
        await waitFor(() => expect(api.getColumnFilterModel('value')).not.toBeNull());
    });

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

    test('`filterPlaceholder` is given the custom option, not an unresolved key', async () => {
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
                                numberOfInputs: 2,
                                predicate: ([target, tolerance]: any[], cellValue: any) =>
                                    Math.abs(cellValue - target) <= tolerance,
                            },
                        ],
                        filterPlaceholder: ({ filterOptionKey, filterOption, placeholder }: any) => {
                            seen.push({ filterOptionKey, filterOption });
                            return placeholder;
                        },
                        debounceMs: 0,
                        maxNumConditions: 1,
                    },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        });

        const harness = await ColumnFilterHarness.open(api, 'age');
        await harness.selectOperator('Within Of');

        // A custom option has no built-in locale text, so its `displayName` is what the callback must see.
        expect(seen).toContainEqual({ filterOptionKey: 'withinOf', filterOption: 'Within Of' });
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
                                predicate: ([target]: any[], cellValue: any) => cellValue === target,
                            },
                        ],
                        filterPlaceholder: ({ filterOptionKey, filterOption, placeholder }: any) => {
                            seen.push({ filterOptionKey, filterOption });
                            return placeholder;
                        },
                        debounceMs: 0,
                        maxNumConditions: 1,
                    },
                },
            ],
            // The `displayKey` is the locale key, so an override reaches the dropdown and the callback alike.
            getLocaleText: ({ key, defaultValue }: any) => (key === 'withinOf' ? 'Dentro De' : defaultValue),
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
        const [from, to] = harness.inputs('number', 0);
        fireEvent.input(from, { target: { value: '10' } });
        fireEvent.input(to, { target: { value: '5' } });
        await waitFor(() => expect(to.validity.valid).toBe(false));

        await harness.selectOperator('Equals');
        fireEvent.input(harness.inputs('number', 0)[0], { target: { value: '10' } });

        // The `to` input is no longer part of the condition, so the error it reported cannot hold it back.
        await waitFor(() =>
            expect(api.getColumnFilterModel('gold')).toEqual({ filterType: 'number', type: 'equals', filter: 10 })
        );
        await new FilterDom(api, 'the abandoned range leaves no message', { colId: 'gold' }).checkFilterDom(`
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
        await new GridRows(api, 'equals applies after an abandoned range').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 gold:10
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
        const [from, to] = harness.inputs('number', 1);
        fireEvent.input(from, { target: { value: '10' } });
        fireEvent.input(to, { target: { value: '5' } });
        await waitFor(() => expect(to.validity.valid).toBe(false));

        await api.setColumnFilterModel('gold', { filterType: 'number', type: 'equals', filter: 10 });
        await api.onFilterChanged();

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
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
    });

    test('a custom option declared with only the removed `test` is rejected rather than offered', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Restored whatever happens: a failed assertion here would otherwise leave every later test
        // running with validation suppressed and warnings swallowed.
        try {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            filterOptions: [
                                'contains',
                                'equals',
                                {
                                    displayKey: 'startsWithA',
                                    displayName: 'Starts with A',
                                    test: (_filterValue: string, cellValue: string) => cellValue?.startsWith('A'),
                                },
                            ],
                        },
                    },
                ],
                rowData: [{ country: 'Argentina' }, { country: 'Brazil' }, { country: 'Australia' }],
            });
            await asyncSetTimeout(0);

            const harness = await ColumnFilterHarness.open(api, 'country');
            expect(await harness.operatorOptions()).toEqual(['Contains', 'Equals']);

            // Nothing runs `test`, so an option carrying only it is reported rather than left to match nothing.
            const warnings = warnSpy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
            expect(warnings).toContain('warning #72');
            expect(warnings).toContain('predicate');

            await api.setColumnFilterModel('country', { filterType: 'text', type: 'startsWithA', filter: 'x' });
            await api.onFilterChanged();
            // A model naming an option the column does not offer filters nothing, as any other unknown one does.
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        } finally {
            warnSpy.mockRestore();
            enableDevValidations({ throwOn: ALL_SEVERITIES });
        }
    });
});
