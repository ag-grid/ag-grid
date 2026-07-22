import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Regression baseline for Advanced Filter autocomplete: Tab completion, the position-aware suggestion
 * list, re-parsing after an edit, and multi-condition join completion. The suggestion list is a
 * VirtualList, so `installFilterLayoutMock` is required for its rows to render in jsdom.
 */
interface Row {
    athlete: string;
    age: number;
}

const ROW_DATA: Row[] = [
    { athlete: 'Bolt', age: 25 },
    { athlete: 'Ng', age: 40 },
    { athlete: 'Bond', age: 28 },
];

const OPTS: GridOptions<Row> = {
    columnDefs: [
        { field: 'athlete', filter: true },
        { field: 'age', filter: true },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

const UNFILTERED = `
    ROOT id:ROOT_NODE_ID
    ├── LEAF id:0 athlete:"Bolt" age:25
    ├── LEAF id:1 athlete:"Ng" age:40
    └── LEAF id:2 athlete:"Bond" age:28
`;

describe('Advanced Filter — autocomplete completion & editing', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the suggestion list is position-aware: column, operator, then filtered operators', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Ath');
        expect(af.autocompleteEntries()).toEqual(['Athlete']);

        await af.type('[Athlete] ');
        expect(af.autocompleteEntries()).toEqual([
            'contains',
            'does not contain',
            'equals',
            'does not equal',
            'begins with',
            'ends with',
            'is blank',
            'is not blank',
        ]);

        await af.type('[Athlete] beg');
        expect(af.autocompleteEntries()).toEqual(['begins with']);

        // At the operand position there are no suggestions and the popup closes.
        await af.type('[Athlete] contains "Bo"');
        await asyncSetTimeout(0);
        expect(af.isAutocompleteOpen()).toBe(false);
    });

    test('an inherited property name in filterOptions is not offered as an operator', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['equals', 'toString'] },
                },
            ],
            rowData: [{ name: 'Bolt' }],
            enableAdvancedFilter: true,
        });
        const af = AdvancedFilterHarness.get(api);

        // `toString` is an inherited Object.prototype name, not an AF operator — only `equals` is offered.
        await af.type('[Name] ');
        expect(af.autocompleteEntries()).toEqual(['equals']);
    });

    test('Tab completes a partial column name and appends a space', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Ath');
        await asyncSetTimeout(0);
        await af.tabComplete();
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Athlete] ');
    });

    test('Tab completes a partial operator and opens the operand quote', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Athlete] con');
        await asyncSetTimeout(0);
        await af.tabComplete();
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Athlete] contains "');
    });

    test('Tab at an empty operator slot selects the first operator', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Athlete] ');
        await asyncSetTimeout(0);
        await af.tabComplete();
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Athlete] contains "');
    });

    test('an expression built entirely through completion applies', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Ath');
        await asyncSetTimeout(0);
        await af.tabComplete(); // -> "[Athlete] "
        await af.append('con');
        await asyncSetTimeout(0);
        await af.tabComplete(); // -> "[Athlete] contains \""
        await af.append('Bo"');
        await af.apply();
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Athlete] contains "Bo"');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'contains',
            filter: 'Bo',
        });
        await new GridRows(api, 'built via completion rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:2 athlete:"Bond" age:28
        `);
    });

    test('editing an applied expression re-parses to a new operator', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Age] > 30');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'greaterThan',
            filter: 30,
        });
        await new GridRows(api, 'edit before rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Ng" age:40
        `);

        await af.applyExpression('[Age] < 30');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'lessThan',
            filter: 30,
        });
        await new GridRows(api, 'edit after rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:2 athlete:"Bond" age:28
        `);
    });

    test('placing the caret inside the column token reopens autocomplete for that token', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Caret at position 3 (inside `[Athlete]`) — the parser regenerates column-context suggestions.
        await af.type('[Athlete] contains "Bo"', 3);
        await asyncSetTimeout(0);

        expect(af.isAutocompleteOpen()).toBe(true);
        expect(af.autocompleteEntries()).toEqual(['Athlete']);
    });
});

describe('Advanced Filter — join autocomplete & multi-condition completion', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('after a complete condition the suggestion list offers the join operators', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Age] > 20 ');
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);
    });

    test('a partial join operator narrows to the matching join', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Age] > 20 A');
        expect(af.autocompleteEntries()).toEqual(['AND']);
    });

    test('once a join is chosen, a further operator slot only offers the same join', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // With AND already chosen, the third-condition join slot must not offer OR (mixed joins are invalid).
        await af.type('[Age] > 20 AND [Age] < 30 ');
        expect(af.autocompleteEntries()).toEqual(['AND']);
    });

    test('a whole AND expression can be built entirely through Tab completion', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Ath');
        await asyncSetTimeout(0);
        await af.tabComplete(); // "[Athlete] "
        await af.append('con');
        await asyncSetTimeout(0);
        await af.tabComplete(); // "[Athlete] contains \""
        await af.append('B" ');
        await asyncSetTimeout(0);
        await af.tabComplete(); // join -> "[Athlete] contains \"B\" AND "
        await af.append('[Ag');
        await asyncSetTimeout(0);
        await af.tabComplete(); // "... AND [Age] "
        await af.append('> 24');
        await af.apply();
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Athlete] contains "B" AND [Age] > 24');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'B' },
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 24 },
            ],
        });
        // contains 'B' (Bolt, Bond) AND age>24 ⇒ Bolt(25), Bond(28).
        await new GridRows(api, 'AND built via completion').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:2 athlete:"Bond" age:28
        `);
    });

    test('the second condition column and operator complete independently', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Start from a complete first condition + chosen join, then complete the second column.
        await af.type('[Age] > 20 OR [Ath');
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['Athlete']);
        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] > 20 OR [Athlete] ');

        // Now the second operator slot offers text operators.
        await af.append('eq');
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['equals', 'does not equal']);
        await af.tabComplete();
        await af.append('Ng"');
        await af.apply();
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Age] > 20 OR [Athlete] equals "Ng"');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'OR',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 },
                { filterType: 'text', colId: 'athlete', type: 'equals', filter: 'Ng' },
            ],
        });
        // age>20 is true for all three rows, so the OR matches everything.
        await new GridRows(api, 'second condition completed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            ├── LEAF id:1 athlete:"Ng" age:40
            └── LEAF id:2 athlete:"Bond" age:28
        `);
    });
});

describe('Advanced Filter — join-operator editing & multi-condition autocomplete', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('changing the first join operator rewrites every sibling operator', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Three AND conditions; double space before each AND so the caret can sit exactly at the first
        // operator's start, where the join list is unfiltered (both offered).
        await af.type('[Age] = 25  AND [Age] = 40  AND [Age] = 28', 12);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);

        // Select OR (second entry) → propagation rewrites the second AND to OR too.
        await af.pressKey('ArrowDown');
        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] = 25  OR [Age] = 40  OR [Age] = 28');

        await af.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'OR',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'equals', filter: 25 },
                { filterType: 'number', colId: 'age', type: 'equals', filter: 40 },
                { filterType: 'number', colId: 'age', type: 'equals', filter: 28 },
            ],
        });
        await new GridRows(api, 'three-way OR matches all').check(UNFILTERED);
    });

    test('editing the first operator skips an invalid sibling operator during propagation', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // The middle operator `XOR` is invalid, so it has no parsed end position. Re-completing the first
        // operator (OR) must skip that sibling in the propagation loop instead of rewriting it.
        await af.type('[Age] = 25  OR [Age] = 40 XOR [Age] = 28', 12);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);

        await af.pressKey('ArrowDown');
        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] = 25  OR [Age] = 40 XOR [Age] = 28');
    });

    test('the join list appears between two conditions and a partial narrows it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Caret at position 12 (mid first AND) → search string "A" narrows to AND only.
        await af.type('[Age] = 25 AND [Age] = 40 AND [Age] = 28', 12);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['AND']);
    });

    test('a caret before the expression offers columns and inserts a new leading condition', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Leading space → the first condition starts at 1, so caret 0 is "before the expression".
        await af.type(' [Age] > 20', 0);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['Age', 'Athlete']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] [Age] > 20');
    });

    test('a caret at a leading open bracket disables suggestions', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('([Age] > 20)', 0);
        await asyncSetTimeout(0);
        expect(af.isAutocompleteOpen()).toBe(false);
    });

    test('a completed bracket group offers a following join operator', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('([Age] > 20) ');
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('([Age] > 20) AND ');
    });

    test('a valid bracket group before an invalid condition reports the condition error', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('([Age] > 20) AND [Age] blah');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new FilterDom(api, 'valid group then invalid condition').checkFilterDom(`
            ADVANCED FILTER
            input: "([Age] > 20) AND [Age] blah"
            valid: false — Expression has an error. Option not found - blah.
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'valid-group-invalid-condition rows').check(UNFILTERED);
    });

    test('completing a column for a new second condition appends it beyond the join', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Age] > 20 AND ');
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['Age', 'Athlete']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] > 20 AND [Age] ');
    });

    test('a join operator is inserted directly before a following bracket group', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Two conditions with no operator between them; caret at the open bracket (position 12).
        await af.type('[Age] > 20  ([Age] < 30)', 12);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] > 20  AND ([Age] < 30)');
    });

    test('a join operator inserted at a space gap before a bracket group', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Caret at the space (position 11) just before the group — the end position is scanned backwards.
        await af.type('[Age] > 20  ([Age] < 30)', 11);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['AND', 'OR']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] > 20  AND ([Age] < 30)');
    });

    test('a whitespace-only expression offers the column list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type(' ');
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['Age', 'Athlete']);
    });
});

describe('Advanced Filter — column & operator editing branches', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('re-selecting an already-valid column leaves the expression unchanged', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Caret inside the valid `[Age]` token → the column list reopens for that token.
        await af.type('[Age] > 20', 2);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['Age', 'Athlete']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] > 20');
    });

    test('completing a partially-typed column from inside the token rewrites the whole token', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Caret at position 1 inside the still-incomplete `[Ag` token → the token has no resolved colId,
        // so the end position is found by scanning forward over the remaining name characters.
        await af.type('[Ag', 1);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['Age', 'Athlete']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] ');
    });

    test('completing an operator inside the leading spaces inserts it in place', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Extra spaces between column and operator; caret at position 6 (before the `>` at 9).
        await af.type('[Age]    > 20', 6);
        await asyncSetTimeout(0);
        // Position precedes the operator's own start, so the search string is empty → full operator list.
        expect(af.autocompleteEntries()).toEqual(['=', '!=', '>', '>=', '<', '<=', 'is blank', 'is not blank']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] =  > 20');
    });

    test('completing an operator with an open bracket immediately after treats the value as empty', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Column, spaces, then `(` in the operator slot; caret at the bracket (position 7). No operator is
        // resolved yet, so the end position is scanned and the bracket marks the operand region as empty.
        await af.type('[Age]  (', 7);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual(['=', '!=', '>', '>=', '<', '<=', 'is blank', 'is not blank']);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age]  = (');
    });

    test('completing a partial operator whose scan reaches a close bracket', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // Partial operator `con` sits right before the group's `)`; caret at its start (position 11), so
        // the search string is empty (full list) and the end position is found by scanning to the bracket.
        await af.type('([Athlete] con)', 11);
        await asyncSetTimeout(0);
        expect(af.autocompleteEntries()).toEqual([
            'contains',
            'does not contain',
            'equals',
            'does not equal',
            'begins with',
            'ends with',
            'is blank',
            'is not blank',
        ]);

        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('([Athlete] contains ")');
    });

    test('an unknown column name yields an open but empty suggestion list', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // `[Zzz]` never resolves to a column, so the token keeps absorbing input and the caret stays in
        // column context — the list opens but no column matches the search string.
        await af.type('[Zzz] ');
        await asyncSetTimeout(0);
        expect(af.isAutocompleteOpen()).toBe(true);
        expect(af.autocompleteEntries()).toEqual([]);
    });
});
