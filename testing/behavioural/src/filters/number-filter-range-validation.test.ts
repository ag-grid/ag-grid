import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import {
    ColumnFilterHarness,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../test-utils';

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
});
