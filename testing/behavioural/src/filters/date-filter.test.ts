import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { DateFilterModel } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Date Filter - Equals', () => {
    const gridsManager = new TestGridsManager({
        modules: [DateFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    test('filters string date column (YYYY-MM-DD) with equals', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter' }],
            rowData: [{ date: '2024-01-15' }, { date: '2024-03-20' }, { date: '2024-01-15' }, { date: '2024-07-04' }],
        });
        await new GridColumns(api, `filters string date column (YYYY-MM-DD) with equals setup`).checkColumns(`
            CENTER
            └── date "Date" width:200
        `);
        await new GridRows(api, `filters string date column (YYYY-MM-DD) with equals setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-15"
            ├── LEAF id:1 date:"2024-03-20"
            ├── LEAF id:2 date:"2024-01-15"
            └── LEAF id:3 date:"2024-07-04"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);
        await asyncSetTimeout(0);

        const dateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter' })
        );

        dateInput.valueAsDate = new Date('2024-01-15');
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        await asyncSetTimeout(0);

        await waitFor(() => {
            const model = api.getFilterModel()?.date as DateFilterModel;
            expect(model).toBeTruthy();
            expect(model.type).toBe('equals');
        });

        expect(api.getDisplayedRowCount()).toBe(2);
        expect(api.getDisplayedRowAtIndex(0)?.data.date).toBe('2024-01-15');
        expect(api.getDisplayedRowAtIndex(1)?.data.date).toBe('2024-01-15');
        await new GridRows(api, `filters string date column (YYYY-MM-DD) with equals final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-15"
            └── LEAF id:2 date:"2024-01-15"
        `);
    });

    test('filters Date object column (cellDataType: dateTime) with equals', async () => {
        const userSession = userEvent.setup();

        // Use midnight dates so the default comparator (which does exact datetime comparison) matches correctly.
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', cellDataType: 'dateTime' }],
            rowData: [
                { date: new Date(2024, 0, 15, 0, 0, 0) }, // Jan 15 midnight — matches
                { date: new Date(2024, 2, 20, 0, 0, 0) }, // Mar 20 midnight — no match
                { date: new Date(2024, 0, 15, 0, 0, 0) }, // Jan 15 midnight — matches
                { date: new Date(2024, 6, 4, 0, 0, 0) }, // Jul 4 midnight — no match
            ],
        });
        await new GridColumns(api, `filters Date object column (cellDataType: dateTime) with equals setup`)
            .checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
        await new GridRows(api, `filters Date object column (cellDataType: dateTime) with equals setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-15T00:00:00"
            ├── LEAF id:1 date:"2024-03-20T00:00:00"
            ├── LEAF id:2 date:"2024-01-15T00:00:00"
            └── LEAF id:3 date:"2024-07-04T00:00:00"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);
        await asyncSetTimeout(0);

        // For cellDataType: 'dateTime', the filter renders an input[type="datetime-local"]
        const dateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter' })
        );

        // datetime-local inputs expect the format 'YYYY-MM-DDTHH:mm:ss'
        dateInput.value = '2024-01-15T00:00:00';
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        await asyncSetTimeout(0);

        await waitFor(() => {
            const model = api.getFilterModel()?.date as DateFilterModel;
            expect(model).toBeTruthy();
            expect(model.type).toBe('equals');
        });

        expect(api.getDisplayedRowCount()).toBe(2);
        expect(api.getDisplayedRowAtIndex(0)?.data.date).toEqual(new Date(2024, 0, 15, 0, 0, 0));
        expect(api.getDisplayedRowAtIndex(1)?.data.date).toEqual(new Date(2024, 0, 15, 0, 0, 0));
        await new GridRows(api, `filters Date object column (cellDataType: dateTime) with equals final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 date:"2024-01-15T00:00:00"
                └── LEAF id:2 date:"2024-01-15T00:00:00"
            `
        );
    });

    test('filters Date object column (cellDataType: dateTime) by exact non-midnight time with equals', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', cellDataType: 'dateTime' }],
            rowData: [
                { date: new Date(2024, 0, 15, 10, 30, 0) }, // Jan 15 10:30:00 — matches
                { date: new Date(2024, 0, 15, 14, 0, 0) }, // Jan 15 14:00:00 — same date, different time
                { date: new Date(2024, 0, 15, 10, 30, 0) }, // Jan 15 10:30:00 — matches
                { date: new Date(2024, 2, 20, 10, 30, 0) }, // Mar 20 10:30:00 — different date
            ],
        });
        await new GridColumns(
            api,
            `filters Date object column (cellDataType: dateTime) by exact non-midnight time w setup`
        ).checkColumns(`
            CENTER
            └── date "Date" width:200
        `);
        await new GridRows(
            api,
            `filters Date object column (cellDataType: dateTime) by exact non-midnight time w setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-15T10:30:00"
            ├── LEAF id:1 date:"2024-01-15T14:00:00"
            ├── LEAF id:2 date:"2024-01-15T10:30:00"
            └── LEAF id:3 date:"2024-03-20T10:30:00"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        const filterBtn = getByTestId(gridDiv, agTestIdFor.headerFilterButton('date'));
        await userSession.click(filterBtn);
        await asyncSetTimeout(0);

        const dateInput = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.dateFilterInstanceInput({ source: 'column-filter' })
        );

        dateInput.value = '2024-01-15T10:30:00';
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        await asyncSetTimeout(0);

        await waitFor(() => {
            const model = api.getFilterModel()?.date as DateFilterModel;
            expect(model).toBeTruthy();
            expect(model.type).toBe('equals');
        });

        // Only the two rows with exactly 10:30:00 match — same date but different time does not
        expect(api.getDisplayedRowCount()).toBe(2);
        expect(api.getDisplayedRowAtIndex(0)?.data.date).toEqual(new Date(2024, 0, 15, 10, 30, 0));
        expect(api.getDisplayedRowAtIndex(1)?.data.date).toEqual(new Date(2024, 0, 15, 10, 30, 0));
        await new GridRows(
            api,
            `filters Date object column (cellDataType: dateTime) by exact non-midnight time w final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 date:"2024-01-15T10:30:00"
            └── LEAF id:2 date:"2024-01-15T10:30:00"
        `);
    });
});
