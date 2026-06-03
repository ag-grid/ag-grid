import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

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

function getInput(gridDiv: HTMLElement): HTMLInputElement {
    const input = gridDiv.querySelector<HTMLInputElement>('.ag-advanced-filter input[type=text]');
    if (!input) {
        throw new Error('Advanced filter input not found');
    }
    return input;
}

/** Sets input value with cursor at the given position (defaults to end) and dispatches input event. */
function typeInto(input: HTMLInputElement, text: string, cursorPos?: number): void {
    const pos = cursorPos ?? text.length;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    nativeInputValueSetter.call(input, text);
    input.selectionStart = pos;
    input.selectionEnd = pos;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function pressKey(input: HTMLInputElement, key: string): void {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

/** Returns true if the autocomplete list popup is present in the DOM. */
function isAutocompleteOpen(): boolean {
    return document.querySelector('.ag-autocomplete-list-popup') !== null;
}

/**
 * Selects from the autocomplete by pressing Enter.
 * The autocomplete's internal selection state works independently of VirtualList DOM rendering,
 * so this selects the first matching entry even though items may not be visible in jsdom.
 */
function selectAutocomplete(input: HTMLInputElement): void {
    pressKey(input, 'Enter');
}

/** Closes any open autocomplete list and applies the expression. */
function applyFilter(input: HTMLInputElement): void {
    pressKey(input, 'Escape');
    pressKey(input, 'Enter');
}

// --- Tests ---

describe('Advanced Filter - Autocomplete Interaction', () => {
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

    describe('Column autocomplete', () => {
        test('typing [ opens autocomplete popup', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `typing [ opens autocomplete popup setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `typing [ opens autocomplete popup setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            typeInto(input, '[');
            await asyncSetTimeout(0);

            expect(isAutocompleteOpen()).toBe(true);
            await new GridRows(api, `typing [ opens autocomplete popup final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('selecting column from autocomplete updates expression with bracket syntax', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(
                api,
                `selecting column from autocomplete updates expression with bracket syntax setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `selecting column from autocomplete updates expression with bracket syntax setup`)
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
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Type a unique prefix that matches only 'Athlete'
            typeInto(input, '[Athle');
            await asyncSetTimeout(0);
            expect(isAutocompleteOpen()).toBe(true);

            // Enter selects the top matching entry
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            expect(input.value).toContain('[Athlete]');
            await new GridRows(
                api,
                `selecting column from autocomplete updates expression with bracket syntax final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('selecting Age column updates expression', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `selecting Age column updates expression setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `selecting Age column updates expression setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            typeInto(input, '[Ag');
            await asyncSetTimeout(0);

            selectAutocomplete(input);
            await asyncSetTimeout(0);

            expect(input.value).toContain('[Age]');
            await new GridRows(api, `selecting Age column updates expression final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('selecting Has Gold column with spaces updates expression', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `selecting Has Gold column with spaces updates expression setup`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    ├── date "Date" width:200
                    ├── hasGold "Has Gold" width:200
                    └── country "Country" width:200
                `
            );
            await new GridRows(api, `selecting Has Gold column with spaces updates expression setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            typeInto(input, '[Has');
            await asyncSetTimeout(0);

            selectAutocomplete(input);
            await asyncSetTimeout(0);

            expect(input.value).toContain('[Has Gold]');
            await new GridRows(api, `selecting Has Gold column with spaces updates expression final state`).check(`
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

    describe('Operator autocomplete', () => {
        test('after column selection, autocomplete reopens for operators', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `after column selection, autocomplete reopens for operators setup`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    ├── date "Date" width:200
                    ├── hasGold "Has Gold" width:200
                    └── country "Country" width:200
                `
            );
            await new GridRows(api, `after column selection, autocomplete reopens for operators setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            typeInto(input, '[Athle');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // After column is selected, operator autocomplete should open
            expect(isAutocompleteOpen()).toBe(true);
            await new GridRows(api, `after column selection, autocomplete reopens for operators final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('typing operator prefix and selecting updates expression for text column', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `typing operator prefix and selecting updates expression for text column setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    ├── date "Date" width:200
                    ├── hasGold "Has Gold" width:200
                    └── country "Country" width:200
                `);
            await new GridRows(api, `typing operator prefix and selecting updates expression for text column setup`)
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
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Select Athlete column
            typeInto(input, '[Athle');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Type 'c' to narrow to 'contains' and select
            const afterCol = input.value;
            typeInto(input, afterCol + 'c');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            expect(input.value).toContain('contains');
            await new GridRows(
                api,
                `typing operator prefix and selecting updates expression for text column final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('typing > and selecting updates expression for number column', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `typing > and selecting updates expression for number column setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    ├── date "Date" width:200
                    ├── hasGold "Has Gold" width:200
                    └── country "Country" width:200
                `);
            await new GridRows(api, `typing > and selecting updates expression for number column setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Select Age column
            typeInto(input, '[Ag');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Type '>' to narrow to scalar operator and select
            const afterCol = input.value;
            typeInto(input, afterCol + '>');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            expect(input.value).toContain('>');
            await new GridRows(api, `typing > and selecting updates expression for number column final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                    ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                    ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                    ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                    ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                    └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
                `
            );
        });
    });

    describe('Full autocomplete flow → filter applied', () => {
        test('text filter: column → contains → value → apply filters rows', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `text filter: column → contains → value → apply filters rows setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    ├── date "Date" width:200
                    ├── hasGold "Has Gold" width:200
                    └── country "Country" width:200
                `);
            await new GridRows(api, `text filter: column → contains → value → apply filters rows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Step 1: Select column
            typeInto(input, '[Athle');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Step 2: Type operator prefix and select
            const afterCol = input.value;
            typeInto(input, afterCol + 'c');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Step 3: Type value — autocomplete already adds opening quote for text operands
            const afterOp = input.value;
            typeInto(input, afterOp + 'bolt"');
            await asyncSetTimeout(0);

            // Step 4: Apply
            applyFilter(input);
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(1);
            expect(getDisplayedAthletes(api)).toEqual(['Usain Bolt']);
            await new GridRows(api, `text filter: column → contains → value → apply filters rows final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                `
            );
        });

        test('number filter: column → > → number → apply filters rows', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `number filter: column → > → number → apply filters rows setup`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    ├── date "Date" width:200
                    ├── hasGold "Has Gold" width:200
                    └── country "Country" width:200
                `
            );
            await new GridRows(api, `number filter: column → > → number → apply filters rows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Select Age
            typeInto(input, '[Ag');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Select >
            const afterCol = input.value;
            typeInto(input, afterCol + '>');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Type number and apply
            const afterOp = input.value;
            typeInto(input, afterOp + '25');
            await asyncSetTimeout(0);
            applyFilter(input);
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson', 'Li Wei']);
            await new GridRows(api, `number filter: column → > → number → apply filters rows final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                └── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
            `);
        });

        test('boolean filter: column → is true → apply filters rows', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `boolean filter: column → is true → apply filters rows setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `boolean filter: column → is true → apply filters rows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Select Has Gold
            typeInto(input, '[Has');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Select 'is true' (type 'is t' to narrow)
            const afterCol = input.value;
            typeInto(input, afterCol + 'is t');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Boolean needs no value, apply directly
            applyFilter(input);
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Michael Phelps', 'Usain Bolt', '']);
            await new GridRows(api, `boolean filter: column → is true → apply filters rows final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('blank filter: column → is blank → apply filters rows', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `blank filter: column → is blank → apply filters rows setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `blank filter: column → is blank → apply filters rows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Select Age
            typeInto(input, '[Ag');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Select 'is blank' (type 'is b' to narrow)
            const afterCol = input.value;
            typeInto(input, afterCol + 'is b');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            applyFilter(input);
            await asyncSetTimeout(0);

            // Only '' row has null age
            expect(getDisplayedAthletes(api)).toEqual(['']);
            await new GridRows(api, `blank filter: column → is blank → apply filters rows final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });
    });

    describe('Keyboard navigation', () => {
        test('Escape closes autocomplete popup', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `Escape closes autocomplete popup setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `Escape closes autocomplete popup setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            typeInto(input, '[');
            await asyncSetTimeout(0);
            expect(isAutocompleteOpen()).toBe(true);

            pressKey(input, 'Escape');
            await asyncSetTimeout(0);

            expect(isAutocompleteOpen()).toBe(false);
            await new GridRows(api, `Escape closes autocomplete popup final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('Tab selects from autocomplete like Enter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `Tab selects from autocomplete like Enter setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `Tab selects from autocomplete like Enter setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            typeInto(input, '[Athle');
            await asyncSetTimeout(0);
            expect(isAutocompleteOpen()).toBe(true);

            // Tab should select the highlighted item, same as Enter
            pressKey(input, 'Tab');
            await asyncSetTimeout(0);

            expect(input.value).toContain('[Athlete]');
            await new GridRows(api, `Tab selects from autocomplete like Enter final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
        });

        test('ArrowDown then Enter selects a different column than the default', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `ArrowDown then Enter selects a different column than the default setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    ├── date "Date" width:200
                    ├── hasGold "Has Gold" width:200
                    └── country "Country" width:200
                `);
            await new GridRows(api, `ArrowDown then Enter selects a different column than the default setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Type '[' to get all columns, first will be selected
            typeInto(input, '[');
            await asyncSetTimeout(0);

            // Select the default (first) item to capture its value
            selectAutocomplete(input);
            await asyncSetTimeout(0);
            const firstColumnValue = input.value;

            // Reset and try again with ArrowDown
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
            nativeInputValueSetter.call(input, '');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await asyncSetTimeout(0);

            typeInto(input, '[');
            await asyncSetTimeout(0);

            // Press down to move to next item, then select
            pressKey(input, 'ArrowDown');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Should have selected a different column than the default first item
            expect(input.value).not.toBe(firstColumnValue);
            await new GridRows(api, `ArrowDown then Enter selects a different column than the default final state`)
                .check(`
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

    describe('Model verification after autocomplete-built expression', () => {
        test('getAdvancedFilterModel returns correct model', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `getAdvancedFilterModel returns correct model setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                ├── date "Date" width:200
                ├── hasGold "Has Gold" width:200
                └── country "Country" width:200
            `);
            await new GridRows(api, `getAdvancedFilterModel returns correct model setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 date:"2012-07-15" hasGold:false country:"United Kingdom"
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 date:"2012-08-05" hasGold:true country:"Jamaica"
                ├── LEAF id:3 athlete:"Anna Kowalski" age:19 date:"2020-07-23" hasGold:false country:"Poland"
                ├── LEAF id:4 athlete:"Li Wei" age:28 date:null hasGold:null country:null
                └── LEAF id:5 athlete:"" age:null date:"2024-01-01" hasGold:true country:""
            `);
            await asyncSetTimeout(0);
            const input = getInput(getGridElement(api)! as HTMLElement);

            // Build: [Athlete] contains "phelps"
            typeInto(input, '[Athle');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            const afterCol = input.value;
            typeInto(input, afterCol + 'contains');
            await asyncSetTimeout(0);
            selectAutocomplete(input);
            await asyncSetTimeout(0);

            // Autocomplete already adds opening quote for text operands
            const afterOp = input.value;
            typeInto(input, afterOp + 'phelps"');
            await asyncSetTimeout(0);
            applyFilter(input);
            await asyncSetTimeout(0);

            const model = api.getAdvancedFilterModel();
            expect(model).not.toBeNull();
            if (model && model.filterType !== 'join') {
                expect(model.colId).toBe('athlete');
                expect(model.type).toBe('contains');
                expect((model as any).filter).toBe('phelps');
            }
            await new GridRows(api, `getAdvancedFilterModel returns correct model final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" age:23 date:"2008-08-24" hasGold:true country:"United States"
            `);
        });
    });
});
