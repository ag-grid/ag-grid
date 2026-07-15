import type { AdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    AdvancedFilterBuilderHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Regression baseline for the Advanced Filter Builder: the DOM tree (nested conditions, 0-operand
 * operators, `+ add`, validity marks) and editing through the dialog (value/operator pills, group join,
 * condition removal). Needs the layout mock for the builder VirtualList + pill rich-select popups in
 * jsdom. Pinned so AG-8950 (set multi-select pill) and AG-11352 (custom filter component) surface as diffs.
 */
const DEFAULT_OPTIONS: GridOptions = {
    columnDefs: [
        { field: 'name', filter: true },
        { field: 'age', filter: true },
        { field: 'active', filter: true },
        { field: 'date', filter: true },
    ],
    rowData: [
        { name: 'Bolt', age: 25, active: true, date: '2012-08-05' },
        { name: 'Ng', age: 40, active: false, date: '2024-01-01' },
    ],
    enableAdvancedFilter: true,
};

describe('Advanced Filter Builder — DOM baseline', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('empty builder shows a root join and the add affordance', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await AdvancedFilterBuilderHarness.open(api);
        await new FilterDom(api, 'empty builder', { mode: 'builder' }).checkFilterDom(`
            BUILDER
            AND
              + add
            buttons: Apply | Cancel
            model: null
        `);
    });

    test('single condition auto-wraps in a valid root join (no false invalid mark)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'greaterThan', filter: 35 });
        await asyncSetTimeout(0);
        await AdvancedFilterBuilderHarness.open(api);

        await new FilterDom(api, 'single condition builder', { mode: 'builder' }).checkFilterDom(`
            BUILDER
            AND
              Age > 35
              + add
            buttons: Apply | Cancel
            model:
              filterType: "number"
              colId: "age"
              type: "greaterThan"
              filter: 35
        `);
    });

    test('0-operand operators render with no value slot', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        const model: AdvancedFilterModel = {
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'blank' },
                { filterType: 'boolean', colId: 'active', type: 'true' },
            ],
        };
        api.setAdvancedFilterModel(model);
        await asyncSetTimeout(0);
        await AdvancedFilterBuilderHarness.open(api);

        await new FilterDom(api, 'blank/true builder', { mode: 'builder' }).checkFilterDom(`
            BUILDER
            AND
              Age is blank
              Active is true
              + add
            buttons: Apply | Cancel
            model:
              filterType: "join"
              type: "AND"
              conditions:
                - filterType: "number"
                  colId: "age"
                  type: "blank"
                - filterType: "boolean"
                  colId: "active"
                  type: "true"
        `);
    });

    test('nested (A OR B) AND C renders the tree exactly as nested', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        const model: AdvancedFilterModel = {
            filterType: 'join',
            type: 'AND',
            conditions: [
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'text', colId: 'name', type: 'contains', filter: 'o' },
                        { filterType: 'dateString', colId: 'date', type: 'greaterThan', filter: '2012-08-05' },
                    ],
                },
                { filterType: 'boolean', colId: 'active', type: 'true' },
            ],
        };
        api.setAdvancedFilterModel(model);
        await asyncSetTimeout(0);
        await AdvancedFilterBuilderHarness.open(api);

        await new FilterDom(api, 'nested builder', { mode: 'builder' }).checkFilterDom(`
            BUILDER
            AND
              OR
                Name contains "o"
                Date > "2012-08-05"
              Active is true
              + add
            buttons: Apply | Cancel
            model:
              filterType: "join"
              type: "AND"
              conditions:
                - filterType: "join"
                  type: "OR"
                  conditions:
                    - filterType: "text"
                      colId: "name"
                      type: "contains"
                      filter: "o"
                    - filterType: "dateString"
                      colId: "date"
                      type: "greaterThan"
                      filter: "2012-08-05"
                - filterType: "boolean"
                  colId: "active"
                  type: "true"
        `);
    });
});

interface Row {
    athlete: string;
    age: number;
}

const ROW_DATA: Row[] = [
    { athlete: 'Bolt', age: 25 },
    { athlete: 'Bond', age: 40 },
    { athlete: 'Ng', age: 28 },
];

const OPTS: GridOptions<Row> = {
    columnDefs: [
        { field: 'athlete', filter: true },
        { field: 'age', filter: true },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

describe('Advanced Filter — builder editing', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test("editing a condition's value pill re-filters the rows", async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Bo' });
        await asyncSetTimeout(0);
        await new GridRows(api, 'before value edit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:1 athlete:"Bond" age:40
        `);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        await builder.setValue(condition, 'Ng');

        // The staged edit shows in the builder tree (Apply is enabled) before it is committed.
        await new FilterDom(api, 'builder staged value edit', { skipValidation: true }).checkFilterDom(`
            BUILDER
            AND
              Athlete contains "Ng"
              + add
            buttons: Apply | Cancel
            model:
              filterType: "text"
              colId: "athlete"
              type: "contains"
              filter: "Bo"
        `);

        await builder.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'contains',
            filter: 'Ng',
        });
        await new GridRows(api, 'after value edit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ng" age:28
        `);
    });

    test("changing a condition's operator pill re-filters the rows", async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'equals', filter: 'Bolt' });
        await asyncSetTimeout(0);
        await new GridRows(api, 'before operator change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt" age:25
        `);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [condition] = await builder.conditionItems();
        await builder.selectOperator(condition, 'does not equal');
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'notEqual',
            filter: 'Bolt',
        });
        // does not equal 'Bolt' ⇒ Bond, Ng.
        await new GridRows(api, 'after operator change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Bond" age:40
            └── LEAF id:2 athlete:"Ng" age:28
        `);
    });

    test('changing the group join from AND to OR re-filters the rows', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Bo' },
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 30 },
            ],
        });
        await asyncSetTimeout(0);
        // AND: contains 'Bo' (Bolt, Bond) AND age>30 ⇒ Bond only.
        await new GridRows(api, 'before join change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Bond" age:40
        `);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [join] = await builder.joinItems();
        await builder.selectJoin(join, 'OR');
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'OR',
            conditions: [
                { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Bo' },
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 30 },
            ],
        });
        // OR: contains 'Bo' (Bolt, Bond) OR age>30 (Bond) ⇒ Bolt, Bond.
        await new GridRows(api, 'after join change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:1 athlete:"Bond" age:40
        `);
    });

    test('removing a condition collapses the group to the remaining condition', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'B' },
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 30 },
            ],
        });
        await asyncSetTimeout(0);
        await new GridRows(api, 'before remove').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Bond" age:40
        `);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const conditions = await builder.conditionItems();
        // Remove the number condition (index 1); the text condition alone remains.
        await builder.removeItem(conditions[1]);
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'contains',
            filter: 'B',
        });
        // contains 'B' alone ⇒ Bolt, Bond.
        await new GridRows(api, 'after remove').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:1 athlete:"Bond" age:40
        `);
    });
});
