import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import {
    ColumnFilterHarness,
    FilterDom,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

describe('Number Range Filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('Filter displays validation error state in last touched input when invalid range entered', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: ['inRange'],
                    },
                },
            ],
            rowData: [
                { country: 'Ireland', gold: 2 },
                { country: 'Mexico', gold: 8 },
                { country: 'Italy', gold: 3 },
            ],
        });
        await new GridColumns(
            api,
            `Filter displays validation error state in last touched input when invalid range  setup`
        ).checkColumns(`
            CENTER
            └── gold "Gold" width:200
        `);
        await new GridRows(
            api,
            `Filter displays validation error state in last touched input when invalid range  setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 gold:2
            ├── LEAF id:1 gold:8
            └── LEAF id:2 gold:3
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        // Wait for next tick, filters are async
        await asyncSetTimeout(0);

        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('gold'));
        await userSession.click(filterBtn);

        const fromNumberInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.numberFilterInstanceInput({ source: 'column-filter', index: 0 })
        );
        const toNumberInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.numberFilterInstanceInput({ source: 'column-filter', index: 1 })
        );

        await userSession.type(fromNumberInput, '1');
        await userSession.type(toNumberInput, '5');

        expect(fromNumberInput.valueAsNumber).toBe(1);
        expect(toNumberInput.valueAsNumber).toBe(5);
        expect(toNumberInput.validity.valid).toBe(true);
        await waitFor(() => {
            expect(api.getFilterModel()).toEqual({
                gold: {
                    filter: 1,
                    filterTo: 5,
                    filterType: 'number',
                    type: 'inRange',
                },
            });
        });

        await userSession.type(fromNumberInput, '0');
        expect(fromNumberInput.valueAsNumber).toBe(10);
        expect(fromNumberInput.validity.valid).toBe(false);
        expect(fromNumberInput).toHaveAttribute('aria-invalid', 'true');

        // Click away to make the filter disappear
        await userSession.click(getByTestId(gridDiv, agTestIdFor.cell('2', 'gold')));

        // Click to get the filter back again
        await userSession.click(filterBtn);

        // When re-opening, validity state defaults to the "to" input
        expect(fromNumberInput.valueAsNumber).toBe(10);
        expect(toNumberInput.valueAsNumber).toBe(5);
        expect(toNumberInput.validity.valid).toBe(false);
        expect(toNumberInput).toHaveAttribute('aria-invalid', 'true');

        // Delete content of from input
        await userSession.type(fromNumberInput, `{Backspace}{Backspace}`);

        expect(fromNumberInput.valueAsNumber).toBeNaN();
        expect(toNumberInput.valueAsNumber).toBe(5);
        expect(toNumberInput.validity.valid).toBe(true);
        expect(toNumberInput).toHaveAttribute('aria-invalid', 'false');
        await new GridRows(
            api,
            `Filter displays validation error state in last touched input when invalid range  final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 gold:2
            └── LEAF id:2 gold:3
        `);
    });

    test('re-opening reports the range again rather than leaving it invalid in silence', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['inRange'] },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(8, 0);
        await filter.setNumber(2, 1);
        expect(filter.input('number', 1).validity.valid).toBe(false);

        api.hidePopupMenu();
        await asyncSetTimeout(0);

        const reopened = await ColumnFilterHarness.open(api, 'gold');

        // Re-opening focuses `from`, which would claim the message; the attach pass is what hands it back
        // to `to`, so the pair is what separates a re-validated condition from a merely focused one.
        expect(reopened.input('number', 0).validity.valid).toBe(true);
        expect(reopened.input('number', 1).validity.valid).toBe(false);
        expect(reopened.input('number', 1).validationMessage).toBe('Must be greater than 8');
    });

    // An inclusive range accepts `from === to`, so a message saying the value must be strictly beyond the
    // other end would name a bound the filter would have taken.
    test('an inclusive range names a bound it would accept, not a strict one', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, filterOptions: ['inRange'], inRangeInclusive: true },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(8, 0);
        await filter.setNumber(2, 1);

        expect(filter.input('number', 1).validity.valid).toBe(false);
        expect(filter.input('number', 1).validationMessage).toBe('Must be greater than or equal to 8');

        // The bound it names is genuinely taken: equal ends are an exact match under an inclusive range.
        await filter.setNumber(8, 1);
        expect(filter.input('number', 1).validity.valid).toBe(true);
        await new GridRows(api, 'an inclusive range of one value matches that value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 gold:8
        `);
    });

    test('the message names the bound each input must respect, and follows the touched input', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['inRange'] },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(5, 0);
        await filter.setNumber(1, 1);

        // The `to` input was touched last, so it carries the message and must exceed `from`.
        expect(filter.input('number', 1).validity.valid).toBe(false);
        expect(filter.input('number', 1).validationMessage).toBe('Must be greater than 5');
        expect(filter.input('number', 0).validationMessage).toBe('');

        // Touching `from` moves the message across, mirrored to name the opposite bound.
        await filter.setNumber(6, 0);

        expect(filter.input('number', 0).validity.valid).toBe(false);
        expect(filter.input('number', 0).validationMessage).toBe('Must be less than 1');
        expect(filter.input('number', 1).validationMessage).toBe('');

        await new FilterDom(api, 'message on the touched input', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "6" ✗ "Must be less than 1"
            input [1]: "1"
            model: null
        `);
    });

    test('a from value equal to the to value is invalid', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['inRange'] },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(3, 0);
        await filter.setNumber(3, 1);

        // The bound is strict (`from >= to` is invalid), so an empty range is rejected rather than
        // silently matching nothing.
        expect(filter.input('number', 1).validity.valid).toBe(false);
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'equal range bounds', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "3"
            input [1]: "3" ✗ "Must be greater than 3"
            model: null
        `);
        await new GridRows(api, 'equal range bounds leave rows unfiltered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 gold:2
            ├── LEAF id:1 gold:8
            └── LEAF id:2 gold:3
        `);
    });

    test('switching from inRange to equals clears the range validation', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['inRange', 'equals'] },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(8, 0);
        await filter.setNumber(2, 1);

        expect(filter.input('number', 1).validity.valid).toBe(false);

        // "Equals" is a single-input condition, so the range bound no longer applies.
        await filter.selectOperator('Equals');
        await asyncSetTimeout(0);

        expect(filter.input('number', 0).validity.valid).toBe(true);
        expect(filter.input('number', 0).validationMessage).toBe('');
        await new GridRows(api, 'rows stay unfiltered while the equals value is unset').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 gold:2
            ├── LEAF id:1 gold:8
            └── LEAF id:2 gold:3
        `);
    });

    test('switching from equals back to inRange re-applies the range validation', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['inRange', 'equals'] },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(8, 0);
        await filter.setNumber(2, 1);
        await filter.selectOperator('Equals');
        await asyncSetTimeout(0);

        expect(filter.input('number', 0).validity.valid).toBe(true);

        // Switching back re-exposes the retained `to` value, so the inverted range is flagged again.
        await filter.selectOperator('Between');
        await asyncSetTimeout(0);

        expect(filter.input('number', 1).validity.valid).toBe(false);
        expect(filter.input('number', 1).validationMessage).toBe('Must be greater than 8');
    });

    test('cancelling back to an applied range clears the message the edit left behind', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['inRange'], buttons: ['apply', 'cancel'] },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(1, 0);
        await filter.setNumber(5, 1);
        await filter.apply();

        // Edit the applied range the wrong way round, then abandon the edit.
        await filter.setNumber(0, 1);
        expect(filter.input('number', 1).validity.valid).toBe(false);

        await filter.cancel();

        // The inputs hold the applied range again, so the message it replaced is gone.
        expect(filter.input('number', 1).validity.valid).toBe(true);
        expect(filter.input('number', 0).validity.valid).toBe(true);

        await new FilterDom(api, 'cancelled back to the applied range', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "1"
            input [1]: "5"
            AND
            operator: "Between"
            input [0]: "" ⟨From⟩
            input [1]: "" ⟨To⟩
            buttons: Apply | Cancel
            model:
              filterType: "number"
              type: "inRange"
              filter: 1
              filterTo: 5
        `);
    });

    test('a valid model applied through the API clears a stale range message', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'gold', filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['inRange'] } },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(5, 0);
        await filter.setNumber(1, 1);
        expect(filter.input('number', 1).validity.valid).toBe(false);

        await api.setColumnFilterModel('gold', { filterType: 'number', type: 'inRange', filter: 1, filterTo: 5 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The inputs hold an ordered range, so the message the old one left is gone.
        expect(filter.input('number', 0).validity.valid).toBe(true);
        expect(filter.input('number', 1).validity.valid).toBe(true);

        await new FilterDom(api, 'model applied over a stale message', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "1"
            input [1]: "5"
            AND
            operator: "Between"
            input [0]: "" ⟨From⟩
            input [1]: "" ⟨To⟩
            model:
              filterType: "number"
              type: "inRange"
              filter: 1
              filterTo: 5
        `);
    });

    test('a one-input option is not held to the range rule of the value left behind', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, filterOptions: ['inRange', 'equals'], maxNumConditions: 1 },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(1, 0);
        await filter.setNumber(5, 1);

        await filter.selectOperator('Equals');
        // `Equals` takes one value, so the 5 the range left in the hidden second input is not a bound on it.
        await filter.setNumber(8, 0);
        await asyncSetTimeout(0);

        expect(filter.input('number', 0).validity.valid).toBe(true);
        await waitFor(() => expect(filter.getModel()).toEqual({ filterType: 'number', type: 'equals', filter: 8 }));
        await new FilterDom(api, 'one-input option after a range', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "8"
            model:
              filterType: "number"
              type: "equals"
              filter: 8
        `);
        await new GridRows(api, 'equals applies over a stale range bound').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 gold:8
        `);

        // Coming back shows the 5 was kept rather than cleared, which is what made it a bound to ignore.
        await filter.selectOperator('Between');
        expect(filter.input('number', 1).value).toBe('5');
    });

    test('a zero-input option is not held to what either input still holds', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, filterOptions: ['inRange', 'blank'], maxNumConditions: 1 },
                },
            ],
            // A blank row: without one, `blank` and the abandoned 9..1 range both leave no rows.
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }, { gold: null }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(9, 0);
        await filter.setNumber(1, 1);
        expect(filter.input('number', 1).validity.valid).toBe(false);

        // `Blank` reads neither input, so the inverted range left in them cannot hold the condition back.
        await filter.selectOperator('Blank');
        await asyncSetTimeout(0);

        // Both inputs are hidden, so applying at all is what proves their contents stopped counting.
        expect(filter.inputs('number')).toHaveLength(0);
        await waitFor(() => expect(filter.getModel()).toEqual({ filterType: 'number', type: 'blank' }));
        await new GridRows(api, 'blank applies over an abandoned inverted range').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 gold:null
        `);
    });

    test('a condition still validates its own inputs once an earlier condition has been dropped', async () => {
        const userSession = userEvent.setup();
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['inRange'], maxNumConditions: 4 },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(1, 0);
        await filter.setNumber(2, 1);
        await filter.setNumber(3, 2);
        await filter.setNumber(4, 3);
        await filter.setNumber(5, 4);
        await filter.setNumber(6, 5);

        // Emptying the middle condition makes it incomplete, so closing the popup drops it and the
        // third condition slides down into its place.
        await filter.setNumber('', 2);
        await filter.setNumber('', 3);
        const gridDiv = getGridElement(api)! as HTMLElement;
        await userSession.click(getByTestId(gridDiv, agTestIdFor.cell('2', 'gold')));

        const reopened = await ColumnFilterHarness.open(api, 'gold');
        await waitFor(() => expect(reopened.inputs('number', 1)).toHaveLength(2));

        await reopened.setNumber(9, 2);
        await reopened.setNumber(1, 3);

        expect(reopened.input('number', 3).validity.valid).toBe(false);
        expect(reopened.input('number', 3).validationMessage).toBe('Must be greater than 9');
        await new FilterDom(api, 'range validated after a condition was dropped', { colId: 'gold' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "1"
            input [1]: "2"
            AND
            operator: "Between"
            input [0]: "9"
            input [1]: "1" ✗ "Must be greater than 9"
            AND
            operator: "Between"
            input [0]: "" ⟨From⟩
            input [1]: "" ⟨To⟩
            model:
              filterType: "number"
              operator: "AND"
              conditions:
                - filterType: "number"
                  type: "inRange"
                  filter: 1
                  filterTo: 2
                - filterType: "number"
                  type: "inRange"
                  filter: 5
                  filterTo: 6
        `);
    });

    // A condition kept back because an input is invalid has to stay editable, or there is no way to fix it.
    test('a condition kept back for being invalid is not disabled while the user fixes it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0, maxNumConditions: 3, filterOptions: ['equals', 'inRange'] },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }, { gold: 3 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.selectOperator('Equals', 0);
        await filter.setNumber(2, 0);
        await filter.setJoinOperator('OR');
        await filter.selectOperator('Equals', 1);
        await filter.setNumber(8, 1);
        await filter.selectOperator('Between', 2);
        await filter.setNumber(9, 2);
        await filter.setNumber(1, 3);
        // Length first, so a pair that lost an input fails as that rather than as a crash.
        expect(filter.inputs('number', 2)).toHaveLength(2);
        expect(filter.inputs('number', 2)[1].validity.valid).toBe(false);

        // The middle condition stops being complete, which is what asks for the trailing ones to go.
        await filter.selectOperator('Between', 1);
        await asyncSetTimeout(0);

        // Named first, so a condition that vanished instead of staying editable fails as that, not as a crash.
        expect(filter.inputs('number', 2)).toHaveLength(2);
        expect(filter.inputs('number', 2)[0].disabled).toBe(false);
        expect(filter.inputs('number', 2)[1].disabled).toBe(false);

        // Held back, not applied: the model must not carry the range the user is still fixing.
        await new FilterDom(api, 'the invalid condition stays on show without reaching the model', {
            colId: 'gold',
        }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "2"
            OR
            operator: "Between"
            input [0]: "8"
            input [1]: "" ⟨To⟩
            OR
            operator: "Between"
            input [0]: "9"
            input [1]: "1" ✗ "Must be greater than 9"
            model:
              filterType: "number"
              operator: "OR"
              conditions:
                - filterType: "number"
                  type: "equals"
                  filter: 2
                - filterType: "number"
                  type: "equals"
                  filter: 8
        `);
    });

    // The condition is held open by how many values its option takes, not by its key being `inRange`.
    test('a custom two-input option keeps its invalid state across a popup close', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter' as const,
                    filterParams: {
                        debounceMs: 0,
                        filterOptions: [
                            {
                                displayKey: 'span',
                                displayName: 'Span',
                                numberOfInputs: 2,
                                predicate: ([from, to]: (number | null)[], cellValue: number | null) =>
                                    cellValue != null &&
                                    (from == null || cellValue >= from) &&
                                    (to == null || cellValue <= to),
                            },
                        ],
                    },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(9, 0);
        await filter.setNumber(1, 1);
        expect(filter.input('number', 1).validity.valid).toBe(false);

        api.hidePopupMenu();
        await asyncSetTimeout(0);
        const reopened = await ColumnFilterHarness.open(api, 'gold');

        expect(reopened.input('number', 0).value).toBe('9');
        expect(reopened.input('number', 1).value).toBe('1');
        expect(reopened.input('number', 1).validity.valid).toBe(false);
    });

    test('an option that keeps its key but drops to one input clears the range message it left', async () => {
        const columnDefs = (numberOfInputs: 1 | 2) => [
            {
                field: 'gold',
                filter: 'agNumberColumnFilter' as const,
                filterParams: {
                    debounceMs: 0,
                    filterOptions: [
                        {
                            displayKey: 'span',
                            displayName: 'Span',
                            numberOfInputs,
                            predicate: ([from, to]: (number | null)[], cellValue: number | null) =>
                                cellValue != null &&
                                (from == null || cellValue >= from) &&
                                (to == null || cellValue <= to),
                        },
                    ],
                },
            },
        ];

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs(2),
            rowData: [{ gold: 2 }, { gold: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        // `from` is edited last, so the message lands on the input the one-value option keeps using.
        await filter.setNumber(1, 1);
        await filter.setNumber(9, 0);
        expect(filter.input('number', 0).validationMessage).toBe('Must be less than 1');

        // The same key takes one value here, so there is no order left for that input to be out of.
        api.setGridOption('columnDefs', columnDefs(1));
        await asyncSetTimeout(0);

        expect(filter.input('number', 0).validationMessage).toBe('');
        expect(filter.input('number', 0).validity.valid).toBe(true);
        // The value too: clearing the input would also clear the message, and lose what the user typed.
        expect(filter.input('number', 0).value).toBe('9');
    });

    test('a `colDef` refresh keeps the value an input showing a range error holds', async () => {
        const columnDefs = (numberParser: (value: string | null) => number | null) => [
            {
                field: 'gold',
                filter: 'agNumberColumnFilter' as const,
                filterParams: { debounceMs: 0, filterOptions: ['inRange'], numberParser },
            },
        ];

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs((value) => (value == null ? null : Number(value))),
            rowData: [{ gold: 2 }, { gold: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setNumber(9, 0);
        await filter.setNumber(1, 1);
        expect(filter.input('number', 1).validity.valid).toBe(false);

        // A new parser identity re-renders every input, and the invalid one still holds what the user typed.
        api.setGridOption(
            'columnDefs',
            columnDefs((value) => (value == null ? null : Number(value)))
        );
        await asyncSetTimeout(0);

        expect(filter.input('number', 0).value).toBe('9');
        expect(filter.input('number', 1).value).toBe('1');
    });

    test('Reset clears a range message a `numberFormatter` would otherwise leave on an empty input', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'gold',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        filterOptions: ['inRange'],
                        buttons: ['reset'],
                        // Writes '' rather than null for no value, so the empty input is not written as null.
                        numberFormatter: (value: number | null) => (value == null ? '' : String(value)),
                    },
                },
            ],
            rowData: [{ gold: 2 }, { gold: 8 }],
        });

        // A `numberFormatter` gives the column text inputs, so its values are read as text.
        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setText('9', 0);
        await filter.setText('1', 1);
        expect(filter.input('text', 1).validity.valid).toBe(false);

        await filter.reset();

        // Both inputs are empty, so there is no pair left for the message to be about.
        expect(filter.input('text', 1).value).toBe('');
        expect(filter.input('text', 1).validationMessage).toBe('');
        expect(filter.input('text', 1).validity.valid).toBe(true);
    });

    test('an out-of-order range keeps the next condition disabled across a rebuild', async () => {
        const columnDefs = (allowedCharPattern: string) => [
            {
                field: 'gold',
                filter: 'agNumberColumnFilter' as const,
                filterParams: { debounceMs: 0, filterOptions: ['inRange'], allowedCharPattern },
            },
        ];

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs('\\d\\-\\.'),
            rowData: [{ gold: 2 }, { gold: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setText('9', 0);
        await filter.setText('1', 1);
        expect(filter.input('text', 1).validity.valid).toBe(false);
        // An invalid pair is not a complete condition, so no second one is offered.
        expect(filter.inputs('text')).toHaveLength(2);

        // The pattern decides the element, so every input is replaced — carrying none of the validity
        // that decides whether the condition counts as complete.
        api.setGridOption('columnDefs', columnDefs('\\d\\-\\.,'));
        await asyncSetTimeout(0);

        expect(filter.input('text', 1).validity.valid).toBe(false);
        expect(filter.inputs('text')).toHaveLength(2);
    });

    // A rebuilt pair re-attaches both listeners, and the one that applies the filter reads the validity the
    // other maintains, so it has to run second or the edit that puts the range in order is judged stale.
    test('the edit that puts a range back in order after a rebuild applies on that edit', async () => {
        const columnDefs = (allowedCharPattern: string) => [
            {
                field: 'gold',
                filter: 'agNumberColumnFilter' as const,
                filterParams: { debounceMs: 0, filterOptions: ['inRange'], allowedCharPattern },
            },
        ];

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs('\\d\\-\\.'),
            rowData: [{ gold: 2 }, { gold: 8 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'gold');
        await filter.setText('1', 0);
        await filter.setText('0', 1);
        expect(filter.input('text', 1).validity.valid).toBe(false);

        api.setGridOption('columnDefs', columnDefs('\\d\\-\\.,'));
        await asyncSetTimeout(0);

        // One edit puts the range in order, and the row it admits is what says the filter followed it.
        await filter.setText('5', 1);

        expect(filter.input('text', 1).validity.valid).toBe(true);
        await new GridRows(api, 'the corrected range applies on the edit that corrected it').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 gold:2
        `);
    });
});
