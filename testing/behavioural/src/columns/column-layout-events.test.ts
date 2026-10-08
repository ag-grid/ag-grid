import { TestGridsManager } from 'ag-test-utils';

import type { Column, ColumnGroup, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';

/** Each displayed column as `colId@left`, failing where a column does not start where the one before it ends. */
const contiguousLefts = (api: GridApi): string[] => {
    const res: string[] = [];
    let end = 0;
    for (const column of api.getAllDisplayedColumns()) {
        const left = column.getLeft();
        res.push(left === end ? `${column.getColId()}@${left}` : `${column.getColId()}@${left}, expected ${end}`);
        end = left! + column.getActualWidth();
    }
    return res;
};

describe('column layout events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = () =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            defaultColDef: { width: 100 },
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });

    /** What `column`'s `event` listener sees of the displayed columns, once per event. */
    const listen = (
        api: GridApi,
        column: Column,
        event: 'leftChanged' | 'widthChanged' | 'columnStateUpdated' = 'leftChanged'
    ): string[][] => {
        const seen: string[][] = [];
        column.addEventListener(event, () => seen.push(contiguousLefts(api)));
        return seen;
    };

    /** What `group`'s `event` listener sees of the displayed columns, once per event. */
    const listenToGroup = (
        api: GridApi,
        group: ColumnGroup,
        event: 'leftChanged' | 'displayedChildrenChanged'
    ): string[][] => {
        const seen: string[][] = [];
        group.addEventListener(event, () => seen.push(contiguousLefts(api)));
        return seen;
    };

    test('a resize tells each moved column once, after every left is set', () => {
        const api = createGrid();
        const seen = listen(api, api.getColumn('b')!);
        const seenByA = listen(api, api.getColumn('a')!);

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(seen).toEqual([['a@0', 'b@150', 'c@250', 'd@350']]);
        expect(seenByA).toEqual([]);
    });

    test('a refresh tells each moved column once, after every left is set', () => {
        const api = createGrid();
        const seen = listen(api, api.getColumn('a')!);

        api.moveColumns(['d'], 0);

        expect(seen).toEqual([['d@0', 'a@100', 'b@200', 'c@300']]);
    });

    test('a column leaving the displayed columns is told it has no left', () => {
        const api = createGrid();
        const b = api.getColumn('b')!;
        const lefts: (number | null)[] = [];
        b.addEventListener('leftChanged', () => lefts.push(b.getLeft()));

        api.setColumnsVisible(['b'], false);

        expect(lefts).toEqual([null]);
    });

    test('a refresh with a flex pass tells a column once of where it ends, and nothing where it ends where it was', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', flex: 1 },
                { colId: 'c', width: 100 },
            ],
            rowData: [{}],
        });
        const seenByB = listen(api, api.getColumn('b')!);
        const widthsSeenByB = listen(api, api.getColumn('b')!, 'widthChanged');
        const seenByC = listen(api, api.getColumn('c')!);

        // c first follows b's old width, then b flexes into a's space and c ends at 900 again
        api.setColumnsVisible(['a'], false);

        expect(seenByB).toEqual([['b@0', 'c@900']]);
        expect(widthsSeenByB).toEqual([['b@0', 'c@900']]);
        expect(seenByC).toEqual([]);
    });

    test('a resize updates the width in the column state once, after every left is set, and not at the next one', () => {
        const api = createGrid();
        const seenByA = listen(api, api.getColumn('a')!, 'columnStateUpdated');
        const seenByB = listen(api, api.getColumn('b')!, 'columnStateUpdated');

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        expect(seenByB).toEqual([]);

        api.setColumnWidths([{ key: 'b', newWidth: 50 }]);
        expect(seenByA).toEqual([['a@0', 'b@150', 'c@250', 'd@350']]);
        expect(seenByB).toEqual([['a@0', 'b@150', 'c@200', 'd@300']]);
    });

    test('a resize tells a column flexed by it of its width once, after every left is set', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', flex: 1 },
                { colId: 'c', width: 100 },
            ],
            rowData: [{}],
        });
        const seen = listen(api, api.getColumn('b')!, 'widthChanged');
        const sources: string[] = [];
        for (const colId of ['a', 'b']) {
            api.getColumn(colId)!.addEventListener('widthChanged', (event) => sources.push(`${colId}:${event.source}`));
        }

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(seen).toEqual([['a@0', 'b@150', 'c@900']]);
        expect(api.getColumn('b')!.getActualWidth()).toBe(750);
        expect(sources).toEqual(['a:api', 'b:flex']);
    });

    test('a fit tells each column of its width after every left is set', () => {
        const api = createGrid();
        const seen = listen(api, api.getColumn('a')!, 'widthChanged');

        api.sizeColumnsToFit();

        expect(seen).toEqual([['a@0', 'b@250', 'c@500', 'd@750']]);
    });

    test('a group is told its displayed children changed once the displayed columns hold them', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    groupId: 'g',
                    openByDefault: true,
                    children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                },
                { colId: 'c' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        const seen = listenToGroup(api, api.getColumnGroup('g')!, 'displayedChildrenChanged');

        api.setColumnGroupOpened('g', false);

        expect(seen).toEqual([['a@0', 'c@100']]);
    });

    test('a group is told once when a child group listener collapses a sibling group', () => {
        const child = (groupId: string, colId: string) => ({
            groupId,
            openByDefault: true,
            children: [{ colId: `${colId}1` }, { colId: `${colId}2`, columnGroupShow: 'open' as const }],
        });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ groupId: 'g', children: [child('h', 'h'), child('j', 'j')] }],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        const seenByG = listenToGroup(api, api.getColumnGroup('g')!, 'displayedChildrenChanged');
        api.getColumnGroup('h')!.addEventListener('displayedChildrenChanged', () => {
            api.setColumnGroupOpened('j', false);
        });

        api.setColumnGroupOpened('h', false);

        expect(seenByG).toEqual([['h1@0', 'j1@100']]);
    });

    test('a group is told its left moved once every column, flexed ones included, is laid out', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'x', width: 100 },
                { groupId: 'g', children: [{ colId: 'a', flex: 1 }] },
                { colId: 'c', width: 100 },
            ],
            rowData: [{}],
        });
        const seen = listenToGroup(api, api.getColumnGroup('g')!, 'leftChanged');

        api.setColumnsVisible(['x'], false);

        expect(seen).toEqual([['a@0', 'c@900']]);
    });

    test('a listener changing the columns again is told of its own change in the same publish', () => {
        const api = createGrid();
        const seenByD = listen(api, api.getColumn('d')!, 'widthChanged');
        const seenByB = listen(api, api.getColumn('b')!);
        api.getColumn('b')!.addEventListener('leftChanged', () => {
            api.setColumnWidths([{ key: 'd', newWidth: 50 }]);
        });

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(seenByD).toEqual([['a@0', 'b@150', 'c@250', 'd@350']]);
        expect(seenByB).toEqual([['a@0', 'b@150', 'c@250', 'd@350']]);
        expect(api.getColumn('d')!.getActualWidth()).toBe(50);
    });

    test('a widthChanged listener moving its own column is told of the move once', () => {
        const api = createGrid();
        const c = api.getColumn('c')!;
        const seenByC = listen(api, c);
        c.addEventListener('widthChanged', () => {
            api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        });

        api.setColumnWidths([{ key: 'c', newWidth: 150 }]);
        api.setColumnWidths([{ key: 'd', newWidth: 50 }]);

        expect(seenByC).toEqual([['a@0', 'b@150', 'c@250', 'd@400']]);
        expect(c.getLeft()).toBe(250);
    });

    test('a listener hiding a column during a refresh leaves the displayed columns laid out without it', () => {
        const api = createGrid();
        let hidden = false;
        api.getColumn('a')!.addEventListener('leftChanged', () => {
            if (!hidden) {
                hidden = true;
                api.setColumnsVisible(['c'], false);
            }
        });

        api.moveColumns(['d'], 0);

        expect(contiguousLefts(api)).toEqual(['d@0', 'a@100', 'b@200']);
        expect(api.getColumn('c')!.getLeft()).toBeNull();
    });

    test('a column destroyed by a listener replacing the columns is told nothing more', () => {
        const api = createGrid();
        const b = api.getColumn('b')!;
        let replaced = false;
        const heardOnceReplaced: string[] = [];
        b.addEventListener('leftChanged', () => {
            if (replaced) {
                heardOnceReplaced.push('b');
            }
        });
        api.getColumn('a')!.addEventListener('leftChanged', () => {
            if (!replaced) {
                replaced = true;
                api.setGridOption('columnDefs', [{ field: 'x' }]);
            }
        });

        api.moveColumns(['d'], 0);

        expect(heardOnceReplaced).toEqual([]);
        expect(contiguousLefts(api)).toEqual(['x@0']);
    });

    test('a column destroyed by its own listener is told nothing more', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', pinned: 'left' }, { field: 'b' }],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        const heard: string[] = [];
        const a = api.getColumn('a')!;
        for (const event of ['columnStateUpdated', 'leftChanged', 'lastLeftPinnedChanged'] as const) {
            a.addEventListener(event, () => heard.push(event));
        }
        a.addEventListener('widthChanged', () => {
            heard.push('replaced');
            api.setGridOption('columnDefs', [{ field: 'x' }]);
        });

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(heard).toEqual(['replaced']);
    });

    test('a column moved into view is told once the viewport holds it', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: Array.from({ length: 30 }, (_, i) => ({ colId: `c${i}`, width: 100 })),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        const inView = () => api.getAllDisplayedVirtualColumns().some((column) => column.getColId() === 'c25');
        expect(inView()).toBe(false);
        const seen: boolean[] = [];
        api.getColumn('c25')!.addEventListener('leftChanged', () => seen.push(inView()));

        api.moveColumns(['c25'], 1);

        expect(seen).toEqual([true]);
    });
});

describe('a column update made from a layout event', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = () =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'p', pinned: 'left' },
                { colId: 'a' },
                {
                    groupId: 'g',
                    openByDefault: true,
                    children: [{ colId: 'b' }, { colId: 'c', columnGroupShow: 'open' }],
                },
                { colId: 'd' },
                { colId: 'r', pinned: 'right' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });

    /** What is wrong with the columns' layout: a lane not contiguous from 0, a misplaced pinned edge, or a column not
     *  displayed that keeps a `left`. */
    const layoutProblems = (api: GridApi): string[] => {
        const problems: string[] = [];
        const lanes = [api.getDisplayedLeftColumns(), api.getDisplayedCenterColumns(), api.getDisplayedRightColumns()];
        for (let lane = 0; lane < 3; ++lane) {
            const cols = lanes[lane];
            let end = 0;
            for (let i = 0; i < cols.length; ++i) {
                const column = cols[i];
                const colId = column.getColId();
                if (column.getLeft() !== end) {
                    problems.push(`${colId} at ${column.getLeft()}, expected ${end}`);
                }
                end += column.getActualWidth();
                if (column.isLastLeftPinned() !== (lane === 0 && i === cols.length - 1)) {
                    problems.push(`${colId} last left pinned: ${column.isLastLeftPinned()}`);
                }
                if (column.isFirstRightPinned() !== (lane === 2 && i === 0)) {
                    problems.push(`${colId} first right pinned: ${column.isFirstRightPinned()}`);
                }
            }
        }
        for (const column of api.getColumns()!) {
            if (!column.isVisible() && column.getLeft() !== null) {
                problems.push(`${column.getColId()} hidden at ${column.getLeft()}`);
            }
        }
        return problems;
    };

    type LayoutEvent = 'widthChanged' | 'columnStateUpdated' | 'lastLeftPinnedChanged' | 'firstRightPinnedChanged';

    /** Runs `update` the first time `column` hears `event`. */
    const onFirst = (column: Column, event: LayoutEvent, update: () => void) => {
        let done = false;
        column.addEventListener(event, () => {
            if (!done) {
                done = true;
                update();
            }
        });
    };

    test('in widthChanged leaves the columns laid out', () => {
        const api = createGrid();
        onFirst(api.getColumn('a')!, 'widthChanged', () => api.setColumnsVisible(['d'], false));

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(layoutProblems(api)).toEqual([]);
        expect(api.getColumn('d')!.isVisible()).toBe(false);
    });

    test('in columnStateUpdated leaves the columns laid out', () => {
        const api = createGrid();
        onFirst(api.getColumn('a')!, 'columnStateUpdated', () => api.setColumnsVisible(['d'], false));

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(layoutProblems(api)).toEqual([]);
        expect(api.getColumn('d')!.isVisible()).toBe(false);
    });

    test('in a group displayedChildrenChanged leaves the columns laid out', () => {
        const api = createGrid();
        let done = false;
        api.getColumnGroup('g')!.addEventListener('displayedChildrenChanged', () => {
            if (!done) {
                done = true;
                api.setColumnsVisible(['a'], false);
            }
        });

        api.setColumnGroupOpened('g', false);

        expect(layoutProblems(api)).toEqual([]);
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual(['p', 'b', 'd', 'r']);
    });

    test('in a group leftChanged leaves the columns laid out', () => {
        const api = createGrid();
        let done = false;
        api.getColumnGroup('g')!.addEventListener('leftChanged', () => {
            if (!done) {
                done = true;
                api.setColumnsVisible(['d'], false);
            }
        });

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(layoutProblems(api)).toEqual([]);
        expect(api.getColumn('d')!.isVisible()).toBe(false);
    });

    /** Each `event` heard, as `colId:` and whether the column is at that edge as it hears it. */
    const listenToEdge = (api: GridApi, event: 'lastLeftPinnedChanged' | 'firstRightPinnedChanged'): string[] => {
        const seen: string[] = [];
        for (const column of api.getColumns()!) {
            column.addEventListener(event, () =>
                seen.push(
                    `${column.getColId()}:${event === 'lastLeftPinnedChanged' ? column.isLastLeftPinned() : column.isFirstRightPinned()}`
                )
            );
        }
        return seen;
    };

    test('in lastLeftPinnedChanged leaves the pinned edges in place, each column told where it is as it changes', () => {
        const api = createGrid();
        const seen = listenToEdge(api, 'lastLeftPinnedChanged');
        onFirst(api.getColumn('p')!, 'lastLeftPinnedChanged', () => api.setColumnsPinned(['d'], 'left'));

        api.setColumnsPinned(['a'], 'left');

        expect(layoutProblems(api)).toEqual([]);
        expect(api.getDisplayedLeftColumns().map((column) => column.getColId())).toEqual(['p', 'a', 'd']);
        expect(seen).toEqual(['p:false', 'd:true']);
    });

    test('a listener throwing leaves the columns laid out, and the columns it stopped are told at the next operation', () => {
        const api = createGrid();
        const seen = listenToEdge(api, 'lastLeftPinnedChanged');
        api.getColumn('a')!.addEventListener('leftChanged', () => seen.push('a:left'));
        onFirst(api.getColumn('p')!, 'lastLeftPinnedChanged', () => {
            throw new Error('listener failed');
        });

        expect(() => api.setColumnsPinned(['a'], 'left')).toThrow('listener failed');
        expect(layoutProblems(api)).toEqual([]);
        expect(seen).toEqual(['p:false']);

        api.setColumnWidths([{ key: 'd', newWidth: 150 }]);

        expect(seen).toEqual(['p:false', 'a:left', 'a:true']);
    });

    test('in firstRightPinnedChanged leaves the pinned edges in place, each column told where it is as it changes', () => {
        const api = createGrid();
        const seen = listenToEdge(api, 'firstRightPinnedChanged');
        onFirst(api.getColumn('r')!, 'firstRightPinnedChanged', () => api.setColumnsPinned(['a'], 'right'));

        api.setColumnsPinned(['d'], 'right');

        expect(layoutProblems(api)).toEqual([]);
        expect(api.getDisplayedRightColumns().map((column) => column.getColId())).toEqual(['a', 'd', 'r']);
        expect(seen).toEqual(['d:true', 'r:false', 'a:true', 'd:false']);
    });
});

describe('the layout events of a primary column while pivoting', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, PivotModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a primary column resized while pivoting is told at once', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
                { field: 'd' },
            ],
            pivotMode: true,
            rowData: [{ a: 1, b: 'x', c: 3, d: 4 }],
        });
        const d = api.getColumn('d')!;
        const seen: string[] = [];
        d.addEventListener('widthChanged', (event) => seen.push(`${event.source}:${d.getActualWidth()}`));

        api.applyColumnState({ state: [{ colId: 'd', width: 333 }] });

        expect(seen).toEqual(['api:333']);
    });
});
