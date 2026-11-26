import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnHoverModule, getGridElement } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

// Exercises the header-drag reorder path: getBestColumnMoveIndexFromXPosition -> getLowestFragMove
// (the `displayedIndex >= 0` displayed-subset filter) -> calculateValidMoves / notDisplayedInSection
// (the hidden-column skip). A hidden column sits between displayed ones so both the displayed filter
// and the section skip have a hidden col to act on.
describe('column header drag reorder', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnHoverModule, RowGroupingModule],
    });

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

    // The pointer sits over the body viewport (a BodyDropTarget); the drop index comes from the section-relative
    // `toClientX`, while `fromClientX` only sets the drag direction.
    async function dragHeader(
        api: GridApi,
        sourceColId: string,
        fromClientX: number,
        toClientX: number
    ): Promise<void> {
        await dragSelector(api, `.ag-header-cell[col-id="${sourceColId}"]`, fromClientX, toClientX);
    }

    async function dragSelector(
        api: GridApi,
        sourceSelector: string,
        fromClientX: number,
        toClientX: number
    ): Promise<{ dragStarted: boolean }> {
        const source = el(api, sourceSelector);
        const viewport = el(api, '.ag-grid-viewport');
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        const y = 100; // inside the body viewport rect (top = headerHeight)
        try {
            await dispatcher.startDrag(source, fromClientX, y);
            await dispatcher.movePointer(viewport, fromClientX, y);
            await dispatcher.movePointer(viewport, toClientX, y);
            const dragStarted = source.ownerDocument.querySelector('.ag-dnd-ghost') != null;
            await dispatcher.finishDrag(viewport);
            return { dragStarted };
        } finally {
            dispatcher.reset();
        }
    }

    // Drives a real header drag then holds at the far-left edge (the "hold to pin" affordance): the grid
    // cannot scroll further, so the hold-to-pin interval keeps failing to move. It fires every 100ms and
    // needs to fail ~9 times before it crosses the threshold that decides the drag-ghost icon. Returns
    // whether the pin indicator is showing on the drag ghost the user actually sees.
    //
    // The ghost shows the scroll arrow while those attempts are running and swaps it for the pin (or back
    // to the plain move icon, when nothing can pin) at the threshold — so both outcomes are reached by
    // waiting for the arrow to go, rather than by out-waiting the interval.
    async function holdAtLeftEdgeShowsPinIcon(api: GridApi, sourceSelector: string): Promise<boolean> {
        const source = el(api, sourceSelector);
        const viewport = el(api, '.ag-grid-viewport');
        const ownerDocument = source.ownerDocument;
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        const y = 100;
        try {
            await dispatcher.startDrag(source, 200, y);
            await dispatcher.movePointer(viewport, 200, y);
            await dispatcher.movePointer(viewport, 5, y);

            const ghostIcon = () => ownerDocument.querySelector('.ag-dnd-ghost-icon');
            // The scroll arrow first: it proves the hold-to-pin interval actually started, which out-waiting
            // it never did.
            await waitFor(() => expect(ghostIcon()?.querySelector('.ag-icon-left')).toBeTruthy());
            await waitFor(() => expect(ghostIcon()!.querySelector('.ag-icon-left')).toBeFalsy(), { timeout: 3000 });

            return ghostIcon()!.querySelector('.ag-icon-pin') != null;
        } finally {
            await dispatcher.finishDrag(viewport);
        }
    }

    // Drags a header out over the body; reads the ghost icon and `colIds` visibility while out and after release.
    async function dragOutOfGrid(api: GridApi, sourceSelector: string, colIds: string[]) {
        const source = el(api, sourceSelector);
        const viewport = el(api, '.ag-grid-viewport');
        const ownerDocument = source.ownerDocument;
        const visibility = () => Object.fromEntries(colIds.map((colId) => [colId, api.getColumn(colId)!.isVisible()]));
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(source, 50, 15);
            await dispatcher.movePointer(viewport, 50, 100);
            await dispatcher.movePointer(ownerDocument.body, 5000, 5000);
            await waitFor(() => expect(ownerDocument.querySelector('.ag-dnd-ghost-icon')).not.toBeNull());
            const ghost = ownerDocument.querySelector('.ag-dnd-ghost')!;
            const ghostIcon = {
                hideIcon: ghost.querySelector('.ag-dnd-ghost-icon .ag-icon-eye-slash') != null,
                notAllowed: ghost.classList.contains('ag-dnd-ghost-not-allowed'),
            };
            const whileOut = visibility();
            await dispatcher.finishDrag(ownerDocument.body);
            return { ghostIcon, whileOut, released: visibility() };
        } finally {
            dispatcher.reset();
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

        await waitFor(() => expect(colOrder(api)).toEqual(['b', 'c', 'd', 'a']));
    });

    test('with moves deferred to the drop, the header the drag would drop beside shows where, and the dragged one is moving, until the drop', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', width: 100 },
                { field: 'b', width: 100 },
                { field: 'd', width: 100 },
            ],
            rowData: [{ a: 1, b: 2, d: 4 }],
            suppressMoveWhenColumnDragging: true,
        });
        const highlights = () =>
            ['a', 'b', 'd'].flatMap((colId) => {
                const classList = el(api, `.ag-header-cell[col-id="${colId}"]`).classList;
                return ['before', 'after']
                    .filter((side) => classList.contains(`ag-header-highlight-${side}`))
                    .map((side) => `${colId}:${side}`);
            });
        const source = el(api, '.ag-header-cell[col-id="a"]');
        const viewport = el(api, '.ag-grid-viewport');
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(source, 5, 100);
            await dispatcher.movePointer(viewport, 5, 100);
            await dispatcher.movePointer(viewport, 250, 100);
            expect(highlights()).toEqual(['d:after']);
            expect(source.classList.contains('ag-header-cell-moving')).toBe(true);
            expect(colOrder(api)).toEqual(['a', 'b', 'd']);
            await dispatcher.finishDrag(viewport);
        } finally {
            dispatcher.reset();
        }

        await waitFor(() => expect(colOrder(api)).toEqual(['b', 'd', 'a']));
        expect(highlights()).toEqual([]);
        expect(el(api, '.ag-header-cell[col-id="a"]').classList.contains('ag-header-cell-moving')).toBe(false);
    });

    test('with moves deferred to the drop, a dragged group header is moving, and the group it would drop beside shows where, until the drop', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    groupId: 'g1',
                    children: [
                        { field: 'a', width: 100 },
                        { field: 'b', width: 100 },
                    ],
                },
                {
                    groupId: 'g2',
                    children: [
                        { field: 'c', width: 100 },
                        { field: 'd', width: 100 },
                    ],
                },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            suppressMoveWhenColumnDragging: true,
        });
        const groupState = (groupId: string) => {
            const classList = el(api, `.ag-header-group-cell[col-id^="${groupId}_"]`).classList;
            const classes = ['ag-header-cell-moving', 'ag-header-highlight-before', 'ag-header-highlight-after'];
            return `${groupId}:${classes.filter((cssClass) => classList.contains(cssClass)).join()}`;
        };
        const seen: string[] = [];
        const viewport = el(api, '.ag-grid-viewport');
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(el(api, '.ag-header-group-cell[col-id^="g2_"]'), 350, 100);
            await dispatcher.movePointer(viewport, 350, 100);
            await dispatcher.movePointer(viewport, 5, 100);
            seen.push(groupState('g1'), groupState('g2'));
            await dispatcher.finishDrag(viewport);
        } finally {
            dispatcher.reset();
        }

        await waitFor(() => expect(colOrder(api)).toEqual(['c', 'd', 'a', 'b']));
        seen.push(groupState('g1'), groupState('g2'));
        expect(seen).toEqual(['g1:ag-header-highlight-before', 'g2:ag-header-cell-moving', 'g1:', 'g2:']);
    });

    test('a drag whose column is removed mid-drag moves nothing, leaving the removed column out', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: ['a', 'b', 'c', 'd'].map((field) => ({ field, width: 100 })),
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });
        const source = el(api, '.ag-header-cell[col-id="b"]');
        const viewport = el(api, '.ag-grid-viewport');
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(source, 150, 100);
            await dispatcher.movePointer(viewport, 150, 100);
            await dispatcher.movePointer(viewport, 250, 100);
            expect(source.classList.contains('ag-header-cell-moving')).toBe(true);
            api.setGridOption(
                'columnDefs',
                ['a', 'c', 'd'].map((field) => ({ field, width: 100 }))
            );
            await dispatcher.movePointer(viewport, 350, 100);
            await dispatcher.finishDrag(viewport);
        } finally {
            dispatcher.reset();
        }

        expect(colOrder(api)).toEqual(['a', 'c', 'd']);
    });

    test('dragging a header left to the front, hidden col preserved', async () => {
        const api = await createGrid();
        expect(colOrder(api)).toEqual(['a', 'b', 'c', 'd']);

        // Drag 'd' to the far left: calculateValidMoves runs its dragging-left branch (calling
        // notDisplayedInSection) and 'd' settles at the front; hidden 'c' keeps its slot.
        await dragHeader(api, 'd', 400, 5);

        await waitFor(() => expect(colOrder(api)).toEqual(['d', 'a', 'b', 'c']));
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

        await waitFor(() => expect(colOrder(api)).toEqual(['d', 'p', 'a', 'b']));
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

        // nothing to poll for a move that must not happen: every timer the drag queues runs out first
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        // calculateValidMoves short-circuits to [] for a non-movable col, so no valid move exists.
        await dragHeader(api, 'a', 5, 400);
        await vi.runAllTimersAsync();
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

        await waitFor(() => expect(colOrder(api)).toEqual(['a', 'b', 'x', 'd']));
    });

    test("dragging out the part of a split group that holds only a locked column hides the group's other column, and shows the hide icon", async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', width: 100 },
                {
                    headerName: 'G',
                    children: [
                        { field: 'c', width: 100, lockVisible: true },
                        { field: 'd', width: 100 },
                    ],
                },
            ],
            rowData: [{ a: 1, c: 3, d: 4 }],
        });
        api.setColumnsPinned(['d'], 'left');
        const groupHeaders = (section: string) =>
            el(api, '.ag-header').querySelectorAll(`.${section} .ag-header-group-cell-with-group`).length;
        expect({
            left: groupHeaders('ag-grid-pinned-left-cells'),
            centre: groupHeaders('ag-grid-scrolling-cells'),
        }).toEqual({ left: 1, centre: 1 });

        const centreGroup = await dragOutOfGrid(
            api,
            '.ag-header .ag-grid-scrolling-cells .ag-header-group-cell-with-group',
            ['a', 'c', 'd']
        );

        expect(centreGroup).toEqual({
            ghostIcon: { hideIcon: true, notAllowed: false },
            whileOut: { a: true, c: true, d: false },
            released: { a: true, c: true, d: false },
        });
    });

    describe('a kept column group header follows the leaves new column definitions give it', () => {
        const rowData = [{ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, z: 7 }];
        const leaf = (field: string, extra: Partial<ColDef> = {}): ColDef => ({ field, width: 100, ...extra });
        const group = (...children: ColDef[]): ColGroupDef => ({ groupId: 'g', children });
        const fieldsOf = (defs: (ColDef | ColGroupDef)[]): string[] =>
            defs.flatMap((def) => ('children' in def ? fieldsOf(def.children) : [def.field!]));

        const groupHeader = '.ag-header-group-cell[col-id^="g_"]';

        // Runs `act` on a grid whose definitions changed in place (same groupId), then on a fresh grid made with them.
        async function onKeptAndFresh<T>(
            options: GridOptions,
            before: (ColDef | ColGroupDef)[],
            after: (ColDef | ColGroupDef)[],
            act: (api: GridApi) => Promise<T>
        ): Promise<{ kept: T; fresh: T }> {
            const fields = fieldsOf(after).sort();
            const keptApi = await gridsManager.createGridAndWait('myGrid', { ...options, columnDefs: before, rowData });
            const groupHeaderBefore = el(keptApi, groupHeader);
            keptApi.setGridOption('columnDefs', after);
            await waitFor(() => {
                for (const field of fields) {
                    el(keptApi, `.ag-header-cell[col-id="${field}"]`);
                }
                expect(colOrder(keptApi).sort()).toEqual(fields);
            });
            expect(el(keptApi, groupHeader)).toBe(groupHeaderBefore);
            const kept = await act(keptApi);
            gridsManager.reset();

            const freshApi = await gridsManager.createGridAndWait('myGrid', { ...options, columnDefs: after, rowData });
            const fresh = await act(freshApi);
            return { kept, fresh };
        }

        const dragGroup = (fromClientX: number, toClientX: number) => async (api: GridApi) => {
            const before = colOrder(api);
            const dragStarted = (await dragSelector(api, groupHeader, fromClientX, toClientX)).dragStarted;
            // A drop that must move nothing has no signal to poll for: hold open the window a move would land in.
            // eslint-disable-next-line no-restricted-syntax -- waits out the post-drop settle window in which an (incorrect) column move would be applied
            await asyncSetTimeout(50);
            return { before, after: colOrder(api), dragStarted };
        };

        // TODO: disabled due to AG-19353 - re-enable once fixed
        test.skip('hovering the header highlights the body cells of the leaves it now has, as a fresh one does', async () => {
            const { kept, fresh } = await onKeptAndFresh(
                { columnHoverHighlight: true },
                [leaf('a'), group(leaf('c'), leaf('d')), leaf('z')],
                [leaf('a'), group(leaf('c'), leaf('e')), leaf('z')],
                async (api) => {
                    el(api, groupHeader).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                    return Array.from(
                        el(api, '.ag-root-wrapper').querySelectorAll('.ag-cell.ag-column-hover'),
                        (cell) => cell.getAttribute('col-id')
                    ).sort();
                }
            );

            expect(kept).toEqual(['c', 'e']);
            expect(fresh).toEqual(['c', 'e']);
        });

        test('the header cannot be moved once a leaf it now has is position-locked, as a fresh one cannot', async () => {
            const { kept, fresh } = await onKeptAndFresh(
                {},
                [group(leaf('c'), leaf('d')), leaf('a'), leaf('z')],
                [group(leaf('c'), leaf('e', { lockPosition: true })), leaf('a'), leaf('z')],
                dragGroup(100, 350)
            );
            gridsManager.reset();
            const unlockedApi = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [group(leaf('c'), leaf('e')), leaf('a'), leaf('z')],
                rowData,
            });
            const unlocked = await dragGroup(100, 350)(unlockedApi);

            // Dropped at x=350 dragging right: the 200px group fits after a and z.
            expect(unlocked).toEqual({ before: ['c', 'e', 'a', 'z'], after: ['a', 'z', 'c', 'e'], dragStarted: true });
            // lockPosition places e first.
            expect(kept.before).toEqual(['e', 'c', 'a', 'z']);
            expect(fresh.before).toEqual(['e', 'c', 'a', 'z']);
            expect({ kept: kept.after, fresh: fresh.after }).toEqual({ kept: kept.before, fresh: fresh.before });
            expect(fresh.dragStarted).toBe(false);
        });

        test('a fresh header with no position-locked leaf moves when dragged to the start', async () => {
            const { fresh } = await onKeptAndFresh(
                {},
                [leaf('a'), group(leaf('c'), leaf('d', { lockPosition: true })), leaf('z')],
                [leaf('a'), group(leaf('c'), leaf('e')), leaf('z')],
                dragGroup(200, 5)
            );
            expect(fresh.after).toEqual(['c', 'e', 'a', 'z']);
        });
    });
});
