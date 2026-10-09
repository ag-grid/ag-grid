import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type {
    AgColumn,
    ColDef,
    Column,
    ColumnGroup,
    ColumnStateUpdatedEvent,
    GridApi,
    IColumnStateUpdateStrategy,
    IHeaderComp,
    IHeaderParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    RowSelectionModule,
    getGridElement,
} from 'ag-grid-community';
import { AllEnterpriseModule, PivotModule, RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

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

    test('a refresh raises the grid events reporting it in a fixed order', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: Array.from({ length: 30 }, (_, i) => ({ colId: `c${i}`, width: 100 })),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);
        const heard: string[] = [];
        const types = [
            'columnContainerWidthChanged',
            'displayedColumnsWidthChanged',
            'virtualColumnsChanged',
            'columnVisible',
            'columnMoved',
            'displayedColumnsChanged',
        ] as const;
        for (const type of types) {
            // some of these are not public grid events, which the API types its listener with
            api.addEventListener(type as 'columnVisible', () => heard.push(type));
        }

        api.setColumnsVisible(['c1'], false);
        await asyncSetTimeout(0);
        const onHide = heard.splice(0);
        api.moveColumns(['c2'], 0);
        await asyncSetTimeout(0);
        const onMove = heard.splice(0);

        expect({ onHide, onMove }).toEqual({
            onHide: [
                'columnContainerWidthChanged',
                'displayedColumnsWidthChanged',
                'virtualColumnsChanged',
                'displayedColumnsChanged',
                'columnVisible',
            ],
            onMove: ['virtualColumnsChanged', 'displayedColumnsChanged', 'columnMoved'],
        });
    });
});

describe('the rows drawn for the columns', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    /** The first row's drawn cells, as `colId:width`. */
    const drawnRow = (api: GridApi): string =>
        Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index="0"] .ag-cell'))
            .map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`)
            .join(' ');

    test('the cells at the first, last and pinned edges are marked as the edges move', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: ['a', 'b', 'c', 'd'].map((colId) => ({ colId })),
            rowData: [{}],
        });
        const edges = (): string =>
            Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index="0"] .ag-cell'))
                .map((cell) => {
                    const marks = [
                        ['ag-column-first', 'F'],
                        ['ag-column-last', 'L'],
                        ['ag-cell-last-left-pinned', '<'],
                        ['ag-cell-first-right-pinned', '>'],
                    ]
                        .filter(([cls]) => cell.classList.contains(cls))
                        .map(([, mark]) => mark)
                        .join('');
                    return `${cell.getAttribute('col-id')}${marks}`;
                })
                .sort()
                .join(' ');
        await waitFor(() => expect(edges()).toBe('aF b c dL'));
        const seen: string[] = [];

        api.setColumnsVisible(['a'], false);
        seen.push(edges());
        api.moveColumns(['b'], 2);
        seen.push(edges());
        api.setColumnsPinned(['d'], 'left');
        api.setColumnsPinned(['c'], 'right');
        seen.push(edges());
        api.setColumnsPinned(['c', 'd'], null);
        api.setColumnsVisible(['a'], true);
        seen.push(edges());

        expect(seen).toEqual(['bF c dL', 'b cF dL', 'b cL> dF<', 'aF b c dL']);
    });

    test('a body row is numbered after the header rows a new column group adds', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
        });
        const ariaRowIndex = () =>
            getGridElement(api)!.querySelector<HTMLElement>('.ag-row[row-index="0"]')!.getAttribute('aria-rowindex');
        expect(ariaRowIndex()).toBe('2');

        api.setGridOption('columnDefs', [{ headerName: 'G', children: [{ field: 'a' }] }]);

        expect(ariaRowIndex()).toBe('3');
    });

    // a group open or close refreshes the columns outside a column update, and its rows are laid out before its layout events
    test('a column a group shows is drawn in the rows, and one it hides is gone from them, when a column listener runs', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { groupId: 'g', children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }] },
                { field: 'c' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        await waitFor(() => expect(drawnRow(api)).toBe('a:100px c:100px'));
        const seen: string[] = [];
        api.getColumn('c')!.addEventListener('leftChanged', () => seen.push(drawnRow(api)));

        api.setColumnGroupOpened('g', true);
        api.setColumnGroupOpened('g', false);

        expect(seen).toEqual(['a:100px b:100px c:100px', 'a:100px c:100px']);
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

    test('a listener throwing while pivot mode is switched on leaves the grid told of the switch', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
                { field: 'd' },
            ],
            rowData: [{ a: 1, b: 'x', c: 3, d: 4 }],
        });
        let thrown = 0;
        for (const colId of ['a', 'b', 'c', 'd']) {
            for (const type of ['leftChanged', 'widthChanged', 'visibleChanged'] as const) {
                api.getColumn(colId)!.addEventListener(type, () => {
                    ++thrown;
                    throw new Error('listener failed');
                });
            }
        }
        const pivotModeChanges: boolean[] = [];
        api.addEventListener('columnPivotModeChanged', () => pivotModeChanges.push(api.isPivotMode()));

        expect(() => api.setGridOption('pivotMode', true)).toThrow('listener failed');

        expect(thrown).toBeGreaterThan(0);
        await waitFor(() => expect(pivotModeChanges).toEqual([true]));
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

    test('a pivot result column redefined with others is told once every one is in place', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'c', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData: [{ a: 1, b: 'x', c: 3 }],
        });
        api.setPivotResultColumns([
            { colId: 'x', field: 'c' },
            { colId: 'y', field: 'c' },
        ]);
        const seen: string[] = [];
        api.getColumn('x')!.addEventListener('colDefChanged', () =>
            seen.push(
                api
                    .getPivotResultColumns()!
                    .map((column) => column.getColId())
                    .join()
            )
        );

        api.setPivotResultColumns([
            { colId: 'x', field: 'c', headerName: 'X' },
            { colId: 'y', field: 'c' },
            { colId: 'z', field: 'c' },
        ]);

        expect(seen).toEqual(['x,y,z']);
    });
});

describe('the column events of one call', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, RowGroupingModule, RowSelectionModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = (columnDefs: ColDef[] = [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }]) =>
        gridsManager.createGrid('myGrid', {
            columnDefs,
            defaultColDef: { width: 100 },
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });

    const ids = (columns: Column[] | null) => (columns ?? []).map((column) => column.getColId()).join();

    test('a column hidden with others by applyColumnState is told once every one is hidden and laid out', () => {
        const api = createGrid();
        const a = api.getColumn('a')!;
        const seen: string[] = [];
        a.addEventListener('visibleChanged', () => seen.push(`visible:${ids(api.getAllDisplayedColumns())}`));
        a.addEventListener('columnStateUpdated', () => seen.push(`state:${ids(api.getAllDisplayedColumns())}`));

        api.applyColumnState({
            state: [
                { colId: 'a', hide: true },
                { colId: 'c', hide: true },
            ],
        });

        expect(seen).toEqual(['visible:b,d', 'state:b,d']);
    });

    test('a column hidden with others by new column definitions is told once every one is hidden and laid out', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => seen.push(ids(api.getAllDisplayedColumns())));

        api.setGridOption('columnDefs', [
            { field: 'a', hide: true },
            { field: 'b' },
            { field: 'c', hide: true },
            { field: 'd' },
        ]);

        expect(seen).toEqual(['b,d']);
    });

    test('a column hidden with others by setColumnsVisible is told once every one is hidden and laid out', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => seen.push(ids(api.getAllDisplayedColumns())));

        api.setColumnsVisible(['a', 'c'], false);

        expect(seen).toEqual(['b,d']);
    });

    test('a column a reset shows with others is told once every one is reset and laid out', () => {
        const api = createGrid([{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }]);
        api.applyColumnState({
            state: [
                { colId: 'a', hide: true },
                { colId: 'c', hide: true },
            ],
        });
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => seen.push(ids(api.getAllDisplayedColumns())));

        api.resetColumnState();

        expect(seen).toEqual(['a,b,c,d']);
    });

    test('a column a listener destroys is told nothing of the change queued for it', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () =>
            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }, { field: 'd' }])
        );
        api.getColumn('c')!.addEventListener('visibleChanged', () => seen.push('c'));

        api.applyColumnState({
            state: [
                { colId: 'a', hide: true },
                { colId: 'c', hide: true },
            ],
        });

        expect(seen).toEqual([]);
        expect(api.getColumn('c')).toBeNull();
    });

    test('a column pinned with others is told once every one is pinned and laid out', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('columnStateUpdated', () =>
            seen.push(`${ids(api.getDisplayedLeftColumns())}|${ids(api.getDisplayedCenterColumns())}`)
        );

        api.setColumnsPinned(['a', 'c'], 'left');

        expect(seen).toEqual(['a,c|b,d']);
    });

    test('a column sorted from its header is told once the sort it replaces is cleared', async () => {
        const api = createGrid([{ field: 'a', sort: 'asc' }, { field: 'b' }, { field: 'c' }, { field: 'd' }]);
        const seen: string[] = [];
        api.getColumn('b')!.addEventListener('sortChanged', () => seen.push(`a:${api.getColumn('a')!.getSort()}`));

        const label = getGridElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="b"] .ag-header-cell-label'
        )!;
        await userEvent.setup().click(label);

        expect(seen).toEqual(['a:null']);
        expect(api.getColumn('b')!.getSort()).toBe('asc');
    });

    test('a column state update carries the column, the source and the grid, like the other column events', () => {
        const api = createGrid();
        const a = api.getColumn('a')!;
        const seen: unknown[] = [];
        a.addEventListener('columnStateUpdated', (event) => {
            const { type, column, columns, source } = event;
            seen.push({ type, key: (event as ColumnStateUpdatedEvent).key, column, columns, source });
            seen.push(event.api === api);
        });

        api.setColumnsPinned(['a'], 'left');

        expect(seen).toEqual([
            { type: 'columnStateUpdated', key: 'pinned', column: a, columns: [a], source: 'api' },
            true,
        ]);
    });

    test('a column a listener resizes during a sort is told its width before the click ends', async () => {
        const api = createGrid();
        const seen: number[] = [];
        api.getColumn('b')!.addEventListener('sortChanged', () => api.setColumnWidths([{ key: 'c', newWidth: 150 }]));
        api.getColumn('c')!.addEventListener('widthChanged', () => seen.push(api.getColumn('c')!.getActualWidth()));

        const label = getGridElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="b"] .ag-header-cell-label'
        )!;
        await userEvent.setup().click(label);

        expect(seen).toEqual([150]);
    });

    test('a column grouped with others is told once every one is grouped', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('columnRowGroupChanged', () => seen.push(ids(api.getRowGroupColumns())));

        api.setRowGroupColumns(['a', 'c']);

        expect(seen).toEqual(['a,c']);
    });

    test('a group column redefined by a new defaultColDef is told once every column holds it', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', rowGroup: true }, { field: 'b', rowGroup: true }, { field: 'c' }],
            groupDisplayType: 'multipleColumns',
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        const seen: string[] = [];
        api.getColumn('ag-Grid-AutoColumn-a')!.addEventListener('colDefChanged', () =>
            seen.push(
                `${api.getColumn('ag-Grid-AutoColumn-b')!.getColDef().width}:${api.getColumn('c')!.getColDef().width}`
            )
        );

        api.setGridOption('defaultColDef', { width: 150 });

        expect(seen).toEqual(['150:150']);
    });

    test('the group columns a new autoGroupColumnDef redefines are told once all hold it, and resized together', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', rowGroup: true }, { field: 'b', rowGroup: true }, { field: 'c' }],
            groupDisplayType: 'multipleColumns',
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        await asyncSetTimeout(0);
        const seen: number[] = [];
        api.getColumn('ag-Grid-AutoColumn-a')!.addEventListener('colDefChanged', () =>
            seen.push(api.getColumn('ag-Grid-AutoColumn-b')!.getActualWidth())
        );
        const resized: string[] = [];
        api.addEventListener('columnResized', (event) => resized.push(ids(event.columns)));

        api.setGridOption('autoGroupColumnDef', { width: 150 });

        expect(seen).toEqual([150]);
        await asyncSetTimeout(0);
        expect(resized).toEqual(['ag-Grid-AutoColumn-a,ag-Grid-AutoColumn-b']);
    });

    test('the selection column redefined by a new selectionColumnDef is told once it holds the new state', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowSelection: { mode: 'multiRow' },
            rowData: [{ a: 1 }],
        });
        const selectionCol = api.getColumn('ag-Grid-SelectionColumn')!;
        const seen: number[] = [];
        selectionCol.addEventListener('colDefChanged', () => seen.push(selectionCol.getActualWidth()));

        api.setGridOption('selectionColumnDef', { width: 80 });

        expect(seen).toEqual([80]);
    });

    test('a group column shown by expanding is told once every group column it reveals is shown', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true },
                { field: 'b', rowGroup: true },
                { field: 'c', rowGroup: true },
                { field: 'd' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });
        const seen: boolean[] = [];
        api.getColumn('ag-Grid-AutoColumn-b')!.addEventListener('visibleChanged', () =>
            seen.push(api.getColumn('ag-Grid-AutoColumn-c')!.isVisible())
        );

        api.expandAll();

        await waitFor(() => expect(seen).toEqual([true]));
    });

    test('a group column redefined by a row group move is told once the columns hold the new order', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', rowGroup: true }, { field: 'b', rowGroup: true }, { field: 'c' }],
            groupDisplayType: 'multipleColumns',
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        const seen: string[] = [];
        api.getColumn('ag-Grid-AutoColumn-a')!.addEventListener('colDefChanged', () =>
            seen.push(ids(api.getAllGridColumns()))
        );

        api.moveRowGroupColumn(0, 1);

        expect(seen).toEqual([ids(api.getAllGridColumns())]);
    });

    test("a column a listener changes again before being told is told once, by the listener's update", () => {
        const api = createGrid();
        const c = api.getColumn('c')!;
        const seen: boolean[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => api.setColumnsVisible(['c'], true));
        c.addEventListener('visibleChanged', () => seen.push(c.isVisible()));

        api.applyColumnState({
            state: [
                { colId: 'a', hide: true },
                { colId: 'c', hide: true },
            ],
        });

        expect(seen).toEqual([true]);
    });

    test('a column a listener changes again after being told is told again, of its final state', () => {
        const api = createGrid();
        const a = api.getColumn('a')!;
        const seen: boolean[] = [];
        a.addEventListener('visibleChanged', () => seen.push(a.isVisible()));
        a.addEventListener('visibleChanged', () => api.setColumnsVisible(['a'], true));

        api.applyColumnState({ state: [{ colId: 'a', hide: true }] });

        expect(seen).toEqual([false, true]);
    });

    test('a column update made from one of them is kept, and the rest are told after it', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => api.setColumnsVisible(['b'], false));
        api.getColumn('c')!.addEventListener('visibleChanged', () => seen.push(ids(api.getAllDisplayedColumns())));

        api.applyColumnState({
            state: [
                { colId: 'a', hide: true },
                { colId: 'c', hide: true },
            ],
        });

        expect(seen).toEqual(['d']);
        expect(ids(api.getAllDisplayedColumns())).toBe('d');
    });

    test('the grid events of an update a column listener makes follow those of the call that told it', async () => {
        const api = createGrid();
        const seen: string[] = [];
        api.addEventListener('columnVisible', (event) => seen.push(`visible:${ids(event.columns)}`));
        api.addEventListener('columnPinned', (event) => seen.push(`pinned:${ids(event.columns)}`));
        api.getColumn('b')!.addEventListener('visibleChanged', () => api.setColumnsPinned(['d'], 'left'));

        api.setColumnsVisible(['b'], false);
        await asyncSetTimeout(0);

        expect(seen).toEqual(['visible:b', 'pinned:d']);
    });

    test('a column a listener hides while a sort is told is reported by the listener alone', async () => {
        const api = createGrid();
        const seen: string[] = [];
        api.addEventListener('sortChanged', (event) => seen.push(`sort:${ids(event.columns ?? null)}`));
        api.addEventListener('columnVisible', (event) => seen.push(`visible:${ids(event.columns)}`));
        api.getColumn('a')!.addEventListener('sortChanged', () => api.setColumnsVisible(['c'], false));

        api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
        await asyncSetTimeout(0);

        expect(seen).toEqual(['sort:a', 'visible:c']);
    });

    test('an aggregation change made from a column event tells its column once the listener returns, within the call', () => {
        const api = createGrid([{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd', aggFunc: 'sum' }]);
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            seen.push('call');
            api.setColumnAggFunc('d', 'avg');
            seen.push('returned');
        });
        api.getColumn('d')!.addEventListener('columnStateUpdated', (event) =>
            seen.push(`d:${'key' in event ? event.key : ''}`)
        );

        api.applyColumnState({ state: [{ colId: 'a', hide: true }] });

        expect(seen).toEqual(['call', 'returned', 'd:aggFunc']);
    });

    test('a column moved again by an update made from another column event is told once, of where it ends', () => {
        const api = createGrid();
        const c = api.getColumn('c')!;
        const seen: number[] = [];
        c.addEventListener('leftChanged', () => seen.push(c.getLeft()!));
        api.getColumn('b')!.addEventListener('visibleChanged', () => api.setColumnsVisible(['a'], false));

        api.applyColumnState({ state: [{ colId: 'b', hide: true }] });

        expect(seen).toEqual([0]);
    });

    test('a column whose sort one call changes twice is told once, in the place of its first event, of the sort it ends with', () => {
        const api = createGrid();
        const a = api.getColumn('a')!;
        const b = api.getColumn('b')!;
        const seen: string[] = [];
        a.addEventListener('sortChanged', () => seen.push(`a:${a.getSort()}`));
        a.addEventListener('columnStateUpdated', (event) => seen.push(`a-state:${'key' in event ? event.key : ''}`));
        b.addEventListener('sortChanged', () => seen.push(`b:${b.getSort()}`));

        api.applyColumnState({
            state: [
                { colId: 'a', sort: 'asc' },
                { colId: 'b', sort: 'asc' },
                { colId: 'a', sort: 'desc' },
            ],
        });

        expect(seen).toEqual(['a:desc', 'a-state:sort', 'b:asc']);
    });

    test('a column one call ungroups and groups again is told once', () => {
        const api = createGrid([{ field: 'a', rowGroup: true }, { field: 'b' }, { field: 'c' }, { field: 'd' }]);
        const a = api.getColumn('a')!;
        const seen: string[] = [];
        a.addEventListener('columnRowGroupChanged', () => seen.push(`grouped:${a.isRowGroupActive()}`));

        api.applyColumnState({
            state: [
                { colId: 'a', rowGroup: false },
                { colId: 'a', rowGroup: true },
            ],
        });

        expect(seen).toEqual(['grouped:true']);
    });

    test('a listener throwing stops none of the other columns being told, and the call throws its error after them', () => {
        const api = createGrid();
        const c = api.getColumn('c')!;
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            throw new Error('listener failed');
        });
        c.addEventListener('visibleChanged', () => seen.push(`${c.isVisible()}:${ids(api.getAllDisplayedColumns())}`));

        expect(() =>
            api.applyColumnState({
                state: [
                    { colId: 'a', hide: true },
                    { colId: 'c', hide: true },
                ],
            })
        ).toThrow('listener failed');
        expect(seen).toEqual(['false:b,d']);

        // nothing is left over to be told again
        api.applyColumnState({ state: [{ colId: 'c', hide: false }] });

        expect(seen).toEqual(['false:b,d', 'true:b,c,d']);
    });

    test('a listener throwing during an update another listener makes throws from the outer call, not into the listener', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            try {
                api.setColumnsVisible(['b', 'd'], false);
            } catch {
                seen.push('caught');
            }
        });
        api.getColumn('b')!.addEventListener('visibleChanged', () => {
            throw new Error('listener failed');
        });
        api.getColumn('d')!.addEventListener('visibleChanged', () => seen.push('d'));

        expect(() => api.applyColumnState({ state: [{ colId: 'a', hide: true }] })).toThrow('listener failed');

        expect(seen).toEqual(['d']);
    });

    test('a listener throwing during an aggregation change leaves the rows aggregated with the new function', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'g', rowGroup: true },
                { field: 'v', aggFunc: 'sum' },
            ],
            rowData: [
                { g: 'x', v: 1 },
                { g: 'x', v: 3 },
            ],
        });
        api.getColumn('v')!.addEventListener('columnStateUpdated', () => {
            throw new Error('listener failed');
        });

        expect(() => api.setColumnAggFunc('v', 'max')).toThrow('listener failed');

        expect(api.getDisplayedRowAtIndex(0)!.aggData).toEqual({ v: 3 });
    });

    test('a column state applied with a total mode that makes a value column is told once every state is applied', () => {
        const api = createGrid([{ field: 'a' }, { field: 'amount' }, { field: 'c' }]);
        const seen: unknown[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            seen.push({
                cVisible: api.getColumn('c')!.isVisible(),
                amountIsValue: api.getColumn('amount')!.isValueActive(),
            });
        });

        api.applyColumnState({
            state: [
                { colId: 'a', hide: true },
                { colId: 'amount', showValuesAs: 'percentOfGrandTotal' },
                { colId: 'c', hide: true },
            ],
        });

        expect(seen).toEqual([{ cVisible: false, amountIsValue: true }]);
    });

    test('a listener throwing during a row group column move leaves the rows grouped in the new order', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'g1', rowGroup: true },
                { field: 'g2', rowGroup: true },
            ],
            groupDisplayType: 'multipleColumns',
            rowData: [{ g1: 'a', g2: 'x' }],
        });
        api.getColumn('ag-Grid-AutoColumn-g1')!.addEventListener('leftChanged', () => {
            throw new Error('listener failed');
        });

        expect(() => api.moveRowGroupColumn(0, 1)).toThrow('listener failed');

        expect(api.getDisplayedRowAtIndex(0)!.field).toBe('g2');
    });

    test('a column redefined by data type inference is told once every inferred column holds its type', () => {
        // no rows yet, so the types are inferred from the first rows set
        const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }, { field: 'b' }] });
        const seen: unknown[] = [];
        api.getColumn('a')!.addEventListener('colDefChanged', () =>
            seen.push(api.getColumn('b')!.getColDef().cellDataType)
        );

        api.setGridOption('rowData', [{ a: 1, b: 2 }]);

        expect(seen).toEqual(['number']);
    });

    test('a row group column a column listener adds while it is told is grouped by once the call returns', () => {
        const api = createGrid();
        api.getColumn('a')!.addEventListener('visibleChanged', () => api.addRowGroupColumns(['b']));

        api.setColumnsVisible(['a'], false);

        expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
        expect(api.getDisplayedRowAtIndex(0)!.group).toBe(true);
    });

    test('column definitions a column listener sets do not keep the next row group change from raising columnEverythingChanged', async () => {
        const api = createGrid();
        let everythingChanged = 0;
        api.addEventListener('columnEverythingChanged', () => ++everythingChanged);
        api.getColumn('a')!.addEventListener('visibleChanged', () =>
            api.setGridOption('columnDefs', [
                { field: 'a', hide: true },
                { field: 'b' },
                { field: 'c' },
                { field: 'd' },
            ])
        );
        api.setColumnsVisible(['a'], false);
        await asyncSetTimeout(0);
        const before = everythingChanged;

        api.addRowGroupColumns(['b']);

        await waitFor(() => expect(everythingChanged).toBe(before + 1));
    });

    test('a row group column a column listener adds when new default column definitions are told raises columnEverythingChanged', async () => {
        const api = createGrid();
        await asyncSetTimeout(0);
        let everythingChanged = 0;
        api.addEventListener('columnEverythingChanged', () => ++everythingChanged);
        api.getColumn('a')!.addEventListener('colDefChanged', () => api.addRowGroupColumns(['b']));

        api.setGridOption('defaultColDef', { width: 150 });

        // one for the new definitions, one for the row group column the listener adds
        await waitFor(() => expect(everythingChanged).toBe(2));
        expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
    });

    test('a row group column one column listener adds is grouped by even when another listener of the call throws', () => {
        const api = createGrid();
        api.getColumn('a')!.addEventListener('visibleChanged', () => api.addRowGroupColumns(['b']));
        api.getColumn('c')!.addEventListener('visibleChanged', () => {
            throw new Error('listener failed');
        });

        expect(() => api.setColumnsVisible(['a', 'c'], false)).toThrow('listener failed');

        expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
        expect(api.getDisplayedRowAtIndex(0)!.group).toBe(true);
    });

    test('a listener throwing during a sort from the header leaves the rows sorted', async () => {
        let headerParams: IHeaderParams | undefined;
        class Header implements IHeaderComp {
            private readonly eGui = document.createElement('div');
            public init(params: IHeaderParams): void {
                headerParams = params;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return true;
            }
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', headerComponent: Header }],
            rowData: [{ a: 2 }, { a: 1 }],
        });
        await waitFor(() => expect(headerParams).toBeDefined());
        api.getColumn('a')!.addEventListener('sortChanged', () => {
            throw new Error('listener failed');
        });

        expect(() => headerParams!.setSort('asc')).toThrow('listener failed');

        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((node) => values.push(node.data.a));
        expect(values).toEqual([1, 2]);
    });
});

describe('the column events of a column tool panel apply', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const ids = (columns: Column[] | null) => (columns ?? []).map((column) => column.getColId()).join();

    test('a column grouped with others by an apply is told once the apply has laid them out', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeTruthy();
            return panel;
        });
        const strategy: IColumnStateUpdateStrategy = toolPanel.beans.columnStateUpdateStrategy;
        const a = api.getColumn('a') as AgColumn;
        const seen: string[] = [];
        a.addEventListener('columnRowGroupChanged', () => seen.push(ids(api.getAllDisplayedColumns())));

        strategy.setRowGroupColumns(true, [a, api.getColumn('c') as AgColumn], 'toolPanelUi');
        strategy.commit(true);

        expect(seen).toEqual([ids(api.getAllDisplayedColumns())]);
        expect(api.getAllDisplayedColumns()[0].getColId()).toBe('ag-Grid-AutoColumn');
    });

    test('a column listener resizing a column during an apply leaves the apply reporting its own source', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeTruthy();
            return panel;
        });
        const strategy: IColumnStateUpdateStrategy = toolPanel.beans.columnStateUpdateStrategy;
        const sources: string[] = [];
        // `b` is moved by the apply alone: the listener resizes `d`, to its right
        api.getColumn('b')!.addEventListener('leftChanged', (event) => sources.push(event.source));
        api.getColumn('a')!.addEventListener('visibleChanged', () =>
            api.setColumnWidths([{ key: 'd', newWidth: 150 }])
        );

        strategy.setColumnsVisible(true, [api.getColumn('a') as AgColumn], false, 'toolPanelUi');
        strategy.commit(true);

        expect(sources).toEqual(['toolPanelUi']);
    });

    test('a listener throwing during an apply leaves the next operation telling its columns once they are final', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeTruthy();
            return panel;
        });
        const strategy: IColumnStateUpdateStrategy = toolPanel.beans.columnStateUpdateStrategy;
        const a = api.getColumn('a') as AgColumn;
        let fail = true;
        a.addEventListener('columnRowGroupChanged', () => {
            if (fail) {
                fail = false;
                throw new Error('listener failed');
            }
        });
        // a visibility op after a role op closes and reopens the apply's update, and the close raises the role events
        strategy.setRowGroupColumns(true, [a], 'toolPanelUi');
        strategy.setColumnsVisible(true, [api.getColumn('b') as AgColumn], false, 'toolPanelUi');
        expect(() => strategy.commit(true)).toThrow('listener failed');
        // the operations after the throw are applied all the same
        expect(api.getColumn('b')!.isVisible()).toBe(false);
        expect(strategy.hasPendingChanges(true)).toBe(false);

        const seen: string[] = [];
        api.getColumn('c')!.addEventListener('visibleChanged', () => seen.push(ids(api.getAllDisplayedColumns())));
        api.applyColumnState({
            state: [
                { colId: 'c', hide: true },
                { colId: 'd', hide: true },
            ],
        });

        expect(seen).toEqual([ids(api.getAllDisplayedColumns())]);
        expect(api.getColumn('c')!.isVisible() || api.getColumn('d')!.isVisible()).toBe(false);
    });
});

describe('the column events of a tool panel drop on the body while pivoting', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a column given a role by the drop is told once every dropped column holds its role', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    headerName: 'Medals',
                    children: [
                        { field: 'country', enableRowGroup: true },
                        { field: 'gold', enableValue: true },
                    ],
                },
            ],
            rowData: [{ country: 'UK', gold: 1 }],
            pivotMode: true,
            allowDragFromColumnsToolPanel: true,
            suppressDragLeaveHidesColumns: true,
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const handle = await waitFor(() => {
            const found = gridElement.querySelector<HTMLElement>('.ag-column-select-column-group-drag-handle');
            expect(found).not.toBeNull();
            return found!;
        });
        const viewport = gridElement.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const seen: string[] = [];
        api.getColumn('gold')!.addEventListener('columnValueChanged', () =>
            seen.push(
                api
                    .getRowGroupColumns()
                    .map((column) => column.getColId())
                    .join()
            )
        );
        const sources: string[] = [];
        api.addEventListener('columnRowGroupChanged', (event) => sources.push(event.source));

        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(handle, 10, 10);
            await dispatcher.movePointer(viewport, 50, 100);
            await dispatcher.movePointer(viewport, 60, 100);
            await dispatcher.finishDrag(viewport);
        } finally {
            dispatcher.reset();
        }

        expect(seen).toEqual(['country']);
        await waitFor(() => expect(sources).toEqual(['toolPanelDragAndDrop']));
    });
});

describe('the column group events of one call', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = (openByDefault: boolean) =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { groupId: 'g1', openByDefault, children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }] },
                { groupId: 'g2', openByDefault, children: [{ field: 'c' }, { field: 'd', columnGroupShow: 'open' }] },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });

    const ids = (api: GridApi) =>
        api
            .getAllDisplayedColumns()
            .map((column) => column.getColId())
            .join();

    test('a group opened with others is told once every group is opened and the columns laid out', () => {
        const api = createGrid(false);
        const seen: string[] = [];
        api.getProvidedColumnGroup('g1')!.addEventListener('expandedChanged', () =>
            seen.push(`${api.getProvidedColumnGroup('g2')!.isExpanded()}:${ids(api)}`)
        );

        api.setColumnGroupState([
            { groupId: 'g1', open: true },
            { groupId: 'g2', open: true },
        ]);

        expect(seen).toEqual(['true:a,b,c,d']);
    });

    test('a group a hide makes unexpandable is told once every column is hidden and laid out', () => {
        const api = createGrid(true);
        const seen: string[] = [];
        api.getProvidedColumnGroup('g1')!.addEventListener('expandableChanged', () => seen.push(ids(api)));

        api.setColumnsVisible(['b', 'd'], false);

        expect(seen).toEqual(['a,c']);
    });
});

describe('the header a column rebuild draws', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule, PivotModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('pivot mode switched on with nothing to pivot draws none of the columns it hides', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
        });
        const drawnHeaders = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell')).map((cell) =>
                cell.getAttribute('col-id')
            );
        await waitFor(() => expect(drawnHeaders()).toEqual(['a', 'b']));

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);

        expect({ displayed: api.getAllDisplayedColumns().length, drawnHeaders: drawnHeaders() }).toEqual({
            displayed: 0,
            drawnHeaders: [],
        });
    });
});
