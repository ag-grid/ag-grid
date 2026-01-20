import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    DateFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Number Range Filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, DateFilterModule],
    });

    beforeAll(() => setupAgTestIds());
    beforeEach(() => gridsManager.reset());
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

        expect(fromNumberInput).toHaveValue(1);
        expect(toNumberInput).toHaveValue(5);
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
        expect(fromNumberInput).toHaveValue(10);
        expect(fromNumberInput.validity.valid).toBe(false);
        expect(fromNumberInput).toHaveAttribute('aria-invalid', 'true');

        // Click away to make the filter disappear
        await userSession.click(getByTestId(gridDiv, agTestIdFor.cell('2', 'gold')));

        // Click to get the filter back again
        await userSession.click(filterBtn);

        // When re-opening, validity state defaults to the "to" input
        expect(fromNumberInput).toHaveValue(10);
        expect(toNumberInput).toHaveValue(5);
        expect(toNumberInput.validity.valid).toBe(false);
        expect(toNumberInput).toHaveAttribute('aria-invalid', 'true');

        // Delete content of from input
        await userSession.type(fromNumberInput, `{Backspace}{Backspace}`);

        expect(fromNumberInput).toHaveValue(null);
        expect(toNumberInput).toHaveValue(5);
        expect(toNumberInput.validity.valid).toBe(true);
        expect(toNumberInput).toHaveAttribute('aria-invalid', 'false');
    });
});
