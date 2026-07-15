import { getByTestId } from '@testing-library/dom';

import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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
                columnDefs: [{ field: 'country', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
                defaultColDef: { floatingFilter: true },
                rowData: [{ country: 'Ireland' }, { country: 'Ireland' }, { country: 'Italy' }],
            });
            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const input = getByTestId(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            ) as HTMLInputElement;

            // Type into the floating filter → default 'contains' applies and the grid filters live.
            typeIntoFloatingFilter(input, 'Italy');
            await asyncSetTimeout(0);
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
            typeIntoFloatingFilter(input, '');
            await asyncSetTimeout(0);
            expect(api.getColumnFilterModel('country')).toBeNull();
            await new GridRows(api, 'floating text filter — cleared').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"Ireland"
                ├── LEAF id:1 country:"Ireland"
                └── LEAF id:2 country:"Italy"
            `);
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

            typeIntoFloatingFilter(input, '25');
            await asyncSetTimeout(0);
            expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'equals', filter: 25 });
            await new GridRows(api, 'floating number filter — equals 25').check(`
                ROOT id:ROOT_NODE_ID
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
