import { waitFor } from '@testing-library/dom';
import { TestGridsManager, nextAnimationFrame } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    PivotModule,
    RowGroupingModule,
    RowNumbersModule,
} from 'ag-grid-enterprise';

// Where calculated columns added from an auto group column sit when row grouping is cleared and set again.

describe('calculated columns - placement after row grouping is cleared and set again', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            GridStateModule,
            CalculatedColumnsModule,
            FormulaModule,
            ColumnMenuModule,
            ContextMenuModule,
            PivotModule,
            RowGroupingModule,
            RowNumbersModule,
            TextEditorModule,
            NumberEditorModule,
            ValidationModule,
        ] as Module[],
    });

    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    function createGrid(id: string, opts: Partial<GridOptions>): GridApi {
        return gridsManager.createGrid(id, {
            getRowId: (params) => params.data?.id,
            calculatedColumns: true,
            ...opts,
        });
    }

    function order(api: GridApi): string[] {
        return api.getAllGridColumns()!.map((col) => col.getColId());
    }

    function enableOffsetParentPolyfill(): void {
        if (restoreOffsetParent) {
            return;
        }
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            configurable: true,
            get(this: HTMLElement) {
                return this.parentElement;
            },
        });
        restoreOffsetParent = () => {
            if (original) {
                Object.defineProperty(HTMLElement.prototype, 'offsetParent', original);
            } else {
                delete (HTMLElement.prototype as any).offsetParent;
            }
        };
    }

    async function clickColumnMenuItem(name: string): Promise<void> {
        const menuItem = await waitFor(() => {
            const text = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
                (element) => element.textContent?.trim() === name
            );
            const element = text?.closest<HTMLElement>('.ag-menu-option');
            expect(element).toBeTruthy();
            return element!;
        });
        menuItem.click();
    }

    function getDialog(): HTMLElement {
        const dialog = document.querySelector<HTMLElement>('.ag-calculated-column-form');
        expect(dialog).toBeTruthy();
        return dialog!;
    }

    function setExpression(expression: string): void {
        const input = getDialog().querySelector<HTMLTextAreaElement>('textarea')!;
        input.value = expression;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function clickDialogButton(label: string): void {
        const button = Array.from(getDialog().querySelectorAll<HTMLButtonElement>('button')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(button).toBeTruthy();
        button!.click();
    }

    /** Adds a calc col through the header menu of {@link anchorColId} (the documented "anchor").
     *  Returns the auto-generated colId of the new column, discovered by diffing the column set. */
    async function addViaDialog(api: GridApi, anchorColId: string, expression: string): Promise<string> {
        const before = new Set(order(api));
        enableOffsetParentPolyfill();
        api.showColumnMenu(anchorColId);
        await clickColumnMenuItem('Add Calculated Column');
        await waitFor(() => getDialog());
        setExpression(expression);
        clickDialogButton('Apply');
        // Wait past the live-apply animation frame so no expression flush is in flight when the
        // caller starts toggling columns (under the default 'live' mode Apply is a no-op).
        await nextAnimationFrame();
        await nextAnimationFrame();
        const added = order(api).filter((id) => !before.has(id));
        expect(added).toHaveLength(1);
        return added[0];
    }

    const regionAuto = 'ag-Grid-AutoColumn-region';
    const countryAuto = 'ag-Grid-AutoColumn-country';

    const LEAF_DEFS: ColDef[] = [
        { field: 'region', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
        { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
    ];

    async function regroup(api: GridApi): Promise<void> {
        api.setRowGroupColumns([]);
        await waitFor(() => expect(order(api).some((id) => id.startsWith('ag-Grid-AutoColumn'))).toBe(false));
        api.setRowGroupColumns(['region', 'country']);
        await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
    }

    test('columns added from an auto group column that a column state moved together to the end stay there when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const api = createGrid(`regroup-block-moved-to-end-${maintainColumnOrder}`, {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const x2 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const added = [regionAuto, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'];
            expect({ maintainColumnOrder, step: 'added', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'added',
                order: added,
            });

            const others = order(api).filter((id) => id !== x1 && id !== x2);
            api.applyColumnState({ state: [...others, x2, x1].map((colId) => ({ colId })), applyOrder: true });
            expect({ maintainColumnOrder, step: 'moved', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'moved',
                order: [...others, x2, x1],
            });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: [regionAuto, countryAuto, 'region', 'country', 'revenue', 'cost', x2, x1],
            });
        }
    });

    test('a column state putting a column added from an auto group column one place after the next group column keeps it there when row grouping is cleared and set again, as a move does', async () => {
        for (const maintainColumnOrder of [false, true]) {
            for (const arm of ['api.moveColumns', 'applyColumnState with applyOrder'] as const) {
                gridsManager.reset();
                const api = createGrid(`regroup-after-next-group-column-${arm}-${maintainColumnOrder}`, {
                    groupDisplayType: 'multipleColumns',
                    maintainColumnOrder,
                    rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                    columnDefs: LEAF_DEFS,
                });
                await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
                const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
                expect({ maintainColumnOrder, arm, step: 'added', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'added',
                    order: [regionAuto, x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
                });

                const expected = [regionAuto, countryAuto, x1, 'region', 'country', 'revenue', 'cost'];
                if (arm === 'api.moveColumns') {
                    api.moveColumns([x1], 2);
                } else {
                    api.applyColumnState({ state: expected.map((colId) => ({ colId })), applyOrder: true });
                }
                expect({ maintainColumnOrder, arm, step: 'moved', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'moved',
                    order: expected,
                });

                await regroup(api);
                expect({ maintainColumnOrder, arm, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    order: expected,
                });
            }
        }
    });

    test("a column added from an auto group column moved past another source's added column stays there when row grouping is cleared and set again", async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const api = createGrid(`regroup-moved-past-other-source-${maintainColumnOrder}`, {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', hide: true },
                    { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
                    { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
                ],
            });
            await waitFor(() => expect(order(api)).toContain(regionAuto));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const y1 = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
            expect({ maintainColumnOrder, step: 'added', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'added',
                order: [regionAuto, x1, 'region', 'country', 'revenue', y1, 'cost'],
            });

            api.moveColumns([y1], 1);
            expect({ maintainColumnOrder, step: 'y1 moved', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'y1 moved',
                order: [regionAuto, y1, x1, 'region', 'country', 'revenue', 'cost'],
            });

            // x1 already follows y1: move it away and back so the place is one the user gave it.
            api.moveColumns([x1], order(api).length - 1);
            api.moveColumns([x1], 2);
            const placed = [regionAuto, y1, x1, 'region', 'country', 'revenue', 'cost'];
            expect({ maintainColumnOrder, step: 'x1 placed after y1', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'x1 placed after y1',
                order: placed,
            });

            api.setRowGroupColumns([]);
            await waitFor(() => expect(order(api)).not.toContain(regionAuto));
            api.setRowGroupColumns(['region']);
            await waitFor(() => expect(order(api)).toContain(regionAuto));
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: placed,
            });
        }
    });

    test('a column state putting a column added from an auto group column before it places it as a move does when row grouping is cleared and set again', async () => {
        async function run(arm: 'move' | 'state', maintainColumnOrder: boolean) {
            gridsManager.reset();
            const api = createGrid(`regroup-before-source-${arm}-${maintainColumnOrder}`, {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            expect({ maintainColumnOrder, arm, step: 'added', order: order(api) }).toEqual({
                maintainColumnOrder,
                arm,
                step: 'added',
                order: [regionAuto, x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
            });

            if (arm === 'move') {
                api.moveColumns([x1], 0);
            } else {
                const state = [x1, regionAuto, countryAuto, 'region', 'country', 'revenue', 'cost'];
                api.applyColumnState({ state: state.map((colId) => ({ colId })), applyOrder: true });
            }
            const afterCall = order(api);

            await regroup(api);
            return { x1, afterCall, regrouped: order(api) };
        }

        for (const maintainColumnOrder of [false, true]) {
            const move = await run('move', maintainColumnOrder);
            const state = await run('state', maintainColumnOrder);
            expect({
                maintainColumnOrder,
                firstAfterCall: { move: move.afterCall[0], state: state.afterCall[0] },
                state: { afterCall: state.afterCall, regrouped: state.regrouped },
            }).toEqual({
                maintainColumnOrder,
                firstAfterCall: { move: move.x1, state: state.x1 },
                state: { afterCall: move.afterCall, regrouped: move.regrouped },
            });
        }
    });
});
