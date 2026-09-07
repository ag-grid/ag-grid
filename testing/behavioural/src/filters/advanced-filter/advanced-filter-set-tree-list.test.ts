import {
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridOptions, ISetFilterParams, KeyCreatorParams, SetAdvancedFilterModel } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { SET_MODULES, displayedAthletes } from './advancedFilterSetFixture';

describe('Advanced Filter - Set Filter tree list', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const TREE_OPTIONS: GridOptions = {
        columnDefs: [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: {
                    treeList: true,
                    treeListPathGetter: (value: string | null) => (value ? value.split('/') : null),
                },
            },
        ],
        rowData: [
            { athlete: 'Usain Bolt', country: 'Americas/Jamaica' },
            { athlete: 'Anna Kowalski', country: 'Europe/Poland' },
            { athlete: 'Emma Thompson', country: 'Europe/United Kingdom' },
        ],
        enableAdvancedFilter: true,
    };

    test('the list drills into groups and reports how many children each still offers', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Americas [1]', 'Europe [2]']);

        await af.type('[Country] is any of ["Europe" > ');
        expect(af.autocompleteEntries()).toEqual(['Poland', 'United Kingdom']);
        // Drilling in is a half-written value, so it must not be reported as naming nothing. The
        // unclosed list is still flagged, which is what the caret is actually missing.
        expect(af.input.validationMessage).not.toContain('Value not found');
        expect(af.input.validationMessage).toContain('Missing end bracket');
    });

    test('a cell renderer draws the leaves of a tree list, and not the groups', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...TREE_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        treeList: true,
                        treeListPathGetter: (value: string | null) => (value ? value.split('/') : null),
                        cellRenderer: (p: { value: string | null }) => `<em>${p.value ?? ''}</em>`,
                    },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        const rendered = () =>
            Array.from(document.querySelectorAll('.ag-autocomplete-list em')).map((e) => e.textContent);

        // A group is a path segment rather than a value, so there is nothing for a renderer to draw.
        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Americas [1]', 'Europe [2]']);
        expect(rendered()).toEqual([]);

        // The Set Filter's own tree list draws a leaf from its tree key, so the same value reaches here.
        await af.type('[Country] is any of ["Europe" > ');
        expect(af.autocompleteEntries()).toEqual(['Poland', 'United Kingdom']);
        expect(rendered()).toEqual(['Poland', 'United Kingdom']);

        // Searching reaches the same leaf by another route, so it must draw it the same way.
        await af.type('[Country] is any of [Pol');
        expect(rendered()).toEqual(['Poland']);
    });

    test('a blank value is offered and filtered on by the same label the Set Filter gives it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...TREE_OPTIONS,
            rowData: [...TREE_OPTIONS.rowData!, { athlete: 'Li Wei', country: null }],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toContain('(Blanks)');

        await af.applyExpression('[Country] is any of ["(Blanks)"]');
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual([null]);
        await new GridRows(api, 'blank tree value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 athlete:"Li Wei" country:null
        `);
    });

    test('a group with every leaf already chosen drops out of the list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of ["Americas" > "Jamaica", ');

        expect(af.autocompleteEntries()).toEqual(['Europe [2]']);
    });

    test('a written path filters the rows it names', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Europe" > "Poland"]');

        await new FilterDom(api, 'tree path').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Europe" > "Poland"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Europe/Poland"
        `);
        await new GridRows(api, 'tree path rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Anna Kowalski" country:"Europe/Poland"
        `);
    });

    test('a path naming no leaf is rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Europe" > "Atlantis"]');

        await new FilterDom(api, 'unknown tree path').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Europe" > "Atlantis"]"
            valid: false — Expression has an error. Value not found - "Europe" > "Atlantis".
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('reads a path however the separator between its segments is written', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const FORMS: Record<string, string> = {
            'the written separator': '[Country] is any of ["Europe" › "Poland"]',
            'the ASCII arrow a keyboard offers': '[Country] is any of ["Europe" > "Poland"]',
            'a slash': '[Country] is any of ["Europe" / "Poland"]',
            'no spacing around it': '[Country] is any of ["Europe">"Poland"]',
        };
        const outcomes: Record<string, unknown> = {};
        for (const name of Object.keys(FORMS)) {
            await af.applyExpression(FORMS[name]);
            outcomes[name] =
                af.input.validationMessage || (api.getAdvancedFilterModel() as SetAdvancedFilterModel).values;
        }

        expect(outcomes).toEqual({
            'the written separator': ['Europe/Poland'],
            'the ASCII arrow a keyboard offers': ['Europe/Poland'],
            'a slash': ['Europe/Poland'],
            'no spacing around it': ['Europe/Poland'],
        });
    });

    test('a path written in another case resolves, as a flat value does', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["EUROPE" > "poland"]');

        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Europe/Poland']);
    });

    test('a group written in another case offers its children, as the same path resolves', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of ["EUROPE" > ');

        expect(af.autocompleteEntries()).toEqual(['Poland', 'United Kingdom']);
    });

    test('caseSensitive makes the fold the identity, so only a path in its own case resolves', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...TREE_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        treeList: true,
                        treeListPathGetter: (value: string | null) => (value ? value.split('/') : null),
                        caseSensitive: true,
                    } satisfies ISetFilterParams,
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["EUROPE" > "poland"]');
        expect(af.input.validationMessage).toContain('Value not found');
        expect(api.getAdvancedFilterModel()).toBeNull();

        await af.applyExpression('[Country] is any of ["Europe" > "Poland"]');
        expect(af.input.validationMessage).toBe('');
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Europe/Poland']);
        expect(displayedAthletes(api)).toEqual(['Anna Kowalski']);

        // The same fold writes a model out, so a stored key in another case names no path and is written whole.
        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['europe/poland'],
        } as SetAdvancedFilterModel);
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Country] is any of ["europe/poland"]');
    });

    test('treeListFormatter re-labels the list and the expression is written in those labels', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...TREE_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        treeList: true,
                        treeListPathGetter: (value: string | null) => (value ? value.split('/') : null),
                        treeListFormatter: (pathKey: string | null, level: number) =>
                            level === 0 ? `${pathKey} region` : (pathKey ?? ''),
                    } satisfies ISetFilterParams,
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Americas region [1]', 'Europe region [2]']);

        await af.applyExpression('[Country] is any of ["Europe region" > "Poland"]');

        // The label is what is written; the model still stores the underlying key.
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Europe/Poland']);
    });

    test('a tree path is written back out of a stored model in its own labels', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Europe/Poland'],
        });
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Country] is any of ["Europe" › "Poland"]');
    });

    /** `Europe` lands on the path `EU`, which `Europe/Poland` also groups under: one row, two roles. */
    const GROUP_IS_ALSO_A_VALUE_OPTIONS: GridOptions = {
        columnDefs: [
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: {
                    treeList: true,
                    treeListPathGetter: (value: string | null) => {
                        if (!value) {
                            return null;
                        }
                        const country = value.split('/')[1];
                        return country ? ['EU', country] : ['EU'];
                    },
                } satisfies ISetFilterParams,
            },
        ],
        rowData: [{ country: 'Europe' }, { country: 'Europe/Poland' }],
        enableAdvancedFilter: true,
    };

    test('a value at a group own path is named by that path, not by its key', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUP_IS_ALSO_A_VALUE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        api.setAdvancedFilterModel({ filterType: 'set', colId: 'country', type: 'isAnyOf', values: ['Europe'] });
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Country] is any of ["EU"]');
    });

    test('a value at a group own path resolves from the expression, and filters to it alone', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUP_IS_ALSO_A_VALUE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["EU"]');

        expect(af.input.validationMessage).not.toContain('Value not found');
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Europe']);
        await new GridRows(api, 'group path as a value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Europe"
        `);
    });

    test('typing at the root searches the whole hierarchy, not just the level shown', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        // `Poland` is a child of `Europe`, so the drill-down level alone would offer nothing.
        await af.type('[Country] is any of [Pol');
        expect(af.autocompleteEntries()).toEqual(['Europe › Poland']);
    });

    test('a group is searchable too, so it can still be drilled into from a search', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [Euro');
        expect(af.autocompleteEntries()).toEqual(['Europe [2]', 'Europe › Poland', 'Europe › United Kingdom']);
    });

    test('a searched path draws its parents back, so the leaf is what the row names', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const parents = () =>
            Array.from(document.querySelectorAll('.ag-autocomplete-row-path-parent')).map((el) => el.textContent);
        const bold = (selector: string) =>
            Array.from(document.querySelectorAll(`${selector} b`)).map((el) => el.textContent);

        await af.type('[Country] is any of [Pol');
        expect(parents()).toEqual(['Europe › ']);
        expect(bold('.ag-autocomplete-list')).toEqual(['Pol']);

        // A match landing in a parent is still marked, so the drawn-back span has to be split around it
        // rather than wrapping whole nodes. The group row has no path, so it gets no parent span at all.
        await af.type('[Country] is any of [Euro');
        expect(af.autocompleteEntries()).toEqual(['Europe [2]', 'Europe › Poland', 'Europe › United Kingdom']);
        expect(parents()).toEqual(['Europe › ', 'Europe › ']);
        expect(bold('.ag-autocomplete-row-path-parent')).toEqual(['Euro', 'Euro']);
    });

    test('choosing a match found by searching writes the whole path it stands for', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [Pol');
        await af.selectAutocomplete();

        expect(af.value).toBe('[Country] is any of ["Europe" › "Poland", ');
        await af.applyExpression('[Country] is any of ["Europe" > "Poland"]');
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Europe/Poland']);
    });

    test('the search is relative to the path already written', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        // Inside `Europe` only its own descendants are searched, so Jamaica is out of scope.
        await af.type('[Country] is any of ["Europe" > n');
        expect(af.autocompleteEntries()).toEqual(['Poland', 'United Kingdom']);

        await af.type('[Country] is any of ["Europe" > Jam');
        expect(af.autocompleteEntries()).toEqual([]);
    });

    test('clearing the search puts the drill-down level back', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [Pol');
        expect(af.autocompleteEntries()).toEqual(['Europe › Poland']);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Americas [1]', 'Europe [2]']);
    });

    test('a value already written is not offered by the search either', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        // The same search before the value is written, so the empty result below is the value being
        // spoken for rather than a list that never opened.
        await af.type('[Country] is any of [Pol');
        expect(af.autocompleteEntries()).toEqual(['Europe › Poland']);

        await af.type('[Country] is any of ["Europe" > "Poland", Pol');
        expect(af.autocompleteEntries()).toEqual([]);
    });

    test('selecting a group drills in and selecting a leaf completes the value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [Euro');
        await af.selectAutocomplete();
        expect(af.value).toBe('[Country] is any of ["Europe" › ');

        await af.type('[Country] is any of ["Europe" > Pol');
        await af.selectAutocomplete();
        expect(af.value).toBe('[Country] is any of ["Europe" > "Poland", ');
    });
});

describe('Advanced Filter - Set Filter on a row group column', () => {
    const gridsManager = new TestGridsManager({ modules: [...SET_MODULES, RowGroupingModule] });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    // A grouping tree list keys every row by its whole group path, so both the offered list and the row
    // test go down `matchesKeys`'s grouping branch rather than reading the column's own value.
    const GROUPING_OPTIONS: GridOptions = {
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'sport', rowGroup: true, hide: true },
            {
                colId: 'group',
                headerName: 'Group',
                showRowGroup: true,
                cellRenderer: 'agGroupCellRenderer',
                field: 'athlete',
                filter: 'agSetColumnFilter',
                filterParams: {
                    treeList: true,
                    keyCreator: ({ value }: KeyCreatorParams) => (value ? value.join('#') : ''),
                } satisfies ISetFilterParams,
            },
        ],
        rowData: [
            { country: 'Jamaica', sport: 'Sprint', athlete: 'Usain Bolt' },
            { country: 'Poland', sport: 'Sprint', athlete: 'Anna Kowalski' },
            { country: 'Poland', sport: 'Swimming', athlete: 'Jan Nowak' },
        ],
        groupDefaultExpanded: -1,
        enableAdvancedFilter: true,
    };

    test('the value list is the group path, one level at a time', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Group] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica [1]', 'Poland [2]']);

        await af.type('[Group] is any of ["Poland" > ');
        expect(af.autocompleteEntries()).toEqual(['Sprint [1]', 'Swimming [1]']);

        await af.type('[Group] is any of ["Poland" > "Sprint" > ');
        expect(af.autocompleteEntries()).toEqual(['Anna Kowalski']);
    });

    test('a written group path filters to the leaf it names', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Group] is any of ["Poland" > "Sprint" > "Anna Kowalski"]');

        await new FilterDom(api, 'grouping tree path').checkFilterDom(`
            ADVANCED FILTER
            input: "[Group] is any of ["Poland" > "Sprint" > "Anna Kowalski"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "group"
              type: "isAnyOf"
              values:
                - "Poland#Sprint#Anna Kowalski"
        `);
        await new GridRows(api, 'grouping tree path rows').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Poland ag-Grid-AutoColumn:"Poland" group:"Poland"
            · └─┬ LEAF_GROUP id:row-group-country-Poland-sport-Sprint ag-Grid-AutoColumn:"Sprint" group:"Sprint"
            · · └── LEAF id:1 country:"Poland" sport:"Sprint" group:"Anna Kowalski"
        `);
    });

    test('is none of a group path leaves every other leaf', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Group] is none of ["Poland" > "Sprint" > "Anna Kowalski"]');

        await new GridRows(api, 'grouping is none of rows').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Jamaica ag-Grid-AutoColumn:"Jamaica" group:"Jamaica"
            │ └─┬ LEAF_GROUP id:row-group-country-Jamaica-sport-Sprint ag-Grid-AutoColumn:"Sprint" group:"Sprint"
            │ · └── LEAF id:0 country:"Jamaica" sport:"Sprint" group:"Usain Bolt"
            └─┬ filler id:row-group-country-Poland ag-Grid-AutoColumn:"Poland" group:"Poland"
            · └─┬ LEAF_GROUP id:row-group-country-Poland-sport-Swimming ag-Grid-AutoColumn:"Swimming" group:"Swimming"
            · · └── LEAF id:2 country:"Poland" sport:"Swimming" group:"Jan Nowak"
        `);
    });

    test('a group path only new row data creates reaches the value list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Group] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica [1]', 'Poland [2]']);

        api.setGridOption('rowData', [
            ...GROUPING_OPTIONS.rowData!,
            { country: 'Kenya', sport: 'Marathon', athlete: 'Eliud Kipchoge' },
        ]);
        await asyncSetTimeout(0);

        // The keys are the group paths, which only exist once the grouping stage has run over the new rows.
        await af.type('');
        await af.type('[Group] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica [1]', 'Kenya [1]', 'Poland [2]']);

        await af.applyExpression('[Group] is any of ["Kenya" > "Marathon" > "Eliud Kipchoge"]');
        expect(af.input.validationMessage).toBe('');
        await new GridRows(api, 'new group path filters to its own leaf').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Kenya ag-Grid-AutoColumn:"Kenya" group:"Kenya"
            · └─┬ LEAF_GROUP id:row-group-country-Kenya-sport-Marathon ag-Grid-AutoColumn:"Marathon" group:"Marathon"
            · · └── LEAF id:3 country:"Kenya" sport:"Marathon" group:"Eliud Kipchoge"
        `);
    });

    test('a stored group key is written back out as the path it names', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const model = {
            filterType: 'set' as const,
            colId: 'group',
            type: 'isAnyOf' as const,
            values: ['Poland#Sprint#Anna Kowalski'],
        };
        api.setAdvancedFilterModel(model);
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Group] is any of ["Poland" › "Sprint" › "Anna Kowalski"]');
        expect(api.getAdvancedFilterModel()).toEqual(model);
    });

    test('changing the row group columns re-derives the paths the list offers', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Group] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica [1]', 'Poland [2]']);

        // The key a row gets is built from the row group columns, so dropping one shortens every path.
        api.setRowGroupColumns(['country']);
        await asyncSetTimeout(0);

        await af.type('');
        await af.type('[Group] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica [1]', 'Poland [2]']);

        await af.type('[Group] is any of ["Poland" > ');
        expect(af.autocompleteEntries()).toEqual(['Anna Kowalski', 'Jan Nowak']);
    });

    test('a path from the old grouping no longer names a row once a group column is dropped', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Group] is any of ["Poland" > "Sprint" > "Anna Kowalski"]');
        api.setRowGroupColumns(['country']);
        await asyncSetTimeout(0);

        // The expression is left alone, as any row data change leaves it alone; it simply matches nothing.
        expect(af.value).toBe('[Group] is any of ["Poland" > "Sprint" > "Anna Kowalski"]');
        await new GridRows(api, 'stale grouping path rows').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('a group path naming a whole branch is not a leaf, so it is rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GROUPING_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Group] is any of ["Poland"]');

        expect(af.input.validationMessage).toContain('Value not found');
        expect(api.getAdvancedFilterModel()).toBeNull();
    });
});

describe('Advanced Filter - Set Filter on a tree data column', () => {
    const gridsManager = new TestGridsManager({ modules: [...SET_MODULES, TreeDataModule] });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    interface FileRow {
        path: string[];
        size: number;
    }

    // Tree data keys a row by its route, which is the other branch of `matchesKeys`: only leaves are
    // tested, and the row model brings the ancestors back for the ones that pass.
    const TREE_DATA_OPTIONS: GridOptions<FileRow> = {
        columnDefs: [
            {
                colId: 'group',
                headerName: 'Group',
                showRowGroup: true,
                cellRenderer: 'agGroupCellRenderer',
                filter: 'agSetColumnFilter',
                filterParams: {
                    treeList: true,
                    keyCreator: ({ value }: KeyCreatorParams) => (value ? value.join('/') : ''),
                } satisfies ISetFilterParams,
            },
            { field: 'size' },
        ],
        treeData: true,
        getDataPath: (data: FileRow) => data.path,
        rowData: [
            { path: ['docs', 'notes.txt'], size: 1 },
            { path: ['docs', 'plan.txt'], size: 2 },
            { path: ['src', 'main.ts'], size: 3 },
        ],
        groupDefaultExpanded: -1,
        enableAdvancedFilter: true,
    };

    test('the value list is the data path, one level at a time', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_DATA_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Group] is any of [');
        expect(af.autocompleteEntries()).toEqual(['docs [2]', 'src [1]']);

        await af.type('[Group] is any of ["docs" > ');
        expect(af.autocompleteEntries()).toEqual(['notes.txt', 'plan.txt']);
    });

    test('is none of a data path leaves every other leaf', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_DATA_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Group] is none of ["docs" > "plan.txt"]');

        // Asserted alongside the rows: a snapshot of an unfiltered grid cannot otherwise be told apart
        // from an expression that was rejected before it ever filtered.
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'set',
            colId: 'group',
            type: 'isNoneOf',
            values: ['docs/plan.txt'],
        });
        await new GridRows(api, 'tree data is none of rows').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs filler id:row-group-0-docs ag-Grid-AutoColumn:"docs" group:"docs"
            │ └── notes.txt LEAF id:0 ag-Grid-AutoColumn:"notes.txt" group:"notes.txt" size:1
            └─┬ src filler id:row-group-0-src ag-Grid-AutoColumn:"src" group:"src"
            · └── main.ts LEAF id:2 ag-Grid-AutoColumn:"main.ts" group:"main.ts" size:3
        `);
    });

    test('is none of every leaf leaves nothing', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_DATA_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Group] is none of ["docs" > "notes.txt", "docs" > "plan.txt", "src" > "main.ts"]');

        await new GridRows(api, 'tree data is none of every leaf').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('a row that is itself a group names no value, so the expression is rejected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...TREE_DATA_OPTIONS,
            rowData: [
                { path: ['docs'], size: 0 },
                { path: ['docs', 'notes.txt'], size: 1 },
                { path: ['src', 'main.ts'], size: 3 },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        // `docs` is a real row here, not only a filler, but the value list offers it as a group to drill
        // into rather than as a value, so nothing resolves and the grid is left unfiltered.
        await af.applyExpression('[Group] is any of ["docs"]');

        expect(af.input.validationMessage).toContain('Value not found');
        expect(api.getAdvancedFilterModel()).toBeNull();
        await new GridRows(api, 'tree data group row rows').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs GROUP id:0 ag-Grid-AutoColumn:"docs" group:"docs" size:0
            │ └── notes.txt LEAF id:1 ag-Grid-AutoColumn:"notes.txt" group:"notes.txt" size:1
            └─┬ src filler id:row-group-0-src ag-Grid-AutoColumn:"src" group:"src"
            · └── main.ts LEAF id:2 ag-Grid-AutoColumn:"main.ts" group:"main.ts" size:3
        `);
    });

    test('a written data path filters to the leaf it names, ancestors included', async () => {
        const api = await gridsManager.createGridAndWait('grid1', TREE_DATA_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Group] is any of ["docs" > "plan.txt"]');

        await new FilterDom(api, 'tree data path').checkFilterDom(`
            ADVANCED FILTER
            input: "[Group] is any of ["docs" > "plan.txt"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "group"
              type: "isAnyOf"
              values:
                - "docs/plan.txt"
        `);
        await new GridRows(api, 'tree data path rows').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ docs filler id:row-group-0-docs ag-Grid-AutoColumn:"docs" group:"docs"
            · └── plan.txt LEAF id:1 ag-Grid-AutoColumn:"plan.txt" group:"plan.txt" size:2
        `);
    });
});

describe('Advanced Filter - Set Filter tree list holding the separators', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    // Paths split on `|`, so a segment is free to hold the characters the expression reads as separators.
    const SEPARATOR_TREE_OPTIONS: GridOptions = {
        columnDefs: [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: {
                    treeList: true,
                    treeListPathGetter: (value: string | null) => (value ? value.split('|') : null),
                } satisfies ISetFilterParams,
            },
        ],
        rowData: [
            { athlete: 'A', country: 'Arrow > Group|Leaf' },
            { athlete: 'B', country: 'Slash / Group|2024/01' },
            { athlete: 'C', country: 'Plain|Guillemet › Leaf' },
        ],
        enableAdvancedFilter: true,
    };

    test('a segment holding a separator is offered as it stands', async () => {
        const api = await gridsManager.createGridAndWait('grid1', SEPARATOR_TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Arrow > Group [1]', 'Plain [1]', 'Slash / Group [1]']);

        await af.type('[Country] is any of ["Slash / Group" > ');
        expect(af.autocompleteEntries()).toEqual(['2024/01']);
    });

    test('choosing a segment holding a separator writes it quoted, so the path still reads', async () => {
        const api = await gridsManager.createGridAndWait('grid1', SEPARATOR_TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [Slash');
        await af.selectAutocomplete();
        expect(af.value).toBe('[Country] is any of ["Slash / Group" › ');

        await af.append('2024');
        await af.selectAutocomplete();
        expect(af.value).toBe('[Country] is any of ["Slash / Group" › "2024/01", ');

        await af.applyExpression('[Country] is any of ["Slash / Group" > "2024/01"]');
        expect(af.input.validationMessage).toBe('');
        await new GridRows(api, 'separator in a tree segment').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"B" country:"Slash / Group|2024/01"
        `);
    });

    test('a stored path holding a separator is written back quoted segment by segment', async () => {
        const api = await gridsManager.createGridAndWait('grid1', SEPARATOR_TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const KEYS: Record<string, string> = {
            'the written separator in a group name': 'Arrow > Group|Leaf',
            'a slash in a leaf name': 'Slash / Group|2024/01',
            'a guillemet in a leaf name': 'Plain|Guillemet › Leaf',
        };
        const outcomes: Record<string, unknown> = {};
        for (const name of Object.keys(KEYS)) {
            const key = KEYS[name];
            api.setAdvancedFilterModel({ filterType: 'set', colId: 'country', type: 'isAnyOf', values: [key] });
            await asyncSetTimeout(0);
            outcomes[name] = af.input.validationMessage || {
                written: af.value,
                readBack: (api.getAdvancedFilterModel() as SetAdvancedFilterModel).values,
            };
        }

        expect(outcomes).toEqual({
            'the written separator in a group name': {
                written: '[Country] is any of ["Arrow > Group" › "Leaf"]',
                readBack: ['Arrow > Group|Leaf'],
            },
            'a slash in a leaf name': {
                written: '[Country] is any of ["Slash / Group" › "2024/01"]',
                readBack: ['Slash / Group|2024/01'],
            },
            'a guillemet in a leaf name': {
                written: '[Country] is any of ["Plain" › "Guillemet › Leaf"]',
                readBack: ['Plain|Guillemet › Leaf'],
            },
        });
    });

    test('an unquoted segment holding a separator splits the path, so it names nothing', async () => {
        const api = await gridsManager.createGridAndWait('grid1', SEPARATOR_TREE_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of [Arrow > Group > Leaf]');

        expect(af.input.validationMessage).toContain('Value not found');
        expect(api.getAdvancedFilterModel()).toBeNull();
    });
});

describe('Advanced Filter - Set Filter tree list where a separator is ambiguous', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    // Three things a written `Hello > World` could plausibly mean: two root values that hold the separator
    // themselves, and the path through the group that shares their name. Paths split on `|`.
    const AMBIGUOUS_OPTIONS: GridOptions = {
        columnDefs: [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: {
                    treeList: true,
                    treeListPathGetter: (value: string | null) => (value ? value.split('|') : null),
                } satisfies ISetFilterParams,
            },
        ],
        rowData: [
            { athlete: 'spaced', country: 'Hello > World' },
            { athlete: 'tight', country: 'Hello>World' },
            { athlete: 'slashed', country: 'Hello/World' },
            { athlete: 'child', country: 'Hello|World' },
            { athlete: 'other', country: 'Hello|Other' },
        ],
        enableAdvancedFilter: true,
    };

    test('all four sit side by side in the list, the group after the values', async () => {
        const api = await gridsManager.createGridAndWait('grid1', AMBIGUOUS_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Hello > World', 'Hello/World', 'Hello>World', 'Hello [2]']);
    });

    test('quoted, each of them names exactly one row', async () => {
        const api = await gridsManager.createGridAndWait('grid1', AMBIGUOUS_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const EXPRESSIONS: Record<string, string> = {
            'a root value holding a spaced separator': '[Country] is any of ["Hello > World"]',
            'a root value holding a tight separator': '[Country] is any of ["Hello>World"]',
            'a root value holding a slash': '[Country] is any of ["Hello/World"]',
            'the path through the group': '[Country] is any of ["Hello" > "World"]',
        };
        const outcomes: Record<string, unknown> = {};
        for (const name of Object.keys(EXPRESSIONS)) {
            await af.applyExpression(EXPRESSIONS[name]);
            outcomes[name] = af.input.validationMessage || displayedAthletes(api);
        }

        expect(outcomes).toEqual({
            'a root value holding a spaced separator': ['spaced'],
            'a root value holding a tight separator': ['tight'],
            'a root value holding a slash': ['slashed'],
            'the path through the group': ['child'],
        });
    });

    test('unquoted, a separator means the path wherever the path exists', async () => {
        const api = await gridsManager.createGridAndWait('grid1', AMBIGUOUS_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const EXPRESSIONS: Record<string, string> = {
            spaced: '[Country] is any of [Hello > World]',
            tight: '[Country] is any of [Hello>World]',
            slashed: '[Country] is any of [Hello/World]',
        };
        const outcomes: Record<string, unknown> = {};
        for (const name of Object.keys(EXPRESSIONS)) {
            await af.applyExpression(EXPRESSIONS[name]);
            outcomes[name] = af.input.validationMessage || displayedAthletes(api);
        }

        // Both readings name a row here, and the path is the one that wins; the root values need quotes.
        expect(outcomes).toEqual({ spaced: ['child'], tight: ['child'], slashed: ['child'] });
    });

    test('a slash reads as a path where one exists, and a date-like value reads whole where none does', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...AMBIGUOUS_OPTIONS,
            rowData: [
                { athlete: 'child', country: 'Hello|World' },
                { athlete: 'slashed', country: 'Hello/World' },
                { athlete: 'dated', country: '2024/01' },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of [Hello/World]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['child']);

        // Nothing is grouped under `2024`, so the path names nothing and the text is taken whole. This is
        // what keeps a date spelling itself now that `/` is read as a separator.
        await af.applyExpression('[Country] is any of [2024/01]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['dated']);

        // The root value the path reading shadows is still named by quoting it.
        await af.applyExpression('[Country] is any of ["Hello/World"]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['slashed']);
    });

    test('a bare root value holding a separator is read whole once no path matches it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...AMBIGUOUS_OPTIONS,
            // The same root values, with no `Hello` group for the path reading to land on.
            rowData: [
                { athlete: 'spaced', country: 'Hello > World' },
                { athlete: 'tight', country: 'Hello>World' },
                { athlete: 'other', country: 'Elsewhere|Leaf' },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of [Hello > World]');

        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['spaced']);
    });

    test('the list writes each of them so it reads back as itself', async () => {
        const api = await gridsManager.createGridAndWait('grid1', AMBIGUOUS_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        for (const key of ['Hello > World', 'Hello>World', 'Hello/World', 'Hello|World']) {
            api.setAdvancedFilterModel({ filterType: 'set', colId: 'country', type: 'isAnyOf', values: [key] });
            await asyncSetTimeout(0);
            expect(af.input.validationMessage).toBe('');
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'set',
                colId: 'country',
                type: 'isAnyOf',
                values: [key],
            });
        }
    });
});

describe('Advanced Filter - Set Filter tree list where a path is shared', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    // A lossy path getter: `US` and `USA` are distinct keys with nothing in the path to tell them apart.
    const SHARED_PATH_OPTIONS: GridOptions = {
        columnDefs: [
            { field: 'athlete' },
            {
                field: 'country',
                filter: 'agSetColumnFilter',
                filterParams: {
                    treeList: true,
                    treeListPathGetter: (value: string | null) => (value ? [value.slice(0, 2)] : null),
                } satisfies ISetFilterParams,
            },
        ],
        rowData: [
            { athlete: 'shortForm', country: 'US' },
            { athlete: 'longForm', country: 'USA' },
            { athlete: 'other', country: 'IT' },
        ],
        enableAdvancedFilter: true,
    };

    test('one entry stands for both keys, so the expression matches every row it covers', async () => {
        const api = await gridsManager.createGridAndWait('grid1', SHARED_PATH_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['IT', 'US']);

        await af.applyExpression('[Country] is any of ["US"]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['shortForm', 'longForm']);
    });

    test('`is none of` on a shared entry excludes every row it covers', async () => {
        const api = await gridsManager.createGridAndWait('grid1', SHARED_PATH_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is none of ["US"]');

        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['other']);
    });

    test('a model naming either key writes the entry they share and reads back as both', async () => {
        const api = await gridsManager.createGridAndWait('grid1', SHARED_PATH_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const outcomes: Record<string, unknown> = {};
        for (const key of ['US', 'USA']) {
            api.setAdvancedFilterModel({ filterType: 'set', colId: 'country', type: 'isAnyOf', values: [key] });
            await asyncSetTimeout(0);
            outcomes[key] = af.input.validationMessage || {
                written: af.value,
                readBack: (api.getAdvancedFilterModel() as SetAdvancedFilterModel).values,
            };
        }

        expect(outcomes).toEqual({
            US: { written: '[Country] is any of ["US"]', readBack: ['US', 'USA'] },
            USA: { written: '[Country] is any of ["US"]', readBack: ['US', 'USA'] },
        });
    });
});
