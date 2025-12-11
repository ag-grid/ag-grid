import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Sorting', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    const columnDefs = [{ field: 'sport', sortable: false }, { field: 'year' }, { field: 'amount' }, { field: 'day' }];
    const rowData = [
        { sport: 'football', year: 2021, amount: 43, day: 'monday' },
        { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
        { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
        { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
        { sport: 'golf', year: 2021, amount: 7, day: 'monday' },
        { sport: 'swimming', year: 2020, amount: 93, day: 'tuesday' },
        { sport: 'rowing', year: 2019, amount: 32, day: 'saturday' },
    ];

    test('Cannot sort when sortable: false', async () => {
        const userSession = userEvent.setup();
        const listener = vitest.fn();

        const api = await gridMgr.createGridAndWait('grid1', {
            columnDefs,
            rowData,
            onSortChanged: listener,
        });

        // wait for test ids to attach
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const header = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

        await userSession.click(header.querySelector('.ag-header-cell-label')!);
        await asyncSetTimeout(1);

        expect(listener).not.toHaveBeenCalled();
    });
});
