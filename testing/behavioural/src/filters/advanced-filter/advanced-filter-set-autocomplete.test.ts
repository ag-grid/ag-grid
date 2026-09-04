import {
    AdvancedFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import { DEFAULT_OPTIONS, ROW_DATA, SET_MODULES } from './advancedFilterSetFixture';

describe('Advanced Filter - Set Filter value sources', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('a provided values list is what the autocomplete offers, not the row values', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['Atlantis', 'Jamaica'] },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Atlantis', 'Jamaica']);

        // A provided value the rows do not hold is still a valid expression; it just matches nothing.
        await af.applyExpression('[Country] is any of ["Atlantis"]');
        await new GridRows(api, 'provided values').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('values from an async callback reach the list on the keystroke after they arrive', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: (params: { success: (values: string[]) => void }) => {
                            setTimeout(() => params.success(['Jamaica', 'Poland']), 0);
                        },
                    },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        // The callback has not answered yet, so there is nothing to offer rather than a wait.
        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual([]);

        await asyncSetTimeout(0);
        // The same keystroke again, so the arrival is the only thing that changed: asking is what picks
        // the values up, since the open list is not refreshed from underneath.
        await af.type('');
        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Jamaica', 'Poland']);
    });

    test('suppressSorting leaves the values in the order the rows give them', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', filter: 'agSetColumnFilter', filterParams: { suppressSorting: true } },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');

        expect(af.autocompleteEntries()).toEqual(['United States', 'United Kingdom', 'Jamaica', 'Poland', '(Blanks)']);
    });

    test('new values arriving with the row data reach the list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).not.toContain('Kenya');

        api.setGridOption('rowData', [...ROW_DATA, { athlete: 'New', country: 'Kenya', age: 20 }]);
        await asyncSetTimeout(0);

        await af.type('');
        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toContain('Kenya');
    });
});

describe('Advanced Filter - Set Filter autocomplete rendering', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the matching text is highlighted, as it is for columns and options', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [nit');

        const highlighted = Array.from(document.querySelectorAll('.ag-autocomplete-list b')).map(
            (el) => el.textContent
        );
        expect(highlighted).toEqual(['nit', 'nit']);
    });

    test('a cell renderer owns the row, so the match is not marked up inside it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { cellRenderer: (p: { value: string | null }) => `<em>${p.value ?? ''}</em>` },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [nit');

        expect(af.autocompleteEntries()).toEqual(['United Kingdom', 'United States']);
        expect(document.querySelectorAll('.ag-autocomplete-list em').length).toBe(2);
        expect(document.querySelectorAll('.ag-autocomplete-list b').length).toBe(0);
    });

    test('a blank reaches a cell renderer named, the same spelling the list offers', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...DEFAULT_OPTIONS,
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        cellRenderer: (p: { valueFormatted?: string | null }) => `<em>${p.valueFormatted || ''}</em>`,
                    },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');

        expect(af.autocompleteEntries()).toEqual([
            '(Blanks)',
            'Jamaica',
            'Poland',
            'United Kingdom',
            'United States',
        ]);
        expect(Array.from(document.querySelectorAll('.ag-autocomplete-list em')).map((el) => el.textContent)).toEqual([
            '(Blanks)',
            'Jamaica',
            'Poland',
            'United Kingdom',
            'United States',
        ]);
    });
});

describe('Advanced Filter - Set Filter editing a written list', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const LIST = '[Country] is any of ["Jamaica", "Poland"]';
    const INSIDE_FIRST_VALUE = LIST.indexOf('Jamaica') + 1;

    test('the value being replaced is still offered, while the rest of the list is not', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type(LIST, INSIDE_FIRST_VALUE);

        // "Jamaica" is the value under the caret, so it comes back on offer; "Poland" is still spoken for.
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Jamaica', 'United Kingdom', 'United States']);
    });

    test('rewriting the first value changes which value the list holds back', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of ["Jamaica", ');
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Poland', 'United Kingdom', 'United States']);

        // One value is spoken for either way, so only *which* one has changed.
        await af.type('[Country] is any of ["Poland", ');
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Jamaica', 'United Kingdom', 'United States']);
    });

    test('the search string is the text before the caret, not the whole value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const expression = '[Country] is any of ["United Kingdom"]';
        await af.type(expression, expression.indexOf('Kingdom'));

        expect(af.autocompleteEntries()).toEqual(['United Kingdom', 'United States']);
    });

    test('selecting replaces the value at the caret and leaves the rest of the list alone', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const partial = '[Country] is any of ["United King", "Poland"]';
        await af.type(partial, partial.indexOf('United King') + 'United King'.length);
        await af.selectAutocomplete();

        // The replacement is written where the old value was; a value already terminated takes no separator.
        expect(af.value).toBe('[Country] is any of ["United Kingdom", "Poland"]');
    });

    test('a value deleted from the middle of a list is offered again and stops filtering', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica", "Poland", "United States"]');
        await new GridRows(api, 'three values').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States" age:23
            ├── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
            └── LEAF id:3 athlete:"Anna Kowalski" country:"Poland" age:19
        `);

        await af.applyExpression('[Country] is any of ["Jamaica", "United States"]');

        await new GridRows(api, 'middle value deleted').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States" age:23
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
        `);
        await af.type('[Country] is any of ["Jamaica", "United States", ');
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Poland', 'United Kingdom']);
    });

    test('replacing the column definitions re-derives the value list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toContain('Jamaica');

        api.setGridOption('columnDefs', [
            { field: 'athlete', filter: 'agTextColumnFilter' },
            { field: 'country', filter: 'agSetColumnFilter', filterParams: { values: ['Atlantis'] } },
            { field: 'age', filter: 'agNumberColumnFilter' },
        ]);
        await asyncSetTimeout(0);

        await af.type('');
        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['Atlantis']);
    });
});

describe('Advanced Filter - Set Filter value list', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('choosing a set option opens the value list ready for the first value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any');
        await af.selectAutocomplete();

        expect(af.value).toBe('[Country] is any of ["');
        expect(af.autocompleteEntries()).toContain('Jamaica');
    });

    test('the value list offers the column values, drops the ones written and restores a deleted one', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Jamaica', 'Poland', 'United Kingdom', 'United States']);

        await af.type('[Country] is any of ["Jamaica", ');
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Poland', 'United Kingdom', 'United States']);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toContain('Jamaica');
    });

    test('typing filters the values without an opening quote', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [Uni');

        expect(af.autocompleteEntries()).toEqual(['United Kingdom', 'United States']);
    });

    test('selecting a value quotes it and readies the next', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [Jam');
        await af.selectAutocomplete();

        expect(af.value).toBe('[Country] is any of ["Jamaica", ');
        expect(af.autocompleteEntries()).not.toContain('Jamaica');
    });

    test('selecting a value the author already quoted replaces it rather than leaving the end quote behind', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of ["Jamaica"');
        await af.selectAutocomplete();

        expect(af.value).toBe('[Country] is any of ["Jamaica", ');
    });

    test('past the end of a set condition the join operators are offered, as after any other condition', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        // A closed quote with no separator after it leaves the caret in the value just written, so the
        // list is still being edited: values, not join operators, which is the contrast that follows.
        await af.type('[Country] is any of ["Jamaica"');
        expect(af.autocompleteEntries()).toEqual(['Jamaica']);

        await af.type('[Country] is any of ["Jamaica"] ');
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);

        // An unbracketed list holds one value, so it too is over once a space follows it.
        await af.type('[Country] is any of "Jamaica" ');
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);
    });

    test('a caret in the gap between two written values offers the ones still missing', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const expression = '[Country] is any of ["Jamaica", "Poland"]';
        await af.type(expression, expression.indexOf(' "Poland"'));

        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'United Kingdom', 'United States']);
    });

    test('a caret before the end bracket of a closed list can still start another value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const expression = '[Country] is any of ["Jamaica", ]';
        await af.type(expression, expression.length - 1);
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Poland', 'United Kingdom', 'United States']);

        // Readied for the next value, as selecting anywhere else in the list is.
        await af.selectAutocomplete();
        expect(af.value).toBe('[Country] is any of ["Jamaica", "(Blanks)", ]');
    });
});
