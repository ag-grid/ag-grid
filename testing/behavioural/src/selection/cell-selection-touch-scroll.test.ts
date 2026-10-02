import { getByTestId, waitFor } from '@testing-library/dom';
import { TestGridsManager, assertSelectedCellRanges, initPointerEventPolyfill } from 'ag-test-utils';

import { ClientSideRowModelModule, agTestIdFor, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

describe('cell selection drag with touch-like pointers', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, CellSelectionModule] });

    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    async function swipeAcrossCells(pointerType: string) {
        const gridDiv = document.createElement('div');
        document.body.appendChild(gridDiv);

        const api = gridMgr.createGrid(gridDiv, {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
            rowData: [
                { athlete: 'A', age: 20, country: 'UK' },
                { athlete: 'B', age: 21, country: 'US' },
                { athlete: 'C', age: 22, country: 'FR' },
            ],
            getRowId: (params) => params.data.athlete,
            cellSelection: { handle: { mode: 'fill' } },
        });

        const startCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('A', 'athlete')));
        const endCell = getByTestId(gridDiv, agTestIdFor.cell('C', 'country'));

        const pointerInit: PointerEventInit = {
            bubbles: true,
            composed: true,
            button: 0,
            buttons: 1,
            clientX: 10,
            pointerId: 1,
            pointerType,
            isPrimary: true,
        };
        startCell.dispatchEvent(new PointerEvent('pointerdown', pointerInit));
        endCell.dispatchEvent(new PointerEvent('pointermove', { ...pointerInit, clientX: 30 }));
        endCell.dispatchEvent(new PointerEvent('pointermove', { ...pointerInit, clientX: 31 }));

        // the browser only scrolls natively if the grid leaves the touchmove uncancelled
        const touchMove = new TouchEvent('touchmove', { bubbles: true, cancelable: true });
        endCell.dispatchEvent(touchMove);

        endCell.dispatchEvent(new PointerEvent('pointerup', { ...pointerInit, clientX: 31, buttons: 0 }));

        gridDiv.remove();
        return { api, touchMovePrevented: touchMove.defaultPrevented };
    }

    test.each([
        ['touch', 'touch'],
        // assistive technology such as Android Voice Access injects touches with an empty pointerType
        ['an empty pointerType', ''],
    ])('a swipe from %s does not start a range drag or block native scrolling', async (_name, pointerType) => {
        const { api, touchMovePrevented } = await swipeAcrossCells(pointerType);

        expect(touchMovePrevented).toBe(false);
        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 0, columns: ['athlete'] }], api);
    });

    test('a mouse drag selects a range and blocks touch scrolling while dragging', async () => {
        const { api, touchMovePrevented } = await swipeAcrossCells('mouse');

        expect(touchMovePrevented).toBe(true);
        assertSelectedCellRanges([{ rowStartIndex: 0, rowEndIndex: 2, columns: ['athlete', 'age', 'country'] }], api);
    });
});
