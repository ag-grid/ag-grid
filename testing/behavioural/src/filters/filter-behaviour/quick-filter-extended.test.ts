import type { GetQuickFilterTextParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, QuickFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

interface Animal {
    name: string;
    habitat: string;
    lifespan: number;
}

const ROW_DATA: Animal[] = [
    { name: 'Tiger', habitat: 'Jungle', lifespan: 20 },
    { name: 'Penguin', habitat: 'Antarctic', lifespan: 15 },
    { name: 'Camel', habitat: 'Desert', lifespan: 40 },
    { name: 'Shark', habitat: 'Ocean', lifespan: 70 },
];

/**
 * Black-box coverage for QuickFilterModule gaps not covered by quick-filter.test.ts:
 * get/resetQuickFilter APIs, initial-option vs setGridOption, AND semantics, column-filter interaction,
 * getQuickFilterText exclusion, cacheQuickFilter, applyQuickFilterBeforePivotOrAgg, non-string warning.
 */
describe('Quick Filter — extended coverage', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, QuickFilterModule, TextFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('getQuickFilter reflects text set via setGridOption; clearing removes the filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
        });

        // No text yet: API reports absent and every row shows.
        expect(api.getQuickFilter()).toBeUndefined();
        expect(api.isQuickFilterPresent()).toBe(false);
        await new GridRows(api, 'no quick filter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Tiger" habitat:"Jungle"
            ├── LEAF id:1 name:"Penguin" habitat:"Antarctic"
            ├── LEAF id:2 name:"Camel" habitat:"Desert"
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);

        // getQuickFilter returns the raw (non-uppercased) text, not the internal parsed form.
        api.setGridOption('quickFilterText', 'Desert');
        await asyncSetTimeout(0);
        expect(api.getQuickFilter()).toBe('Desert');
        expect(api.isQuickFilterPresent()).toBe(true);
        await new GridRows(api, 'quick filter "Desert"').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"Camel" habitat:"Desert"
        `);

        // Empty string clears: present=false, but getQuickFilter echoes the stored option value.
        api.setGridOption('quickFilterText', '');
        await asyncSetTimeout(0);
        expect(api.getQuickFilter()).toBe('');
        expect(api.isQuickFilterPresent()).toBe(false);
        await new GridRows(api, 'quick filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Tiger" habitat:"Jungle"
            ├── LEAF id:1 name:"Penguin" habitat:"Antarctic"
            ├── LEAF id:2 name:"Camel" habitat:"Desert"
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);
    });

    test('quickFilterText supplied as an initial grid option filters on first render', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
            quickFilterText: 'Ocean',
        });

        expect(api.getQuickFilter()).toBe('Ocean');
        expect(api.isQuickFilterPresent()).toBe(true);
        await new GridRows(api, 'initial-option quick filter matches Shark').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);
    });

    test('multi-word AND is order-independent and parts may share a single column', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid', {
            columnDefs: [{ field: 'name' }, { field: 'city' }],
            rowData: [
                { name: 'Eric Cartman', city: 'Denver' },
                { name: 'Stan Marsh', city: 'Aspen' },
            ],
        });

        // Parts spread across two columns match the same row regardless of order.
        api.setGridOption('quickFilterText', 'eric denver');
        await asyncSetTimeout(0);
        await new GridRows(api, 'name+city parts match row 0').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Eric Cartman" city:"Denver"
        `);

        api.setGridOption('quickFilterText', 'denver eric');
        await asyncSetTimeout(0);
        await new GridRows(api, 'reversed order still matches row 0').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Eric Cartman" city:"Denver"
        `);

        // Both parts inside one column's aggregate text still match (AND within a column).
        api.setGridOption('quickFilterText', 'cartman eric');
        await asyncSetTimeout(0);
        await new GridRows(api, 'two parts within the name column').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Eric Cartman" city:"Denver"
        `);

        // Parts that live on different rows AND to nothing.
        api.setGridOption('quickFilterText', 'eric aspen');
        await asyncSetTimeout(0);
        await new GridRows(api, 'parts on different rows match nothing').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('custom parser receives uppercased text; matcher receives the uppercased newline-joined aggregate', async () => {
        const parserInputs: string[] = [];
        const matcherCalls: { parts: string[]; aggregate: string }[] = [];

        const api: GridApi = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: [ROW_DATA[0]], // single Tiger row keeps the recorded matcher calls deterministic
            quickFilterParser: (text) => {
                parserInputs.push(text);
                return text.split(',').map((p) => p.trim());
            },
            quickFilterMatcher: (parts, aggregate) => {
                matcherCalls.push({ parts, aggregate });
                return parts.every((p) => aggregate.includes(p));
            },
        });

        // Typed lower-case, comma-separated: the parser is invoked with the already-uppercased text.
        api.setGridOption('quickFilterText', 'tiger,jungle');
        await asyncSetTimeout(0);

        expect(parserInputs).toContain('TIGER,JUNGLE');
        // The matcher gets the parsed parts and the per-column values uppercased and '\n'-joined.
        const lastCall = matcherCalls[matcherCalls.length - 1];
        expect(lastCall.parts).toEqual(['TIGER', 'JUNGLE']);
        expect(lastCall.aggregate).toBe('TIGER\nJUNGLE');

        await new GridRows(api, 'comma parser + contains-all matcher keep Tiger').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Tiger" habitat:"Jungle"
        `);
    });

    test('quick filter and an active column filter must both pass (AND)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Avocado' }, { name: 'Banana' }, { name: 'Cherry' }, { name: 'Grape' }],
        });

        // Column filter alone: names containing "a" (Cherry has none).
        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Contains');
        await filter.setText('a');
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('name')).toEqual({ filterType: 'text', type: 'contains', filter: 'a' });
        await new FilterDom(api, 'column filter panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "a"
            AND
            operator: "Contains"
            input: ""
            model:
              filterType: "text"
              type: "contains"
              filter: "a"
        `);
        await new GridRows(api, 'column filter only').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Avocado"
            ├── LEAF id:1 name:"Banana"
            └── LEAF id:3 name:"Grape"
        `);

        // Add a quick filter for "o" — only rows passing BOTH remain (Avocado).
        api.setGridOption('quickFilterText', 'o');
        await asyncSetTimeout(0);
        expect(api.isQuickFilterPresent()).toBe(true);
        expect(api.isColumnFilterPresent()).toBe(true);
        await new GridRows(api, 'column filter AND quick filter').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Avocado"
        `);

        // Clearing the quick filter leaves the column filter in effect.
        api.setGridOption('quickFilterText', '');
        await asyncSetTimeout(0);
        expect(api.isQuickFilterPresent()).toBe(false);
        expect(api.isColumnFilterPresent()).toBe(true);
        await new GridRows(api, 'column filter remains after quick filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Avocado"
            ├── LEAF id:1 name:"Banana"
            └── LEAF id:3 name:"Grape"
        `);
    });

    test('getQuickFilterText returning null excludes that column from the search', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid', {
            columnDefs: [
                {
                    field: 'name',
                    // Hide the name column's text entirely from the quick filter.
                    getQuickFilterText: () => null as unknown as string,
                },
                { field: 'city' },
            ],
            rowData: [
                { name: 'Denver', city: 'Colorado' },
                { name: 'Aspen', city: 'Utah' },
            ],
        });

        // "denver" only exists in the excluded name column ⇒ no match.
        api.setGridOption('quickFilterText', 'denver');
        await asyncSetTimeout(0);
        await new GridRows(api, 'excluded column value matches nothing').check(`
            ROOT id:ROOT_NODE_ID
        `);

        // The city column still participates.
        api.setGridOption('quickFilterText', 'colorado');
        await asyncSetTimeout(0);
        await new GridRows(api, 'included column value still matches').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Denver" city:"Colorado"
        `);
    });

    test('cacheQuickFilter combined with getQuickFilterText filters on the derived text', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [
                {
                    field: 'name',
                    getQuickFilterText: (params: GetQuickFilterTextParams<Animal>) =>
                        params.data!.lifespan >= 50 ? 'LONG_LIVED' : 'SHORT_LIVED',
                },
                { field: 'habitat' },
            ],
            rowData: ROW_DATA,
            cacheQuickFilter: true,
        });

        api.setGridOption('quickFilterText', 'LONG_LIVED');
        await asyncSetTimeout(0);
        await new GridRows(api, 'cached derived text — long lived').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);

        // Re-filter on a different derived token to confirm the cache re-evaluates per part.
        api.setGridOption('quickFilterText', 'SHORT_LIVED');
        await asyncSetTimeout(0);
        await new GridRows(api, 'cached derived text — short lived').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Tiger" habitat:"Jungle"
            ├── LEAF id:1 name:"Penguin" habitat:"Antarctic"
            └── LEAF id:2 name:"Camel" habitat:"Desert"
        `);
    });

    test('resetQuickFilter rebuilds cached text after external getQuickFilterText state changes', async () => {
        // getQuickFilterText derives its token from external state, not the row data — the documented
        // case where the cached aggregate text must be reset manually after that state changes.
        const tokens: Record<string, string> = { Tiger: 'MATCH', Penguin: 'MISS', Camel: 'MISS', Shark: 'MISS' };
        const api: GridApi = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [
                { field: 'name', getQuickFilterText: (p: GetQuickFilterTextParams<Animal>) => tokens[p.data!.name] },
                { field: 'habitat' },
            ],
            rowData: ROW_DATA,
            cacheQuickFilter: true,
        });

        api.setGridOption('quickFilterText', 'MATCH');
        await asyncSetTimeout(0);
        await new GridRows(api, 'cached token matches Tiger').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Tiger" habitat:"Jungle"
        `);

        // Flip the external state so Tiger should drop and Shark should match, then re-run filtering.
        // The cached aggregate text is not auto-invalidated, so the stale result persists.
        tokens.Tiger = 'MISS';
        tokens.Shark = 'MATCH';
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'stale cache keeps the old result').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Tiger" habitat:"Jungle"
        `);

        // resetQuickFilter rebuilds the aggregate text so the filter re-evaluates against fresh tokens.
        api.resetQuickFilter();
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'after resetQuickFilter uses fresh tokens').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);
    });

    test('non-string quickFilterText is rejected with a warning and does not filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
        });

        const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            api.setGridOption('quickFilterText', 123 as unknown as string);
            await asyncSetTimeout(0);

            expect(warnSpy).toHaveBeenCalled();
            expect(warnSpy.mock.calls.flat().join(' ')).toContain('quickFilterText');
        } finally {
            warnSpy.mockRestore();
        }

        // The invalid value is ignored for filtering — no filter applied, all rows visible.
        expect(api.isQuickFilterPresent()).toBe(false);
        await new GridRows(api, 'invalid quick filter ignored').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Tiger" habitat:"Jungle"
            ├── LEAF id:1 name:"Penguin" habitat:"Antarctic"
            ├── LEAF id:2 name:"Camel" habitat:"Desert"
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);
    });
});

describe('Quick Filter — applyQuickFilterBeforePivotOrAgg', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, QuickFilterModule, RowGroupingModule, PivotModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    const PIVOT_ROWS = [
        { country: 'Russia', sport: 'Gymnastics', gold: 3 },
        { country: 'USA', sport: 'Gymnastics', gold: 4 },
        { country: 'USA', sport: 'Swimming', gold: 2 },
    ];

    test('applyQuickFilterBeforePivotOrAgg=true filters leaves by their raw column values', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            applyQuickFilterBeforePivotOrAgg: true,
            rowData: PIVOT_ROWS,
        });

        // 'swimming' is a raw leaf value; before-agg mode keeps only the matching leaf.
        api.setGridOption('quickFilterText', 'swimming');
        await asyncSetTimeout(0);
        await new GridRows(api, 'before-agg quick filter on leaf value').check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Swimming_gold:2
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport_Swimming_gold:2
            · └── LEAF hidden id:2 pivot_sport_Swimming_gold:2
        `);
    });

    test('applyQuickFilterBeforePivotOrAgg=false (default) searches pivot-result columns', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            rowData: PIVOT_ROWS,
        });

        // The same raw leaf text no longer matches: default mode searches the pivot-result columns
        // (whose values are the numeric gold totals), not the leaf's own country/sport text.
        api.setGridOption('quickFilterText', 'swimming');
        await asyncSetTimeout(0);
        await new GridRows(api, 'default-mode does not match raw leaf text').check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Gymnastics_gold:7 pivot_sport_Swimming_gold:2
        `);
    });
});
