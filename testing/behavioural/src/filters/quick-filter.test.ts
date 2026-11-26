import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GetQuickFilterTextParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';

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

    test('cacheQuickFilter filters on the current columns and definitions once the quick filter text changes', async () => {
        interface Result {
            country: string;
            year: number;
            sport: string;
        }
        const api = await gridsManager.createGridAndWait<Result>('grid', {
            columnDefs: [{ field: 'country' }, { field: 'year' }, { field: 'sport' }],
            rowData: [
                { country: 'Ireland', year: 2000, sport: 'Golf' },
                { country: 'Spain', year: 2004, sport: 'Swim' },
                { country: 'Italy', year: 2008, sport: 'Golf' },
            ],
            cacheQuickFilter: true,
        });

        const displayedCountries = () => {
            const countries: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => {
                if (!node.group) {
                    countries.push(node.data!.country);
                }
            });
            return countries;
        };

        api.setGridOption('quickFilterText', '2004');
        await waitFor(() => expect(displayedCountries()).toEqual(['Spain']));

        // no visible column holds '200' once year is hidden
        api.setColumnsVisible(['year'], false);
        expect(api.getColumn('year')!.isVisible()).toBe(false);
        api.setGridOption('quickFilterText', '200');
        await waitFor(() => expect(displayedCountries()).toEqual([]));

        api.setColumnsVisible(['year'], true);
        expect(api.getColumn('year')!.isVisible()).toBe(true);
        api.setGridOption('quickFilterText', '2008');
        await waitFor(() => expect(displayedCountries()).toEqual(['Italy']));

        api.setGridOption('columnDefs', [
            { field: 'country' },
            { field: 'year', getQuickFilterText: () => 'zzz' },
            { field: 'sport' },
        ]);
        api.setGridOption('quickFilterText', 'zzz');
        await waitFor(() => expect(displayedCountries()).toEqual(['Ireland', 'Spain', 'Italy']));

        api.setGridOption('quickFilterText', '2004');
        await waitFor(() => expect(displayedCountries()).toEqual([]));

        api.setColumnsVisible(['year'], false);
        expect(api.getColumn('year')!.isVisible()).toBe(false);
        expect(api.getGridOption('includeHiddenColumnsInQuickFilter')).toBeFalsy();
        api.setGridOption('quickFilterText', 'zz');
        await waitFor(() => expect(displayedCountries()).toEqual([]));

        api.setGridOption('includeHiddenColumnsInQuickFilter', true);
        expect(api.getGridOption('includeHiddenColumnsInQuickFilter')).toBe(true);
        api.setGridOption('quickFilterText', 'zzz');
        await waitFor(() => expect(displayedCountries()).toEqual(['Ireland', 'Spain', 'Italy']));
    });

    test('rows follow a column being hidden or shown without another filter change, cached or not, unless hidden columns are included', async () => {
        interface Result {
            country: string;
            year: number;
        }
        const rowData: Result[] = [
            { country: 'Ireland', year: 2000 },
            { country: 'Spain', year: 2004 },
            { country: 'Italy', year: 2008 },
        ];
        const columnDefs = [{ field: 'country' }, { field: 'year' }];

        const displayedCountries = (api: GridApi<Result>) => {
            const countries: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => {
                if (!node.group) {
                    countries.push(node.data!.country);
                }
            });
            return countries;
        };

        // default: hidden columns are not matched, and the rows follow the visibility change
        const api = await gridsManager.createGridAndWait<Result>('default', {
            columnDefs,
            rowData,
            quickFilterText: '2004',
        });
        expect(displayedCountries(api)).toEqual(['Spain']);

        api.setColumnsVisible(['year'], false);
        expect(api.getColumn('year')!.isVisible()).toBe(false);
        await waitFor(() => expect(displayedCountries(api)).toEqual([]));

        api.setColumnsVisible(['year'], true);
        expect(api.getColumn('year')!.isVisible()).toBe(true);
        await waitFor(() => expect(displayedCountries(api)).toEqual(['Spain']));

        // hidden or shown by a column state, the rows follow as well
        api.applyColumnState({ state: [{ colId: 'year', hide: true }] });
        await waitFor(() => expect(displayedCountries(api)).toEqual([]));
        api.applyColumnState({ state: [{ colId: 'year', hide: false }] });
        await waitFor(() => expect(displayedCountries(api)).toEqual(['Spain']));

        // hidden columns included: hiding keeps the match
        const includeApi = await gridsManager.createGridAndWait<Result>('include', {
            columnDefs,
            rowData,
            includeHiddenColumnsInQuickFilter: true,
            quickFilterText: '2004',
        });
        expect(displayedCountries(includeApi)).toEqual(['Spain']);

        includeApi.setColumnsVisible(['year'], false);
        expect(includeApi.getColumn('year')!.isVisible()).toBe(false);
        await waitFor(() => expect(displayedCountries(includeApi)).toEqual(['Spain']));

        // cached quick filter text follows the visibility change too
        const cachedApi = await gridsManager.createGridAndWait<Result>('cached', {
            columnDefs,
            rowData,
            cacheQuickFilter: true,
            quickFilterText: '2004',
        });
        expect(displayedCountries(cachedApi)).toEqual(['Spain']);

        cachedApi.setColumnsVisible(['year'], false);
        expect(cachedApi.getColumn('year')!.isVisible()).toBe(false);
        await waitFor(() => expect(displayedCountries(cachedApi)).toEqual([]));

        cachedApi.setColumnsVisible(['year'], true);
        expect(cachedApi.getColumn('year')!.isVisible()).toBe(true);
        await waitFor(() => expect(displayedCountries(cachedApi)).toEqual(['Spain']));
    });

    describe('events raised by a quick filter option change', () => {
        const ANIMALS: Animal[] = [
            { name: 'Tiger', habitat: 'Jungle', lifespan: 20 },
            { name: 'Shark', habitat: 'Ocean', lifespan: 70 },
        ];

        const displayedNames = (api: GridApi<Animal>) => {
            const names: string[] = [];
            api.forEachNodeAfterFilter((node) => {
                if (!node.group) {
                    names.push(node.data!.name);
                }
            });
            return names;
        };

        // createGridAndWait hangs when the quick filter hides every row, so wait one turn instead.
        const createReadyGrid = async (options: Parameters<typeof gridsManager.createGrid<Animal>>[1]) => {
            const api = gridsManager.createGrid<Animal>('grid', options);
            await asyncSetTimeout(0);
            const events: string[] = [];
            api.addEventListener('filterChanged', () => events.push('filterChanged'));
            api.addEventListener('modelUpdated', () => events.push('modelUpdated'));
            return { api, events };
        };

        const columnDefs = [{ field: 'name' }, { field: 'habitat', hide: true }];

        test('excluding hidden columns drops the rows they match and including them shows those rows again, each with one filterChanged then one modelUpdated', async () => {
            const { api, events } = await createReadyGrid({
                columnDefs,
                rowData: ANIMALS,
                quickFilterText: 'Ocean',
                includeHiddenColumnsInQuickFilter: true,
            });
            expect(displayedNames(api)).toEqual(['Shark']);

            api.setGridOption('includeHiddenColumnsInQuickFilter', false);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            expect(displayedNames(api)).toEqual([]);
            expect(events).toEqual(['filterChanged', 'modelUpdated']);

            events.length = 0;
            api.setGridOption('includeHiddenColumnsInQuickFilter', true);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            expect(displayedNames(api)).toEqual(['Shark']);
            expect(events).toEqual(['filterChanged', 'modelUpdated']);
        });

        test('toggling applyQuickFilterBeforePivotOrAgg without pivot keeps the rows, with one filterChanged then one modelUpdated', async () => {
            const { api, events } = await createReadyGrid({
                columnDefs: [{ field: 'name' }, { field: 'habitat' }],
                rowData: ANIMALS,
                quickFilterText: 'Ocean',
            });
            expect(displayedNames(api)).toEqual(['Shark']);

            api.setGridOption('applyQuickFilterBeforePivotOrAgg', true);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            expect(displayedNames(api)).toEqual(['Shark']);
            expect(events).toEqual(['filterChanged', 'modelUpdated']);
        });

        test('moving a column raises neither filterChanged nor modelUpdated', async () => {
            const { api, events } = await createReadyGrid({
                columnDefs: [{ field: 'name' }, { field: 'habitat' }],
                rowData: ANIMALS,
                quickFilterText: 'Ocean',
            });
            expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['name', 'habitat']);

            api.moveColumns(['habitat'], 0);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['habitat', 'name']);
            expect(displayedNames(api)).toEqual(['Shark']);

            // control: the same listeners do see a filter change after the same wait
            expect(events).toEqual([]);
            api.setGridOption('quickFilterText', 'Tiger');
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
            expect(events).toEqual(['filterChanged', 'modelUpdated']);
        });

        test('a column width set through column state raises neither filterChanged nor modelUpdated', async () => {
            const { api, events } = await createReadyGrid({
                columnDefs: [{ field: 'name' }, { field: 'habitat' }],
                rowData: ANIMALS,
                quickFilterText: 'Ocean',
            });

            api.applyColumnState({ state: [{ colId: 'habitat', width: 300 }] });
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            expect(api.getColumn('habitat')!.getActualWidth()).toBe(300);
            expect(displayedNames(api)).toEqual(['Shark']);
            expect(events).toEqual([]);

            // control: the same listeners do see a filter change after the same wait
            api.setGridOption('quickFilterText', 'Tiger');
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
            expect(events).toEqual(['filterChanged', 'modelUpdated']);
        });

        test('hiding a column with no quick filter set raises neither filterChanged nor modelUpdated', async () => {
            const { api, events } = await createReadyGrid({
                columnDefs: [{ field: 'name' }, { field: 'habitat' }],
                rowData: [{ name: 'Tiger', habitat: 'Jungle', lifespan: 20 }],
            });

            api.setColumnsVisible(['habitat'], false);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            expect(api.getColumn('habitat')!.isVisible()).toBe(false);
            expect(events).toEqual([]);

            // control: the same listeners do see a filter change after the same wait
            api.setGridOption('quickFilterText', 'Tiger');
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
            expect(events).toEqual(['filterChanged', 'modelUpdated']);
        });
    });
});
