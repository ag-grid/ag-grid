import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Black-box coverage for agTextColumnFilter conditions: every operator, blank/notBlank, incomplete
 * conditions, two-condition AND/OR compounds, and caseSensitive / trimInput / textFormatter / textMatcher params.
 */
describe('Text Filter — conditions coverage', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    // Distinctive rows: null and '' exercise the null-value / isBlank branches of every operator.
    const OPERATOR_ROWS = [
        { name: 'Apple' },
        { name: 'Banana' },
        { name: 'Cherry' },
        { name: 'apple pie' },
        { name: null },
        { name: '' },
    ];

    test('single-value operators: contains / notContains / equals / notEqual / startsWith / endsWith', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
            ],
            rowData: OPERATOR_ROWS,
        });

        const filter = await ColumnFilterHarness.open(api, 'name');

        // contains — case-insensitive by default, so 'app' matches 'Apple' and 'apple pie'.
        await filter.selectOperator('Contains');
        await filter.setText('app');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'app' });
        await new FilterDom(api, 'contains panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "app"
            model:
              filterType: "text"
              type: "contains"
              filter: "app"
        `);
        await new GridRows(api, 'contains rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            └── LEAF id:3 name:"apple pie"
        `);

        // notContains — passes null (evaluateNullValue) and the empty string.
        await filter.selectOperator('Does not contain');
        await filter.setText('app');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'notContains', filter: 'app' });
        await new GridRows(api, 'notContains rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Banana"
            ├── LEAF id:2 name:"Cherry"
            ├── LEAF id:4 name:null
            └── LEAF id:5 name:""
        `);

        // equals — exact match after lowercasing.
        await filter.selectOperator('Equals');
        await filter.setText('apple');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'equals', filter: 'apple' });
        await new GridRows(api, 'equals rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Apple"
        `);

        // notEqual — passes null and everything not exactly equal.
        await filter.selectOperator('Does not equal');
        await filter.setText('apple');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'notEqual', filter: 'apple' });
        await new GridRows(api, 'notEqual rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Banana"
            ├── LEAF id:2 name:"Cherry"
            ├── LEAF id:3 name:"apple pie"
            ├── LEAF id:4 name:null
            └── LEAF id:5 name:""
        `);

        // startsWith — 'app' at index 0.
        await filter.selectOperator('Begins with');
        await filter.setText('app');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'startsWith', filter: 'app' });
        await new GridRows(api, 'startsWith rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            └── LEAF id:3 name:"apple pie"
        `);

        // endsWith — only 'apple pie' ends with 'pie'.
        await filter.selectOperator('Ends with');
        await filter.setText('pie');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'endsWith', filter: 'pie' });
        await new GridRows(api, 'endsWith rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 name:"apple pie"
        `);
    });

    test('zero-input operators: blank / notBlank produce a value-less model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
            ],
            rowData: OPERATOR_ROWS,
        });

        const filter = await ColumnFilterHarness.open(api, 'name');

        // blank — matches null and whitespace/empty; input is hidden (no value in model).
        await filter.selectOperator('Blank');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'blank' });
        await new FilterDom(api, 'blank panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Blank"
            model:
              filterType: "text"
              type: "blank"
        `);
        await new GridRows(api, 'blank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 name:null
            └── LEAF id:5 name:""
        `);

        // notBlank — complement of blank.
        await filter.selectOperator('Not blank');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'notBlank' });
        await new GridRows(api, 'notBlank rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            ├── LEAF id:1 name:"Banana"
            ├── LEAF id:2 name:"Cherry"
            └── LEAF id:3 name:"apple pie"
        `);
    });

    test('a value operator with no text entered applies no filter (incomplete condition)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
            ],
            rowData: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Contains');
        await asyncSetTimeout(0);

        // Operator chosen but no value ⇒ model stays null and every row passes.
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'incomplete condition panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: ""
            model: null
        `);
        await new GridRows(api, 'incomplete condition rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            ├── LEAF id:1 name:"Banana"
            └── LEAF id:2 name:"Cherry"
        `);

        // Typing then clearing the text back to empty removes the filter again.
        await filter.setText('an');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'an' });
        await new GridRows(api, 'incomplete condition after typing text rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Banana"
        `);
        await filter.setText('');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();
        await new GridRows(api, 'incomplete condition after clearing text rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            ├── LEAF id:1 name:"Banana"
            └── LEAF id:2 name:"Cherry"
        `);
    });

    test('two-condition AND compound filters rows matching both conditions', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Alice' }, { name: 'Albert' }, { name: 'Bob' }, { name: 'Barbara' }, { name: 'Charlie' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Contains', 0);
        await filter.setText('a', 0);
        await asyncSetTimeout(0);
        await filter.selectOperator('Ends with', 1);
        await filter.setText('e', 1);
        await filter.setJoinOperator('AND');
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({
            filterType: 'text',
            operator: 'AND',
            conditions: [
                { filterType: 'text', type: 'contains', filter: 'a' },
                { filterType: 'text', type: 'endsWith', filter: 'e' },
            ],
        });
        await new FilterDom(api, 'AND compound panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "a"
            AND
            operator: "Ends with"
            input: "e"
            model:
              filterType: "text"
              operator: "AND"
              conditions:
                - filterType: "text"
                  type: "contains"
                  filter: "a"
                - filterType: "text"
                  type: "endsWith"
                  filter: "e"
        `);
        await new GridRows(api, 'AND compound rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:4 name:"Charlie"
        `);
    });

    test('two-condition OR compound filters rows matching either condition', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Alice' }, { name: 'Albert' }, { name: 'Bob' }, { name: 'Barbara' }, { name: 'Charlie' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Begins with', 0);
        await filter.setText('al', 0);
        await asyncSetTimeout(0);
        await filter.selectOperator('Begins with', 1);
        await filter.setText('b', 1);
        await filter.setJoinOperator('OR');
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({
            filterType: 'text',
            operator: 'OR',
            conditions: [
                { filterType: 'text', type: 'startsWith', filter: 'al' },
                { filterType: 'text', type: 'startsWith', filter: 'b' },
            ],
        });
        await new FilterDom(api, 'OR compound panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Begins with"
            input: "al"
            OR
            operator: "Begins with"
            input: "b"
            model:
              filterType: "text"
              operator: "OR"
              conditions:
                - filterType: "text"
                  type: "startsWith"
                  filter: "al"
                - filterType: "text"
                  type: "startsWith"
                  filter: "b"
        `);
        await new GridRows(api, 'OR compound rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            ├── LEAF id:1 name:"Albert"
            ├── LEAF id:2 name:"Bob"
            └── LEAF id:3 name:"Barbara"
        `);
    });

    test('default text filter is case-insensitive (equals matches all casings)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
            ],
            rowData: [{ name: 'Apple' }, { name: 'apple' }, { name: 'APPLE' }, { name: 'Pear' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Equals');
        await filter.setText('apple');
        await asyncSetTimeout(0);

        // Model stores the raw typed value; matching lowercases both sides.
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'equals', filter: 'apple' });
        await new GridRows(api, 'case-insensitive equals rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            ├── LEAF id:1 name:"apple"
            └── LEAF id:2 name:"APPLE"
        `);
    });

    test('caseSensitive:true makes equals match only the exact casing', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agTextColumnFilter',
                    filterParams: { debounceMs: 0, maxNumConditions: 1, caseSensitive: true },
                },
            ],
            rowData: [{ name: 'Apple' }, { name: 'apple' }, { name: 'APPLE' }, { name: 'Pear' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Equals');
        await filter.setText('apple');
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'equals', filter: 'apple' });
        await new GridRows(api, 'case-sensitive equals rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"apple"
        `);
    });

    test('trimInput:true trims the applied model value but leaves the input text untouched', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agTextColumnFilter',
                    filterParams: { debounceMs: 0, maxNumConditions: 1, trimInput: true },
                },
            ],
            rowData: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Pineapple' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Contains');
        await filter.setText('  App  ');
        await asyncSetTimeout(0);

        // Applied model is trimmed to 'App'; the panel input keeps the raw '  App  '.
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'App' });
        await new FilterDom(api, 'trimInput panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "App"
            model:
              filterType: "text"
              type: "contains"
              filter: "App"
        `);
        await new GridRows(api, 'trimInput rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            └── LEAF id:2 name:"Pineapple"
        `);
    });

    test('textFormatter normalises accents on both cell value and filter text', async () => {
        const stripAccents = (s?: string | null): string | null =>
            s == null ? null : s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agTextColumnFilter',
                    filterParams: { debounceMs: 0, maxNumConditions: 1, textFormatter: stripAccents },
                },
            ],
            rowData: [{ name: 'Café' }, { name: 'Cafe' }, { name: 'Tea' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Contains');
        await filter.setText('cafe');
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'cafe' });
        await new GridRows(api, 'textFormatter rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Café"
            └── LEAF id:1 name:"Cafe"
        `);
    });

    test('custom textMatcher overrides the default matching logic', async () => {
        // Word-boundary matcher: value matches only if a whitespace-delimited token equals the filter text.
        const wordMatcher = ({ value, filterText }: { value: string; filterText: string | null }): boolean =>
            filterText != null && value.split(' ').includes(filterText);
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agTextColumnFilter',
                    filterParams: { debounceMs: 0, maxNumConditions: 1, textMatcher: wordMatcher },
                },
            ],
            rowData: [{ name: 'red car' }, { name: 'carpet' }, { name: 'scar' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        await filter.selectOperator('Contains');
        await filter.setText('car');
        await asyncSetTimeout(0);

        // Default 'contains' would match all three; the custom matcher keeps only 'red car'.
        expect(filter.getModel()).toEqual({ filterType: 'text', type: 'contains', filter: 'car' });
        await new GridRows(api, 'textMatcher rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"red car"
        `);
    });
});
