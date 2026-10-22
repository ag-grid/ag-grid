import { getByTestId, waitFor } from '@testing-library/dom';
import { TestGridsManager, assertSelectedCellRanges, asyncSetTimeout, initPointerEventPolyfill } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, agTestIdFor, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

describe('touch press on a cell', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, CellSelectionModule] });

    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        document.body.innerHTML = '';
    });

    async function createGrid(gridOptions: GridOptions = {}) {
        const gridDiv = document.createElement('div');
        document.body.appendChild(gridDiv);

        const events: string[] = [];
        const api = gridMgr.createGrid(gridDiv, {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData: [
                { athlete: 'A', age: 20 },
                { athlete: 'B', age: 21 },
            ],
            getRowId: (params) => params.data.athlete,
            cellSelection: true,
            onCellMouseDown: () => events.push('cellMouseDown'),
            onCellClicked: () => events.push('cellClicked'),
            ...gridOptions,
        });

        return { api, gridDiv, events };
    }

    function press(target: HTMLElement, pointerType: string) {
        const init: PointerEventInit = { bubbles: true, cancelable: true, button: 0, buttons: 1, pointerType };
        target.dispatchEvent(new PointerEvent('pointerdown', init));
        target.dispatchEvent(new PointerEvent('pointerup', { ...init, buttons: 0 }));
    }

    function getCell(gridDiv: HTMLElement) {
        return waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('B', 'age')));
    }

    function expectCellSelected(api: GridApi) {
        expect(api.getFocusedCell()).toMatchObject({ rowIndex: 1, column: api.getColumn('age') });
        assertSelectedCellRanges([{ rowStartIndex: 1, rowEndIndex: 1, columns: ['age'] }], api);
    }

    test('a touch that becomes a scroll does not focus or select the cell', async () => {
        const { api, gridDiv, events } = await createGrid();

        // a scroll gesture ends without the click that a tap produces
        press(await getCell(gridDiv), 'touch');
        await asyncSetTimeout(0);

        expect(api.getFocusedCell()).toBeUndefined();
        assertSelectedCellRanges([], api);
        expect(events).toEqual([]);
    });

    test('a tap focuses and selects the cell before cellClicked', async () => {
        const { api, gridDiv, events } = await createGrid();
        const cell = await getCell(gridDiv);

        press(cell, 'touch');
        cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expectCellSelected(api);
        await waitFor(() => expect(events).toEqual(['cellMouseDown', 'cellClicked']));
    });

    test('a long press focuses and selects the cell before its context menu', async () => {
        const { api, gridDiv } = await createGrid();
        const cell = await getCell(gridDiv);

        press(cell, 'touch');
        cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));

        expectCellSelected(api);
    });

    test('a click on another cell does not replay an earlier touch that scrolled', async () => {
        const { api, gridDiv } = await createGrid();
        const otherCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('A', 'athlete')));

        press(await getCell(gridDiv), 'touch');
        otherCell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(api.getFocusedCell()).toBeUndefined();
    });

    test('a mouse press focuses and selects the cell straight away', async () => {
        const { api, gridDiv, events } = await createGrid();

        press(await getCell(gridDiv), 'mouse');

        expectCellSelected(api);
        await waitFor(() => expect(events).toEqual(['cellMouseDown']));
    });

    test('a touch on a full width row only focuses it once tapped', async () => {
        const { api, gridDiv } = await createGrid({
            isFullWidthRow: () => true,
            fullWidthCellRenderer: () => '<span>full width</span>',
        });
        const span = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLElement>('.ag-full-width-row span');
            expect(el).not.toBeNull();
            return el!;
        });

        press(span, 'touch');
        expect(api.getFocusedCell()).toBeUndefined();

        span.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(api.getFocusedCell()).not.toBeNull();
    });
});
