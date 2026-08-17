import { getAllByTestId, getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { DateFilterModel } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

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
        // fires `focusin` and re-triggers the (debounced) date validation report. happy-dom's
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

            // Let the 500ms date-report debounce window elapse. The assertion below is negative (no
            // second report was scheduled), so it can only be made once the window has closed.
            // eslint-disable-next-line no-restricted-syntax -- samples past the date validity-report debounce window (dateCompWrapper.ts)
            await asyncSetTimeout(50);

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

        // Let the debounced report from typing land, so the invalid bubble is stably shown. The spy
        // installed below must see zero calls, so the pending debounce has to drain first — there is
        // no positive signal to poll for, only the absence of further reports.
        // eslint-disable-next-line no-restricted-syntax -- samples past the date validity-report debounce window (dateCompWrapper.ts)
        await asyncSetTimeout(50);

        expect(toDateInput.validity.valid).toBe(false);

        const reportSpy = vi.spyOn(HTMLInputElement.prototype, 'reportValidity');

        try {
            // Switching browser tabs away and back re-focuses the invalid input, firing `focusin`.
            // The validity message is unchanged, so no report should be scheduled - otherwise the
            // native validation bubble blinks (disappears then reappears) on every tab return.
            toDateInput.dispatchEvent(new Event('focusin', { bubbles: true }));

            // eslint-disable-next-line no-restricted-syntax -- samples past the date validity-report debounce window (dateCompWrapper.ts); the assertion below is negative
            await asyncSetTimeout(50);

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
        // The spy installed below must only see the report triggered by the focus change, so the
        // pending debounce from typing has to drain first — nothing positive to poll for.
        // eslint-disable-next-line no-restricted-syntax -- samples past the date validity-report debounce window (dateCompWrapper.ts)
        await asyncSetTimeout(50);

        expect(toDateInput.validity.valid).toBe(false);
        // The message names the bound the focused input has to respect: `to` must come after `from`.
        expect(toDateInput.validationMessage).toMatch(/^Date must be after /);

        const reportSpy = vi.spyOn(HTMLInputElement.prototype, 'reportValidity');

        try {
            // Focus the `from` input: the message now targets `from` (interpolating the other date),
            // so the message changes and the bubble must follow focus by re-reporting on `from`.
            fromDateInput.dispatchEvent(new Event('focusin', { bubbles: true }));

            // Poll for the re-report (it lands after the 500ms debounce) rather than guessing a delay.
            await waitFor(() => expect(reportSpy).toHaveBeenCalled(), { timeout: 2000 });

            expect(fromDateInput.validity.valid).toBe(false);
            // Mirrored for the other input: `from` must come before `to`.
            expect(fromDateInput.validationMessage).toMatch(/^Date must be before /);
            expect(toDateInput.validationMessage).toBe('');
        } finally {
            reportSpy.mockRestore();
        }
    });

    /**
     * The range check compares the parsed dates, so it is only as good as the parse. A year outside
     * 1000-9999 and an identical from/to pair are the two boundaries the descending 4-digit pairs
     * used above never reach.
     */
    describe.each([
        ['an end year before 100AD', '1999-10-10', '0099-12-19'],
        ['an end date equal to the start date', '2024-06-15', '2024-06-15'],
    ])('rejects a range with %s', (_, fromValue, toValue) => {
        test('flags the to input as invalid and applies no filter', async () => {
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

            await userSession.click(getByTestId(gridDiv, agTestIdFor.headerFilterButton('date')));

            await asyncSetTimeout(0);

            const fromDateInput = getByTestId<HTMLInputElement>(
                gridDiv,
                agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 0 })
            );
            const toDateInput = getByTestId<HTMLInputElement>(
                gridDiv,
                agTestIdFor.dateFilterInstanceInput({ source: 'column-filter', index: 1 })
            );

            // Assigning the string rather than `valueAsDate` keeps the four-digit form the browser
            // date picker produces, which is what the filter parses.
            fromDateInput.value = fromValue;
            fromDateInput.dispatchEvent(new Event('input', { bubbles: true }));
            fromDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            toDateInput.value = toValue;
            toDateInput.dispatchEvent(new Event('input', { bubbles: true }));
            toDateInput.dispatchEvent(new Event('change', { bubbles: true }));

            await asyncSetTimeout(0);

            expect(toDateInput.validity.valid).toBe(false);
            expect(api.getFilterModel()).toEqual({});

            await new GridRows(api, `invalid range leaves rows unfiltered`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 date:"2024-01-15"
                ├── LEAF id:1 date:"2024-06-15"
                └── LEAF id:2 date:"2024-12-15"
            `);
        });
    });
});
