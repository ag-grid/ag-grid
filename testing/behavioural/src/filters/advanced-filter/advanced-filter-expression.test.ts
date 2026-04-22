import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
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

/**
 * Types an expression into the advanced filter input and presses Enter to apply.
 * This tests the full expression parsing path: text → parse → model → evaluate.
 */
function applyExpression(gridDiv: HTMLElement, expression: string): void {
    const input = gridDiv.querySelector<HTMLInputElement>('.ag-advanced-filter input[type=text]');
    if (!input) {
        throw new Error('Advanced filter input not found in DOM');
    }
    // Set the native value and fire the input event so AgAutocomplete picks it up
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    nativeInputValueSetter.call(input, expression);
    // Position cursor at end so the autocomplete list generator sees a complete expression
    input.selectionStart = expression.length;
    input.selectionEnd = expression.length;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // Close any open autocomplete list before applying
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    // Press Enter to apply (when autocomplete list is closed, Enter triggers onCompleted → applyExpression)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

// --- Tests ---

describe('Advanced Filter - Expression Input', () => {
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
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] contains "michael"');
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(1);
            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps']);
        });

        test('does not contain', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] does not contain "a"');
            await asyncSetTimeout(0);

            // Case-insensitive: 'michael', 'emma', 'usain', 'anna' all contain 'a'
            expect(getDisplayedAthletes(api)).toEqual(['Li Wei', '']);
        });

        test('equals', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] equals "Usain Bolt"');
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(1);
            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('does not equal', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] does not equal "Usain Bolt"');
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(5);
            expect(getDisplayedAthletes(api)).not.toContain('Usain Bolt');
        });

        test('begins with', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] begins with "an"');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });

        test('ends with', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] ends with "bolt"');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('is blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] is blank');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['']);
        });

        test('is not blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] is not blank');
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
        test('= (equals)', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] = 25');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('!= (not equal)', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] != 25');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Emma Thompson', 'Anna Kowalski', 'Li Wei']);
        });

        test('> (greater than)', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] > 25');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Li Wei']);
        });

        test('>= (greater than or equal)', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] >= 25');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Usain Bolt', 'Li Wei']);
        });

        test('< (less than)', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] < 23');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });

        test('<= (less than or equal)', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] <= 23');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Anna Kowalski']);
        });

        test('is blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] is blank');
            await asyncSetTimeout(0);

            // Only '' row has null age
            expect(getDisplayedAthletes(api)).toEqual(['']);
        });

        test('is not blank', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] is not blank');
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

    describe('Boolean column operators', () => {
        test('is true', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Has Gold] is true');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Usain Bolt', '']);
        });

        test('is false', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Has Gold] is false');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Anna Kowalski']);
        });
    });

    describe('Compound expressions', () => {
        test('AND join', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] > 20 AND [Athlete] contains "bolt"');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
        });

        test('OR join', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] = 23 OR [Age] = 19');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Anna Kowalski']);
        });

        test('nested joins with brackets', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '([Age] = 23 OR [Age] = 25) AND [Has Gold] is true');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Usain Bolt']);
        });
    });

    describe('Expression round-trip with model API', () => {
        test('expression applied via input is retrievable via getAdvancedFilterModel', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] contains "phelps"');
            await asyncSetTimeout(0);

            const model = api.getAdvancedFilterModel();
            expect(model).not.toBeNull();
            expect(model!.filterType).not.toBe('join');
            if (model && model.filterType !== 'join') {
                expect(model.colId).toBe('athlete');
                expect(model.type).toBe('contains');
                expect((model as any).filter).toBe('phelps');
            }
        });

        test('clearing expression via empty input clears the filter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] = 25');
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(1);

            // Clear by applying empty expression
            applyExpression(gridDiv, '');
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(ROW_DATA.length);
        });
    });

    describe('Edge cases', () => {
        test('invalid expression does not apply filter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] contains');
            await asyncSetTimeout(0);

            // Invalid expression (missing value) should not filter
            expect(api.getDisplayedRowCount()).toBe(ROW_DATA.length);
        });

        test('expression is case-insensitive for text values', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Athlete] contains "MICHAEL"');
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps']);
        });

        test('replacing expression applies new filter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await asyncSetTimeout(0);
            const gridDiv = getGridElement(api)! as HTMLElement;

            applyExpression(gridDiv, '[Age] > 20');
            await asyncSetTimeout(0);
            const count1 = api.getDisplayedRowCount();

            applyExpression(gridDiv, '[Age] < 20');
            await asyncSetTimeout(0);
            const count2 = api.getDisplayedRowCount();

            expect(count1).not.toBe(count2);
            expect(getDisplayedAthletes(api)).toEqual(['Anna Kowalski']);
        });
    });
});
