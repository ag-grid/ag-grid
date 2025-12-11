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

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Floating Filters', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, DateFilterModule],
    });

    beforeAll(() => setupAgTestIds());
    beforeEach(() => gridsManager.reset());
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

            const textFilter = getByTestId(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            );

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

            const textFilter = getByTestId(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            );

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

            const textFilter = getByTestId(
                gridDiv,
                agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'country' })
            );

            expect(textFilter.getAttribute('placeholder')).toBe('Filter...');
        });
    });
});
