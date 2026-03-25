import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Floating Filters', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, DateFilterModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

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
        });
    });

    describe('Text input behaviour', () => {
        test('Floating filter input retains typed characters after model sync-back', async () => {
            const userSession = userEvent.setup();

            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        filter: 'agTextColumnFilter',
                    },
                ],
                defaultColDef: {
                    floatingFilter: true,
                },
                rowData: [
                    { country: 'ALPHA' },
                    { country: 'GLAM' },
                    { country: 'GLIDE' },
                    { country: 'GLOW' },
                    { country: 'GLOOM' },
                ],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            // Wait for next tick, filters are async
            await asyncSetTimeout(0);

            const filterInput = getByTestId<HTMLInputElement>(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            );

            // Type into the floating filter and verify input value is preserved
            await userSession.type(filterInput, 'GLAM');

            // Input should retain all typed characters, not revert mid-typing
            expect(filterInput.value).toBe('GLAM');

            // Wait for debounce to complete and filter model to apply
            await waitFor(() => {
                expect(api.getFilterModel()).toEqual({
                    country: {
                        filter: 'GLAM',
                        filterType: 'text',
                        type: 'contains',
                    },
                });
            });

            // After model sync-back, input should still show the typed value
            expect(filterInput.value).toBe('GLAM');
        });

        test('Floating filter input value persists through rapid typing', async () => {
            const userSession = userEvent.setup({ delay: 20 });

            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            debounceMs: 50,
                        },
                    },
                ],
                defaultColDef: {
                    floatingFilter: true,
                },
                rowData: [
                    { country: 'ALPHA' },
                    { country: 'GLAM' },
                    { country: 'GLIDE' },
                    { country: 'GLOW' },
                    { country: 'GLOOM' },
                ],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            await asyncSetTimeout(0);

            const filterInput = getByTestId<HTMLInputElement>(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            );

            // Type rapidly with short debounce to maximise chance of hitting the sync-back race
            await userSession.type(filterInput, 'GL');

            expect(filterInput.value).toBe('GL');

            // Wait for debounce + model update cycle
            await waitFor(() => {
                expect(api.getFilterModel()).toEqual({
                    country: {
                        filter: 'GL',
                        filterType: 'text',
                        type: 'contains',
                    },
                });
            });

            // Continue typing after first debounce cycle
            await userSession.type(filterInput, 'OOM');

            expect(filterInput.value).toBe('GLOOM');

            await waitFor(() => {
                expect(api.getFilterModel()).toEqual({
                    country: {
                        filter: 'GLOOM',
                        filterType: 'text',
                        type: 'contains',
                    },
                });
            });

            expect(filterInput.value).toBe('GLOOM');
        });
    });
});
