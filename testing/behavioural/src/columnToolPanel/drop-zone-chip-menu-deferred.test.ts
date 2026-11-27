import { findByRole, fireEvent, getByRole, getByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import type { Zone } from './dropZoneMoveMenuHarness';
import { chips, open, order, panel, pill, setupDropZoneMoveMenuSuite } from './dropZoneMoveMenuHarness';

const button = (api: GridApi, label: string) =>
    getByText(getGridElement(api)!.querySelector<HTMLElement>('.ag-column-panel-buttons')!, label) as HTMLButtonElement;

describe('deferred drop zone chip menu', () => {
    const { createDeferred } = setupDropZoneMoveMenuSuite();

    test.each<{ item: string; target: Zone; options: GridOptions; targetChips: string[]; targetOrder: string[] }>([
        { item: 'Move to Values', target: 'aggregation', options: {}, targetChips: ['sum(B)'], targetOrder: ['b'] },
        {
            item: 'Move to Column Labels',
            target: 'pivot',
            options: { pivotMode: true },
            targetChips: ['B'],
            targetOrder: ['b'],
        },
        { item: 'Remove Field', target: 'aggregation', options: {}, targetChips: [], targetOrder: [] },
    ])('$item on a Row Groups chip stages until Apply and Cancel discards it', async (params) => {
        const { item, target, options, targetChips, targetOrder } = params;
        const api = await createDeferred('rowGroup', options);
        api.setColumnsVisible(['b'], false);
        const act = async () => {
            const menu = await open(api, 'rowGroup');
            await userEvent.click(getByRole(menu, 'menuitem', { name: item }));
            expect(chips(panel(api, 'rowGroup'))).toEqual(['A', 'C']);
            expect(chips(panel(api, target))).toEqual(targetChips);
            expect(order(api, 'rowGroup')).toEqual(['a', 'b', 'c']);
            expect(order(api, target)).toEqual([]);
            expect(api.getColumn('b')!.isVisible()).toBe(false);
            expect(button(api, 'Apply').disabled).toBe(false);
        };

        await act();
        button(api, 'Cancel').click();
        expect(chips(panel(api, 'rowGroup'))).toEqual(['A', 'B', 'C']);
        expect(chips(panel(api, target))).toEqual([]);
        expect(order(api, 'rowGroup')).toEqual(['a', 'b', 'c']);

        await act();
        button(api, 'Apply').click();
        expect(order(api, 'rowGroup')).toEqual(['a', 'c']);
        expect(order(api, target)).toEqual(targetOrder);
    });

    test('Remove Field on a Values chip stages until Apply', async () => {
        const api = await createDeferred('aggregation');
        const menu = await open(api, 'aggregation');
        await userEvent.click(getByRole(menu, 'menuitem', { name: 'Remove Field' }));
        expect(chips(panel(api, 'aggregation'))).toEqual(['sum(A)', 'sum(C)']);
        expect(order(api, 'aggregation')).toEqual(['a', 'b', 'c']);

        button(api, 'Apply').click();
        expect(order(api, 'aggregation')).toEqual(['a', 'c']);
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
        expect(chips(panel(api, 'aggregation'))).toEqual(['avg(C)']);

        button(api, 'Apply').click();
        expect(order(api, 'rowGroup')).toEqual(['a', 'b']);
        expect(order(api, 'aggregation')).toEqual(['c']);
        expect(api.getColumnState().find((state) => state.colId === 'b')!.aggFunc).toBeNull();
    });

    test.each([
        { item: 'Move to Row Groups', rowGroups: ['b'], rowGroupChips: ['B'] },
        { item: 'Remove Field', rowGroups: [], rowGroupChips: [] },
    ])(
        '$item on a live value after changing its agg func, then changing another, does not apply it as a value',
        async ({ item, rowGroups, rowGroupChips }) => {
            const api = await createDeferred('aggregation');
            const setAggFunc = async (chip: HTMLElement, aggFunc: string) => {
                await userEvent.click(chip);
                await userEvent.click(
                    getByText(document.querySelector<HTMLElement>('.ag-select-agg-func-popup')!, aggFunc)
                );
            };

            await setAggFunc(pill(api, 'aggregation', false, 'B'), 'avg');
            const chip = getByText(panel(api, 'aggregation'), 'avg(B)').closest<HTMLElement>('.ag-column-drop-cell')!;
            chip.focus();
            fireEvent.contextMenu(chip);
            const menu = await findByRole(getGridElement(api) as HTMLElement, 'menu');
            await userEvent.click(getByRole(menu, 'menuitem', { name: item }));
            await setAggFunc(pill(api, 'aggregation', false, 'C'), 'avg');
            expect(chips(panel(api, 'aggregation'))).toEqual(['sum(A)', 'avg(C)']);
            expect(chips(panel(api, 'rowGroup'))).toEqual(rowGroupChips);

            button(api, 'Apply').click();
            expect(order(api, 'aggregation')).toEqual(['a', 'c']);
            expect(order(api, 'rowGroup')).toEqual(rowGroups);
            expect(api.getColumnState().find((state) => state.colId === 'c')!.aggFunc).toBe('avg');
            expect(api.getColumnState().find((state) => state.colId === 'b')!.aggFunc).toBeNull();
        }
    );
});
