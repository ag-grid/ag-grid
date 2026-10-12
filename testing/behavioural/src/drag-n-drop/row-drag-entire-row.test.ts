import {
    DragEventDispatcher,
    TestGridsManager,
    asyncSetTimeout,
    initPointerEventPolyfill,
    mockGridLayout,
} from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RowDragModule } from 'ag-grid-community';

/** Drags row `fromId` by its cell, with no drag handle, onto row `toId`; returns the rows entered. */
const dragByCell = async (api: GridApi, fromId: string, toId: string): Promise<number> => {
    const gridElement = TestGridsManager.getHTMLElement(api)!;
    const cellOf = (rowId: string) => gridElement.querySelector(`.ag-row[row-id="${rowId}"] [col-id="a"]`)!;
    let entered = 0;
    const onEnter = () => ++entered;
    api.addEventListener('rowDragEnter', onEnter);

    const source = cellOf(fromId);
    const target = cellOf(toId);
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const dispatcher = new DragEventDispatcher('mouse', gridElement.querySelector('.ag-grid-viewport'));
    await dispatcher.startDrag(source, sourceRect.left + 5, sourceRect.top + 5);
    await dispatcher.movePointer(source, sourceRect.left + 10, sourceRect.top + 10);
    await dispatcher.movePointer(target, targetRect.left + 10, targetRect.top + 10);
    await dispatcher.finishDrag();

    api.removeEventListener('rowDragEnter', onEnter);
    return entered;
};

describe('rowDragEntireRow', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowDragModule] });

    beforeAll(() => {
        mockGridLayout.init();
        initPointerEventPolyfill();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a row drags from any cell while the option is on, including after it is turned off and on again', async () => {
        const api = gridsManager.createGrid('entireRow', {
            columnDefs: [{ field: 'a' }],
            rowData: [
                { id: '1', a: 'A' },
                { id: '2', a: 'B' },
            ],
            getRowId: (params) => params.data.id,
            rowDragEntireRow: true,
        });
        await asyncSetTimeout(0);

        expect(await dragByCell(api, '1', '2')).toBe(1);

        api.setGridOption('rowDragEntireRow', false);
        expect(await dragByCell(api, '1', '2')).toBe(0);

        api.setGridOption('rowDragEntireRow', true);
        expect(await dragByCell(api, '1', '2')).toBe(1);
    });
});
