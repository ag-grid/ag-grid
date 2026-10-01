import {
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi, GridOptions, SetAdvancedFilterModel } from 'ag-grid-community';

import { DEFAULT_OPTIONS, SET_MODULES, chooseEveryOffered, displayedAthletes } from './advancedFilterSetFixture';

/** Values chosen so every character the value-list grammar reacts to appears inside one. */
const GRAMMAR_ROWS = [
    { athlete: 'A', country: `O'Brien` },
    { athlete: 'B', country: 'Say "hi"' },
    { athlete: 'C', country: 'Comma, Land' },
    { athlete: 'D', country: 'Plain' },
    { athlete: 'E', country: 'Bracket ] Land' },
    { athlete: 'F', country: 'Arrow > Land' },
    { athlete: 'G', country: 'Paren ) Land' },
    { athlete: 'H', country: 'Slash / Land' },
    { athlete: 'I', country: 'Guillemet › Land' },
    { athlete: 'J', country: '2024/01' },
    { athlete: 'K', country: 'New Zealand' },
    { athlete: 'L', country: `Say "hi" to O'Brien` },
];

const GRAMMAR_OPTIONS: GridOptions = {
    columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
    rowData: GRAMMAR_ROWS,
    enableAdvancedFilter: true,
};

/** The fault an expression reported, or the athletes it left; one grid answers a whole table of them. */
function outcomeOf(api: GridApi, af: AdvancedFilterHarness): string {
    return af.input.validationMessage || displayedAthletes(api).join(' ');
}

/** Every case in a table expects the same answer, so the expectation is that answer against every name. */
function sameOutcome<T>(cases: Record<string, unknown>, outcome: T): Record<string, T> {
    const expected: Record<string, T> = {};
    for (const name of Object.keys(cases)) {
        expected[name] = outcome;
    }
    return expected;
}

describe('Advanced Filter - Set Filter grammar - brackets', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const BRACKET_FORMS: Record<string, string> = {
        'square brackets, the written form': '[Country] is any of ["Plain"]',
        'an unquoted value inside brackets': '[Country] is any of [Plain]',
        'spacing inside the brackets': '[Country] is any of [  "Plain"  ]',
        'spacing before the brackets': '[Country] is any of   ["Plain"]',
    };

    test('reads a bracketed list however it is spaced and quoted', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const outcomes: Record<string, string> = {};

        for (const [name, expression] of Object.entries(BRACKET_FORMS)) {
            await af.applyExpression(expression);
            outcomes[name] = outcomeOf(api, af);
        }

        expect(outcomes).toEqual(sameOutcome(BRACKET_FORMS, 'D'));
    });

    const UNENCLOSED_FORMS: Record<string, string> = {
        'no brackets at all': '[Country] is any of "Plain"',
        'no brackets and no quotes': '[Country] is any of Plain',
        'several values with no brackets': '[Country] is any of "Plain", "O\'Brien"',
        // Parentheses are the range option's brackets, and a list is not a range.
        parentheses: '[Country] is any of ("Plain")',
        'an unbracketed list before a join': '[Country] is any of "Plain" AND [Athlete] contains "D"',
        'an unbracketed list inside a group': '([Country] is any of "Plain" OR [Country] is any of "D")',
    };

    test('a list that is not enclosed in square brackets is rejected, and nothing is applied', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const outcomes: Record<string, { message: string; model: unknown }> = {};

        for (const [name, expression] of Object.entries(UNENCLOSED_FORMS)) {
            await af.applyExpression(expression);
            outcomes[name] = { message: af.input.validationMessage, model: api.getAdvancedFilterModel() };
        }

        expect(outcomes).toEqual(
            sameOutcome(UNENCLOSED_FORMS, {
                message: expect.stringContaining('Missing opening square bracket'),
                model: null,
            })
        );
    });

    test('a set condition inside a bracketed group is read', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('([Country] is any of ["Plain"] OR [Country] is any of ["O\'Brien"])');

        expect(displayedAthletes(api)).toEqual(['A', 'D']);
    });

    test('the blank label is an ordinary value, needing only the list brackets around it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of [(Blanks)]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['Li Wei']);

        await af.applyExpression('[Country] is any of ["(Blanks)"]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['Li Wei']);
        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual([null]);
    });
});

describe('Advanced Filter - Set Filter grammar - quoting', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    /** Only the forms the round-trip suite never writes; every quoted form is driven by it instead. */
    const UNWRITTEN_FORMS: Record<string, [expression: string, athlete: string]> = {
        'single quotes': [`[Country] is any of ['Plain']`, 'D'],
        'a bare value holding spaces and a slash': [`[Country] is any of [Slash / Land]`, 'H'],
        'a bare value holding a space': [`[Country] is any of [New Zealand]`, 'K'],
        'a bare value padded with spaces': [`[Country] is any of [   Plain   ]`, 'D'],
        // A column with no tree list has no path to satisfy, so the separators are part of the value.
        'a bare value holding the written tree separator': ['[Country] is any of [Arrow > Land]', 'F'],
        'a bare value holding the tree separator and padded': ['[Country] is any of [Arrow > Land   ]', 'F'],
        'a bare value holding a guillemet': ['[Country] is any of [Guillemet › Land]', 'I'],
        // Only `>` and `›` separate a path, so dates and paths read as the single value they are.
        'a bare value that is a date path': ['[Country] is any of [2024/01]', 'J'],
        // The brackets say where the value ends, so a `)` inside them is part of it.
        'a bare value holding a close parenthesis': ['[Country] is any of [Paren ) Land]', 'G'],
    };

    test('reads the forms the writer never produces', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const outcomes: Record<string, string> = {};
        const expected: Record<string, string> = {};

        for (const [name, [expression, athlete]] of Object.entries(UNWRITTEN_FORMS)) {
            await af.applyExpression(expression);
            outcomes[name] = outcomeOf(api, af);
            expected[name] = athlete;
        }

        expect(outcomes).toEqual(expected);
    });

    test('a comma still separates values, so an unquoted one names nothing', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of [Comma, Land]');

        // The comma separates the list itself, so no reading of it can be a single value.
        expect(af.input.validationMessage).toContain('Value not found');
        expect(api.getAdvancedFilterModel()).toBeNull();
    });

    test('the model stores the key, not the text, when a bare value is read whole', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of [Arrow > Land]');

        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Arrow > Land']);
    });

    test('the autocomplete writes a value holding a separator quoted, so it reads back', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [2024');
        await af.selectAutocomplete();

        expect(af.value).toBe('[Country] is any of ["2024/01", ');
        await af.applyExpression('[Country] is any of ["2024/01"]');
        expect(af.input.validationMessage).toBe('');
        expect(displayedAthletes(api)).toEqual(['J']);
    });

    test('the two quote kinds do not close each other', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression(`[Country] is any of ['Plain"]`);

        expect(af.input.validationMessage).toContain('Value is missing an end quote');
    });
});

describe('Advanced Filter - Set Filter grammar - separators', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const SEPARATOR_FORMS: Record<string, string> = {
        'a plain separator': '[Country] is any of ["Jamaica", "Poland"]',
        'no space after it': '[Country] is any of ["Jamaica","Poland"]',
        'extra spaces around it': '[Country] is any of ["Jamaica"  ,  "Poland"]',
        'a trailing separator': '[Country] is any of ["Jamaica", "Poland", ]',
    };

    test('reads a two value list however it is separated', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const outcomes: Record<string, unknown> = {};

        for (const [name, expression] of Object.entries(SEPARATOR_FORMS)) {
            await af.applyExpression(expression);
            outcomes[name] =
                af.input.validationMessage || (api.getAdvancedFilterModel() as SetAdvancedFilterModel).values;
        }

        expect(outcomes).toEqual(sameOutcome(SEPARATOR_FORMS, ['Jamaica', 'Poland']));
    });

    test('the same value written twice is kept twice, and filters once', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Plain", "Plain"]');

        expect((api.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual(['Plain', 'Plain']);
        expect(displayedAthletes(api)).toEqual(['D']);
    });
});

describe('Advanced Filter - Set Filter grammar - validation', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const FAULTS: Record<string, [expression: string, message: string]> = {
        'an empty list': ['[Country] is any of []', 'Value is missing'],
        'a list holding only spaces': ['[Country] is any of [   ]', 'Value is missing'],
        'a separator with no value before it': ['[Country] is any of [, "Jamaica"]', 'Value is missing'],
        'a tree separator with no value before it': ['[Country] is any of [> "Jamaica"]', 'Value is missing'],
        'a list left open': ['[Country] is any of ["Jamaica"', 'Missing closing square bracket'],
        'a value left open': ['[Country] is any of ["Jamaic', 'Value is missing an end quote'],
        'two quoted values with no separator': [
            '[Country] is any of ["Jamaica" "Poland"]',
            'Missing closing square bracket',
        ],
        'a bare run of words naming nothing': ['[Country] is any of [Jamaica Poland]', 'Value not found'],
        'brackets that do not match': ['[Country] is any of ["Jamaica")', 'Missing closing square bracket'],
        'a value the column does not hold': ['[Country] is any of ["Atlantis"]', 'Value not found'],
        // The list is what the fault belongs to, so the group's own `)` is taken with it rather than
        // closing anything: the caret is where the missing bracket goes.
        'a group closing before the list opens': ['([Country] is any of )', 'Missing opening square bracket'],
    };

    test('reports the fault in a list it cannot read, and applies nothing', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const outcomes: Record<string, { message: string; model: unknown }> = {};
        const expected: Record<string, { message: unknown; model: unknown }> = {};

        for (const [name, [expression, message]] of Object.entries(FAULTS)) {
            await af.applyExpression(expression);
            outcomes[name] = { message: af.input.validationMessage, model: api.getAdvancedFilterModel() };
            expected[name] = { message: expect.stringContaining(message), model: null };
        }

        expect(outcomes).toEqual(expected);
    });

    test('an expression that could not be applied is not applied by a later revalidation', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Atlantis"]');
        expect(af.input.validationMessage).toContain('Value not found');
        expect(api.getAdvancedFilterModel()).toBeNull();

        // Revalidation exists to re-parse what is applied; it must not apply what the user could not.
        api.setGridOption('includeHiddenColumnsInAdvancedFilter', true);
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        expect(displayedAthletes(api)).toEqual([
            'Michael Phelps',
            'Emma Thompson',
            'Usain Bolt',
            'Anna Kowalski',
            'Li Wei',
        ]);
    });

    test('an unknown value is reported against its own span', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica", "Atlantis"]');

        await new FilterDom(api, 'unknown value in a list').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica", "Atlantis"]"
            valid: false — Expression has an error. Value not found - "Atlantis".
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'unknown value leaves the rows alone').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States" age:23
            ├── LEAF id:1 athlete:"Emma Thompson" country:"United Kingdom" age:30
            ├── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
            ├── LEAF id:3 athlete:"Anna Kowalski" country:"Poland" age:19
            └── LEAF id:4 athlete:"Li Wei" country:null age:28
        `);
    });

    const HALF_WRITTEN: Record<string, string> = {
        'nothing written after the option': '[Country] is any of ',
        'an opening bracket alone': '[Country] is any of [',
        'an opening quote alone': '[Country] is any of ["',
        'a value still being typed': '[Country] is any of ["Jam',
        'a separator waiting for the next value': '[Country] is any of ["Jamaica", ',
    };

    test('does not report a value still being written as an unknown one', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const outcomes: Record<string, string> = {};

        for (const [name, expression] of Object.entries(HALF_WRITTEN)) {
            await af.type(expression);
            outcomes[name] = af.input.validationMessage;
        }

        // Validation runs on completed values only, so a value still being written is not yet a fault.
        expect(outcomes).toEqual(sameOutcome(HALF_WRITTEN, expect.not.stringContaining('Value not found')));
    });

    test('the text after a fault is offered nothing, while a caret before one is still in the list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        // The fault takes the rest of the text with it, so no following condition claims the caret either.
        await af.type('[Country] is any of ["Jamaica" x] AND ');
        expect(af.isAutocompleteOpen()).toBe(false);

        // An empty list is its own fault, reported at the bracket, so a caret inside it precedes the fault.
        const empty = '[Country] is any of []';
        await af.type(empty, empty.length - 1);
        expect(af.autocompleteEntries()).toEqual(['(Blanks)', 'Jamaica', 'Poland', 'United Kingdom', 'United States']);
    });

    test('a value that names nothing outranks the fault the region would otherwise report', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Atlantis"');

        // The value is the fault the author can act on, so it beats the missing bracket.
        expect(af.input.validationMessage).toContain('Value not found');
    });
});

describe('Advanced Filter - Set Filter grammar - round trips', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    /**
     * Writes each model out as an expression, reads that expression back on a second grid, and compares
     * both ends. One pair of grids answers the whole table: each case replaces the one before it.
     */
    async function checkRoundTrips(
        options: GridOptions,
        models: Record<string, SetAdvancedFilterModel>
    ): Promise<void> {
        const fromModel = await gridsManager.createGridAndWait('modelGrid', options);
        const fromExpression = await gridsManager.createGridAndWait('expressionGrid', options);
        const af = AdvancedFilterHarness.get(fromExpression);
        const outcomes: Record<string, unknown> = {};
        const expected: Record<string, unknown> = {};

        for (const [name, model] of Object.entries(models)) {
            fromModel.setAdvancedFilterModel(model);
            await asyncSetTimeout(0);
            const rows = displayedAthletes(fromModel);
            await af.applyExpression(AdvancedFilterHarness.get(fromModel).value);

            outcomes[name] = {
                message: af.input.validationMessage,
                model: fromExpression.getAdvancedFilterModel(),
                rows: displayedAthletes(fromExpression),
            };
            expected[name] = { message: '', model, rows };
            // A pair that both filter everything away would agree without proving anything.
            expect(rows.length).toBeGreaterThan(0);
        }

        expect(outcomes).toEqual(expected);
    }

    const setModel = (values: (string | null)[], type: 'isAnyOf' | 'isNoneOf' = 'isAnyOf'): SetAdvancedFilterModel => ({
        filterType: 'set',
        colId: 'country',
        type,
        values,
    });

    test('writes and reads back every value the grammar has to escape', async () => {
        await checkRoundTrips(GRAMMAR_OPTIONS, {
            'a plain value': setModel(['Plain']),
            'several values': setModel(['Plain', 'Comma, Land', `O'Brien`]),
            'a value holding a comma': setModel(['Comma, Land']),
            'a value holding a double quote': setModel(['Say "hi"']),
            'a value holding a single quote': setModel([`O'Brien`]),
            // No quote character can wrap this one, so the writer has to escape rather than choose.
            'a value holding both quote characters': setModel([`Say "hi" to O'Brien`]),
            'a value holding the close bracket': setModel(['Bracket ] Land']),
            'a value holding the written tree separator': setModel(['Arrow > Land']),
            'a value holding a close parenthesis': setModel(['Paren ) Land']),
            'a value holding a slash': setModel(['Slash / Land']),
            'a value holding a guillemet': setModel(['Guillemet › Land']),
            'a value that is a date path': setModel(['2024/01']),
            'every separator at once': setModel(['Arrow > Land', 'Slash / Land', 'Guillemet › Land']),
        });
    });

    test('every value the list offers can be chosen and applied, whatever characters it holds', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        const outcomes = await chooseEveryOffered(af, '[Country] is any of [');

        // Every row's value is offered under its own text, and choosing it filters on that value: the keys
        // come from the row data rather than from the list, so a value missing or misspelled fails here.
        expect(Object.fromEntries(outcomes)).toEqual(
            Object.fromEntries(GRAMMAR_ROWS.map(({ country }) => [country, [country]]))
        );
    });

    const offersOf = async (af: AdvancedFilterHarness, expression: string) => {
        await af.type(expression);
        return af.autocompleteEntries();
    };

    test('a character the list grammar owns ends the value, so such a value is entered from the list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        // Up to the separator the value narrows the list to itself, and it is still the only match.
        expect(await offersOf(af, '[Country] is any of [Comma')).toEqual(['Comma, Land']);

        // Typing its comma ends the value rather than continuing it: `Comma` names nothing, so it holds
        // no value back, and the caret is at the next one with the whole list to choose from.
        expect(await offersOf(af, '[Country] is any of [Comma,')).toContain('Comma, Land');
        expect(af.input.validationMessage).toContain('Value not found');

        // The end bracket is the stronger case: it closes the list, so there is nothing left to offer.
        expect(await offersOf(af, '[Country] is any of [Bracket')).toEqual(['Bracket ] Land']);
        expect(await offersOf(af, '[Country] is any of [Bracket ]')).toEqual([]);
        expect(af.isAutocompleteOpen()).toBe(false);

        // A quote is not one of them: it only opens a value, so inside one it is an ordinary character.
        expect(await offersOf(af, '[Country] is any of [Say "hi')).toEqual(['Say "hi"', `Say "hi" to O'Brien`]);

        // Choosing from the list is what writes such a value, quoted, so it reads back as itself.
        await af.selectAutocomplete();
        await af.append(']');
        await af.apply();
        expect(af.input.validationMessage).toBe('');
        expect((af.getModel() as SetAdvancedFilterModel).values).toEqual(['Say "hi"']);
    });

    test('opening a quote makes the list characters ordinary, and the list still narrows', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        // The quote is what says the characters the list grammar owns belong to the value, so typing one
        // is how a value holding them is reached by hand rather than by choosing it.
        expect(await offersOf(af, '[Country] is any of ["Bracket ]')).toEqual(['Bracket ] Land']);
        expect(await offersOf(af, '[Country] is any of ["Bracket ] La')).toEqual(['Bracket ] Land']);
        expect(await offersOf(af, '[Country] is any of ["Comma,')).toEqual(['Comma, Land']);
        expect(await offersOf(af, '[Country] is any of ["Comma, La')).toEqual(['Comma, Land']);

        await af.append('nd"]');
        await af.apply();
        expect(af.input.validationMessage).toBe('');
        expect((af.getModel() as SetAdvancedFilterModel).values).toEqual(['Comma, Land']);
    });

    test('a chosen value is quoted whether or not the author opened a quote', async () => {
        const api = await gridsManager.createGridAndWait('grid1', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(api);
        const outcomes: Record<string, string> = {};

        // The quotes belong to the value, not to what the author started typing, so a value needing them
        // gets them either way. `Comma, Land` would otherwise end the list at its own comma.
        await af.type('[Country] is any of [Comma');
        await af.selectAutocomplete();
        outcomes['typed bare'] = af.value;

        await af.type('[Country] is any of ["Comma');
        await af.selectAutocomplete();
        outcomes['typed with an opening quote'] = af.value;

        expect(outcomes).toEqual({
            'typed bare': '[Country] is any of ["Comma, Land", ',
            'typed with an opening quote': '[Country] is any of ["Comma, Land", ',
        });

        await af.append(']');
        await af.apply();
        expect(af.input.validationMessage).toBe('');
        expect((af.getModel() as SetAdvancedFilterModel).values).toEqual(['Comma, Land']);
    });

    test('a value holding both quote characters is written with the wrapping quote doubled', async () => {
        const fromModel = await gridsManager.createGridAndWait('modelGrid', GRAMMAR_OPTIONS);
        const af = AdvancedFilterHarness.get(fromModel);

        // Pinned as text on both sides rather than round-tripped: a writer and a parser that agreed on
        // some other escape would satisfy a round trip without either being the grammar.
        fromModel.setAdvancedFilterModel(setModel([`Say "hi" to O'Brien`]));
        await asyncSetTimeout(0);
        expect(af.value).toBe(`[Country] is any of ["Say ""hi"" to O'Brien"]`);

        const fromExpression = await gridsManager.createGridAndWait('expressionGrid', GRAMMAR_OPTIONS);
        await AdvancedFilterHarness.get(fromExpression).applyExpression(
            `[Country] is any of ["Say ""hi"" to O'Brien"]`
        );
        expect((fromExpression.getAdvancedFilterModel() as SetAdvancedFilterModel).values).toEqual([
            `Say "hi" to O'Brien`,
        ]);
        expect(displayedAthletes(fromExpression)).toEqual(['L']);
    });

    test('writes and reads back a blank and the negated option', async () => {
        await checkRoundTrips(DEFAULT_OPTIONS, {
            'a blank': setModel([null]),
            'a blank among values': setModel([null, 'Jamaica']),
            'is none of': setModel(['Jamaica'], 'isNoneOf'),
            'is none of a blank': setModel([null], 'isNoneOf'),
        });
    });

    test('a joined pair of set conditions survives the round trip', async () => {
        const options = DEFAULT_OPTIONS;
        const fromModel = await gridsManager.createGridAndWait('modelGrid', options);
        const model = {
            filterType: 'join' as const,
            type: 'AND' as const,
            conditions: [
                {
                    filterType: 'set' as const,
                    colId: 'country',
                    type: 'isAnyOf' as const,
                    values: ['Jamaica', 'Poland'],
                },
                { filterType: 'set' as const, colId: 'country', type: 'isNoneOf' as const, values: ['Poland'] },
            ],
        };
        fromModel.setAdvancedFilterModel(model);
        await asyncSetTimeout(0);
        const written = AdvancedFilterHarness.get(fromModel).value;

        const fromExpression = await gridsManager.createGridAndWait('expressionGrid', options);
        await AdvancedFilterHarness.get(fromExpression).applyExpression(written);

        expect(fromExpression.getAdvancedFilterModel()).toEqual(model);
        expect(displayedAthletes(fromExpression)).toEqual(['Usain Bolt']);
    });
});
