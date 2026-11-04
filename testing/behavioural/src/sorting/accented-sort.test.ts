import { ALL_SEVERITIES, GridRows, TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

describe('accentedSort locale and collator options', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridMgr.reset();
        vi.restoreAllMocks();
    });

    const names = ['Zoe', 'Åsa', 'Anna', 'Örjan', 'Ola'];

    /** Values of `colId` in display order, after sorting `colId` in `direction`. */
    function sortedValues(api: GridApi, colId: string, direction: 'asc' | 'desc' = 'asc'): unknown[] {
        api.applyColumnState({ state: [{ colId, sort: direction }], defaultState: { sort: null } });
        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((node) => values.push(api.getCellValue({ rowNode: node, colKey: colId })));
        return values;
    }

    function createGrid(id: string, options: GridOptions): GridApi {
        return gridMgr.createGrid(id, options);
    }

    test('`true` keeps sorting with localeCompare and the default locale', () => {
        const values = ['b', 'B', 'à', 'a', 'A', 'z'];
        const api = createGrid('accented-true', {
            columnDefs: [{ field: 'value' }],
            rowData: values.map((value) => ({ value })),
            accentedSort: true,
        });

        expect(sortedValues(api, 'value')).toEqual([...values].sort((a, b) => a.localeCompare(b)));
    });

    test('`locales` sorts using the rules of that locale', () => {
        const rowData = names.map((name) => ({ name }));

        const swedishApi = createGrid('accented-sv', {
            columnDefs: [{ field: 'name' }],
            rowData,
            accentedSort: { locales: 'sv' },
        });
        // Swedish sorts å, ä and ö as separate letters after z.
        expect(sortedValues(swedishApi, 'name')).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);

        const germanApi = createGrid('accented-de', {
            columnDefs: [{ field: 'name' }],
            rowData,
            accentedSort: { locales: 'de' },
        });
        // German sorts å and ö with a and o.
        expect(sortedValues(germanApi, 'name')).toEqual(['Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe']);
    });

    test("`sensitivity: 'accent'` ignores case, keeping the original order of values that differ only in case", async () => {
        const api = createGrid('accented-sensitivity', {
            columnDefs: [{ field: 'code' }],
            rowData: [
                { id: '1', code: 'b' },
                { id: '2', code: 'AA' },
                { id: '3', code: 'az' },
                { id: '4', code: 'aa' },
                { id: '5', code: 'B' },
                { id: '6', code: 'Aa' },
            ],
            getRowId: (params) => params.data.id,
            accentedSort: { options: { sensitivity: 'accent' } },
        });

        api.applyColumnState({ state: [{ colId: 'code', sort: 'asc' }] });
        await new GridRows(api, 'ascending').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 code:"AA"
            ├── LEAF id:4 code:"aa"
            ├── LEAF id:6 code:"Aa"
            ├── LEAF id:3 code:"az"
            ├── LEAF id:1 code:"b"
            └── LEAF id:5 code:"B"
        `);

        api.applyColumnState({ state: [{ colId: 'code', sort: 'desc' }] });
        await new GridRows(api, 'descending').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 code:"b"
            ├── LEAF id:5 code:"B"
            ├── LEAF id:3 code:"az"
            ├── LEAF id:2 code:"AA"
            ├── LEAF id:4 code:"aa"
            └── LEAF id:6 code:"Aa"
        `);
    });

    test('`numeric: true` compares digits by their numeric value', () => {
        const api = createGrid('accented-numeric', {
            columnDefs: [{ field: 'code' }],
            rowData: ['item10', 'item2', 'item1', 'item20'].map((code) => ({ code })),
            accentedSort: { options: { numeric: true } },
        });

        expect(sortedValues(api, 'code')).toEqual(['item1', 'item2', 'item10', 'item20']);
        expect(sortedValues(api, 'code', 'desc')).toEqual(['item20', 'item10', 'item2', 'item1']);
    });

    test('the collator is only used when both values are strings', () => {
        const api = createGrid('accented-non-strings', {
            columnDefs: [{ field: 'amount' }, { field: 'date' }],
            rowData: [
                { amount: 10, date: new Date(2024, 0, 10) },
                { amount: 2, date: new Date(2024, 0, 2) },
                { amount: 1, date: new Date(2023, 11, 31) },
            ],
            accentedSort: { locales: 'sv', options: { numeric: true } },
        });

        expect(sortedValues(api, 'amount')).toEqual([1, 2, 10]);
        expect((sortedValues(api, 'date') as Date[]).map((date) => date.getTime())).toEqual([
            new Date(2023, 11, 31).getTime(),
            new Date(2024, 0, 2).getTime(),
            new Date(2024, 0, 10).getTime(),
        ]);
    });

    test('changing the grid option at runtime sorts again', () => {
        const api = createGrid('accented-runtime', {
            columnDefs: [{ field: 'name', sort: 'asc' }],
            rowData: names.map((name) => ({ name })),
        });
        const displayed = () => {
            const values: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => values.push(node.data.name));
            return values;
        };

        // Without accentedSort, strings are in Unicode order.
        expect(displayed()).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);

        api.setGridOption('accentedSort', { locales: 'de' });
        expect(displayed()).toEqual(['Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe']);

        api.setGridOption('accentedSort', { locales: 'de', options: { sensitivity: 'base' } });
        expect(displayed()).toEqual(['Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe']);

        api.setGridOption('accentedSort', false);
        expect(displayed()).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);
    });

    test('colDef.accentedSort overrides the grid option for that column', () => {
        const rowData = names.map((name) => ({ inherit: name, off: name, german: name }));
        const api = createGrid('accented-coldef', {
            columnDefs: [
                { field: 'inherit' },
                { field: 'off', accentedSort: false },
                { field: 'german', accentedSort: { locales: 'de' } },
            ],
            rowData,
            accentedSort: { locales: 'sv' },
        });

        expect(sortedValues(api, 'inherit')).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);
        expect(sortedValues(api, 'off')).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);
        expect(sortedValues(api, 'german')).toEqual(['Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe']);
    });

    test('colDef.accentedSort applies when the grid option is not set, and updates with the column definitions', () => {
        const columnDefs = (accentedSort: ColDef['accentedSort']): ColDef[] => [{ field: 'name', accentedSort }];
        const api = createGrid('accented-coldef-update', {
            columnDefs: columnDefs({ locales: 'de' }),
            rowData: names.map((name) => ({ name })),
        });

        expect(sortedValues(api, 'name')).toEqual(['Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe']);

        api.setGridOption('columnDefs', columnDefs({ locales: 'sv' }));
        expect(sortedValues(api, 'name')).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);

        api.setGridOption('columnDefs', columnDefs(undefined));
        expect(sortedValues(api, 'name')).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);
    });

    test('defaultColDef.accentedSort applies to all columns, and a column can turn it off', () => {
        const api = createGrid('accented-default-coldef', {
            columnDefs: [{ field: 'first' }, { field: 'second' }, { field: 'off', accentedSort: false }],
            defaultColDef: { accentedSort: { locales: 'de' } },
            rowData: names.map((name) => ({ first: name, second: name, off: name })),
        });

        expect(sortedValues(api, 'first')).toEqual(['Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe']);
        expect(sortedValues(api, 'second')).toEqual(['Anna', 'Åsa', 'Ola', 'Örjan', 'Zoe']);
        expect(sortedValues(api, 'off')).toEqual(['Anna', 'Ola', 'Zoe', 'Åsa', 'Örjan']);
    });

    test('group rows sort using the accentedSort of the row group column', async () => {
        const api = createGrid('accented-group', {
            columnDefs: [{ field: 'name', rowGroup: true, hide: true }],
            defaultColDef: { accentedSort: { locales: 'sv' } },
            autoGroupColumnDef: { sort: 'asc' },
            rowData: ['Örjan', 'Anna', 'Åsa', 'Zoe'].map((name) => ({ name })),
            groupDefaultExpanded: 0,
        });

        await new GridRows(api, 'swedish groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-name-Anna ag-Grid-AutoColumn:"Anna"
            │ └── LEAF hidden id:1 name:"Anna"
            ├─┬ LEAF_GROUP collapsed id:row-group-name-Zoe ag-Grid-AutoColumn:"Zoe"
            │ └── LEAF hidden id:3 name:"Zoe"
            ├─┬ LEAF_GROUP collapsed id:"row-group-name-Åsa" ag-Grid-AutoColumn:"Åsa"
            │ └── LEAF hidden id:2 name:"Åsa"
            └─┬ LEAF_GROUP collapsed id:"row-group-name-Örjan" ag-Grid-AutoColumn:"Örjan"
            · └── LEAF hidden id:0 name:"Örjan"
        `);

        // The auto group column's sort is coupled to the row group column, whose values are compared.
        api.setGridOption('columnDefs', [
            { field: 'name', rowGroup: true, hide: true, accentedSort: { locales: 'de' } },
        ]);
        await new GridRows(api, 'german groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-name-Anna ag-Grid-AutoColumn:"Anna"
            │ └── LEAF hidden id:1 name:"Anna"
            ├─┬ LEAF_GROUP collapsed id:"row-group-name-Åsa" ag-Grid-AutoColumn:"Åsa"
            │ └── LEAF hidden id:2 name:"Åsa"
            ├─┬ LEAF_GROUP collapsed id:"row-group-name-Örjan" ag-Grid-AutoColumn:"Örjan"
            │ └── LEAF hidden id:0 name:"Örjan"
            └─┬ LEAF_GROUP collapsed id:row-group-name-Zoe ag-Grid-AutoColumn:"Zoe"
            · └── LEAF hidden id:3 name:"Zoe"
        `);
    });

    test('an invalid locale tag is reported by validation', () => {
        expect(() =>
            createGrid('accented-invalid-validation', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'a' }],
                accentedSort: { locales: 'not a locale!' },
            })
        ).toThrow(/warning #322 accentedSort could not create an `Intl.Collator`/);
    });

    test('an invalid locale tag falls back to the default locale instead of throwing', () => {
        // Validation reports the invalid tag (see above); suppress it to check the sort itself falls back.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [322] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = createGrid('accented-invalid', {
            columnDefs: [{ field: 'name' }],
            rowData: ['b', 'à', 'a'].map((name) => ({ name })),
            accentedSort: { locales: 'not a locale!' },
        });

        expect(sortedValues(api, 'name')).toEqual(['a', 'à', 'b']);
    });
});
