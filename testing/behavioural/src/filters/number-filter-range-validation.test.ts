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
});
