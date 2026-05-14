import type { GridApi, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ValueCacheModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

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

    test('field path: api.getCellValue works synchronously after createGrid', () => {
        const api: GridApi<Person> = gridsManager.createGrid('grid-field', {
            columnDefs: [{ colId: 'firstName', field: 'firstName' }],
            rowData: PEOPLE,
        });

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'firstName' })).toBe('Ada');
    });

    test('valueGetter path: getCellValue runs the function getter immediately after createGrid', () => {
        const fullName = (params: ValueGetterParams<Person>) => `${params.data!.firstName} ${params.data!.lastName}`;

        const api: GridApi<Person> = gridsManager.createGrid('grid-fn-getter', {
            columnDefs: [{ colId: 'fullName', valueGetter: fullName }],
            rowData: PEOPLE,
        });

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'fullName' })).toBe('Ada Lovelace');
    });

    test('valueCache path: cache-variant executeValueGetter is bound in postConstruct', () => {
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

        const node = api.getRowNode('0')!;

        const callsBeforeApi = calls;
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        // Cache hit — getter not re-invoked.
        expect(calls).toBe(callsBeforeApi);
    });

    test('valueCache: by the time createGrid returns, the cache is populated and the first API read is a hit', () => {
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

        const node = api.getRowNode('0')!;

        // The cache must be populated for this row before user code runs.
        const callsAfterCreate = calls;
        api.getCellValue({ rowNode: node, colKey: 'shouted' });
        expect(calls).toBe(callsAfterCreate);
    });

    test('no-valueCache path: every getCellValue call re-invokes the getter when ValueCacheModule is NOT registered', () => {
        let calls = 0;
        const countingGetter = (params: ValueGetterParams<Person>) => {
            calls++;
            return params.data!.firstName.toUpperCase();
        };

        const api: GridApi<Person> = gridsManager.createGrid('grid-no-value-cache', {
            columnDefs: [{ colId: 'shouted', valueGetter: countingGetter }],
            rowData: PEOPLE,
        });

        const node = api.getRowNode('0')!;

        const callsBeforeApi = calls;
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        expect(api.getCellValue({ rowNode: node, colKey: 'shouted' })).toBe('ADA');
        // No cache — every api call re-invokes the getter.
        expect(calls).toBe(callsBeforeApi + 3);
    });

    test('cellExpressions path: string valueGetter is evaluated as an expression', () => {
        // ExpressionModule is part of the core bundle, so no extra module registration is needed.
        const api: GridApi<Person> = gridsManager.createGrid('grid-expressions', {
            columnDefs: [{ colId: 'doubled', valueGetter: 'data.age * 2' }],
            rowData: PEOPLE,
            enableCellExpressions: true,
        });

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'doubled' })).toBe(72);
    });

    test('treeData option change is picked up by the listener registered in postConstruct', () => {
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

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'firstName' })).toBe('Ada');

        // Flipping treeData after init must still update ValueService's cached isTreeData.
        api.setGridOption('treeData', true);
        expect(api.getCellValue({ rowNode: node, colKey: 'firstName' })).toBe('Ada');
    });

    test('valueGetter.getValue callback resolves cross-column values during the initial render', () => {
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

        // Cross-column lookups during the initial render must resolve, not return undefined.
        expect(observed.length).toBeGreaterThan(0);
        expect(observed.every((v) => typeof v === 'string')).toBe(true);

        const node = api.getRowNode('0')!;
        expect(api.getCellValue({ rowNode: node, colKey: 'composite' })).toBe('Ada (36)');
    });
});
