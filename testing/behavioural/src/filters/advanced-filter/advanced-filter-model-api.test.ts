import type { AdvancedFilterModel, ColumnAdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';

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
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    describe('Text column operators', () => {
        test('contains', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('notContains', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('equals', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('notEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('startsWith', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'startsWith',
                filter: 'an',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });

        test('endsWith', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'endsWith',
                filter: 'bolt',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Empty string and null should be blank
            expect(getDisplayedAthletes(api)).toEqual(['']);
        });

        test('notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });
    });

    describe('Number column operators', () => {
        test('equals', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'equals',
                filter: 25,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('notEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('greaterThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'greaterThan',
                filter: 25,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Li Wei']);
        });

        test('greaterThanOrEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'greaterThanOrEqual',
                filter: 25,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Usain Bolt', 'Li Wei']);
        });

        test('lessThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'lessThan',
                filter: 23,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });

        test('lessThanOrEqual', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'lessThanOrEqual',
                filter: 23,
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Anna Kowalski']);
        });

        test('blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Only '' row has null age; Li Wei has age 28
            expect(getDisplayedAthletes(api)).toEqual(['']);
        });

        test('notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });
    });

    describe('Date column operators (string dates inferred as dateString)', () => {
        test('equals', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'equals',
                filter: '2012-08-05',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('greaterThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'greaterThan',
                filter: '2012-08-05',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski', '']);
        });

        test('lessThan', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'lessThan',
                filter: '2012-08-01',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Emma Thompson']);
        });

        test('blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Li Wei']);
        });

        test('notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'notBlank',
            });
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(5);
        });
    });

    describe('Boolean column operators', () => {
        test('true', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'boolean',
                colId: 'hasGold',
                type: 'true',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Usain Bolt', '']);
        });

        test('false', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'boolean',
                colId: 'hasGold',
                type: 'false',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Anna Kowalski']);
        });
    });

    describe('Join operators (compound expressions)', () => {
        test('AND join — both conditions must pass', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('OR join — either condition passes', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('nested joins — (A OR B) AND C', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });
    });

    describe('Model API round-trip', () => {
        test('setAdvancedFilterModel then getAdvancedFilterModel returns equivalent model', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('setting model to null clears the filter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('compound model round-trip preserves structure', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });
    });

    describe('Edge cases', () => {
        test('filtering with no matching rows returns zero results', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'equals',
                filter: 'Nonexistent Person',
            });
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(0);
        });

        test('text filter is case-insensitive by default', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'MICHAEL',
            });
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps']);
        });

        test('multiple filters can be applied sequentially', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
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
        });

        test('null values in number column handled by blank/notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'number',
                colId: 'age',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Only the '' row has age: null; Li Wei has age: 28
            expect(getDisplayedAthletes(api)).toEqual(['']);
        });

        test('null values in date column handled by blank/notBlank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);

            applyModel(api, {
                filterType: 'dateString',
                colId: 'date',
                type: 'blank',
            });
            await asyncSetTimeout(0);

            // Li Wei (date: null)
            expect(getDisplayedAthletes(api)).toEqual(['Li Wei']);
        });

        test('enableAdvancedFilter can be toggled', async () => {
            const api = gridsManager.createGrid('grid1', {
                ...DEFAULT_OPTIONS,
                enableAdvancedFilter: false,
            });
            await asyncSetTimeout(0);

            // Advanced filter is disabled, model should return null
            expect(api.getAdvancedFilterModel()).toBeNull();
        });
    });
});
