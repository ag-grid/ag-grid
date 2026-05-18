import type { GetQuickFilterTextParams } from 'ag-grid-community';
import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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

describe('QuickFilterService', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, QuickFilterModule],
    });

    afterEach(() => gridsManager.reset());

    test('substring match is case-insensitive', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
        });

        api.setGridOption('quickFilterText', 'tiger');
        await asyncSetTimeout(0);

        await new GridRows(api, 'lowercase "tiger" matches "Tiger"').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Tiger" habitat:"Jungle"
        `);
    });

    test('matches across any column (OR across columns)', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
        });

        api.setGridOption('quickFilterText', 'Ocean');
        await asyncSetTimeout(0);

        // 'Ocean' isn't in any name but is in Shark's habitat — row should match.
        await new GridRows(api, 'habitat "Ocean" matches Shark row').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);
    });

    test('space-separated parts are treated as AND', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
        });

        // 'Shark' is the name, 'Ocean' is the habitat — both parts must match the
        // same row's aggregate text.
        api.setGridOption('quickFilterText', 'Shark Ocean');
        await asyncSetTimeout(0);

        await new GridRows(api, 'both parts match only the Shark row').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);

        // 'Shark' and 'Jungle' never co-exist on a single row.
        api.setGridOption('quickFilterText', 'Shark Jungle');
        await asyncSetTimeout(0);

        await new GridRows(api, 'AND across different rows matches nothing').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('clearing quick filter restores all rows', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
        });

        api.setGridOption('quickFilterText', 'Tiger');
        await asyncSetTimeout(0);
        expect(api.isQuickFilterPresent()).toBe(true);

        api.setGridOption('quickFilterText', '');
        await asyncSetTimeout(0);
        expect(api.isQuickFilterPresent()).toBe(false);

        await new GridRows(api, 'filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Tiger" habitat:"Jungle"
            ├── LEAF id:1 name:"Penguin" habitat:"Antarctic"
            ├── LEAF id:2 name:"Camel" habitat:"Desert"
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);
    });

    test('custom quickFilterParser overrides default space split', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
            // Split on commas rather than whitespace so multi-word habitat strings work.
            quickFilterParser: (text) => text.split(',').map((p) => p.trim().toUpperCase()),
        });

        // Without the custom parser, 'Tiger Penguin' would AND the two parts and match
        // nothing. The parser treats it as a single unbroken part, which matches
        // neither. Using a comma now AND-joins the two.
        api.setGridOption('quickFilterText', 'TIGER,JUNGLE');
        await asyncSetTimeout(0);

        await new GridRows(api, 'comma parser ANDs "TIGER" and "JUNGLE"').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Tiger" habitat:"Jungle"
        `);
    });

    test('custom quickFilterMatcher replaces default contains logic', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
            // Match only when the aggregate text starts with the first part.
            quickFilterMatcher: (parts, aggregate) => aggregate.startsWith(parts[0]),
        });

        // Aggregate text is 'NAME\nHABITAT' uppercased. 'TIGER' starts Tiger's aggregate.
        api.setGridOption('quickFilterText', 'TIGER');
        await asyncSetTimeout(0);

        await new GridRows(api, 'startsWith matcher only matches Tiger').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Tiger" habitat:"Jungle"
        `);

        // 'JUNGLE' is only inside Tiger's aggregate (not at the start).
        api.setGridOption('quickFilterText', 'JUNGLE');
        await asyncSetTimeout(0);

        await new GridRows(api, 'startsWith matcher rejects mid-string').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('colDef.getQuickFilterText overrides the raw cell value', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [
                {
                    field: 'name',
                    // Expose lifespan-style text instead of the raw name.
                    getQuickFilterText: (params: GetQuickFilterTextParams<Animal>) =>
                        params.data!.lifespan >= 50 ? 'LONG_LIVED' : 'SHORT_LIVED',
                },
                { field: 'habitat' },
            ],
            rowData: ROW_DATA,
        });

        api.setGridOption('quickFilterText', 'LONG_LIVED');
        await asyncSetTimeout(0);

        // Only Shark has lifespan >= 50.
        await new GridRows(api, 'only long-lived match from getQuickFilterText').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);

        // 'Tiger' is the raw name but not what getQuickFilterText returns.
        api.setGridOption('quickFilterText', 'Tiger');
        await asyncSetTimeout(0);

        await new GridRows(api, 'raw name ignored when getQuickFilterText replaces it').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('includeHiddenColumnsInQuickFilter toggles hidden column participation', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [
                { field: 'name' },
                { field: 'habitat', hide: true }, // hidden column
            ],
            rowData: ROW_DATA,
        });

        // Default: hidden columns are excluded from quick filter.
        api.setGridOption('quickFilterText', 'Ocean');
        await asyncSetTimeout(0);

        await new GridRows(api, 'hidden habitat column excluded by default').check(`
            ROOT id:ROOT_NODE_ID
        `);

        // Enable inclusion of hidden columns.
        api.setGridOption('includeHiddenColumnsInQuickFilter', true);
        await asyncSetTimeout(0);

        await new GridRows(api, 'hidden habitat column included after toggle').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"Shark" habitat:"Ocean"
        `);
    });

    test('cacheQuickFilter produces the same result as uncached', async () => {
        const api = await gridsManager.createGridAndWait<Animal>('grid', {
            columnDefs: [{ field: 'name' }, { field: 'habitat' }],
            rowData: ROW_DATA,
            cacheQuickFilter: true,
        });

        api.setGridOption('quickFilterText', 'Desert');
        await asyncSetTimeout(0);

        await new GridRows(api, 'cached quick filter matches Camel row').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"Camel" habitat:"Desert"
        `);

        // Changing the filter should re-evaluate using the cache without a stale result.
        api.setGridOption('quickFilterText', 'Tiger');
        await asyncSetTimeout(0);

        await new GridRows(api, 'cached quick filter re-evaluates on change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Tiger" habitat:"Jungle"
        `);
    });
});
