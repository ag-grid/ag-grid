import type { CellMouseDownEvent, CellMouseOverEvent, ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    EventApiModule,
    GROUP_AUTO_COLUMN_ID,
    KeyCode,
    RenderApiModule,
    RowDragModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, initPointerEventPolyfill } from '../test-utils';

interface RowData {
    category: string;
    value: string;
}

// Expanded layout (groupDefaultExpanded: -1):
//   row 0: group A
//   row 1: leaf { category:'A', value:'v1' }   <- fades out on collapse, covering the slot group B takes
//   row 2: leaf { category:'A', value:'v2' }
//   row 3: group B
//   row 4: leaf { category:'B', value:'v3' }
const rowData: RowData[] = [
    { category: 'A', value: 'v1' },
    { category: 'A', value: 'v2' },
    { category: 'B', value: 'v3' },
];

const FADING_LEAF = '0';
const GROUP_B = 'row-group-category-B';

function getCell(rowId: string, colId: string): HTMLElement {
    const cell = document.querySelector(`[row-id="${rowId}"] [col-id="${colId}"]`);
    if (!cell) {
        throw new Error(`No cell for row ${rowId} / column ${colId}`);
    }
    return cell as HTMLElement;
}

function dispatchPointerDown(element: HTMLElement): void {
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
}

describe('Interactions while rows animate out', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RenderApiModule, RowDragModule, EventApiModule],
    });

    beforeAll(() => {
        // without it jsdom reports no pointer support and the grid falls back to touchstart, which the
        // row drag handle then rejects for having no touches
        initPointerEventPolyfill();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    /** Collapses group A and leaves its leaves in the dom, mid fade-out, as they are when the user clicks one. */
    function createGridWithCollapsingGroup(columnDefs: ColDef<RowData>[]): GridApi<RowData> {
        const api: GridApi<RowData> = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
            animateRows: true,
            // animation is suppressed while the grid enforces dom order
            ensureDomOrder: false,
        } as GridOptions<RowData>);

        api.flushAllAnimationFrames();
        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        getCell('row-group-category-A', GROUP_AUTO_COLUMN_ID).dispatchEvent(
            new KeyboardEvent('keydown', { key: KeyCode.ENTER, bubbles: true, cancelable: true })
        );
        api.flushAllAnimationFrames();

        return api;
    }

    test('clicking a row that is animating out focuses the row now occupying that slot', () => {
        const api = createGridWithCollapsingGroup([
            { field: 'category', rowGroup: true, hide: true },
            { field: 'value', colId: 'value' },
        ]);

        dispatchPointerDown(getCell(FADING_LEAF, GROUP_AUTO_COLUMN_ID));

        expect(api.getFocusedCell()?.rowIndex).toBe(1);
        expect(api.getFocusedCell()?.column.getColId()).toBe(GROUP_AUTO_COLUMN_ID);
        expect(document.activeElement).toBe(getCell(GROUP_B, GROUP_AUTO_COLUMN_ID));

        (document.activeElement as HTMLElement).dispatchEvent(
            new KeyboardEvent('keydown', { key: KeyCode.DOWN, bubbles: true, cancelable: true })
        );
        expect(api.getFocusedCell()?.rowIndex).toBe(2);
    });

    test('a widget on the row animating out does not suppress cell handling for the row taking its slot', async () => {
        const api = createGridWithCollapsingGroup([
            { field: 'category', rowGroup: true, hide: true },
            { field: 'value', colId: 'value', rowDrag: true },
        ]);

        const mouseDownEvents: CellMouseDownEvent<RowData>[] = [];
        api.addEventListener('cellMouseDown', (e) => mouseDownEvents.push(e));

        const dragger = getCell(FADING_LEAF, 'value').querySelector('.ag-row-drag') as HTMLElement;
        expect(dragger).toBeTruthy();
        dispatchPointerDown(dragger);
        await asyncSetTimeout(0);

        // the drag handle belongs to the dying row, so this counts as a plain click on the live cell
        expect(mouseDownEvents).toHaveLength(1);
        expect(mouseDownEvents[0].node.id).toBe(GROUP_B);
        expect(api.getFocusedCell()?.rowIndex).toBe(1);
    });

    test('a drag handle on the row animating out does not suppress rowClicked for the row taking its slot', async () => {
        const api = createGridWithCollapsingGroup([
            { field: 'category', rowGroup: true, hide: true },
            { field: 'value', colId: 'value', rowDrag: true },
        ]);

        const rowClickedIds: (string | undefined)[] = [];
        api.addEventListener('rowClicked', (e) => rowClickedIds.push(e.node.id));

        const dragger = getCell(FADING_LEAF, 'value').querySelector('.ag-row-drag') as HTMLElement;
        dispatchPointerDown(dragger);
        dragger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await asyncSetTimeout(0);

        expect(rowClickedIds).toEqual([GROUP_B]);
    });

    test('moving within a cell of the row animating out reports the hover once', async () => {
        const api = createGridWithCollapsingGroup([
            { field: 'category', rowGroup: true, hide: true },
            { field: 'value', colId: 'value' },
        ]);

        const mouseOverEvents: CellMouseOverEvent<RowData>[] = [];
        api.addEventListener('cellMouseOver', (e) => mouseOverEvents.push(e));

        const fadingCell = getCell(FADING_LEAF, GROUP_AUTO_COLUMN_ID);
        const inner = fadingCell.firstElementChild as HTMLElement;
        expect(inner).toBeTruthy();

        fadingCell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        // the pointer moves into a child of the same cell, so it is the same hover and must not be reported again
        inner.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: fadingCell }));
        await asyncSetTimeout(0);

        expect(mouseOverEvents).toHaveLength(1);
        expect(mouseOverEvents[0].node.id).toBe(GROUP_B);
    });
});
