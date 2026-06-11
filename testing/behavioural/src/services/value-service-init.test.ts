import type { GridApi, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ValueCacheModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

interface Person {
    firstName: string;
    lastName: string;
    age: number;
}

const PEOPLE: Person[] = [
    { firstName: 'Ada', lastName: 'Lovelace', age: 36 },
    { firstName: 'Alan', lastName: 'Turing', age: 41 },
];

describe('ValueService init in wireBeans', () => {
    // Every grid renders during postConstruct, exercising the rowRenderer → valueSvc.getValue
    // path that previously required an `if (!initialised) init()` hack inside getValue.

    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    test('field path: api.getCellValue works synchronously after createGrid', async () => {
        const api: GridApi<Person> = gridsManager.createGrid('grid-field', {
            columnDefs: [{ colId: 'firstName', field: 'firstName' }],
            rowData: PEOPLE,
        });
        await new GridColumns(api, `field path: api.getCellValue works synchronously after createGrid setup`)
            .checkColumns(`
                CENTER
                └── firstName "First Name" width:200
            `);
        await new GridRows(api, `field path: api.getCellValue works synchronously after createGrid setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 firstName:"Ada"
            └── LEAF id:1 firstName:"Alan"
        `);

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'firstName' })).toBe('Ada');
        await new GridRows(api, `field path: api.getCellValue works synchronously after createGrid final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 firstName:"Ada"
                └── LEAF id:1 firstName:"Alan"
            `
        );
    });

    test('valueGetter path: getCellValue runs the function getter immediately after createGrid', async () => {
        const fullName = (params: ValueGetterParams<Person>) => `${params.data!.firstName} ${params.data!.lastName}`;

        const api: GridApi<Person> = gridsManager.createGrid('grid-fn-getter', {
            columnDefs: [{ colId: 'fullName', valueGetter: fullName }],
            rowData: PEOPLE,
        });
        await new GridColumns(
            api,
            `valueGetter path: getCellValue runs the function getter immediately after create setup`
        ).checkColumns(`
            CENTER
            └── fullName width:200
        `);
        await new GridRows(
            api,
            `valueGetter path: getCellValue runs the function getter immediately after create setup`
        ).check(`
            ROOT id:ROOT_NODE_ID fullName:"<ERROR>"
            ├── LEAF id:0 fullName:"Ada Lovelace"
            └── LEAF id:1 fullName:"Alan Turing"
        `);

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'fullName' })).toBe('Ada Lovelace');
        await new GridRows(
            api,
            `valueGetter path: getCellValue runs the function getter immediately after create final state`
        ).check(`
            ROOT id:ROOT_NODE_ID fullName:"<ERROR>"
            ├── LEAF id:0 fullName:"Ada Lovelace"
            └── LEAF id:1 fullName:"Alan Turing"
        `);
    });

    test('valueCache path: cache-variant executeValueGetter is bound in postConstruct', async () => {
        let calls = 0;
        const countingGetter = (params: ValueGetterParams<Person>) => {
            calls++;
            return params.data!.firstName.toUpperCase();
        };

        const api: GridApi<Person> = gridsManager.createGrid(
            'grid-value-cache',
            {
                columnDefs: [{ colId: 'shouted', valueGetter: countingGetter }],
                rowData: PEOPLE,
                valueCache: true,
            },
            { modules: [ValueCacheModule] }
        );
        await new GridColumns(api, `valueCache path: cache-variant executeValueGetter is bound in postConstruct setup`)
            .checkColumns(`
                CENTER
                └── shouted width:200
            `);
        await new GridRows(api, `valueCache path: cache-variant executeValueGetter is bound in postConstruct setup`)
            .check(`
                ROOT id:ROOT_NODE_ID shouted:"<ERROR>"
                ├── LEAF id:0 shouted:"ADA"
                └── LEAF id:1 shouted:"ALAN"
            `);

        const node = api.getRowNode('0')!;

        const callsBeforeApi = calls;
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        // Cache hit — getter not re-invoked.
        expect(calls).toBe(callsBeforeApi);
        await new GridRows(
            api,
            `valueCache path: cache-variant executeValueGetter is bound in postConstruct final state`
        ).check(`
            ROOT id:ROOT_NODE_ID shouted:"<ERROR>"
            ├── LEAF id:0 shouted:"ADA"
            └── LEAF id:1 shouted:"ALAN"
        `);
    });

    test('valueCache: by the time createGrid returns, the cache is populated and the first API read is a hit', async () => {
        // Cache variant is bound in init() (wireBeans), so the very first render writes to
        // the cache. The first user API read after createGrid must therefore be a cache hit.
        let calls = 0;
        const countingGetter = (params: ValueGetterParams<Person>) => {
            calls++;
            return params.data!.firstName.toUpperCase();
        };

        const api: GridApi<Person> = gridsManager.createGrid(
            'grid-value-cache-populated',
            {
                columnDefs: [{ colId: 'shouted', valueGetter: countingGetter }],
                rowData: PEOPLE,
                valueCache: true,
            },
            { modules: [ValueCacheModule] }
        );
        await new GridColumns(
            api,
            `valueCache: by the time createGrid returns, the cache is populated and the first setup`
        ).checkColumns(`
            CENTER
            └── shouted width:200
        `);
        await new GridRows(
            api,
            `valueCache: by the time createGrid returns, the cache is populated and the first setup`
        ).check(`
            ROOT id:ROOT_NODE_ID shouted:"<ERROR>"
            ├── LEAF id:0 shouted:"ADA"
            └── LEAF id:1 shouted:"ALAN"
        `);

        const node = api.getRowNode('0')!;

        // The cache must be populated for this row before user code runs.
        const callsAfterCreate = calls;
        api.getCellValue({ rowNode: node, colKey: 'shouted' });
        expect(calls).toBe(callsAfterCreate);
        await new GridRows(
            api,
            `valueCache: by the time createGrid returns, the cache is populated and the first final state`
        ).check(`
            ROOT id:ROOT_NODE_ID shouted:"<ERROR>"
            ├── LEAF id:0 shouted:"ADA"
            └── LEAF id:1 shouted:"ALAN"
        `);
    });

    test('no-valueCache path: every getCellValue call re-invokes the getter when ValueCacheModule is NOT registered', async () => {
        let calls = 0;
        const countingGetter = (params: ValueGetterParams<Person>) => {
            calls++;
            return params.data!.firstName.toUpperCase();
        };

        const api: GridApi<Person> = gridsManager.createGrid('grid-no-value-cache', {
            columnDefs: [{ colId: 'shouted', valueGetter: countingGetter }],
            rowData: PEOPLE,
        });
        await new GridColumns(
            api,
            `no-valueCache path: every getCellValue call re-invokes the getter when ValueCach setup`
        ).checkColumns(`
            CENTER
            └── shouted width:200
        `);
        await new GridRows(
            api,
            `no-valueCache path: every getCellValue call re-invokes the getter when ValueCach setup`
        ).check(`
            ROOT id:ROOT_NODE_ID shouted:"<ERROR>"
            ├── LEAF id:0 shouted:"ADA"
            └── LEAF id:1 shouted:"ALAN"
        `);

        const node = api.getRowNode('0')!;

        const callsBeforeApi = calls;
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        // No cache — every api call re-invokes the getter.
        expect(calls).toBe(callsBeforeApi + 3);
        await new GridRows(
            api,
            `no-valueCache path: every getCellValue call re-invokes the getter when ValueCach final state`
        ).check(`
            ROOT id:ROOT_NODE_ID shouted:"<ERROR>"
            ├── LEAF id:0 shouted:"ADA"
            └── LEAF id:1 shouted:"ALAN"
        `);
    });

    test('cellExpressions path: string valueGetter is evaluated as an expression', async () => {
        const api: GridApi<Person> = gridsManager.createGrid('grid-expressions', {
            columnDefs: [{ colId: 'doubled', valueGetter: 'data ? data.age * 2 : null' }],
            rowData: PEOPLE,
            enableCellExpressions: true,
        });
        await new GridColumns(api, `cellExpressions path: string valueGetter is evaluated as an expression setup`)
            .checkColumns(`
                CENTER
                └── doubled width:200
            `);
        await new GridRows(api, `cellExpressions path: string valueGetter is evaluated as an expression setup`).check(
            `
                ROOT id:ROOT_NODE_ID doubled:null
                ├── LEAF id:0 doubled:72
                └── LEAF id:1 doubled:82
            `
        );

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'doubled' })).toBe(72);
        await new GridRows(api, `cellExpressions path: string valueGetter is evaluated as an expression final state`)
            .check(`
                ROOT id:ROOT_NODE_ID doubled:null
                ├── LEAF id:0 doubled:72
                └── LEAF id:1 doubled:82
            `);
    });

    test('treeData option change is picked up by the listener registered in postConstruct', async () => {
        interface TreePerson extends Person {
            children?: TreePerson[];
        }
        const treeData: TreePerson[] = [
            { firstName: 'Ada', lastName: 'Lovelace', age: 36, children: [] },
            { firstName: 'Alan', lastName: 'Turing', age: 41 },
        ];

        const api: GridApi<TreePerson> = gridsManager.createGrid(
            'grid-tree-data',
            {
                columnDefs: [{ colId: 'firstName', field: 'firstName' }],
                rowData: treeData,
                treeData: false,
                treeDataChildrenField: 'children',
            },
            { modules: [TreeDataModule] }
        );
        await new GridColumns(
            api,
            `treeData option change is picked up by the listener registered in postConstruct setup`
        ).checkColumns(`
            CENTER
            └── firstName "First Name" width:200
        `);
        await new GridRows(api, `treeData option change is picked up by the listener registered in postConstruct setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 firstName:"Ada"
                └── LEAF id:1 firstName:"Alan"
            `);

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'firstName' })).toBe('Ada');

        // Flipping treeData after init must still update ValueService's cached isTreeData.
        api.setGridOption('treeData', true);
        await new GridColumns(
            api,
            `treeData option change is picked up by the listener registered in postConstruct after setGridOption treeData`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── firstName "First Name" width:200
        `);
        await new GridRows(
            api,
            `treeData option change is picked up by the listener registered in postConstruct after setGridOption treeData`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0" firstName:"Ada"
            └── 1 LEAF id:1 ag-Grid-AutoColumn:"1" firstName:"Alan"
        `);
        expect(api.getCellValue({ rowNode: node, colKey: 'firstName' })).toBe('Ada');
    });

    test('valueGetter.getValue callback resolves cross-column values during the initial render', async () => {
        // params.getValue fires during rowRenderer.postConstruct's initial render — the exact
        // window that motivated the original race-condition hack.
        const observed: Array<string | undefined> = [];
        const compositeGetter = (params: ValueGetterParams<Person>) => {
            const first = params.getValue('firstName');
            observed.push(first);
            return `${first} (${params.data!.age})`;
        };

        const api: GridApi<Person> = gridsManager.createGrid('grid-cross-col-getter', {
            columnDefs: [
                { colId: 'firstName', field: 'firstName' },
                { colId: 'composite', valueGetter: compositeGetter },
            ],
            rowData: PEOPLE,
        });

        const observedFromInitialRender = observed.slice();
        expect(observedFromInitialRender.length).toBeGreaterThan(0);
        expect(observedFromInitialRender.every((v) => typeof v === 'string')).toBe(true);

        await new GridColumns(
            api,
            `valueGetter.getValue callback resolves cross-column values during the initial re setup`
        ).checkColumns(`
            CENTER
            ├── firstName "First Name" width:200
            └── composite width:200
        `);
        await new GridRows(
            api,
            `valueGetter.getValue callback resolves cross-column values during the initial re setup`
        ).check(`
            ROOT id:ROOT_NODE_ID composite:"<ERROR>"
            ├── LEAF id:0 firstName:"Ada" composite:"Ada (36)"
            └── LEAF id:1 firstName:"Alan" composite:"Alan (41)"
        `);

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'composite' })).toBe('Ada (36)');
        await new GridRows(
            api,
            `valueGetter.getValue callback resolves cross-column values during the initial re final state`
        ).check(`
            ROOT id:ROOT_NODE_ID composite:"<ERROR>"
            ├── LEAF id:0 firstName:"Ada" composite:"Ada (36)"
            └── LEAF id:1 firstName:"Alan" composite:"Alan (41)"
        `);
    });
});

describe('ValueService value cache', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ValueCacheModule],
    });

    afterEach(() => gridsManager.reset());

    test('valueCache + enableCellExpressions returns the evaluated value, stable across reads', async () => {
        const api = gridsManager.createGrid('grid-expr-cache', {
            columnDefs: [{ colId: 'doubled', field: 'doubled' }],
            rowData: [{ id: '0', doubled: '=ctx.n * 2' }],
            getRowId: (params) => params.data.id,
            context: { n: 21 },
            enableCellExpressions: true,
            valueCache: true,
        });

        // Rendered cell shows the evaluated expression, not the raw `=ctx.n * 2` string.
        await new GridRows(api, 'valueCache + cell expression: rendered value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 doubled:42
        `);

        const node = api.getRowNode('0')!;
        // First read evaluates and populates the cache; the second must return the evaluated value,
        // not the cached raw expression string.
        expect(api.getCellValue({ rowNode: node, colKey: 'doubled' })).toBe(42);
        expect(api.getCellValue({ rowNode: node, colKey: 'doubled' })).toBe(42);
    });

    test('valueCache invalidates on expireValueCache and on a data change, so the getter re-runs', async () => {
        let calls = 0;
        const api = gridsManager.createGrid('grid-cache-invalidation', {
            columnDefs: [
                { colId: 'base', field: 'base' },
                {
                    colId: 'computed',
                    valueGetter: (p: ValueGetterParams) => {
                        calls++;
                        return (p.data?.base ?? 0) * 2;
                    },
                },
            ],
            rowData: [{ id: '0', base: 21 }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });
        const node = api.getRowNode('0')!;

        // Repeat reads are served from the cache — the getter is not re-invoked.
        expect(api.getCellValue({ rowNode: node, colKey: 'computed' })).toBe(42);
        const callsAfterRead = calls;
        expect(api.getCellValue({ rowNode: node, colKey: 'computed' })).toBe(42);
        expect(calls).toBe(callsAfterRead);

        // expireValueCache forces re-evaluation (value unchanged, but the getter runs again).
        api.expireValueCache();
        expect(api.getCellValue({ rowNode: node, colKey: 'computed' })).toBe(42);
        expect(calls).toBeGreaterThan(callsAfterRead);

        // A committed data change invalidates the cache, so the new value is computed.
        node.setDataValue('base', 50);
        expect(api.getCellValue({ rowNode: node, colKey: 'computed' })).toBe(100);
    });
});
