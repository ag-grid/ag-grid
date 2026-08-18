import { fireEvent, getByTestId, waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

/** Sets a floating-filter input's value and fires the `input` event the widget listens for. */
function typeIntoFloatingFilter(input: HTMLInputElement, value: string): void {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Floating Filters', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, DateFilterModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    describe('apply filtering as you type', () => {
        test('typing in a floating text filter filters the grid, and clearing restores every row', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'country', filter: 'agTextColumnFilter' }],
                defaultColDef: { floatingFilter: true },
                rowData: [{ country: 'Ireland' }, { country: 'Ireland' }, { country: 'Italy' }],
            });
            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const input = getByTestId(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            ) as HTMLInputElement;
            expect(input.type).toBe('text');
            expect(input.autocomplete).toBe('off');
            const clearButton = input.parentElement!.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
            expect(clearButton.classList.contains('ag-hidden')).toBe(true);

            // Type into the floating filter → default 'contains' applies and the grid filters live.
            typeIntoFloatingFilter(input, 'Italy');
            await waitFor(() =>
                expect(api.getColumnFilterModel('country')).toEqual({
                    filterType: 'text',
                    type: 'contains',
                    filter: 'Italy',
                })
            );
            expect(clearButton.classList.contains('ag-hidden')).toBe(false);
            expect(api.getColumnFilterModel('country')).toEqual({
                filterType: 'text',
                type: 'contains',
                filter: 'Italy',
            });
            await new GridRows(api, 'floating text filter — contains Italy').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 country:"Italy"
            `);

            // Clearing the floating input removes the filter and restores all rows.
            input.focus();
            fireEvent.mouseDown(clearButton);
            fireEvent.click(clearButton);
            await asyncSetTimeout(0);
            expect(input.value).toBe('');
            expect(document.activeElement).toBe(input);
            expect(clearButton.isConnected).toBe(true);
            expect(clearButton.classList.contains('ag-hidden')).toBe(true);
            expect(api.getColumnFilterModel('country')).toBeNull();
            await new GridRows(api, 'floating text filter — cleared').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"Ireland"
                ├── LEAF id:1 country:"Ireland"
                └── LEAF id:2 country:"Italy"
            `);
        });

        test('global input options control autocomplete and the clear button', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'country', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
                defaultColDef: { floatingFilter: true },
                rowData: [{ country: 'Ireland' }, { country: 'Italy' }],
                suppressInputClearButton: true,
                enableInputAutoComplete: true,
            });
            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const input = getByTestId(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            ) as HTMLInputElement;
            expect(input.getAttribute('autocomplete')).toBeNull();

            typeIntoFloatingFilter(input, 'Italy');
            await asyncSetTimeout(0);
            const clearButton = input.parentElement!.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
            expect(clearButton.classList.contains('ag-hidden')).toBe(true);

            api.setGridOption('suppressInputClearButton', false);
            expect(clearButton.classList.contains('ag-hidden')).toBe(false);

            api.setGridOption('enableInputAutoComplete', false);
            expect(input.autocomplete).toBe('off');
        });

        test('floating filter autocomplete overrides the global input option', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        filter: 'agTextColumnFilter',
                        floatingFilter: true,
                        floatingFilterComponentParams: { browserAutoComplete: false },
                    },
                ],
                rowData: [{ country: 'Ireland' }],
                enableInputAutoComplete: true,
            });
            await asyncSetTimeout(0);

            const input = getByTestId(
                getGridElement(api)! as HTMLElement,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            ) as HTMLInputElement;
            expect(input.autocomplete).toBe('off');

            api.setGridOption('columnDefs', [
                {
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                },
            ]);
            await asyncSetTimeout(0);

            const refreshedInput = getByTestId(
                getGridElement(api)! as HTMLElement,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            ) as HTMLInputElement;
            expect(refreshedInput.getAttribute('autocomplete')).toBeNull();
        });

        test('clearing during a pending debounce applies immediately, exactly once', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'country', filter: 'agTextColumnFilter', filterParams: { debounceMs: 200 } }],
                defaultColDef: { floatingFilter: true },
                rowData: [{ country: 'Ireland' }, { country: 'Italy' }],
            });
            await asyncSetTimeout(0);

            const input = getByTestId(
                getGridElement(api)! as HTMLElement,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            ) as HTMLInputElement;

            typeIntoFloatingFilter(input, 'Italy');
            await waitFor(() =>
                expect(api.getColumnFilterModel('country')).toEqual({
                    filterType: 'text',
                    type: 'contains',
                    filter: 'Italy',
                })
            );

            // type again, then clear while the 200ms sync debounce is still pending
            typeIntoFloatingFilter(input, 'Irel');
            let filterChangedCount = 0;
            api.addEventListener('filterChanged', () => ++filterChangedCount);
            const clearButton = input.parentElement!.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
            fireEvent.mouseDown(clearButton);
            fireEvent.click(clearButton);
            await asyncSetTimeout(0);

            // the clear applied without waiting out the debounce, with a single event
            expect(input.value).toBe('');
            expect(api.getColumnFilterModel('country')).toBeNull();
            expect(filterChangedCount).toBe(1);

            // eslint-disable-next-line no-restricted-syntax -- negative assertion: samples past the 200ms sync debounce so an uncancelled 'Irel' timer would already have fired
            await asyncSetTimeout(300);
            expect(api.getColumnFilterModel('country')).toBeNull();
            expect(filterChangedCount).toBe(1);
        });

        test('typing in a floating number filter filters the grid by equals', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
                defaultColDef: { floatingFilter: true },
                rowData: [{ age: 23 }, { age: 25 }, { age: 25 }],
            });
            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const input = getByTestId(
                gridDiv,
                agTestIdFor.numberFilterInstanceInput({ source: 'floating-filter', colId: 'age' })
            ) as HTMLInputElement;
            const clearButton = input.parentElement!.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
            expect(clearButton.classList.contains('ag-hidden')).toBe(true);

            typeIntoFloatingFilter(input, '25');
            await asyncSetTimeout(0);
            expect(clearButton.classList.contains('ag-hidden')).toBe(false);
            expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'equals', filter: 25 });
            await new GridRows(api, 'floating number filter — equals 25').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 age:25
                └── LEAF id:2 age:25
            `);

            fireEvent.mouseDown(clearButton);
            fireEvent.click(clearButton);
            await asyncSetTimeout(0);

            expect(input.value).toBe('');
            expect(document.activeElement).toBe(input);
            expect(clearButton.classList.contains('ag-hidden')).toBe(true);
            expect(api.getColumnFilterModel('age')).toBeNull();
            await new GridRows(api, 'floating number filter — cleared').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 age:23
                ├── LEAF id:1 age:25
                └── LEAF id:2 age:25
            `);
        });
    });

    describe.each(['agTextColumnFilter', 'agNumberColumnFilter'])('Placeholders for `%s` filters', (filter) => {
        test(`Floating ${filter} has no placeholder by default`, async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        filter,
                    },
                ],
                defaultColDef: {
                    floatingFilter: true,
                },
                rowData: [
                    { id: '1', country: 'Ireland', athlete: 'I1' },
                    { id: '2', country: 'Ireland', athlete: 'I2' },
                    { id: '3', country: 'Italy', athlete: 'It1' },
                ],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            // Wait for next tick, filters are async
            await asyncSetTimeout(0);

            const getTestId =
                filter === 'agNumberColumnFilter'
                    ? agTestIdFor.numberFilterInstanceInput
                    : agTestIdFor.textFilterInstanceInput;

            const textFilter = getByTestId(gridDiv, getTestId({ source: 'floating-filter', colId: 'country' }));

            expect(textFilter.getAttribute('placeholder')).toBeNull();

            // A floating filter with no value applied leaves every row displayed (filtering is
            // exercised by the 'apply filtering as you type' tests above).
            expect(api.getDisplayedRowCount()).toBe(3);
        });

        test(`Can set custom placeholder for floating ${filter}`, async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        filter,
                    },
                ],
                defaultColDef: {
                    floatingFilter: true,
                    floatingFilterComponentParams: {
                        filterPlaceholder: 'type here',
                    },
                },
                rowData: [
                    { id: '1', country: 'Ireland', athlete: 'I1' },
                    { id: '2', country: 'Ireland', athlete: 'I2' },
                    { id: '3', country: 'Italy', athlete: 'It1' },
                ],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            // Wait for next tick, filters are async
            await asyncSetTimeout(0);

            const getTestId =
                filter === 'agNumberColumnFilter'
                    ? agTestIdFor.numberFilterInstanceInput
                    : agTestIdFor.textFilterInstanceInput;

            const textFilter = getByTestId(gridDiv, getTestId({ source: 'floating-filter', colId: 'country' }));

            expect(textFilter.getAttribute('placeholder')).toBe('type here');

            // Custom placeholder is presentational only — it applies no filter, so all rows remain.
            expect(api.getDisplayedRowCount()).toBe(3);
        });

        test(`Can inherit placeholder from parent filter for floating ${filter}`, async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        filter,
                    },
                ],
                defaultColDef: {
                    floatingFilter: true,
                    floatingFilterComponentParams: {
                        filterPlaceholder: true,
                    },
                },
                rowData: [
                    { id: '1', country: 'Ireland', athlete: 'I1' },
                    { id: '2', country: 'Ireland', athlete: 'I2' },
                    { id: '3', country: 'Italy', athlete: 'It1' },
                ],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            // Wait for next tick, filters are async
            await asyncSetTimeout(0);

            const getTestId =
                filter === 'agNumberColumnFilter'
                    ? agTestIdFor.numberFilterInstanceInput
                    : agTestIdFor.textFilterInstanceInput;

            const textFilter = getByTestId(gridDiv, getTestId({ source: 'floating-filter', colId: 'country' }));

            expect(textFilter.getAttribute('placeholder')).toBe('Filter...');

            // Inherited placeholder is presentational only — it applies no filter, so all rows remain.
            expect(api.getDisplayedRowCount()).toBe(3);
        });
    });
});
