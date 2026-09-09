import type { AdvancedFilterHarness } from 'ag-test-utils';

import type { GridApi, GridOptions, SetAdvancedFilterModel } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule, SetFilterModule } from 'ag-grid-enterprise';

/** The grid the `advanced-filter-set-*` suites share: one Set Filter column among plain ones. */
export const SET_MODULES = [
    TextFilterModule,
    NumberFilterModule,
    SetFilterModule,
    AdvancedFilterModule,
    ClientSideRowModelModule,
];

export interface TestRow {
    athlete: string;
    country: string | null;
    age: number;
}

export const ROW_DATA: TestRow[] = [
    { athlete: 'Michael Phelps', country: 'United States', age: 23 },
    { athlete: 'Emma Thompson', country: 'United Kingdom', age: 30 },
    { athlete: 'Usain Bolt', country: 'Jamaica', age: 25 },
    { athlete: 'Anna Kowalski', country: 'Poland', age: 19 },
    { athlete: 'Li Wei', country: null, age: 28 },
];

export const DEFAULT_OPTIONS: GridOptions<TestRow> = {
    columnDefs: [
        { field: 'athlete', filter: 'agTextColumnFilter' },
        { field: 'country', filter: 'agSetColumnFilter' },
        { field: 'age', filter: 'agNumberColumnFilter' },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

/** Every option a text column offers, in the order the autocomplete offers them. */
export const TEXT_OPTIONS = [
    'contains',
    'does not contain',
    'equals',
    'does not equal',
    'begins with',
    'ends with',
    'is blank',
    'is not blank',
];

/** The two a Set Filter column adds to whatever its data type already offers. */
export const SET_OPTIONS = ['is any of', 'is none of'];

/**
 * Chooses each value the list offers in turn, by keyboard, and pairs it with what applying it produced.
 * Pairs rather than a record: two values can be written alike, and a text key would drop one of them.
 */
export async function chooseEveryOffered(
    af: AdvancedFilterHarness,
    expression: string
): Promise<[offered: string, outcome: unknown][]> {
    await af.type(expression);
    const offered = af.autocompleteEntries();
    const outcomes: [string, unknown][] = [];
    // By keyboard rather than by typing the value: typing one holding a comma or a bracket would be edited
    // by the grammar on the way in, which is the thing under test rather than the setup.
    for (let i = 0; i < offered.length; ++i) {
        await af.type(expression);
        for (let down = 0; down < i; ++down) {
            await af.pressKey('ArrowDown');
        }
        await af.selectAutocomplete();
        await af.append(']');
        await af.apply();
        outcomes.push([offered[i], af.input.validationMessage || (af.getModel() as SetAdvancedFilterModel).values]);
    }
    return outcomes;
}

/** The athletes a grid is showing, in order: what nearly every set expression is judged by. */
export function displayedAthletes(api: GridApi): string[] {
    const result: string[] = [];
    for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
        result.push(api.getDisplayedRowAtIndex(i)!.data!.athlete);
    }
    return result;
}
