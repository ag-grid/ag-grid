import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';

import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from '../../test-utils';

// Exercises the header-drag reorder path: getBestColumnMoveIndexFromXPosition -> getLowestFragMove
// (the `displayedIndex >= 0` displayed-subset filter) -> calculateValidMoves / notDisplayedInSection
// (the hidden-column skip). A hidden column sits between displayed ones so both the displayed filter
// and the section skip have a hidden col to act on.
describe('column header drag reorder', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function colOrder(api: GridApi): string[] {
        return api.getAllGridColumns().map((c) => c.getColId());
    }

    function el(api: GridApi, selector: string): HTMLElement {
        const found = (getGridElement(api)! as HTMLElement).querySelector(selector) as HTMLElement | null;
        if (!found) {
            throw new Error(`element not found: ${selector}`);
        }
        return found;
    }

    // Drives a real header drag through DragService -> dragAndDropService -> MoveColumnFeature.
    // `elementsFromPoint` is pointed at the body viewport (a BodyDropTarget container) so the in-grid
    // drop target resolves; the mouse Y sits in the body so the container rect-containment check passes.
    // The drop index is computed from `toClientX` (section-relative, section left is 0 in the layout mock);
    // `fromClientX` only sets the horizontal drag direction (left vs right).
    async function dragHeader(
        api: GridApi,
        sourceColId: string,
        fromClientX: number,
        toClientX: number
    ): Promise<void> {
        return dragSelector(api, `.ag-header-cell[col-id="${sourceColId}"]`, fromClientX, toClientX);
    }

    async function dragSelector(
        api: GridApi,
        sourceSelector: string,
        fromClientX: number,
        toClientX: number
    ): Promise<void> {
        const source = el(api, sourceSelector);
        const viewport = el(api, '.ag-grid-viewport');
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        const ownerDocument = source.ownerDocument;
        const original = ownerDocument.elementsFromPoint?.bind(ownerDocument);
        ownerDocument.elementsFromPoint = () => [viewport];
        const y = 100; // inside the body viewport rect (top = headerHeight)
        try {
            await dispatcher.startDrag(source, fromClientX, y);
            await dispatcher.movePointer(viewport, fromClientX, y);
            await dispatcher.movePointer(viewport, toClientX, y);
            await dispatcher.finishDrag(viewport);
            await asyncSetTimeout(50);
        } finally {
            ownerDocument.elementsFromPoint = original as typeof ownerDocument.elementsFromPoint;
        }
    }

    // Drives a real header drag then holds at the far-left edge (the "hold to pin" affordance): the grid
    // cannot scroll further, so the hold-to-pin interval keeps failing to move. It fires every 100ms and
    // needs to fail ~9 times before it crosses the threshold that decides the drag-ghost icon. Returns
    // whether the pin indicator is showing on the drag ghost the user actually sees.
    async function holdAtLeftEdgeShowsPinIcon(api: GridApi, sourceSelector: string): Promise<boolean> {
        const source = el(api, sourceSelector);
        const viewport = el(api, '.ag-grid-viewport');
        const ownerDocument = source.ownerDocument;
        const original = ownerDocument.elementsFromPoint?.bind(ownerDocument);
        ownerDocument.elementsFromPoint = () => [viewport];
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        const y = 100;
        try {
            await dispatcher.startDrag(source, 200, y);
            await dispatcher.movePointer(viewport, 200, y);
            await dispatcher.movePointer(viewport, 5, y);
            await asyncSetTimeout(1200);

            const ghostIcon = ownerDocument.querySelector('.ag-dnd-ghost-icon');
            expect(ghostIcon).not.toBeNull();
            return ghostIcon!.querySelector('.ag-icon-pin') != null;
        } finally {
            await dispatcher.finishDrag(viewport);
            ownerDocument.elementsFromPoint = original as typeof ownerDocument.elementsFromPoint;
        }
    }

    function createGrid(): Promise<GridApi> {
        return gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', width: 100 },
                { field: 'b', width: 100 },
                { field: 'c', width: 100, hide: true },
                { field: 'd', width: 100 },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            suppressDragLeaveHidesColumns: true,
        });
    }

    test('dragging a header right places it past the displayed cols, hidden col preserved', async () => {
        const api = await createGrid();
        expect(colOrder(api)).toEqual(['a', 'b', 'c', 'd']);

        // Drag 'a' rightwards to beyond the last displayed col. getLowestFragMove filters the hidden
        // 'c' out of the displayed-order comparison; 'a' lands after 'd', 'c' keeps its slot.
        await dragHeader(api, 'a', 5, 250);

        expect(colOrder(api)).toEqual(['b', 'c', 'd', 'a']);
    });

    test('dragging a header left to the front, hidden col preserved', async () => {
        const api = await createGrid();
        expect(colOrder(api)).toEqual(['a', 'b', 'c', 'd']);

        // Drag 'd' to the far left: calculateValidMoves runs its dragging-left branch (calling
        // notDisplayedInSection) and 'd' settles at the front; hidden 'c' keeps its slot.
        await dragHeader(api, 'd', 400, 5);

        expect(colOrder(api)).toEqual(['d', 'a', 'b', 'c']);
    });

    test('dragging a center column to the far left pins it, alongside an existing pinned column', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'p', width: 100, pinned: 'left' },
                { field: 'a', width: 100 },
                { field: 'b', width: 100 },
                { field: 'd', width: 100 },
            ],
            rowData: [{ p: 0, a: 1, b: 2, d: 4 }],
            suppressDragLeaveHidesColumns: true,
        });
        expect(colOrder(api)).toEqual(['p', 'a', 'b', 'd']);

        // Drag center col 'd' to the far-left (pinned) edge. The left-section move logic runs, and
        // notDisplayedInSection's `section === 'left'` branch skips the center cols (pinned mismatch);
        // 'd' pins to the left, ahead of the existing pinned 'p'.
        await dragHeader(api, 'd', 400, 5);

        expect(colOrder(api)).toEqual(['d', 'p', 'a', 'b']);
        expect(api.getColumn('d')!.getPinned()).toBe('left');
    });

    test('a suppressMovable column cannot be dragged (move is blocked)', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', width: 100, suppressMovable: true },
                { field: 'b', width: 100 },
                { field: 'd', width: 100 },
            ],
            rowData: [{ a: 1, b: 2, d: 4 }],
            suppressDragLeaveHidesColumns: true,
        });
        expect(colOrder(api)).toEqual(['a', 'b', 'd']);

        // calculateValidMoves short-circuits to [] for a non-movable col, so no valid move exists.
        await dragHeader(api, 'a', 5, 400);

        expect(colOrder(api)).toEqual(['a', 'b', 'd']);
    });

    // Regression: holding a lockPinned column at the grid edge (the "hold to pin" affordance) must not
    // show the pin indicator, since the column cannot be pinned there.
    test('holding a lockPinned column at the grid edge does not show the pin icon, nor pin it', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', width: 100 },
                { field: 'b', width: 100, lockPinned: true },
                { field: 'd', width: 100 },
            ],
            rowData: [{ a: 1, b: 2, d: 4 }],
            suppressDragLeaveHidesColumns: true,
        });
        expect(api.getColumn('b')!.getPinned()).toBeNull();

        const showsPinIcon = await holdAtLeftEdgeShowsPinIcon(api, '.ag-header-cell[col-id="b"]');

        expect(showsPinIcon).toBe(false);
        expect(api.getColumn('b')!.getPinned()).toBeNull();
    });

    // A group whose leaves are all lockPinned cannot pin at the edge, so the ghost must not show the pin icon.
    test('holding a group of only lockPinned columns at the edge does not show the pin icon, nor pin them', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', width: 100 },
                {
                    headerName: 'G',
                    children: [
                        { field: 'b', width: 100, lockPinned: true },
                        { field: 'c', width: 100, lockPinned: true },
                    ],
                },
                { field: 'd', width: 100 },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            suppressDragLeaveHidesColumns: true,
        });

        const showsPinIcon = await holdAtLeftEdgeShowsPinIcon(api, '.ag-header-group-cell');

        expect(showsPinIcon).toBe(false);
        expect(api.getColumn('b')!.getPinned()).toBeNull();
        expect(api.getColumn('c')!.getPinned()).toBeNull();
    });

    // A group with a mix of locked and pinnable leaves can pin the unlocked leaves, so the ghost shows the
    // pin icon and only the pinnable leaf gets pinned; the lockPinned leaf is left where it is.
    test('holding a mixed group at the edge shows the pin icon and pins only the pinnable columns', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', width: 100 },
                {
                    headerName: 'G',
                    children: [
                        { field: 'b', width: 100, lockPinned: true },
                        { field: 'c', width: 100 },
                    ],
                },
                { field: 'd', width: 100 },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            suppressDragLeaveHidesColumns: true,
        });

        const showsPinIcon = await holdAtLeftEdgeShowsPinIcon(api, '.ag-header-group-cell');

        expect(showsPinIcon).toBe(true);
        expect(api.getColumn('b')!.getPinned()).toBeNull();
        expect(api.getColumn('c')!.getPinned()).toBe('left');
    });

    test('dragging a marryChildren group header moves all its leaves together, including hidden ones', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'x', width: 100 },
                {
                    headerName: 'G',
                    marryChildren: true,
                    children: [
                        { field: 'a', width: 100 },
                        { field: 'b', width: 100, columnGroupShow: 'open' }, // hidden while the group is closed
                    ],
                },
                { field: 'd', width: 100 },
            ],
            rowData: [{ x: 0, a: 1, b: 2, d: 4 }],
            suppressDragLeaveHidesColumns: true,
        });
        expect(colOrder(api)).toEqual(['x', 'a', 'b', 'd']);

        // Dragging the group header carries multiple moving cols (sortColsLikeCols + calculateOldIndex
        // multi-col path) and getColsToMove pulls the hidden 'b' so the married group stays intact.
        await dragSelector(api, '.ag-header-group-cell', 250, 5);

        expect(colOrder(api)).toEqual(['a', 'b', 'x', 'd']);
    });
});
