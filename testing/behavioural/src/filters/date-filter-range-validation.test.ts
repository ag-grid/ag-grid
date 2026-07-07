import { getAllByTestId, getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { DateFilterModel } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Number Range Filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule, TextFilterModule, DateFilterModule],
    });

    beforeAll(() => setupAgTestIds());
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
});

async function selectFilterOption(gridDiv: HTMLElement, userSession: any, optionText: string): Promise<void> {
    const pickerDisplay = getAllByTestId(
        gridDiv,
        agTestIdFor.filterInstancePickerDisplay({ source: 'column-filter' })
    )[0];
    await userSession.click(pickerDisplay);

    await asyncSetTimeout(0);

    const listItems = document.querySelectorAll('.ag-list-item');
    let targetItem: Element | null = null;
    listItems.forEach((item) => {
        if (item.textContent?.trim() === optionText) {
            targetItem = item;
        }
    });
    expect(targetItem).not.toBeNull();
    await userSession.click(targetItem!);

    await asyncSetTimeout(0);
}

describe('Date Range Filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [DateFilterModule, ClientSideRowModelModule, TextFilterModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    test('Switching from inRange to equals clears range validation on the from input', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        filterOptions: ['inRange', 'equals'],
                    },
                },
            ],
            rowData: [{ date: '2024-01-15' }, { date: '2024-06-15' }, { date: '2024-12-15' }],
        });
        await new GridColumns(api, `Switching from inRange to equals clears range validation on the from input setup`)
            .checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
        await new GridRows(api, `Switching from inRange to equals clears range validation on the from input setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 date:"2024-01-15"
                ├── LEAF id:1 date:"2024-06-15"
                └── LEAF id:2 date:"2024-12-15"
            `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        await asyncSetTimeout(0);

        // Open the filter popup
        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);

        await asyncSetTimeout(0);

        // Enter dates into the inRange inputs: from=2024-01-15, to=2024-06-15
        const fromDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 0 })
        );
        const toDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 1 })
        );

        // Use fireEvent to set date values (userEvent.type doesn't work well with date inputs)
        fromDateInput.valueAsDate = new Date('2024-01-15');
        fromDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        fromDateInput.dispatchEvent(new Event('change', { bubbles: true }));

        toDateInput.valueAsDate = new Date('2024-06-15');
        toDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        toDateInput.dispatchEvent(new Event('change', { bubbles: true }));

        await asyncSetTimeout(0);

        // Both inputs should be valid (from < to)
        expect(fromDateInput.validity.valid).toBe(true);
        expect(toDateInput.validity.valid).toBe(true);

        await waitFor(() => {
            const model = api.getFilterModel()?.date as DateFilterModel;
            expect(model).toBeTruthy();
            expect(model.type).toBe('inRange');
        });

        // Switch to "equals" via the filter type picker
        await selectFilterOption(gridDiv, userSession, 'Equals');

        // Now the filter is "equals" - the to input is hidden but still has its value.
        // Change the from date to match what was in the to date.
        const fromDateInputEquals = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter' })
        );

        fromDateInputEquals.valueAsDate = new Date('2024-06-15');
        fromDateInputEquals.dispatchEvent(new Event('input', { bubbles: true }));
        fromDateInputEquals.dispatchEvent(new Event('change', { bubbles: true }));

        await asyncSetTimeout(0);

        // The from input should be valid - no range validation should apply for "equals"
        expect(fromDateInputEquals.validity.valid).toBe(true);
        await new GridRows(
            api,
            `Switching from inRange to equals clears range validation on the from input final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2024-06-15"
        `);
    });

    test('Switching from equals back to inRange re-enables range validation', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        filterOptions: ['inRange', 'equals'],
                    },
                },
            ],
            rowData: [{ date: '2024-01-15' }, { date: '2024-06-15' }, { date: '2024-12-15' }],
        });
        await new GridColumns(api, `Switching from equals back to inRange re-enables range validation setup`)
            .checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
        await new GridRows(api, `Switching from equals back to inRange re-enables range validation setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-15"
            ├── LEAF id:1 date:"2024-06-15"
            └── LEAF id:2 date:"2024-12-15"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        await asyncSetTimeout(0);

        // Open the filter popup
        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);

        await asyncSetTimeout(0);

        // Enter valid inRange dates: from=2024-01-15, to=2024-06-15
        const fromDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 0 })
        );
        const toDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 1 })
        );

        fromDateInput.valueAsDate = new Date('2024-01-15');
        fromDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        toDateInput.valueAsDate = new Date('2024-06-15');
        toDateInput.dispatchEvent(new Event('input', { bubbles: true }));

        await asyncSetTimeout(0);

        // Switch to "equals"
        await selectFilterOption(gridDiv, userSession, 'Equals');

        // Change the from date to be after what was in the to date
        const fromDateInputEquals = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter' })
        );

        fromDateInputEquals.valueAsDate = new Date('2024-12-15');
        fromDateInputEquals.dispatchEvent(new Event('input', { bubbles: true }));

        await asyncSetTimeout(0);

        // Valid in "equals" mode - no range validation
        expect(fromDateInputEquals.validity.valid).toBe(true);

        // Switch back to "inRange" - the from date (2024-12-15) is now after the to date (2024-06-15)
        await selectFilterOption(gridDiv, userSession, 'Between');

        // Trigger validation by interacting with the from input
        const fromDateInputRange = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 0 })
        );
        fromDateInputRange.dispatchEvent(new Event('focusin', { bubbles: true }));

        await asyncSetTimeout(0);

        // Range validation should now be active again - from > to is invalid
        expect(fromDateInputRange.validity.valid).toBe(false);
        await new GridRows(api, `Switching from equals back to inRange re-enables range validation final state`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );
    });

    test('inRange validation tooltip reports once on re-open, with no debounced re-report', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        filterOptions: ['inRange'],
                    },
                },
            ],
            rowData: [{ date: '2024-01-15' }, { date: '2024-06-15' }, { date: '2024-12-15' }],
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        await asyncSetTimeout(0);

        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);

        await asyncSetTimeout(0);

        const fromDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 0 })
        );
        const toDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 1 })
        );

        // Enter an invalid range: from (2020-10-10) is after to (2020-09-09).
        fromDateInput.valueAsDate = new Date('2020-10-10');
        fromDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        fromDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        toDateInput.valueAsDate = new Date('2020-09-09');
        toDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        toDateInput.dispatchEvent(new Event('change', { bubbles: true }));

        await asyncSetTimeout(0);

        expect(toDateInput.validity.valid).toBe(false);

        // Close the filter. For an invalid inRange filter outside Firefox the invalid
        // input state is deliberately retained, so it is still invalid on re-open.
        await userSession.click(getByTestId(gridDiv, agTestIdFor.cell('2', 'date')));

        await asyncSetTimeout(0);

        // Chrome/Safari focus the invalid control when reportValidity() is called, which
        // fires `focusin` and re-triggers the (debounced) date validation report. jsdom's
        // reportValidity is a no-op that does not steal focus, so model that focus steal on
        // the first report to exercise the same re-report path a real browser would take.
        let stolenFocus = false;
        const reportSpy = vi
            .spyOn(HTMLInputElement.prototype, 'reportValidity')
            .mockImplementation(function reportValidityWithFocusSteal(this: HTMLInputElement) {
                if (!stolenFocus) {
                    stolenFocus = true;
                    this.dispatchEvent(new Event('focusin', { bubbles: true }));
                }
                return this.validity.valid;
            });

        try {
            // Re-open the filter: afterGuiAttached reports validity immediately (once).
            await userSession.click(filterBtn);

            await asyncSetTimeout(0);

            const reportsOnOpen = reportSpy.mock.calls.length;

            // Let the 500ms date-report debounce window elapse.
            await asyncSetTimeout(600);

            // The tooltip must render once and stay stable: the focusin from the focus steal recomputes
            // the same validity message, so no second, conflicting report is scheduled.
            expect(reportSpy.mock.calls.length).toBe(reportsOnOpen);
        } finally {
            reportSpy.mockRestore();
        }
    });

    test('inRange validation tooltip does not re-report when focus returns (e.g. switching browser tabs)', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        filterOptions: ['inRange'],
                    },
                },
            ],
            rowData: [{ date: '2024-01-15' }, { date: '2024-06-15' }, { date: '2024-12-15' }],
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        await asyncSetTimeout(0);

        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);

        await asyncSetTimeout(0);

        const fromDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 0 })
        );
        const toDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 1 })
        );

        // Enter an invalid range: from (2020-10-10) is after to (2020-09-09).
        fromDateInput.valueAsDate = new Date('2020-10-10');
        fromDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        fromDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        toDateInput.valueAsDate = new Date('2020-09-09');
        toDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        toDateInput.dispatchEvent(new Event('change', { bubbles: true }));

        // Let the debounced report from typing land, so the invalid bubble is stably shown.
        await asyncSetTimeout(600);

        expect(toDateInput.validity.valid).toBe(false);

        const reportSpy = vi.spyOn(HTMLInputElement.prototype, 'reportValidity');

        try {
            // Switching browser tabs away and back re-focuses the invalid input, firing `focusin`.
            // The validity message is unchanged, so no report should be scheduled - otherwise the
            // native validation bubble blinks (disappears then reappears) on every tab return.
            toDateInput.dispatchEvent(new Event('focusin', { bubbles: true }));

            await asyncSetTimeout(600);

            expect(reportSpy).not.toHaveBeenCalled();
        } finally {
            reportSpy.mockRestore();
        }
    });

    test('inRange validation bubble follows focus between the from and to inputs', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        filterOptions: ['inRange'],
                    },
                },
            ],
            rowData: [{ date: '2024-01-15' }, { date: '2024-06-15' }, { date: '2024-12-15' }],
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        await asyncSetTimeout(0);

        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);

        await asyncSetTimeout(0);

        const fromDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 0 })
        );
        const toDateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 1 })
        );

        // Enter an invalid range: from (2020-10-10) is after to (2020-09-09). Typing last touches
        // the `to` input, so the validity message is initially carried by `to`.
        fromDateInput.valueAsDate = new Date('2020-10-10');
        fromDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        fromDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        toDateInput.valueAsDate = new Date('2020-09-09');
        toDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        toDateInput.dispatchEvent(new Event('change', { bubbles: true }));

        // Let the debounced report from typing land, so the invalid bubble is stably shown on `to`.
        await asyncSetTimeout(600);

        expect(toDateInput.validity.valid).toBe(false);

        const reportSpy = vi.spyOn(HTMLInputElement.prototype, 'reportValidity');

        try {
            // Focus the `from` input: the message now targets `from` (interpolating the other date),
            // so the message changes and the bubble must follow focus by re-reporting on `from`.
            fromDateInput.dispatchEvent(new Event('focusin', { bubbles: true }));

            await asyncSetTimeout(600);

            expect(reportSpy).toHaveBeenCalled();
            expect(fromDateInput.validity.valid).toBe(false);
        } finally {
            reportSpy.mockRestore();
        }
    });
});
