import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    AdvancedFilterBuilderHarness,
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { AdvancedFilterModel, GridOptions, ISetFilterParams, SetAdvancedFilterModel } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import type { TestRow } from './advancedFilterSetFixture';
import {
    DEFAULT_OPTIONS,
    ROW_DATA,
    SET_MODULES,
    SET_OPTIONS,
    TEXT_OPTIONS,
    displayedAthletes,
} from './advancedFilterSetFixture';

describe('Advanced Filter - Set Filter configuration', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('colDef.valueFormatter alone leaves the underlying values in the expression and the model', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', filter: 'agSetColumnFilter', valueFormatter: ({ value }) => `${value}!` },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toContain('Jamaica');
        expect(af.autocompleteEntries()).not.toContain('Jamaica!');

        await af.applyExpression('[Country] is any of ["Jamaica"]');

        await new FilterDom(api, 'colDef valueFormatter').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
        `);
        await new GridRows(api, 'colDef valueFormatter rows').check(`
            ROOT id:ROOT_NODE_ID country:"undefined!"
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica!"
        `);
    });

    test('filterParams.valueFormatter is what the expression shows, with the model still storing keys', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { valueFormatter: ({ value }: { value: string }) => `${value} (F)` },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toContain('Jamaica (F)');

        await af.applyExpression('[Country] is any of ["Jamaica (F)"]');

        await new FilterDom(api, 'filterParams valueFormatter').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica (F)"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
        `);

        // The stored key is written back out as the formatted value it was chosen as.
        api.setAdvancedFilterModel(api.getAdvancedFilterModel());
        expect(af.value).toBe('[Country] is any of ["Jamaica (F)"]');
    });

    test('a column event while a formatted value is missing from the data does not re-point the filter', async () => {
        const columnDefs = [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: { valueFormatter: ({ value }: { value: string }) => `${value} (F)` },
            },
        ];
        const api = await gridsManager.createGridAndWait('grid1', { ...DEFAULT_OPTIONS, columnDefs });
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica (F)"]');
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);

        // Jamaica leaves the data, so the applied expression names a value the column no longer holds.
        api.setGridOption(
            'rowData',
            ROW_DATA.filter(({ country }) => country !== 'Jamaica')
        );
        api.onFilterChanged();

        // A column event re-validates. The applied filter must keep the key it was built from rather
        // than the text the value was written as, which is all an unresolved value can report.
        api.setGridOption('columnDefs', [...columnDefs]);
        api.onFilterChanged();

        api.setGridOption('rowData', ROW_DATA);
        api.onFilterChanged();

        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
    });

    test('a value arriving in the data is filtered on at the next column event, with no manual refresh', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            rowData: ROW_DATA.filter(({ country }) => country !== 'Jamaica'),
        });
        const af = AdvancedFilterHarness.get(api);

        // Valid, but naming a value the data does not hold: reported without being applied.
        await af.applyExpression('[Country] is any of ["Jamaica"]');
        await asyncSetTimeout(0);
        expect(api.isAnyFilterPresent()).toBe(false);

        // Deliberately no api.onFilterChanged() anywhere below — the grid has to notice by itself.
        api.setGridOption('rowData', ROW_DATA);
        await asyncSetTimeout(0);
        api.setColumnsVisible(['age'], false);
        await asyncSetTimeout(0);

        // The filter is applied, so the rows must have been filtered by it.
        expect(api.isAnyFilterPresent()).toBe(true);
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('a model applied before the row data is rewritten in formatted values once they arrive', async () => {
        const columnDefs = [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: { valueFormatter: ({ value }: { value: string }) => `${value} (F)` },
            },
        ];
        const api = gridsManager.createGrid('grid1', { ...DEFAULT_OPTIONS, columnDefs, rowData: undefined });
        await asyncSetTimeout(0);
        const af = AdvancedFilterHarness.get(api);

        // The usual startup order with a fetched dataset: the saved filter lands before the rows.
        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);

        api.setGridOption('rowData', ROW_DATA);
        await asyncSetTimeout(0);

        // Written as the value the list offers, not as the stored key, and reported as valid.
        expect(af.value).toBe('[Country] is any of ["Jamaica (F)"]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('a blank named by a model applied before the row data still filters on blanks once they arrive', async () => {
        const api = gridsManager.createGrid('grid1', { ...DEFAULT_OPTIONS, rowData: undefined });
        await asyncSetTimeout(0);
        const af = AdvancedFilterHarness.get(api);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: [null],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);

        api.setGridOption('rowData', ROW_DATA);
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Country] is any of ["(Blanks)"]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['Li Wei']);
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual([null]);
    });

    test('a model key in another case is written as the column spells it, and collapses with its own duplicate', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['jamaica', 'Jamaica'],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);

        // Both name the one key, so the column's own text is written once rather than twice in two cases.
        expect(af.value).toBe('[Country] is any of ["Jamaica"]');
        expect(af.input.validationMessage).toBe('');
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Jamaica']);
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('the returned set model owns its values array, so mutating it does not reach the applied filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);

        const model = api.getAdvancedFilterModel() as SetAdvancedFilterModel;
        expect(model.values).not.toBe((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values);
        model.values.push('Poland');

        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Jamaica']);
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('a set model naming no values is discarded, as the schema forbidding an empty list says it is', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: [],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        expect(api.isAnyFilterPresent()).toBe(false);
        expect(displayedAthletes(api)).toEqual(ROW_DATA.map(({ athlete }) => athlete));
    });

    test('each filter resolves the values itself, so a values callback runs once for each', async () => {
        const values = vi.fn((params: Parameters<Extract<ISetFilterParams['values'], (p: any) => void>>[0]) =>
            params.success(['Jamaica', 'Poland'])
        );
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', filter: 'agSetColumnFilter', filterParams: { values } satisfies ISetFilterParams },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        // Lazy on both sides, so the count only means anything once each filter has had to ask. The open
        // list is not refreshed from underneath, so asking again is what shows the values arrived.
        await af.type('[Country] is any of [');
        await af.type('[Country] is any of ["');
        expect(af.autocompleteEntries()).toEqual(['Jamaica', 'Poland']);
        expect(values).toHaveBeenCalledTimes(1);

        // The Advanced Filter holds its own handler, so turning it off and using the column filter asks again.
        api.setGridOption('enableAdvancedFilter', false);
        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Jamaica'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(values).toHaveBeenCalledTimes(2);
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('the rewrite leaves text the author has typed but not applied alone', async () => {
        const columnDefs = [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: { valueFormatter: ({ value }: { value: string }) => `${value} (F)` },
            },
        ];
        const api = await gridsManager.createGridAndWait('grid1', { ...DEFAULT_OPTIONS, columnDefs });
        const af = AdvancedFilterHarness.get(api);

        // Names a value the data does not hold, so it is written as its stored key rather than formatted.
        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Atlantis'],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Country] is any of ["Atlantis"]');

        // An edit in flight, not applied.
        await af.type('[Country] is any of ["Poland (F)"');

        // The value arrives, so the applied text is now stale — but the author's edit is not ours to lose.
        api.setGridOption('rowData', [...ROW_DATA, { athlete: 'Plato', country: 'Atlantis', age: 40 }]);
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Country] is any of ["Poland (F)"');
    });

    test('an applied expression follows the column definitions when the key creator changes', async () => {
        const countryCol = (length: number) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                keyCreator: ({ value }: { value: string }) => `${value}`.slice(0, length),
                valueFormatter: ({ value }: { value: string }) => `${value}`.slice(0, length),
            },
        });
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [{ field: 'athlete' }, countryCol(3)],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Uni"]');
        await new GridRows(api, 'three character keys').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            └── LEAF id:1 athlete:"Emma Thompson" country:"United Kingdom"
        `);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol(1)]);
        api.onFilterChanged();

        // One-character keys, so "Uni" names nothing and the applied expression matches no row.
        await new GridRows(api, 'one character keys').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('a provided value list widened by the column definitions clears the fault its absence reported', async () => {
        const countryCol = (values: string[]) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: { values } satisfies ISetFilterParams,
        });
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [{ field: 'athlete' }, countryCol(['Poland'])],
        });
        const af = AdvancedFilterHarness.get(api);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Country] is any of ["Jamaica"]');
        expect(af.input.validationMessage).toContain('Value not found');

        // A definition change is as much a change to the values as new row data is, and a provided list
        // reports no data change of its own, so the refresh has to say so on its own account.
        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol(['Jamaica', 'Poland'])]);
        await asyncSetTimeout(0);

        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('flipping caseSensitive through the column definitions keeps an applied condition matching', async () => {
        const countryCol = (caseSensitive: boolean) => ({
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: { caseSensitive } satisfies ISetFilterParams,
        });
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [{ field: 'athlete' }, countryCol(false)],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica"]');
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);

        api.setGridOption('columnDefs', [{ field: 'athlete' }, countryCol(true)]);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // "Jamaica" is the column's own spelling of the key, so it names the same row under either rule.
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('two keys the valueFormatter maps alike stay distinguishable in the model and the list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    // Lossy on purpose: both United values format to the same text.
                    filterParams: { valueFormatter: ({ value }: { value: string }) => `${value}`.slice(0, 6) },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        // The formatted text names one of them; the other is written as the key, which is unique.
        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(expect.arrayContaining(['United', 'United States']));

        const model = {
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['United States', 'United Kingdom'],
        } as const;
        api.setAdvancedFilterModel({ ...model, values: [...model.values] });
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual(model);
        await new GridRows(api, 'both colliding keys kept').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States"
            └── LEAF id:1 athlete:"Emma Thompson" country:"United Kingdom"
        `);
    });

    // Neither the formatted text nor the raw key tells these two apart, so no substitution rule can give
    // them separate written forms. The one form they share names both rather than picking a winner, which
    // is what stops the second value being unreachable.
    test('a key that is another key formatted shares its written form, and naming it filters on both', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    // "US" formats to "United States", which is also a key in its own right.
                    filterParams: {
                        valueFormatter: ({ value }: { value: string }) =>
                            value === 'US' ? 'United States' : `${value}`,
                    },
                },
            ],
            rowData: [
                { athlete: 'Michael Phelps', country: 'US' },
                { athlete: 'Emma Thompson', country: 'United States' },
            ],
        });

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['United States'],
        });
        await asyncSetTimeout(0);

        // One written form, so it names both keys and both rows are filtered in. Neither value is left
        // unreachable, which is what a winner-takes-the-text rule would do to the second.
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['US', 'United States'],
        });
        await new GridRows(api, 'key equal to another formatted value').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"US"
            └── LEAF id:1 athlete:"Emma Thompson" country:"United States"
        `);
    });

    // The same limitation from the other side: with the value gone there is no key for the written text to
    // resolve to, so the model reports the text. Nothing filters differently for it — a key the data does
    // not hold matches no rows either way — and it resolves again as soon as the value comes back.
    test('a value the data no longer holds keeps its key in the model, so the model round-trips', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { valueFormatter: ({ value }: { value: string }) => `${value} (F)` },
                },
            ],
        });

        const model: SetAdvancedFilterModel = {
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        };
        api.setAdvancedFilterModel({ ...model });
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual(model);

        api.setGridOption(
            'rowData',
            ROW_DATA.filter(({ country }) => country !== 'Jamaica')
        );
        await asyncSetTimeout(0);

        // The expression can no longer resolve "Jamaica (F)" to a key, but the applied filter is still
        // matching on the key it resolved, and the model names that rather than the text.
        expect(api.getAdvancedFilterModel()).toEqual(model);
        expect(displayedAthletes(api)).toEqual([]);

        api.setGridOption('rowData', ROW_DATA);
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual(model);
        expect(displayedAthletes(api)).toEqual(['Usain Bolt']);
    });

    test('keyCreator and filterParams.valueFormatter drive matching on complex values', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    valueFormatter: ({ value }: { value: { code: string; name: string } | null }) => value?.code ?? '',
                    keyCreator: ({ value }: { value: { code: string; name: string } | null }) => value?.code ?? '',
                    filterParams: {
                        valueFormatter: ({ value }: { value: { code: string; name: string } | null }) =>
                            value?.name ?? '',
                    },
                },
            ],
            rowData: [
                { athlete: 'Usain Bolt', country: { code: 'JAM', name: 'Jamaica' } },
                { athlete: 'Anna Kowalski', country: { code: 'POL', name: 'Poland' } },
            ],
            enableAdvancedFilter: true,
        } as GridOptions);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica', 'Poland']);

        await af.applyExpression('[Country] is any of ["Jamaica"]');

        await new FilterDom(api, 'keyCreator').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "JAM"
        `);
        await new GridRows(api, 'keyCreator rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Usain Bolt" country:"JAM"
        `);
    });

    test('a value written in another case still resolves, as it does in the Set Filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['jamaica'],
        });

        await new GridRows(api, 'case insensitive').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
        `);
    });

    test('caseSensitive keeps a differently cased value unresolved', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', filter: 'agSetColumnFilter', filterParams: { caseSensitive: true } },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["jamaica"]');

        await new FilterDom(api, 'case sensitive').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["jamaica"]"
            valid: false — Expression has an error. Value not found - "jamaica".
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('filter: true offers the set options where the Set Filter is the default', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                { field: 'country', filter: true },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] ');
        expect(af.autocompleteEntries()).toContain('is any of');

        await af.applyExpression('[Country] is any of ["Jamaica"]');
        await new GridRows(api, 'filter true rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica"
        `);
    });

    test('suppressSetFilterByDefault leaves filter: true a text column, with no set options', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                { field: 'country', filter: true },
            ],
            suppressSetFilterByDefault: true,
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] ');

        // The whole list, so an autocomplete that failed to open cannot pass as "no set options".
        expect(af.autocompleteEntries()).toEqual(TEXT_OPTIONS);
    });

    test('filterValueGetter decides the values the list offers and the expression matches', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterValueGetter: ({ data }: { data: TestRow }) => data.country?.toUpperCase() ?? null,
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'JAMAICA', 'POLAND', 'UNITED KINGDOM', 'UNITED STATES']);

        await af.applyExpression('[Country] is any of ["JAMAICA"]');
        await new GridRows(api, 'filterValueGetter rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica"
        `);
    });

    test('a key the column no longer offers is written out as it stands and keeps filtering', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Atlantis'],
        });
        await asyncSetTimeout(0);

        // Nothing rewrites the key, so the expression still says what it filters on, and still filters on it.
        expect(af.value).toBe('[Country] is any of ["Atlantis"]');
        await new GridRows(api, 'unknown key from a model').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('filterOptions is the whole list a column offers, so it narrows the set options away too', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', filter: 'agSetColumnFilter', filterParams: { filterOptions: ['equals'] } },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] ');

        expect(af.autocompleteEntries()).toEqual(['equals']);
    });

    test('filterOptions naming the set options keeps them, beside the ones it names from the data type', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { filterOptions: ['isNoneOf', 'equals'] },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] ');
        expect(af.autocompleteEntries()).toEqual(['is none of', 'equals']);

        await af.applyExpression('[Country] is none of ["Jamaica"]');
        expect(displayedAthletes(api)).toEqual(['Michael Phelps', 'Emma Thompson', 'Anna Kowalski', 'Li Wei']);
    });

    test('filterOptions naming nothing the column can evaluate narrows nothing', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                // `lessThan` is not an option a text column evaluates, so the narrowing is left with nothing.
                { field: 'country', filter: 'agSetColumnFilter', filterParams: { filterOptions: ['lessThan'] } },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] ');

        expect(af.autocompleteEntries()).toEqual([...TEXT_OPTIONS, ...SET_OPTIONS]);
    });

    test('a set option survives retargeting onto another column that narrows its options', async () => {
        const narrowed = (field: string) => ({
            field,
            filter: 'agSetColumnFilter',
            filterParams: { filterOptions: ['equals', 'isAnyOf'] },
        });
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [{ field: 'athlete' }, narrowed('country'), narrowed('team')],
            rowData: [
                { athlete: 'Usain Bolt', country: 'Jamaica', team: 'Racers' },
                { athlete: 'Anna Kowalski', country: 'Poland', team: 'Wisla' },
            ],
        });
        api.setAdvancedFilterModel({ filterType: 'set', colId: 'country', type: 'isAnyOf', values: ['Jamaica'] });

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        // Both columns offer `is any of`, so moving between them must not judge the option unoffered.
        await builder.selectColumn(item, 'Team');

        expect(await builder.operatorOptions(item)).toContain('is any of');
        expect(builder.operatorPillText(item)).toBe('is any of');
        // The keys named a Country value, so the Team condition starts with none rather than inheriting them.
        expect(builder.valuePillText(item)).toBe('Enter a value...');
    });
});

describe('Advanced Filter - two Set Filter columns in one grid', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const TWO_SET_COLUMNS: GridOptions = {
        columnDefs: [
            { field: 'athlete' },
            { field: 'country', filter: 'agSetColumnFilter' },
            { field: 'team', filter: 'agSetColumnFilter' },
        ],
        rowData: [
            { athlete: 'Usain Bolt', country: 'Jamaica', team: 'Racers' },
            { athlete: 'Anna Kowalski', country: 'Poland', team: 'Wisla' },
            { athlete: 'Yohan Blake', country: 'Jamaica', team: 'Wisla' },
        ],
        enableAdvancedFilter: true,
    };

    test('each column offers its own values, alternating within one expression', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TWO_SET_COLUMNS);
        const af = AdvancedFilterHarness.get(api);

        // Alternating is what a single-slot list cache would get wrong: the second column's list must not
        // be answered from the first's, nor the first's from the second's on the way back.
        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica', 'Poland']);

        await af.type('[Team] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Racers', 'Wisla']);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica', 'Poland']);
    });

    test('a condition on each column filters by both', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TWO_SET_COLUMNS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica"] AND [Team] is any of ["Wisla"]');

        expect(af.input.validationMessage).toBe('');
        await new GridRows(api, 'both set columns').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Yohan Blake" country:"Jamaica" team:"Wisla"
        `);
    });

    test('a value written for one column does not resolve against the other', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TWO_SET_COLUMNS);
        const af = AdvancedFilterHarness.get(api);

        // "Racers" is a Team, so the Country column has no such value and must say so.
        await af.applyExpression('[Country] is any of ["Racers"]');

        expect(af.input.validationMessage).toContain('Value not found');
        expect(api.getAdvancedFilterModel()).toBeNull();
    });
});

describe('Advanced Filter - a Set Filter on a column whose data type narrows its own options', () => {
    const gridsManager = new TestGridsManager({ modules: [...SET_MODULES, DateFilterModule] });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    /** A `dateString` column, which offers its relative options only on request and so has defaults of its own. */
    const dateColumn = (filter: string): GridOptions => ({
        columnDefs: [{ field: 'athlete' }, { field: 'day', cellDataType: 'dateString', filter }],
        rowData: [
            { athlete: 'Usain Bolt', day: '2024-01-01' },
            { athlete: 'Anna Kowalski', day: '2024-02-01' },
        ],
        enableAdvancedFilter: true,
    });

    test('offers the set options alongside the ones the data type offers by default', async () => {
        const plain = await gridsManager.createGridAndWait('plain', dateColumn('agDateColumnFilter'));
        const afPlain = AdvancedFilterHarness.get(plain);
        await afPlain.type('[Day] ');
        const withoutSet = afPlain.autocompleteEntries();
        // One grid at a time: the harness reads the document, so a second live grid doubles the list.
        plain.destroy();

        const set = await gridsManager.createGridAndWait('set', dateColumn('agSetColumnFilter'));
        const afSet = AdvancedFilterHarness.get(set);
        await afSet.type('[Day] ');

        // The set options are added to what the column already offers. A data type that narrows its own
        // suggestions — a date column holding back its relative options — must not narrow these away too.
        expect(afSet.autocompleteEntries()).toEqual([...withoutSet, 'is any of', 'is none of']);
        // A pair that both offered nothing would agree without proving anything.
        expect(withoutSet.length).toBeGreaterThan(0);
    });
});

describe('Advanced Filter - Set Filter column without the Set Filter module', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('falls back to the options of its cell data type, and a set model is not applied', async () => {
        // Deliberate: the unresolvable `agSetColumnFilter` is what error #200 reports.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200] });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] ');
        expect(af.autocompleteEntries()).toEqual(TEXT_OPTIONS);
        expect(af.autocompleteEntries()).not.toContain('is any of');

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        } as AdvancedFilterModel);
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(ROW_DATA.length);

        // The missing module is reported rather than passing silently; id 200 is batched behind a debounce.
        await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    });
});
