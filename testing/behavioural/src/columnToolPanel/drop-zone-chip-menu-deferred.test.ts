import { getByRole, getByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import type { Zone } from './dropZoneMoveMenuHarness';
import { open, order, panel, pill, setupDropZoneMoveMenuSuite } from './dropZoneMoveMenuHarness';

const chips = (api: GridApi, zone: Zone) =>
    Array.from(panel(api, zone).querySelectorAll('.ag-column-drop-cell-text'), (el) => el.textContent!.trim());
const button = (api: GridApi, label: string) =>
    getByText(getGridElement(api)!.querySelector<HTMLElement>('.ag-column-panel-buttons')!, label) as HTMLButtonElement;

describe('deferred drop zone chip menu', () => {
    const { createDeferred } = setupDropZoneMoveMenuSuite();

    test.each([
        { item: 'Move to Values', valueChips: ['sum(B)'], values: ['b'] },
        { item: 'Remove Field', valueChips: [], values: [] },
    ])('$item stages until Apply and Cancel discards it', async ({ item, valueChips, values }) => {
        const api = await createDeferred('rowGroup');
        api.setColumnsVisible(['b'], false);
        const act = async () => {
            const menu = await open(api, 'rowGroup');
            await userEvent.click(getByRole(menu, 'menuitem', { name: item }));
            expect(chips(api, 'rowGroup')).toEqual(['A', 'C']);
            expect(chips(api, 'aggregation')).toEqual(valueChips);
            expect(order(api, 'rowGroup')).toEqual(['a', 'b', 'c']);
            expect(order(api, 'aggregation')).toEqual([]);
            expect(api.getColumn('b')!.isVisible()).toBe(false);
            expect(button(api, 'Apply').disabled).toBe(false);
        };

        await act();
        button(api, 'Cancel').click();
        expect(chips(api, 'rowGroup')).toEqual(['A', 'B', 'C']);
        expect(chips(api, 'aggregation')).toEqual([]);
        expect(order(api, 'rowGroup')).toEqual(['a', 'b', 'c']);

        await act();
        button(api, 'Apply').click();
        expect(order(api, 'rowGroup')).toEqual(['a', 'c']);
        expect(order(api, 'aggregation')).toEqual(values);
    });

    test('moving a row group to Values and back, then changing another agg func, applies it as a row group only', async () => {
        const api = await createDeferred('rowGroup', {
            columnDefs: [
                ...['a', 'b'].map((field) => ({ field, enableRowGroup: true, enableValue: true, rowGroup: true })),
                { field: 'c', enableValue: true, aggFunc: 'sum' },
            ],
        });
        let menu = await open(api, 'rowGroup');
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move to Values' }));
        menu = await open(api, 'aggregation');
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Move to Row Groups' }));
        await userEvent.click(pill(api, 'aggregation', false, 'C'));
        await userEvent.click(getByText(document.querySelector<HTMLElement>('.ag-select-agg-func-popup')!, 'avg'));
        expect(chips(api, 'aggregation')).toEqual(['avg(C)']);

        button(api, 'Apply').click();
        expect(order(api, 'rowGroup')).toEqual(['a', 'b']);
        expect(order(api, 'aggregation')).toEqual(['c']);
        expect(api.getColumnState().find((state) => state.colId === 'b')!.aggFunc).toBeNull();
    });
});
