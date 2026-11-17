import type { AggValueGetterParams, GroupRowValueSetterParams } from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';

import {
    EDIT_MODES,
    asyncSetTimeout,
    createGrid,
    distributeGroupValue,
    gridsManager,
    performEdit,
} from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

// an offset, so a distribution computed from the returned values gives different shares and deltas
const aggValueGetter = (params: AggValueGetterParams) => (params.aggValue as number) + 1000;

/**
 * Reverses the getter on the typed and the shown value, then distributes the result as a new aggregate. Writes to
 * child groups during distribution are already stored aggregates, so they are distributed as they are.
 */
const reversingSetter =
    (distribution: 'percentage' | 'increment') =>
    (params: GroupRowValueSetterParams): boolean =>
        distributeGroupValue(
            params.distributing
                ? params
                : { ...params, newValue: Number(params.newValue) - 1000, oldValue: Number(params.oldValue) - 1000 },
            { distribution }
        );

describe.each(EDIT_MODES)('distributeGroupValue with aggValueGetter (%s)', (editMode) => {
    test('percentage mode distributes the reversed value by the stored child aggregates', async () => {
        const api = await createGrid('distribute-agg-value-getter-percentage', {
            aggValueGetter,
            groupRowValueSetter: reversingSetter('percentage'),
        });
        const americas = api.getRowNode('row-group-region-Americas')!;
        expect(api.getCellValue({ rowNode: americas, colKey: 'amount' })).toBe(1160);

        // 1320 reverses to 320: USA 100 and Canada 60 keep their 5:3 share
        await performEdit(editMode, api, americas, 'amount', 1320);

        expect(americas.aggData?.amount).toBe(320);
        expect(api.getRowNode('row-group-region-Americas-country-USA')!.aggData?.amount).toBe(200);
        expect(api.getRowNode('row-group-region-Americas-country-Canada')!.aggData?.amount).toBe(120);
        expect(api.getCellValue({ rowNode: americas, colKey: 'amount' })).toBe(1320);
        // the country groups distribute their stored aggregates, without reversing the getter again
        expect(api.getRowNode('us-nyc')!.data.amount + api.getRowNode('us-la')!.data.amount).toBe(200);
    });

    test('increment mode adds the difference between the reversed values', async () => {
        const api = await createGrid('distribute-agg-value-getter-increment', {
            aggValueGetter,
            groupRowValueSetter: reversingSetter('increment'),
        });
        const americas = api.getRowNode('row-group-region-Americas')!;

        // the setter's oldValue is the shown 1160, so the difference is 40, split between USA and Canada
        await performEdit(editMode, api, americas, 'amount', 1200);

        expect(americas.aggData?.amount).toBe(200);
        expect(api.getRowNode('row-group-region-Americas-country-USA')!.aggData?.amount).toBe(120);
        expect(api.getRowNode('row-group-region-Americas-country-Canada')!.aggData?.amount).toBe(80);
    });
});

test('child group events during distribution carry stored aggregates for both values', async () => {
    const api = await createGrid('distribute-agg-value-getter-child-events', {
        aggValueGetter,
        groupRowValueSetter: reversingSetter('percentage'),
    });
    const events: { id: string | undefined; oldValue: unknown; newValue: unknown }[] = [];
    api.addEventListener('cellValueChanged', (e) =>
        events.push({ id: e.node.id, oldValue: e.oldValue, newValue: e.newValue })
    );

    await performEdit('setDataValue', api, api.getRowNode('row-group-region-Americas')!, 'amount', 1320);

    expect(events).toContainEqual({ id: 'row-group-region-Americas', oldValue: 1160, newValue: 1320 });
    expect(events).toContainEqual({ id: 'row-group-region-Americas-country-USA', oldValue: 100, newValue: 200 });
    expect(events).toContainEqual({ id: 'row-group-region-Americas-country-Canada', oldValue: 60, newValue: 120 });
});

test('a tree data parent with its own data keeps its field: only the function setter writes', async () => {
    const api = await gridsManager.createGridAndWait('distribute-agg-value-getter-tree-function', {
        treeData: true,
        treeDataChildrenField: undefined,
        getDataPath: (data: any) => data.path,
        columnDefs: [
            {
                field: 'budget',
                aggFunc: 'sum',
                groupRowEditable: true,
                aggValueGetter,
                groupRowValueSetter: reversingSetter('percentage'),
            },
        ],
        rowData: [
            { id: 'hq', path: ['HQ'], budget: 5 },
            { id: 'eng', path: ['HQ', 'Engineering'], budget: 40 },
            { id: 'sales', path: ['HQ', 'Sales'], budget: 60 },
        ],
        groupDefaultExpanded: -1,
        getRowId: (params) => params.data.id,
    });
    const hq = api.getRowNode('hq')!;

    hq.setDataValue('budget', 1200, 'ui');
    await asyncSetTimeout(0);

    expect(hq.data.budget).toBe(5);
    expect(api.getRowNode('eng')!.data.budget).toBe(80);
    expect(api.getRowNode('sales')!.data.budget).toBe(120);
    expect(api.getCellValue({ rowNode: hq, colKey: 'budget' })).toBe(1200);
});

test('without a group row setter, setDataValue writes the field of a tree data parent as usual', async () => {
    const api = await gridsManager.createGridAndWait('distribute-agg-value-getter-tree-field', {
        treeData: true,
        treeDataChildrenField: undefined,
        getDataPath: (data: any) => data.path,
        columnDefs: [{ field: 'budget', aggFunc: 'sum', aggValueGetter }],
        rowData: [
            { id: 'hq', path: ['HQ'], budget: 5 },
            { id: 'eng', path: ['HQ', 'Engineering'], budget: 40 },
        ],
        groupDefaultExpanded: -1,
        getRowId: (params) => params.data.id,
    });
    const hq = api.getRowNode('hq')!;
    const events: { oldValue: unknown; newValue: unknown }[] = [];
    api.addEventListener('cellValueChanged', (e) => events.push({ oldValue: e.oldValue, newValue: e.newValue }));

    expect(hq.setDataValue('budget', 7, 'ui')).toBe(true);
    await asyncSetTimeout(0);

    expect(hq.data.budget).toBe(7);
    // the event carries stored values, as without the getter: the parent's aggregate, not the getter's result
    expect(events).toEqual([{ oldValue: 40, newValue: 40 }]);
});

test('undo replays the shown value through the reversing setter', async () => {
    const api = await createGrid('distribute-agg-value-getter-undo', {
        aggValueGetter,
        groupRowValueSetter: reversingSetter('percentage'),
    });
    const americas = api.getRowNode('row-group-region-Americas')!;
    await performEdit('ui', api, americas, 'amount', 1320);
    expect(americas.aggData?.amount).toBe(320);

    api.undoCellEditing();
    await asyncSetTimeout(0);

    expect(americas.aggData?.amount).toBe(160);
    expect(api.getRowNode('row-group-region-Americas-country-USA')!.aggData?.amount).toBe(100);
    expect(api.getCellValue({ rowNode: americas, colKey: 'amount' })).toBe(1160);
});

describe('group-row editing with aggValueGetter and no function groupRowValueSetter', () => {
    // warning #322 is expected here: groupRowEditable has no effect without a function groupRowValueSetter
    beforeEach(() => enableDevValidations({ suppress: [322] }));
    afterEach(() => enableDevValidations({ suppress: [] }));

    test.each([
        ['implicit distribution', {}],
        ['groupRowValueSetter: true', { groupRowValueSetter: true }],
        ['options object', { groupRowValueSetter: { distribution: 'percentage' as const } }],
    ])('%s: group cells are not editable and setDataValue leaves the data unchanged', async (_name, setterProps) => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await createGrid(`distribute-agg-value-getter-blocked-${_name}`, {
            aggValueGetter,
            ...setterProps,
        });
        const americas = api.getRowNode('row-group-region-Americas')!;
        const usaLeaf = api.getRowNode('row-group-region-Americas-country-USA')!.allLeafChildren![0];
        const amount = api.getColumn('amount')!;

        expect(amount.isCellEditable(americas)).toBe(false);
        expect(amount.isCellEditable(usaLeaf)).toBe(true);

        americas.setDataValue('amount', 320, 'ui');
        await asyncSetTimeout(0);

        expect(americas.aggData?.amount).toBe(160);
        expect(api.getRowNode('row-group-region-Americas-country-USA')!.aggData?.amount).toBe(100);
        expect(api.getCellValue({ rowNode: americas, colKey: 'amount' })).toBe(1160);
        warnSpy.mockRestore();
    });

    test('warns that groupRowEditable has no effect', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        await createGrid('distribute-agg-value-getter-warning', { aggValueGetter });

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('`colDef.groupRowValueSetter` is a function');
        warnSpy.mockRestore();
    });

    test('setDataValue leaves the data of a tree data parent with its own data unchanged', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await gridsManager.createGridAndWait('distribute-agg-value-getter-blocked-tree', {
            treeData: true,
            treeDataChildrenField: undefined,
            getDataPath: (data: any) => data.path,
            columnDefs: [{ field: 'budget', aggFunc: 'sum', groupRowEditable: true, aggValueGetter }],
            rowData: [
                { id: 'hq', path: ['HQ'], budget: 5 },
                { id: 'eng', path: ['HQ', 'Engineering'], budget: 40 },
                { id: 'sales', path: ['HQ', 'Sales'], budget: 60 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        const hq = api.getRowNode('hq')!;
        let changedEvents = 0;
        api.addEventListener('cellValueChanged', () => changedEvents++);

        expect(hq.setDataValue('budget', 320, 'ui')).toBe(false);
        await asyncSetTimeout(0);

        expect(hq.data.budget).toBe(5);
        expect(api.getRowNode('eng')!.data.budget).toBe(40);
        expect(api.getCellValue({ rowNode: hq, colKey: 'budget' })).toBe(1100);
        expect(changedEvents).toBe(0);
        warnSpy.mockRestore();
    });

    test('a column that is not aggregated keeps its group row editing', async () => {
        const control = await createGrid('distribute-agg-value-getter-not-aggregated-control', { aggFunc: undefined });
        const api = await createGrid('distribute-agg-value-getter-not-aggregated', {
            aggValueGetter,
            aggFunc: undefined,
        });
        const editable = (gridApi: typeof api) =>
            gridApi.getColumn('amount')!.isCellEditable(gridApi.getRowNode('row-group-region-Americas')!);

        expect(editable(api)).toBe(editable(control));
        expect(api.getCellValue({ rowNode: api.getRowNode('row-group-region-Americas')!, colKey: 'amount' })).toBe(
            control.getCellValue({ rowNode: control.getRowNode('row-group-region-Americas')!, colKey: 'amount' })
        );
    });

    test('does not warn for a column that cannot be aggregated', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        await createGrid('distribute-agg-value-getter-no-agg-no-warning', { aggValueGetter, aggFunc: undefined });

        expect(warnSpy.mock.calls.flat().join(' ')).not.toContain('warning #322');
        warnSpy.mockRestore();
    });

    test('does not warn with a function groupRowValueSetter', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        await createGrid('distribute-agg-value-getter-no-warning', {
            aggValueGetter,
            groupRowValueSetter: (params) => distributeGroupValue(params),
        });

        expect(warnSpy.mock.calls.flat().join(' ')).not.toContain('warning #322');
        warnSpy.mockRestore();
    });
});
