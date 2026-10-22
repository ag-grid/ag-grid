import {
    ALL_SEVERITIES,
    AdvancedFilterBuilderHarness,
    AdvancedFilterHarness,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';
import { onTestFinished } from 'vitest';

import type { AdvancedFilterModel, ColumnAdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

// --- Shared test data ---

interface TestRow {
    athlete: string;
    age: number | null;
    date: string | null;
    hasGold: boolean | null;
    country: string | null;
}

const ROW_DATA: TestRow[] = [
    { athlete: 'Michael Phelps', age: 23, date: '2008-08-24', hasGold: true, country: 'United States' },
    { athlete: 'Emma Thompson', age: 30, date: '2012-07-15', hasGold: false, country: 'United Kingdom' },
    { athlete: 'Usain Bolt', age: 25, date: '2012-08-05', hasGold: true, country: 'Jamaica' },
    { athlete: 'Anna Kowalski', age: 19, date: '2020-07-23', hasGold: false, country: 'Poland' },
    { athlete: 'Li Wei', age: 28, date: null, hasGold: null, country: null },
    { athlete: '', age: null, date: '2024-01-01', hasGold: true, country: '' },
];

const COLUMN_DEFS: GridOptions['columnDefs'] = [
    { field: 'athlete', filter: true },
    { field: 'age', filter: true },
    { field: 'date', filter: true },
    { field: 'hasGold', filter: true },
    { field: 'country', filter: true },
];

const DEFAULT_OPTIONS: GridOptions<TestRow> = {
    columnDefs: COLUMN_DEFS,
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

// --- Helpers ---

function getDisplayedAthletes(api: GridApi<TestRow>): string[] {
    const result: string[] = [];
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        result.push(api.getDisplayedRowAtIndex(i)?.data?.athlete ?? '');
    }
    return result;
}

function applyModel(api: GridApi, model: AdvancedFilterModel | null): void {
    api.setAdvancedFilterModel(model);
    api.onFilterChanged();
}

// --- Tests ---

describe('Advanced Filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            AdvancedFilterModule,
            GridStateModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    describe('Text column operators', () => {
        test('contains', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `contains setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `contains setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'michael',
            });
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(1);
            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps']);
            await new GridRows(api, `contains final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
            `);
        });

        test('notContains', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `notContains setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `notContains setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'notContains',
                filter: 'a',
            });
            await asyncSetTimeout(0);

            // Case-insensitive: 'michael', 'emma', 'usain', 'anna' all contain 'a'
            expect(getDisplayedAthletes(api)).toEqual(['Li Wei', '']);
            await new GridRows(api, `notContains final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('equals', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `equals setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `equals setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'equals',
                filter: 'Usain Bolt',
            });
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(1);
            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
            await new GridRows(api, `equals final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
            `);
        });

        test('notEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `notEqual setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `notEqual setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'notEqual',
                filter: 'Usain Bolt',
            });
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(5);
            expect(getDisplayedAthletes(api)).not.toContain('Usain Bolt');
            await new GridRows(api, `notEqual final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('startsWith', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `startsWith setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `startsWith setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'startsWith',
                filter: 'an',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
            await new GridRows(api, `startsWith final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
            `);
        });

        test('endsWith', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `endsWith setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `endsWith setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'endsWith',
                filter: 'bolt',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
            await new GridRows(api, `endsWith final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
            `);
        });

        test('blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `blank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `blank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Empty string and null should be blank
            expect(getDisplayedAthletes(api)).toEqual(['']);
            await new GridRows(api, `blank final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `notBlank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `notBlank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'notBlank',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual([
                'Michael Phelps',
                'Emma Thompson',
                'Usain Bolt',
                'Anna Kowalski',
                'Li Wei',
            ]);
            await new GridRows(api, `notBlank final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });
    });

    describe('Number column operators', () => {
        test('equals', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `equals setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `equals setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'equals',
                filter: 25,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
            await new GridRows(api, `equals final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
            `);
        });

        test('notEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `notEqual setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `notEqual setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'notEqual',
                filter: 25,
            });
            await asyncSetTimeout(0);

            // notEqual excludes null values (they don't match equals, but notEqual also excludes nulls)
            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Emma Thompson', 'Anna Kowalski', 'Li Wei']);
            await new GridRows(api, `notEqual final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });

        test('greaterThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `greaterThan setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `greaterThan setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'greaterThan',
                filter: 25,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Li Wei']);
            await new GridRows(api, `greaterThan final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });

        test('greaterThanOrEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `greaterThanOrEqual setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `greaterThanOrEqual setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'greaterThanOrEqual',
                filter: 25,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Usain Bolt', 'Li Wei']);
            await new GridRows(api, `greaterThanOrEqual final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });

        test('lessThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `lessThan setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `lessThan setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'lessThan',
                filter: 23,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
            await new GridRows(api, `lessThan final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
            `);
        });

        test('lessThanOrEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `lessThanOrEqual setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `lessThanOrEqual setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'lessThanOrEqual',
                filter: 23,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Anna Kowalski']);
            await new GridRows(api, `lessThanOrEqual final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
            `);
        });

        test('blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `blank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `blank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Only '' row has null age; Li Wei has age 28
            expect(getDisplayedAthletes(api)).toEqual(['']);
            await new GridRows(api, `blank final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `notBlank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `notBlank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'notBlank',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual([
                'Michael Phelps',
                'Emma Thompson',
                'Usain Bolt',
                'Anna Kowalski',
                'Li Wei',
            ]);
            await new GridRows(api, `notBlank final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });
    });

    describe('Date column operators (string dates inferred as dateString)', () => {
        test('equals', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `equals setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `equals setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'equals',
                filter: '2012-08-05',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
            await new GridRows(api, `equals final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
            `);
        });

        test('greaterThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `greaterThan setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `greaterThan setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'greaterThan',
                filter: '2012-08-05',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski', '']);
            await new GridRows(api, `greaterThan final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('lessThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `lessThan setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `lessThan setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'lessThan',
                filter: '2012-08-01',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Emma Thompson']);
            await new GridRows(api, `lessThan final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                └── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
            `);
        });

        test('blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `blank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `blank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Li Wei']);
            await new GridRows(api, `blank final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });

        test('notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `notBlank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `notBlank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'notBlank',
            });
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(5);
            await new GridRows(api, `notBlank final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });
    });

    describe('Boolean column operators', () => {
        test('true', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `true setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `true setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'boolean',
                colId: 'hasGold',
                type: 'true',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Usain Bolt', '']);
            await new GridRows(api, `true final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('false', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `false setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `false setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'boolean',
                colId: 'hasGold',
                type: 'false',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Anna Kowalski']);
            await new GridRows(api, `false final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
            `);
        });
    });

    describe('Join operators (compound expressions)', () => {
        test('AND join — both conditions must pass', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `AND join — both conditions must pass setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `AND join — both conditions must pass setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 },
                    { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'bolt' },
                ],
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
            await new GridRows(api, `AND join — both conditions must pass final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
            `);
        });

        test('OR join — either condition passes', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `OR join — either condition passes setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `OR join — either condition passes setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'join',
                type: 'OR',
                conditions: [
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 23 },
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 19 },
                ],
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Anna Kowalski']);
            await new GridRows(api, `OR join — either condition passes final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
            `);
        });

        test('nested joins — (A OR B) AND C', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `nested joins — (A OR B) AND C setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `nested joins — (A OR B) AND C setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'join',
                type: 'AND',
                conditions: [
                    {
                        filterType: 'join',
                        type: 'OR',
                        conditions: [
                            { filterType: 'number', colId: 'age', type: 'equals', filter: 23 },
                            { filterType: 'number', colId: 'age', type: 'equals', filter: 25 },
                        ],
                    },
                    { filterType: 'boolean', colId: 'hasGold', type: 'true' },
                ],
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Usain Bolt']);
            await new GridRows(api, `nested joins — (A OR B) AND C final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
            `);
        });
    });

    describe('Model API round-trip', () => {
        test('setAdvancedFilterModel then getAdvancedFilterModel returns equivalent model', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(
                api,
                `setAdvancedFilterModel then getAdvancedFilterModel returns equivalent model setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `setAdvancedFilterModel then getAdvancedFilterModel returns equivalent model setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                    ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                    ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                    ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                    ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                    └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
                `);
            await asyncSetTimeout(0);

            const model: AdvancedFilterModel = {
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'phelps',
            };

            applyModel(api, model);
            await asyncSetTimeout(0);

            const retrieved = api.getAdvancedFilterModel();
            expect(retrieved).not.toBeNull();
            expect((retrieved as ColumnAdvancedFilterModel).colId).toBe('athlete');
            expect((retrieved as ColumnAdvancedFilterModel).type).toBe('contains');
            expect((retrieved as any).filter).toBe('phelps');
            await new GridRows(
                api,
                `setAdvancedFilterModel then getAdvancedFilterModel returns equivalent model final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
            `);
        });

        test('setting model to null clears the filter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `setting model to null clears the filter setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `setting model to null clears the filter setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'equals',
                filter: 23,
            });
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(1);

            applyModel(api, null);
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(ROW_DATA.length);
            expect(api.getAdvancedFilterModel()).toBeNull();
            await new GridRows(api, `setting model to null clears the filter final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('the returned model is the caller’s own, so mutating it does not reach the applied filter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 23 },
                    { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Phelps' },
                ],
            });
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(1);

            const model = api.getAdvancedFilterModel() as AdvancedFilterModel & { conditions: any[] };
            expect(model).not.toBe(api.getAdvancedFilterModel());

            model.type = 'OR';
            model.conditions[0].filter = 99;
            model.conditions.push({ filterType: 'text', colId: 'country', type: 'contains', filter: 'zz' });

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 23 },
                    { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Phelps' },
                ],
            });
            expect(api.getDisplayedRowCount()).toBe(1);
        });

        test('compound model round-trip preserves structure', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `compound model round-trip preserves structure setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `compound model round-trip preserves structure setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            const model: AdvancedFilterModel = {
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'bolt' },
                    { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 },
                ],
            };

            applyModel(api, model);
            await asyncSetTimeout(0);

            const retrieved = api.getAdvancedFilterModel();
            expect(retrieved).not.toBeNull();
            expect(retrieved!.filterType).toBe('join');
            if (retrieved!.filterType === 'join') {
                expect(retrieved.type).toBe('AND');
                expect(retrieved.conditions).toHaveLength(2);
            }
            await new GridRows(api, `compound model round-trip preserves structure final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
            `);
        });
    });

    test('a model set with rows loaded filters them at once, reporting the change', async () => {
        const sources: (string | undefined)[] = [];
        const api = gridsManager.createGrid('grid1', {
            ...DEFAULT_OPTIONS,
            onFilterChanged: ({ source }) => sources.push(source),
        });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 });
        await asyncSetTimeout(0);
        expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        expect(sources).toEqual(['api']);
    });

    test.each([
        {
            call: 'setFilterModel',
            run: (api: GridApi) => api.setFilterModel({ age: { filterType: 'number', type: 'lessThan', filter: 20 } }),
        },
        {
            call: 'setColumnFilterModel',
            run: (api: GridApi) =>
                api.setColumnFilterModel('age', { filterType: 'number', type: 'lessThan', filter: 20 }),
        },
        { call: 'getColumnFilterInstance', run: (api: GridApi) => api.getColumnFilterInstance('age') },
    ])('$call warns that column filters are off and leaves the advanced filter applied', async (row) => {
        // the whole list of issues is asserted instead, as a suppressed id raises none
        enableDevValidations({ throwOn: [] });
        onTestFinished(() => enableDevValidations({ throwOn: ALL_SEVERITIES }));
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        onTestFinished(() => warnSpy.mockRestore());
        const issues: string[] = [];
        const api = gridsManager.createGrid('grid1', {
            ...DEFAULT_OPTIONS,
            onIssueRaised: (event) => issues.push(`${event.severity} #${event.id}`),
        });
        await asyncSetTimeout(0);
        applyModel(api, { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Bolt' });

        expect(await row.run(api)).toBeUndefined();
        await asyncSetTimeout(0);
        expect({
            issues,
            model: api.getFilterModel(),
            columnFilterPresent: api.isColumnFilterPresent(),
            athletes: getDisplayedAthletes(api),
        }).toEqual({ issues: ['warning #68'], model: {}, columnFilterPresent: false, athletes: ['Usain Bolt'] });
    });

    describe('Model set before the rows arrive to infer data types from', () => {
        const EMPTY_OPTIONS: GridOptions<TestRow> = { ...DEFAULT_OPTIONS, rowData: [] };
        const UNDER_20: AdvancedFilterModel = { filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 };
        const OVER_24: AdvancedFilterModel = { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 24 };
        const ALL_ATHLETES = ['Michael Phelps', 'Emma Thompson', 'Usain Bolt', 'Anna Kowalski', 'Li Wei', ''];
        const BOLT: AdvancedFilterModel = { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Bolt' };
        const WITH_BUTTONS: GridOptions<TestRow> = {
            ...EMPTY_OPTIONS,
            advancedFilterParams: { buttons: ['apply', 'cancel', 'reset'] },
        };
        const clickButton = (action: 'cancel' | 'reset'): void =>
            document
                .querySelector<HTMLElement>(`.ag-advanced-filter-buttons [data-ref=${action}FilterButton]`)!
                .click();

        beforeAll(() => installFilterLayoutMock());
        afterAll(() => uninstallFilterLayoutMock());

        test('reads back at once as the caller’s own copy, and applies once rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);

            const model: AdvancedFilterModel = { ...UNDER_20 };
            api.setAdvancedFilterModel(model);
            model.filter = 99;
            const retrieved = api.getAdvancedFilterModel();
            expect(retrieved).toEqual(UNDER_20);
            expect(retrieved).not.toBe(model);

            api.setGridOption('rowData', []);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(UNDER_20);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(UNDER_20);
            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
            expect(AdvancedFilterHarness.get(api).value).toBe('[Age] < 20');
        });

        test('a set condition with no values reads back as set and applies once rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);

            const model = { filterType: 'set', colId: 'country' } as unknown as AdvancedFilterModel;
            api.setAdvancedFilterModel(model);
            expect(api.getAdvancedFilterModel()).toEqual(model);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);
        });

        test('null after a model reads back null over an applied expression and leaves the rows unfiltered', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);
            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains "Bolt"');
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel(UNDER_20);
            api.setAdvancedFilterModel(null);
            expect(api.getAdvancedFilterModel()).toBeNull();

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);
        });

        test('several models apply the last once rows arrive, each filterChanged reading it', async () => {
            const changes: unknown[] = [];
            const api: GridApi<TestRow> = gridsManager.createGrid('grid1', {
                ...EMPTY_OPTIONS,
                onFilterChanged: ({ source }) => changes.push([source, api.getAdvancedFilterModel()]),
            });
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel(OVER_24);
            api.setAdvancedFilterModel(UNDER_20);
            await asyncSetTimeout(0);
            expect(changes).toEqual([]);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(changes).toEqual([
                ['api', UNDER_20],
                ['api', UNDER_20],
            ]);
            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });

        test('an initial state model reads back at once and applies once rows arrive as a state change', async () => {
            const sources: (string | undefined)[] = [];
            const api = gridsManager.createGrid('grid1', {
                ...EMPTY_OPTIONS,
                initialState: { filter: { advancedFilterModel: UNDER_20 } },
                onFilterChanged: ({ source }) => sources.push(source),
            });
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(UNDER_20);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(UNDER_20);
            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
            expect(sources).toEqual(['advancedFilter']);
        });

        test('a model restored with setState reads back at once and applies once rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);

            api.setState({ filter: { advancedFilterModel: OVER_24 } });
            expect(api.getAdvancedFilterModel()).toEqual(OVER_24);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(OVER_24);
            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Usain Bolt', 'Li Wei']);
        });

        test('an expression applied in the input after a model replaces it, before and after rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel(UNDER_20);
            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains "Bolt"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(BOLT);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(BOLT);
            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('an expression confirmed in the input after a model replaces it once rows arrive to make it valid', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel(UNDER_20);
            const harness = AdvancedFilterHarness.get(api);
            await harness.applyExpression('[Age] > 24');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(OVER_24);
            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Usain Bolt', 'Li Wei']);
            expect(harness.value).toBe('[Age] > 24');
        });

        test('Cancel in the input keeps the model, before and after rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', WITH_BUTTONS);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel(UNDER_20);
            const harness = AdvancedFilterHarness.get(api);
            await harness.type('[Athlete] contains "x"');
            clickButton('cancel');
            await asyncSetTimeout(0);
            expect(harness.value).toBe('');
            expect(api.getAdvancedFilterModel()).toEqual(UNDER_20);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(UNDER_20);
            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });

        test('Reset in the input drops the model, before and after rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', WITH_BUTTONS);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel(UNDER_20);
            clickButton('reset');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);
        });

        test('Reset in the builder drops the model, before and after rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', {
                ...EMPTY_OPTIONS,
                advancedFilterBuilderParams: { buttons: ['apply', 'reset'] },
            });
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel(UNDER_20);
            await AdvancedFilterBuilderHarness.open(api);
            document.querySelector<HTMLElement>('.ag-advanced-filter-builder [data-ref=resetFilterButton]')!.click();
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);
        });

        test('a model applied in the builder replaces the model, before and after rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains "x"');
            api.setAdvancedFilterModel(UNDER_20);
            const builder = await AdvancedFilterBuilderHarness.open(api);
            await builder.setValue((await builder.conditionItems())[0], 'Bolt');
            await builder.apply();
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(BOLT);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(BOLT);
            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('a model set after an expression typed in the input applies once rows arrive', async () => {
            const changes: unknown[] = [];
            const api: GridApi<TestRow> = gridsManager.createGrid('grid1', {
                ...EMPTY_OPTIONS,
                onFilterChanged: ({ source }) => changes.push([source, api.getAdvancedFilterModel()]),
            });
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] > 24');
            await asyncSetTimeout(0);
            changes.length = 0;
            api.setAdvancedFilterModel(UNDER_20);
            expect(api.getAdvancedFilterModel()).toEqual(UNDER_20);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(changes).toEqual([['api', UNDER_20]]);
            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });

        test('disabling the advanced filter drops a model set before the rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel(UNDER_20);
            api.setGridOption('enableAdvancedFilter', false);
            expect(api.getAdvancedFilterModel()).toBeNull();
            expect(api.getState().filter).toBeUndefined();

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);

            api.setGridOption('enableAdvancedFilter', true);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);
        });

        test('disabling the advanced filter drops a model set before the rows arrive, though enabled again before they do', async () => {
            const api = gridsManager.createGrid('grid1', EMPTY_OPTIONS);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel(UNDER_20);
            api.setGridOption('enableAdvancedFilter', false);
            api.setGridOption('enableAdvancedFilter', true);
            expect(api.getAdvancedFilterModel()).toBeNull();

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);
        });

        test('with the advanced filter off at creation and on before rows load, no column filter is present and the initial advanced filter state applies once they do', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: COLUMN_DEFS,
                enableAdvancedFilter: false,
                initialState: { filter: { advancedFilterModel: BOLT } },
            });
            await asyncSetTimeout(0);
            api.setGridOption('enableAdvancedFilter', true);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({});
            expect(api.isColumnFilterPresent()).toBe(false);
            expect(api.getColumn('athlete')!.isFilterActive()).toBe(false);

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('with filter handlers and the advanced filter on, a state restore leaves a column filter handler built meanwhile', async () => {
            const api = gridsManager.createGrid('grid1', { ...DEFAULT_OPTIONS, enableFilterHandlers: true });
            await asyncSetTimeout(0);
            const handler = api.getColumnFilterHandler('age');
            api.setState({ filter: { filterModel: { age: { filterType: 'number', type: 'lessThan', filter: 20 } } } });
            await asyncSetTimeout(0);
            expect(api.getColumnFilterHandler('age')).toBe(handler);
        });

        test('enabling the advanced filter drops a column filter model set before the rows arrive', async () => {
            const api = gridsManager.createGrid('grid1', { ...EMPTY_OPTIONS, enableAdvancedFilter: false });
            await asyncSetTimeout(0);

            api.setFilterModel({ age: { filterType: 'number', type: 'lessThan', filter: 20 } });
            const columnModelSettled = api.setColumnFilterModel('athlete', {
                filterType: 'text',
                type: 'contains',
                filter: 'Bolt',
            });
            api.setGridOption('enableAdvancedFilter', true);
            await columnModelSettled;
            expect(api.getFilterModel()).toEqual({});

            api.setGridOption('rowData', ROW_DATA);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({});
            expect(api.isColumnFilterPresent()).toBe(false);
            expect(getDisplayedAthletes(api)).toEqual(ALL_ATHLETES);
        });
    });

    describe('Edge cases', () => {
        test('filtering with no matching rows returns zero results', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `filtering with no matching rows returns zero results setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `filtering with no matching rows returns zero results setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'equals',
                filter: 'Nonexistent Person',
            });
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(0);
            await new GridRows(api, `filtering with no matching rows returns zero results final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('text filter is case-insensitive by default', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `text filter is case-insensitive by default setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `text filter is case-insensitive by default setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'MICHAEL',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps']);
            await new GridRows(api, `text filter is case-insensitive by default final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
            `);
        });

        test('multiple filters can be applied sequentially', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `multiple filters can be applied sequentially setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `multiple filters can be applied sequentially setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            // First filter
            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'greaterThan',
                filter: 20,
            });
            await asyncSetTimeout(0);
            const count1 = api.getDisplayedRowCount();

            // Replace with different filter
            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'lessThan',
                filter: 20,
            });
            await asyncSetTimeout(0);
            const count2 = api.getDisplayedRowCount();

            // Both should filter differently
            expect(count1).not.toBe(count2);
            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
            await new GridRows(api, `multiple filters can be applied sequentially final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
            `);
        });

        test('null values in number column handled by blank/notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `null values in number column handled by blank/notBlank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `null values in number column handled by blank/notBlank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Only the '' row has age: null; Li Wei has age: 28
            expect(getDisplayedAthletes(api)).toEqual(['']);
            await new GridRows(api, `null values in number column handled by blank/notBlank final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('null values in date column handled by blank/notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `null values in date column handled by blank/notBlank setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `null values in date column handled by blank/notBlank setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Li Wei (date: null)
            expect(getDisplayedAthletes(api)).toEqual(['Li Wei']);
            await new GridRows(api, `null values in date column handled by blank/notBlank final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });

        test('enableAdvancedFilter can be toggled', async () => {
            const api = gridsManager.createGrid('grid1', {
                ...DEFAULT_OPTIONS,
                enableAdvancedFilter: false,
            });
            await new GridColumns(api, `enableAdvancedFilter can be toggled setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `enableAdvancedFilter can be toggled setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);

            // Advanced filter is disabled, model should return null
            expect(api.getAdvancedFilterModel()).toBeNull();
            await new GridRows(api, `enableAdvancedFilter can be toggled final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });
    });
});
