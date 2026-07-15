import type { GridApi, GridOptions, IFilterOptionDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import { AdvancedFilterModule, SetFilterModule } from 'ag-grid-enterprise';

import { AdvancedFilterHarness, FilterDom, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Regression baseline for Advanced Filter grid options and current operator behaviour: display-name/colId
 * resolution, `includeHiddenColumnsInAdvancedFilter`, `suppressAdvancedFilterEval`, `advancedFilterParent`;
 * operators the tickets will ADD but don't offer today (AG-10029 presets, AG-10029/10819 inRange, AG-10819
 * custom filterOptions); and Set Filter columns treated as text (AG-8950). Locks each so tickets are visible diffs.
 */

describe('Advanced Filter — grid options', () => {
    interface Row {
        athlete: string;
        age: number;
    }

    const ROW_DATA: Row[] = [
        { athlete: 'Bolt', age: 25 },
        { athlete: 'Ng', age: 40 },
        { athlete: 'Wei', age: 28 },
    ];

    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    describe('column display name / colId resolution', () => {
        const OPTS: GridOptions<Row> = {
            columnDefs: [
                { field: 'athlete', headerName: 'Competitor', filter: true },
                { field: 'age', filter: true },
            ],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        };

        test('the expression uses the display header name and resolves to the colId', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);

            await AdvancedFilterHarness.get(api).applyExpression('[Competitor] equals "Bolt"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'equals',
                filter: 'Bolt',
            });
            await new GridRows(api, 'renamed header applied').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Bolt" age:25
            `);
        });

        test('the underlying field name is not accepted when the header is renamed', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] equals "Bolt"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            await new FilterDom(api, 'field name rejected').checkFilterDom(`
                ADVANCED FILTER
                input: "[Athlete] equals "Bolt""
                valid: false — Expression has an error. Column not found - [Athlete] equals "Bolt".
                buttons: Apply ⊘ | Builder
                model: null
            `);
        });

        test('setting a model by colId renders the display name in the editor', async () => {
            const api = await gridsManager.createGridAndWait('grid1', OPTS);

            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'equals', filter: 'Ng' });
            await asyncSetTimeout(0);
            expect(AdvancedFilterHarness.get(api).value).toBe('[Competitor] equals "Ng"');
        });
    });

    describe('includeHiddenColumnsInAdvancedFilter', () => {
        test('a hidden column is not available by default', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: true },
                    { field: 'age', filter: true, hide: true },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });

            await AdvancedFilterHarness.get(api).applyExpression('[Age] > 30');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            await new GridRows(api, 'hidden column default rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25
                ├── LEAF id:1 athlete:"Ng" age:40
                └── LEAF id:2 athlete:"Wei" age:28
            `);
        });

        test('includeHiddenColumnsInAdvancedFilter:true makes a hidden column filterable', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: true },
                    { field: 'age', filter: true, hide: true },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
                includeHiddenColumnsInAdvancedFilter: true,
            });

            await AdvancedFilterHarness.get(api).applyExpression('[Age] > 30');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'greaterThan',
                filter: 30,
            });
            await new GridRows(api, 'hidden column included rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 athlete:"Ng" age:40
            `);
        });
    });

    describe('suppressAdvancedFilterEval (deprecated no-op since v34)', () => {
        test('the option has no effect — the filter still evaluates client-side', async () => {
            // The deprecated option logs warning #306 on grid creation — assert it fires, don't leak it.
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: true },
                    { field: 'age', filter: true },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
                suppressAdvancedFilterEval: true,
            });
            expect(warnSpy.mock.calls.some((c) => c.join(' ').includes('suppressAdvancedFilterEval'))).toBe(true);
            warnSpy.mockRestore();

            await AdvancedFilterHarness.get(api).applyExpression('[Age] > 30');
            await asyncSetTimeout(0);

            // No-op since v34 (advanced filter no longer uses function evaluation): the grid filters normally.
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'greaterThan',
                filter: 30,
            });
            await new GridRows(api, 'deprecated suppress-eval still filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 athlete:"Ng" age:40
            `);
        });
    });

    describe('advancedFilterParent', () => {
        test('the editor renders into the custom parent, not the grid header', async () => {
            const parent = document.createElement('div');
            parent.className = 'custom-af-parent';
            document.body.appendChild(parent);

            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: true },
                    { field: 'age', filter: true },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
                advancedFilterParent: parent,
            });
            await asyncSetTimeout(0);

            const input = parent.querySelector<HTMLInputElement>('.ag-advanced-filter input[type=text]');
            expect(input).not.toBeNull();
            expect(getGridElement(api)!.querySelector('.ag-header .ag-advanced-filter')).toBeNull();

            parent.remove();
        });
    });
});

describe('Advanced Filter — currently-unsupported operators (baseline)', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    describe('relative-date-preset column (filterOptions with preset keys)', () => {
        // Preset keys are strings, so AF lists them as active operators and must reconcile each
        // against the built-in AF operators (which exclude presets) without crashing.
        const OPTS: GridOptions = {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { filterOptions: ['today', 'yesterday', 'equals'] },
                },
            ],
            rowData: [{ date: '2024-01-01' }, { date: '2024-06-15' }],
            enableAdvancedFilter: true,
        };

        test('operator autocomplete does not crash and offers the reconciled operators', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', OPTS);
            const af = AdvancedFilterHarness.get(api);

            // Trailing space puts the cursor at the operator slot, triggering operator autocomplete.
            await af.type('[Date] ');
            await asyncSetTimeout(0);

            // Before the getEntries guard this threw (preset key not in the AF operator map) and the
            // popup never opened.
            expect(af.isAutocompleteOpen()).toBe(true);
        });

        test('a preset key is not an AF operator; a standard operator from the list still applies', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', OPTS);

            // `today` is a preset, not an AF operator → rejected today (AG-10029 will add it).
            await AdvancedFilterHarness.get(api).applyExpression('[Date] today');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            await new FilterDom(api, 'preset operator rejected').checkFilterDom(`
                ADVANCED FILTER
                input: "[Date] today"
                valid: false — Expression has an error. Option not found - today.
                buttons: Apply ⊘ | Builder
                model: null
            `);

            // `equals` is in the list and is a real AF operator → applies.
            await AdvancedFilterHarness.get(api).applyExpression('[Date] = "2024-06-15"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateString',
                colId: 'date',
                type: 'equals',
                filter: '2024-06-15',
            });
            await new GridRows(api, 'preset column equals applied').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 date:"2024-06-15"
            `);
        });
    });

    describe('inRange is not offered today', () => {
        const OPTS: GridOptions = {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter' }],
            rowData: [{ age: 10 }, { age: 20 }, { age: 30 }],
            enableAdvancedFilter: true,
        };

        test('a hand-typed inRange expression is rejected', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', OPTS);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] inRange 15');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            await new FilterDom(api, 'inRange rejected').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] inRange 15"
                valid: false — Expression has an error. Option not found - inRange 15.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'inRange unfiltered').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 age:10
                ├── LEAF id:1 age:20
                └── LEAF id:2 age:30
            `);
        });
    });

    describe('custom (object) filterOptions are ignored today', () => {
        const EVEN: IFilterOptionDef = {
            displayKey: 'even',
            displayName: 'Is even',
            numberOfInputs: 0,
            predicate: (_v, cellValue) => typeof cellValue === 'number' && cellValue % 2 === 0,
        };
        const OPTS: GridOptions = {
            columnDefs: [
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['equals', EVEN] } },
            ],
            rowData: [{ age: 10 }, { age: 15 }, { age: 20 }],
            enableAdvancedFilter: true,
        };

        test('the custom option key is not an AF operator, but standard operators still work', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', OPTS);

            // The object option makes the whole list "not all strings", so AF falls back to its default
            // operators — the custom key is unknown.
            await AdvancedFilterHarness.get(api).applyExpression('[Age] even');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            await new FilterDom(api, 'custom option rejected').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] even"
                valid: false — Expression has an error. Option not found - even.
                buttons: Apply ⊘ | Builder
                model: null
            `);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] = 20');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'equals',
                filter: 20,
            });
            await new GridRows(api, 'custom column standard operator applied').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 age:20
            `);
        });
    });

    describe('string filterOptions restrict autocomplete suggestions only, not the parser', () => {
        const OPTS: GridOptions = {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { filterOptions: ['equals'] } }],
            rowData: [{ name: 'Bolt' }, { name: 'Ng' }],
            enableAdvancedFilter: true,
        };

        test('an operator outside the restricted list is still accepted by the parser', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', OPTS);

            // `contains` is a valid text operator but NOT in the column's restricted `filterOptions`.
            // The restriction only trims the autocomplete suggestions — the parser still accepts it,
            // so the expression applies. (Baseline for AG-10819: the operator set is not enforced.)
            await AdvancedFilterHarness.get(api).applyExpression('[Name] contains "o"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'name',
                type: 'contains',
                filter: 'o',
            });
            await new GridRows(api, 'restricted-but-parsed operator applied').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Bolt"
            `);

            await AdvancedFilterHarness.get(api).applyExpression('[Name] equals "Bolt"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'name',
                type: 'equals',
                filter: 'Bolt',
            });
        });
    });
});

describe('Advanced Filter — Set Filter column (current behaviour)', () => {
    interface Row {
        country: string;
    }

    const ROW_DATA: Row[] = [
        { country: 'Jamaica' },
        { country: 'Poland' },
        { country: 'United States' },
        { country: 'Jamaica' },
    ];

    const OPTS: GridOptions<Row> = {
        columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
        rowData: ROW_DATA,
        enableAdvancedFilter: true,
    };

    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, SetFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    test('a set column is treated as text: text operators apply and yield a text model', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Country] equals "Jamaica"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'country',
            type: 'equals',
            filter: 'Jamaica',
        });
        await new FilterDom(api, 'set column as text').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] equals "Jamaica""
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "text"
              colId: "country"
              type: "equals"
              filter: "Jamaica"
        `);
        await new GridRows(api, 'set column equals rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Jamaica"
            └── LEAF id:3 country:"Jamaica"
        `);
    });

    test('text contains works against the underlying value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Country] contains "United"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toMatchObject({ filterType: 'text', type: 'contains' });
        await new GridRows(api, 'set column contains rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 country:"United States"
        `);
    });

    test('there is no set-membership (IN) operator today', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Country] in ["Jamaica", "Poland"]');
        await asyncSetTimeout(0);

        // No `in` operator exists for a text column → rejected. AG-8950 will introduce it.
        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'set IN rejected').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] in ["Jamaica", "Poland"]"
            valid: false — Expression has an error. Option not found - in ["Jamaica", "Poland"].
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'set IN unfiltered rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Jamaica"
            ├── LEAF id:1 country:"Poland"
            ├── LEAF id:2 country:"United States"
            └── LEAF id:3 country:"Jamaica"
        `);
    });
});
