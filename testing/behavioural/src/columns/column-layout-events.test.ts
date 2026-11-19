import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { DragEventDispatcher, GridRows, TestGridsManager, asyncSetTimeout, runToIdle } from 'ag-test-utils';

import type {
    AgColumn,
    ColDef,
    ColGroupDef,
    Column,
    ColumnGroup,
    ColumnStateUpdatedEvent,
    GridApi,
    GridOptions,
    ICellRendererParams,
    IColumnStateUpdateStrategy,
    IHeaderComp,
    IHeaderParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    RowSelectionModule,
    ScrollApiModule,
    TextFilterModule,
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

    test('a column pushed out of view with none arriving leaves the rendered columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: Array.from({ length: 30 }, (_, i) => ({ colId: `c${i}`, width: 100 })),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);
        const rendered = () => api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        const before = rendered();
        expect(before).not.toContain('c29');
        let told = 0;
        api.addEventListener('virtualColumnsChanged', () => ++told);

        // the last column drawn is pushed past the viewport, and the one before it takes no new column in
        api.setColumnWidths([{ key: before[before.length - 2], newWidth: 3000 }]);
        await asyncSetTimeout(0);

        expect({ rendered: rendered(), told }).toEqual({ rendered: before.slice(0, -1), told: 1 });
    });

    test('a move among columns out of view reports the displayed columns change but no virtual columns change', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: Array.from({ length: 30 }, (_, i) => ({ colId: `c${i}`, width: 100 })),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);
        const rendered = api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        expect(rendered).not.toContain('c28');
        const heard: string[] = [];
        api.addEventListener('virtualColumnsChanged', () => heard.push('virtualColumnsChanged'));
        api.addEventListener('displayedColumnsChanged', () => heard.push('displayedColumnsChanged'));

        api.moveColumns(['c28'], 29);
        await asyncSetTimeout(0);

        expect(heard).toEqual(['displayedColumnsChanged']);
    });

    test('a horizontal scroll bringing new columns into view reports its virtual columns change as after a scroll', async () => {
        const api = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs: Array.from({ length: 30 }, (_, i) => ({ colId: `c${i}`, width: 100 })),
                rowData: [{}],
                suppressColumnVirtualisation: false,
            },
            { modules: [ScrollApiModule] }
        );
        await asyncSetTimeout(0);
        const told: boolean[] = [];
        api.addEventListener('virtualColumnsChanged', (event) => told.push(event.afterScroll));

        api.ensureColumnVisible('c25');
        await asyncSetTimeout(0);

        expect(told).toEqual([true]);
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

    test('a grid created without columns reports no virtual columns change until columns arrive', async () => {
        let told = 0;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            rowData: [{}],
            onVirtualColumnsChanged: () => ++told,
        });
        await asyncSetTimeout(0);
        const atCreation = told;

        api.setGridOption('columnDefs', [{ colId: 'a' }]);
        await asyncSetTimeout(0);

        expect({ atCreation, told }).toEqual({ atCreation: 0, told: 1 });
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

    test('a column shown by setColumnsVisible is drawn in the rows when its visibleChanged listener runs', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', hide: true }, { field: 'c' }],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        await waitFor(() => expect(drawnRow(api)).toBe('a:100px c:100px'));
        const seen: string[] = [];
        api.getColumn('b')!.addEventListener('visibleChanged', () => seen.push(drawnRow(api)));

        api.setColumnsVisible(['b'], true);

        expect(seen).toEqual(['a:100px b:100px c:100px']);
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

    test('a column call keeps the cell of every column that stays rendered, and initialises only the cells that arrive', async () => {
        const inits: Record<string, number> = {};
        class CountingRenderer {
            private gui = document.createElement('span');
            init(params: ICellRendererParams) {
                const colId = params.column!.getColId();
                inits[colId] = (inits[colId] ?? 0) + 1;
            }
            getGui() {
                return this.gui;
            }
            refresh() {
                return true;
            }
        }
        const colIds = Array.from({ length: 30 }, (_, i) => `c${i}`);
        const api = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs: colIds.map((colId) => ({ colId, width: 100, cellRenderer: CountingRenderer })),
                rowData: [{}, {}, {}],
                suppressColumnVirtualisation: false,
            },
            { modules: [ScrollApiModule] }
        );
        // keyed by lane too: a column pinned or unpinned arrives in another container's row
        const readCells = () => {
            const cells = new Map<string, Element>();
            for (const row of getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index]')) {
                const rowIndex = row.getAttribute('row-index');
                for (const cell of row.querySelectorAll('.ag-cell[col-id]')) {
                    const lane = cell.closest('.ag-grid-pinned-left-cells') ? 'left' : 'centre';
                    cells.set(`${lane}:${rowIndex}:${cell.getAttribute('col-id')}`, cell);
                }
            }
            return cells;
        };
        await waitFor(() => expect(readCells().size).toBeGreaterThan(0));
        await asyncSetTimeout(0);

        // each step with whether it brings cells into the rows
        const steps: [string, () => void, boolean][] = [
            ['sort', () => api.applyColumnState({ state: [{ colId: 'c1', sort: 'asc' }] }), false],
            [
                'applyColumnState with the current width',
                () => api.applyColumnState({ state: [{ colId: 'c3', width: 100 }] }),
                false,
            ],
            ['setColumnsVisible on a visible column', () => api.setColumnsVisible(['c1'], true), false],
            ['moveColumns', () => api.moveColumns(['c3'], 1), false],
            // the columns after it move left, so the next one beyond the viewport comes into view
            ['hide', () => api.setColumnsVisible(['c2'], false), true],
            ['show', () => api.setColumnsVisible(['c2'], true), true],
            ['pin left', () => api.setColumnsPinned(['c4'], 'left'), true],
            ['unpin', () => api.setColumnsPinned(['c4'], null), true],
            ['setColumnWidths', () => api.setColumnWidths([{ key: 'c0', newWidth: 150 }]), false],
            [
                'equal columnDefs',
                () =>
                    api.setGridOption(
                        'columnDefs',
                        colIds.map((colId) => ({
                            colId,
                            width: colId === 'c0' ? 150 : 100,
                            cellRenderer: CountingRenderer,
                        }))
                    ),
                false,
            ],
            ['horizontal scroll', () => api.ensureColumnVisible('c25'), true],
        ];

        for (const [step, run, bringsCells] of steps) {
            const before = readCells();
            const initsBefore = { ...inits };
            run();
            await asyncSetTimeout(0);
            const after = readCells();

            const replaced: string[] = [];
            const arrived: Record<string, number> = {};
            for (const [key, cell] of after) {
                const previous = before.get(key);
                if (previous === undefined) {
                    const colId = key.split(':')[2];
                    arrived[colId] = (arrived[colId] ?? 0) + 1;
                } else if (previous !== cell) {
                    replaced.push(key);
                }
            }
            const grown: Record<string, number> = {};
            for (const colId of Object.keys(inits)) {
                const delta = inits[colId] - (initsBefore[colId] ?? 0);
                if (delta) {
                    grown[colId] = delta;
                }
            }

            const displayed = new Set(api.getAllDisplayedColumns().map((column) => column.getColId()));
            const leftBehind = [...after.keys()].filter((key) => !displayed.has(key.split(':')[2]));

            expect({ step, replaced, grown, leftBehind, brought: Object.keys(arrived).length > 0 }).toEqual({
                step,
                replaced: [],
                grown: arrived,
                leftBehind: [],
                brought: bringsCells,
            });
        }
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

    test('a column listener destroying the grid ends the call, telling no column after it', () => {
        const api = createGrid();
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            seen.push('a');
            api.destroy();
        });
        api.getColumn('c')!.addEventListener('visibleChanged', () => seen.push('c'));

        api.setColumnsVisible(['a', 'c'], false);

        expect([api.isDestroyed(), seen]).toEqual([true, ['a']]);
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

    test('the group columns a new autoGroupColumnDef redefines keep their row-group column names when told', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', rowGroup: true }, { field: 'b', rowGroup: true }, { field: 'c' }],
            groupDisplayType: 'multipleColumns',
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        await asyncSetTimeout(0);
        const names = () => ['a', 'b'].map((id) => api.getColumn(`ag-Grid-AutoColumn-${id}`)!.getColDef().headerName);
        const seen: unknown[][] = [];
        for (const id of ['a', 'b']) {
            api.getColumn(`ag-Grid-AutoColumn-${id}`)!.addEventListener('colDefChanged', () => seen.push(names()));
        }

        api.setGridOption('autoGroupColumnDef', { width: 150 });

        expect(seen).toEqual([
            ['A', 'B'],
            ['A', 'B'],
        ]);
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

    test('expanding shows every group column it reveals in one displayed columns change', async () => {
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
        await asyncSetTimeout(0);
        const seen: string[] = [];
        api.addEventListener('displayedColumnsChanged', () =>
            seen.push(ids(api.getAllDisplayedColumns().filter((c) => c.getColId().startsWith('ag-Grid-AutoColumn'))))
        );

        api.expandAll();

        await waitFor(() => expect(seen).toEqual(['ag-Grid-AutoColumn-a,ag-Grid-AutoColumn-b,ag-Grid-AutoColumn-c']));
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

    test('an aggregation change made from a column event tells its column once the listener returns and the rows are aggregated with it', () => {
        const api = createGrid([
            { field: 'a' },
            { field: 'b', rowGroup: true },
            { field: 'c' },
            { field: 'd', aggFunc: 'sum' },
        ]);
        const seen: string[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            seen.push('call');
            api.setColumnAggFunc('d', 'count');
            seen.push('returned');
        });
        api.getColumn('d')!.addEventListener('columnStateUpdated', (event) =>
            seen.push(`d:${'key' in event ? event.key : ''}:${api.getDisplayedRowAtIndex(0)!.aggData?.d}`)
        );

        api.applyColumnState({ state: [{ colId: 'a', hide: true }] });

        expect(seen).toEqual(['call', 'returned', 'd:aggFunc:1']);
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

    test('a column told by an earlier call is told again, not merged into the column now queued where it was', () => {
        const api = createGrid();
        const seen: string[] = [];
        for (const colId of ['a', 'b']) {
            const column = api.getColumn(colId)!;
            column.addEventListener('visibleChanged', (event) =>
                seen.push(`${colId}<-${event.column!.getColId()}:${column.isVisible()}`)
            );
        }

        api.applyColumnState({ state: [{ colId: 'a', hide: true }] });
        api.applyColumnState({
            state: [
                { colId: 'b', hide: true },
                { colId: 'a', hide: false },
            ],
        });

        expect(seen).toEqual(['a<-a:false', 'b<-b:false', 'a<-a:true']);
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
        const grouped: boolean[] = [];
        api.getColumn('a')!.addEventListener('visibleChanged', () => api.addRowGroupColumns(['b']));
        api.getColumn('b')!.addEventListener('columnRowGroupChanged', () =>
            grouped.push(api.getDisplayedRowAtIndex(0)!.group === true && api.getColumn('ag-Grid-AutoColumn') !== null)
        );

        api.setColumnsVisible(['a'], false);

        expect(grouped).toEqual([true]);
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

    test('a column that stops spanning the header height through new columnDefs draws its padding group', async () => {
        const defs = (suppressSpanHeaderHeight: boolean): (ColDef | ColGroupDef)[] => [
            { groupId: 'g', headerName: 'G', children: [{ colId: 'a' }] },
            { colId: 'b', suppressSpanHeaderHeight },
        ];
        const api = gridsManager.createGrid('myGrid', { columnDefs: defs(false), rowData: [{}] });
        await asyncSetTimeout(0);
        const groupRow = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-row-group .ag-header-group-cell'), (cell) =>
                cell.getAttribute('col-id')
            ).join();
        expect(groupRow()).toBe('g_0');

        api.setGridOption('columnDefs', defs(true));
        await asyncSetTimeout(0);

        expect(groupRow()).toBe('g_0,0_0');
    });

    test('hiding the column whose header has the focus removes its header', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', headerName: 'A' },
                { colId: 'b', headerName: 'B' },
            ],
            rowData: [{}],
        });
        await asyncSetTimeout(0);
        const headers = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell'), (cell) =>
                cell.getAttribute('col-id')
            ).join();
        api.setFocusedHeader('b');
        const focused = document.activeElement?.closest('.ag-header-cell')?.getAttribute('col-id');

        api.setColumnsVisible(['b'], false);
        await asyncSetTimeout(0);

        expect({ focused, headers: headers() }).toEqual({ focused: 'b', headers: 'a' });
    });

    test('a group of a column scrolled out of view is drawn once the column, or the group, sizes its header row', async () => {
        const defs = (sizedBy: 'column' | 'group' | null): (ColDef | ColGroupDef)[] => [
            { colId: 'a', width: 3000 },
            {
                groupId: 'g',
                headerName: 'G',
                autoHeaderHeight: sizedBy === 'group',
                children: [{ colId: 'x', autoHeaderHeight: sizedBy === 'column' }],
            },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs(null),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);
        const groupDrawn = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-group-text')).some(
                (text) => text.textContent === 'G'
            );
        const seen = [groupDrawn()];
        for (const sizedBy of ['column', null, 'group'] as const) {
            api.setGridOption('columnDefs', defs(sizedBy));
            await asyncSetTimeout(0);
            seen.push(groupDrawn());
        }

        expect(seen).toEqual([false, true, false, true]);
    });

    test('pivot mode switched on with nothing to pivot draws none of the columns it hides, and switched off draws them all again', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
            suppressColumnVirtualisation: false,
        });
        const drawn = () => {
            const ids = (selector: string) =>
                Array.from(getGridElement(api)!.querySelectorAll(selector), (el) => el.getAttribute('col-id')).join();
            return { headers: ids('.ag-header-cell'), cells: ids('.ag-row[row-index="0"] .ag-cell') };
        };
        await waitFor(() => expect(drawn()).toEqual({ headers: 'a,b', cells: 'a,b' }));

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);
        const pivoted = { displayed: api.getAllDisplayedColumns().length, ...drawn() };
        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);

        expect([pivoted, drawn()]).toEqual([
            { displayed: 0, headers: '', cells: '' },
            { headers: 'a,b', cells: 'a,b' },
        ]);
    });
});

describe('the rows a column update refreshes', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule, TextFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { id: '1', country: 'Ireland', sport: 'Rowing', gold: 1 },
        { id: '2', country: 'Ireland', sport: 'Boxing', gold: 3 },
        { id: '3', country: 'France', sport: 'Rowing', gold: 2 },
    ];

    function countRefreshes(api: GridApi): () => number {
        let refreshes = 0;
        api.addEventListener('modelUpdated', () => ++refreshes);
        return () => refreshes;
    }

    test('new column definitions that group and sort the rows refresh them once', async () => {
        const api = gridsManager.createGrid('groupAndSort', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            rowData,
            getRowId: ({ data }) => data.id,
        });
        await asyncSetTimeout(0);
        const refreshes = countRefreshes(api);

        await runToIdle(() =>
            api.setGridOption('columnDefs', [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport' },
                { field: 'gold', sort: 'desc' },
            ])
        );

        expect(refreshes()).toBe(1);
        await new GridRows(api, 'grouped and sorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF hidden id:2 country:"Ireland" sport:"Boxing" gold:3
            │ └── LEAF hidden id:1 country:"Ireland" sport:"Rowing" gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:3 country:"France" sport:"Rowing" gold:2
        `);
    });

    test('a filtered pivot result column that is replaced lets its rows back and draws no cell once gone', async () => {
        const drawn: string[] = [];
        const cellRenderer = (params: ICellRendererParams) => {
            drawn.push(params.column!.getColId());
            return String(params.value ?? '');
        };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowData,
            pivotMode: true,
        });
        api.setPivotResultColumns([{ colId: 'r1', field: 'gold', filter: 'agTextColumnFilter', cellRenderer }]);
        await asyncSetTimeout(0);
        const unfiltered = api.getDisplayedRowCount();
        expect(unfiltered).toBe(2);
        api.setFilterModel({ r1: { filterType: 'text', type: 'equals', filter: 'none' } });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(0);
        drawn.length = 0;

        api.setPivotResultColumns([{ colId: 'r2', field: 'gold', cellRenderer }]);
        await asyncSetTimeout(0);

        expect({ model: api.getFilterModel(), rows: api.getDisplayedRowCount(), drawn: [...new Set(drawn)] }).toEqual({
            model: {},
            rows: unfiltered,
            drawn: ['r2'],
        });
    });

    test('a filter on a column the update removes, as it groups the rows, lets its rows back in the same refresh', async () => {
        const api = gridsManager.createGrid('filterRemoved', {
            columnDefs: [{ field: 'country' }, { field: 'sport', filter: 'agTextColumnFilter' }, { field: 'gold' }],
            rowData,
            getRowId: ({ data }) => data.id,
        });
        api.setFilterModel({ sport: { filterType: 'text', type: 'equals', filter: 'Rowing' } });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
        const refreshes = countRefreshes(api);
        let filterChanges = 0;
        api.addEventListener('filterChanged', () => ++filterChanges);

        // releasing the removed column's filter does not refresh the rows a second time
        await runToIdle(() =>
            api.setGridOption('columnDefs', [{ field: 'country', rowGroup: true, hide: true }, { field: 'gold' }])
        );

        expect({ filterChanges, refreshes: refreshes() }).toEqual({ filterChanges: 1, refreshes: 1 });
        await new GridRows(api, 'filter released and grouped').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF hidden id:1 country:"Ireland" gold:1
            │ └── LEAF hidden id:2 country:"Ireland" gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:3 country:"France" gold:2
        `);
    });

    const pivotRowData = [
        { country: 'Ireland', year: '2000', gold: 1 },
        { country: 'Ireland', year: '2004', gold: 3 },
        { country: 'Ireland', year: '2008', gold: 2 },
        { country: 'France', year: '2012', gold: 5 },
        { country: 'France', year: '2000', gold: 4 },
    ];
    const pivotColumnDefs = (year: ColDef): ColDef[] => [
        { field: 'country', rowGroup: true },
        year,
        { field: 'gold', aggFunc: 'sum' },
    ];
    const pivotYears = (columns: readonly Column[] | null | undefined) =>
        columns!.map((column) => column.getColDef().pivotKeys![0]);
    const displayedPivotYears = (api: GridApi) => {
        const pivotIds = new Set(api.getPivotResultColumns()!.map((column) => column.getColId()));
        return pivotYears(api.getAllDisplayedColumns().filter((column) => pivotIds.has(column.getColId())));
    };

    /** Runs `update` on a pivot grid and returns the order of the pivot result columns and what its events said. */
    async function reversePivotSort(update: (api: GridApi) => void) {
        const api = gridsManager.createGrid('pivotSort', {
            columnDefs: pivotColumnDefs({ field: 'year', pivot: true }),
            rowData: pivotRowData,
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4));
        expect(displayedPivotYears(api)).toEqual(['2000', '2004', '2008', '2012']);
        const order: string[] = [];
        let moved: string[] = [];
        api.addEventListener('modelUpdated', () => order.push('modelUpdated'));
        api.addEventListener('columnMoved', (event) => {
            order.push('columnMoved');
            moved = pivotYears(event.columns).sort();
        });

        await runToIdle(() => update(api));

        return { order, moved, displayed: displayedPivotYears(api) };
    }

    test('applyColumnState reversing the pivot sort reverses the pivot result columns, telling which moved after the rows refresh', async () => {
        const { order, moved, displayed } = await reversePivotSort((api) =>
            api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] })
        );

        expect({ order, moved, displayed }).toEqual({
            order: ['modelUpdated', 'columnMoved'],
            moved: ['2000', '2004', '2008', '2012'],
            displayed: ['2012', '2008', '2004', '2000'],
        });
    });

    test('a columnDefs update reversing the pivot sort reverses the pivot result columns, refreshing the rows once', async () => {
        const { order, displayed } = await reversePivotSort((api) =>
            api.setGridOption('columnDefs', pivotColumnDefs({ field: 'year', pivot: true, pivotSort: 'desc' }))
        );

        expect({ refreshes: order.filter((type) => type === 'modelUpdated').length, displayed }).toEqual({
            refreshes: 1,
            displayed: ['2012', '2008', '2004', '2000'],
        });
    });

    const columnEvents = [
        'columnMoved',
        'columnsReset',
        'columnPivotChanged',
        'pivotMaxColumnsExceeded',
        'columnGroupOpened',
        'columnHeaderNameChanged',
        'sortChanged',
        'columnVisible',
        'columnPinned',
        'columnResized',
        'columnRowGroupChanged',
        'columnValueChanged',
        'columnPivotModeChanged',
        'columnEverythingChanged',
        'newColumnsLoaded',
        'gridColumnsChanged',
        'displayedColumnsChanged',
        'virtualColumnsChanged',
    ] as const;

    test('resetting the column state reorders the pivot result columns back to ascending, raising columnMoved then columnsReset, the last column event of the reset', async () => {
        const api = gridsManager.createGrid('pivotSortReset', {
            columnDefs: pivotColumnDefs({ field: 'year', pivot: true }),
            rowData: pivotRowData,
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4));
        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitFor(() => expect(displayedPivotYears(api)).toEqual(['2012', '2008', '2004', '2000']));
        await asyncSetTimeout(0);
        const refreshes = countRefreshes(api);
        const heard: string[] = [];
        for (const type of columnEvents) {
            api.addEventListener(type, () => heard.push(type));
        }

        await runToIdle(() => api.resetColumnState());

        expect(displayedPivotYears(api)).toEqual(['2000', '2004', '2008', '2012']);
        expect(heard.filter((type) => type === 'columnMoved' || type === 'columnsReset')).toEqual([
            'columnMoved',
            'columnsReset',
        ]);
        expect(heard[heard.length - 1]).toBe('columnsReset');
        expect(refreshes()).toBe(1);
    });

    test('a pivot column added while a filter is present refreshes the rows once, keeping the rendered rows', async () => {
        const api = gridsManager.createGrid('pivotWithFilter', {
            columnDefs: [
                { field: 'country', rowGroup: true, filter: 'agTextColumnFilter' },
                { field: 'year', pivot: true },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowData: pivotRowData.map((row) => ({ ...row, sport: 'Rowing' })),
            pivotMode: true,
        });
        await waitFor(() => expect(api.getPivotResultColumns()).toHaveLength(4));
        let removedRows = 0;
        api.addEventListener('virtualRowRemoved', () => ++removedRows);
        api.setFilterModel({ country: { filterType: 'text', type: 'contains', filter: 'Ire' } });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
        expect(Object.keys(api.getFilterModel())).toEqual(['country']);
        await asyncSetTimeout(0);
        // The filter removing France's row shows the listener hears a removed row.
        expect(removedRows).toBe(1);
        removedRows = 0;
        const rowElements = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-row[row-id="row-group-country-Ireland"]'));
        const irelandRows = rowElements();
        expect(irelandRows.length).toBeGreaterThan(0);
        const pivotKeys = () => api.getPivotResultColumns()!.map((column) => column.getColDef().pivotKeys!);
        // The Ireland rows' years: the France-only 2012 leaves with the filter.
        expect(pivotKeys()).toEqual([['2000'], ['2004'], ['2008']]);
        const refreshes: (boolean | undefined)[] = [];
        api.addEventListener('modelUpdated', (event) => refreshes.push(event.keepRenderedRows));

        await runToIdle(() => api.addPivotColumns(['sport']));

        expect({
            refreshes,
            removedRows,
            keptRowElements: rowElements().map((element, i) => element === irelandRows[i]),
            displayed: [api.getDisplayedRowAtIndex(0)?.key, api.getDisplayedRowCount()],
            pivots: api.getPivotColumns().map((column) => column.getColId()),
            pivotKeys: pivotKeys(),
        }).toEqual({
            refreshes: [true],
            removedRows: 0,
            keptRowElements: irelandRows.map(() => true),
            displayed: ['Ireland', 1],
            pivots: ['year', 'sport'],
            // Pivot groups are expandable by default with several pivot columns: each has its collapsed column.
            pivotKeys: [['2000', 'Rowing'], ['2000'], ['2004', 'Rowing'], ['2004'], ['2008', 'Rowing'], ['2008']],
        });
    });

    test('onSortChanged after the row data was changed out of band sorts the displayed rows by the current sort, refreshing them once', async () => {
        const data = [
            { id: '1', gold: 1 },
            { id: '2', gold: 2 },
            { id: '3', gold: 3 },
            { id: '4', gold: 4 },
        ];
        const api = gridsManager.createGrid('outOfBandSort', {
            columnDefs: [{ field: 'gold', sort: 'asc' }],
            rowData: data,
            getRowId: ({ data }) => data.id,
        });
        await asyncSetTimeout(0);
        const displayedIds = () =>
            Array.from({ length: api.getDisplayedRowCount() }, (_, i) => api.getDisplayedRowAtIndex(i)!.id);
        expect(displayedIds()).toEqual(['1', '2', '3', '4']);
        const refreshes = countRefreshes(api);
        let sortChanges = 0;
        api.addEventListener('sortChanged', () => ++sortChanges);

        data[0].gold = 9;
        await runToIdle(() => api.onSortChanged());

        expect({ sortChanges, refreshes: refreshes(), displayed: displayedIds() }).toEqual({
            sortChanges: 1,
            refreshes: 1,
            displayed: ['2', '3', '4', '1'],
        });
    });
});

describe('the column animations a column call leaves on', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const hasClass = (api: GridApi, cssClass: string) => {
        const grid = getGridElement(api)!;
        return grid.classList.contains(cssClass) || grid.querySelector(`.${cssClass}`) !== null;
    };
    const resizeAnimating = (api: GridApi) => hasClass(api, 'ag-animate-autosize');
    const moving = (api: GridApi) => hasClass(api, 'ag-column-moving');
    const cellLeft = (api: GridApi, colId: string) =>
        getGridElement(api)!.querySelector<HTMLElement>(`.ag-cell[col-id="${colId}"]`)!.style.left;
    const order = (api: GridApi) =>
        api
            .getAllDisplayedColumns()
            .map((column) => column.getColId())
            .join();

    const createFittingGrid = () =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            defaultColDef: { width: 300 },
            animateColumnResizing: true,
            rowData: [{}],
        });

    test('a fit to the width the columns already fill does not cut short the animation of the width change before it', async () => {
        const api = createFittingGrid();

        api.applyColumnState({ state: [{ colId: 'a', width: 400 }] });
        expect(resizeAnimating(api)).toBe(true);

        api.sizeColumnsToFit(700);

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([400, 300]);
        expect(resizeAnimating(api)).toBe(true);
        await waitFor(() => expect(resizeAnimating(api)).toBe(false));
    });

    const createGroupGrid = async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    groupId: 'g',
                    headerName: 'Group',
                    children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                },
                { colId: 'c' },
                { colId: 'd' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));
        return api;
    };

    /** Widens the group's first column, the next column change after the call under test. */
    const widenFirstGroupColumn = (api: GridApi) => {
        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        expect(api.getColumn('a')!.getActualWidth()).toBe(150);
    };

    test('opening a group makes the next column change slide', async () => {
        const api = await createGroupGrid();

        api.setColumnGroupOpened('g', true);
        expect(order(api)).toBe('a,b,c,d');
        expect(cellLeft(api, 'c')).toBe('200px');

        widenFirstGroupColumn(api);
        expect({ moving: moving(api), cLeft: cellLeft(api, 'c') }).toEqual({ moving: true, cLeft: '250px' });
    });

    const createLockedGrid = async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'year', lockPosition: 'left' },
                { colId: 'athlete' },
                { colId: 'country' },
                { colId: 'sport' },
            ],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));
        return api;
    };

    /** Widens athlete, the next column change after the call under test. */
    const widenAthlete = (api: GridApi) => {
        api.setColumnWidths([{ key: 'athlete', newWidth: 150 }]);
        expect(api.getColumn('athlete')!.getActualWidth()).toBe(150);
    };

    test('moving a column that is allowed to move makes the next column change slide', async () => {
        const api = await createLockedGrid();

        api.moveColumns(['sport'], 1);

        expect(order(api)).toBe('year,sport,athlete,country');
        expect(cellLeft(api, 'country')).toBe('300px');
        widenAthlete(api);
        expect({ moving: moving(api), countryLeft: cellLeft(api, 'country') }).toEqual({
            moving: true,
            countryLeft: '350px',
        });
    });

    test('a call made while a column move is still sliding does not cut the slide short when it changes nothing', async () => {
        // How long a move slides on a fake clock, timer to timer, with a no-op call landing at `callAtMs` or none.
        const slide = async (callAtMs: number | null) => {
            const api = await createLockedGrid();
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
            try {
                const start = Date.now();
                api.moveColumns(['sport'], 1);
                let movingAtCall: boolean | null = null;
                if (callAtMs !== null) {
                    await vi.advanceTimersByTimeAsync(callAtMs);
                    movingAtCall = moving(api);
                    api.applyColumnState({ state: api.getColumnState() });
                }
                for (let timers = 0; moving(api) && timers < 10; ++timers) {
                    await vi.advanceTimersToNextTimerAsync();
                }
                return { order: order(api), movingAtCall, slideEnded: !moving(api), elapsedMs: Date.now() - start };
            } finally {
                vi.useRealTimers();
                gridsManager.reset();
            }
        };

        const uninterrupted = await slide(null);
        const callAtMs = Math.floor(uninterrupted.elapsedMs / 2);
        const withCall = await slide(callAtMs);

        expect({ uninterrupted, withCall }).toEqual({
            uninterrupted: {
                order: 'year,sport,athlete,country',
                movingAtCall: null,
                slideEnded: true,
                elapsedMs: uninterrupted.elapsedMs,
            },
            withCall: {
                order: 'year,sport,athlete,country',
                movingAtCall: true,
                slideEnded: true,
                elapsedMs: uninterrupted.elapsedMs,
            },
        });
        expect(callAtMs).toBeGreaterThan(0);
    });

    const createAnimatedGrid = async (columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }]) => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            defaultColDef: { width: 300 },
            animateColumnResizing: true,
            rowData: [{}],
        });
        await waitFor(() => expect(moving(api)).toBe(false));
        return api;
    };

    test('trading width between two columns at an unchanged total animates the column that moved', async () => {
        const api = await createAnimatedGrid([{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b'), cLeft: cellLeft(api, 'c') }).toEqual(
            {
                resizeAnimating: false,
                bLeft: '300px',
                cLeft: '600px',
            }
        );

        api.applyColumnState({
            state: [
                { colId: 'a', width: 400 },
                { colId: 'b', width: 200 },
            ],
        });

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([400, 200, 300]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b'), cLeft: cellLeft(api, 'c') }).toEqual(
            {
                resizeAnimating: true,
                bLeft: '400px',
                cLeft: '600px',
            }
        );
        await waitFor(() => expect(resizeAnimating(api)).toBe(false));
    });

    test('a fit whose column limits trade width at the total the columns already fill animates the column that moved', async () => {
        // sizeColumnsToFit(params) fits the grid's width, which the layout mock sets to 1000
        const api = await createAnimatedGrid([
            { colId: 'a', width: 600 },
            { colId: 'b', width: 400 },
        ]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b') }).toEqual({
            resizeAnimating: false,
            bLeft: '600px',
        });

        api.sizeColumnsToFit({ columnLimits: [{ key: 'a', maxWidth: 500 }] });

        expect(api.getAllDisplayedColumns().map((column) => column.getActualWidth())).toEqual([500, 500]);
        expect({ resizeAnimating: resizeAnimating(api), bLeft: cellLeft(api, 'b') }).toEqual({
            resizeAnimating: true,
            bLeft: '500px',
        });
        await waitFor(() => expect(resizeAnimating(api)).toBe(false));
    });
});

describe('the column events of an updateGridOptions call changing column options', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { a: 'x', b: 'p', c: 1 },
        { a: 'x', b: 'q', c: 2 },
        { a: 'y', b: 'p', c: 3 },
    ];

    const createGroupedGrid = (options: GridOptions = {}) =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'b', rowGroup: true, hide: true },
                { field: 'c', aggFunc: 'sum' },
            ],
            rowData,
            ...options,
        });

    const settle = async () => {
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
    };

    const displayedIds = (api: GridApi) => api.getAllDisplayedColumns().map((column) => column.getColId());

    const autoGroupColumns = (api: GridApi) =>
        api.getAllGridColumns().filter((column) => column.getColId().startsWith('ag-Grid-AutoColumn'));

    test('one update changing defaultColDef and autoGroupColumnDef gives the auto group column its own header and width and every other column the default width', async () => {
        const api = createGroupedGrid();
        await settle();

        api.updateGridOptions({
            defaultColDef: { width: 140 },
            autoGroupColumnDef: { headerName: 'E', width: 222 },
        });
        await settle();

        const autoGroups = autoGroupColumns(api);
        expect(autoGroups.map((column) => api.getDisplayNameForColumn(column, 'header'))).toEqual(['E']);
        expect(autoGroups.map((column) => column.getActualWidth())).toEqual([222]);
        expect(
            api
                .getAllGridColumns()
                .filter((column) => !autoGroups.includes(column))
                .map((column) => `${column.getColId()}:${column.getActualWidth()}`)
        ).toEqual(['a:140', 'b:140', 'c:140']);
    });

    test('one update changing rowData and autoGroupColumnDef raises the new-data modelUpdated before columnEverythingChanged, ending with the new groups and header', async () => {
        const api = createGroupedGrid();
        await settle();
        // Listeners run after the update call returns: the event order and the end state are what a user observes.
        const heard: string[] = [];
        api.addEventListener('modelUpdated', (event) =>
            heard.push(event.newData ? 'modelUpdated:newData' : 'modelUpdated')
        );
        api.addEventListener('columnEverythingChanged', () => heard.push('columnEverythingChanged'));

        api.updateGridOptions({
            rowData: [
                { a: 'z', b: 'r', c: 5 },
                { a: 'w', b: 's', c: 6 },
            ],
            autoGroupColumnDef: { headerName: 'F' },
        });
        await settle();

        const topGroupKeys: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group && node.level === 0) {
                topGroupKeys.push(String(node.key));
            }
        });
        const newDataRefresh = heard.indexOf('modelUpdated:newData');
        expect({
            header: autoGroupColumns(api).map((column) => api.getDisplayNameForColumn(column, 'header')),
            topGroupKeys,
            newDataRefreshFirst: newDataRefresh >= 0 && newDataRefresh < heard.indexOf('columnEverythingChanged'),
        }).toEqual({ header: ['F'], topGroupKeys: ['z', 'w'], newDataRefreshFirst: true });
    });

    test.each([
        { mode: 'multiRow' as const, off: { mode: 'multiRow' as const, checkboxes: false, headerCheckbox: false } },
        { mode: 'singleRow' as const, off: { mode: 'singleRow' as const, checkboxes: false } },
    ])(
        'rowSelection in $mode mode turning its checkboxes on, off and on in three calls shows, removes and shows the selection column',
        async ({ mode, off }) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b' }],
                rowData,
                rowSelection: off,
            });
            await settle();
            expect(displayedIds(api)).toEqual(['a', 'b']);

            api.updateGridOptions({ rowSelection: { mode, checkboxes: true } });
            await settle();
            expect(displayedIds(api)).toEqual(['ag-Grid-SelectionColumn', 'a', 'b']);

            api.updateGridOptions({ rowSelection: off });
            await settle();
            expect(displayedIds(api)).toEqual(['a', 'b']);

            api.updateGridOptions({ rowSelection: { mode, checkboxes: true } });
            await settle();
            expect(displayedIds(api)).toEqual(['ag-Grid-SelectionColumn', 'a', 'b']);
        }
    );

    test('calculatedColumns enabled, disabled and enabled in three calls shows, removes and shows the calculated column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'c' }],
            rowData,
            calculatedColumns: false,
            initialState: {
                userColumns: [
                    {
                        colId: 'double',
                        created: true,
                        properties: [{ property: 'calculatedExpression', value: '[c] * 2' }],
                    },
                ],
            },
        });
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'c']);
        // Row 0 has c = 1, so its double is 2.
        const firstDouble = () => {
            const rowNode = api.getRowNode('0');
            return rowNode && api.getCellValue({ rowNode, colKey: 'double' });
        };

        api.setGridOption('calculatedColumns', true);
        await settle();
        expect({ ids: displayedIds(api), double: firstDouble() }).toEqual({ ids: ['a', 'c', 'double'], double: 2 });

        api.setGridOption('calculatedColumns', false);
        await settle();
        expect(displayedIds(api)).toEqual(['a', 'c']);

        api.setGridOption('calculatedColumns', true);
        await settle();
        expect({ ids: displayedIds(api), double: firstDouble() }).toEqual({ ids: ['a', 'c', 'double'], double: 2 });
    });

    // d is neither grouped nor aggregated, so pivot mode hides it.
    test.each<{
        option: keyof GridOptions;
        update: GridOptions;
        ids: string[];
        autoHeader: string | undefined;
        changesDisplayedColumns: boolean;
    }>([
        {
            option: 'groupDisplayType',
            update: { groupDisplayType: 'multipleColumns' },
            ids: ['ag-Grid-AutoColumn-a', 'ag-Grid-AutoColumn-b', 'c', 'd'],
            autoHeader: undefined,
            changesDisplayedColumns: true,
        },
        {
            option: 'autoGroupColumnDef',
            update: { autoGroupColumnDef: { headerName: 'G' } },
            ids: ['ag-Grid-AutoColumn', 'c', 'd'],
            autoHeader: 'G',
            changesDisplayedColumns: false,
        },
        {
            option: 'rowNumbers',
            update: { rowNumbers: true },
            ids: ['ag-Grid-RowNumbersColumn', 'ag-Grid-AutoColumn', 'c', 'd'],
            autoHeader: 'Group',
            changesDisplayedColumns: true,
        },
        {
            option: 'rowSelection',
            update: { rowSelection: { mode: 'multiRow' } },
            ids: ['ag-Grid-SelectionColumn', 'ag-Grid-AutoColumn', 'c', 'd'],
            autoHeader: 'Group',
            changesDisplayedColumns: true,
        },
        {
            option: 'pivotMode',
            update: { pivotMode: true },
            ids: ['ag-Grid-AutoColumn', 'c'],
            autoHeader: 'Group',
            changesDisplayedColumns: true,
        },
    ])(
        'one update changing only $option raises at most one displayed columns change, and one when the displayed columns change',
        async ({ option, update, ids, autoHeader, changesDisplayedColumns }) => {
            const api = createGroupedGrid({
                columnDefs: [
                    { field: 'a', rowGroup: true, hide: true },
                    { field: 'b', rowGroup: true, hide: true },
                    { field: 'c', aggFunc: 'sum' },
                    { field: 'd' },
                ],
            });
            await settle();
            expect(displayedIds(api)).toEqual(['ag-Grid-AutoColumn', 'c', 'd']);
            let displayedColumnsChanged = 0;
            api.addEventListener('displayedColumnsChanged', () => ++displayedColumnsChanged);

            await runToIdle(() => api.updateGridOptions(update));

            const auto = api.getColumn('ag-Grid-AutoColumn');
            expect({
                option: api.getGridOption(option),
                ids: displayedIds(api),
                autoHeader: auto ? api.getDisplayNameForColumn(auto, 'header') : undefined,
            }).toEqual({ option: update[option], ids, autoHeader });
            if (changesDisplayedColumns) {
                expect(displayedColumnsChanged).toBe(1);
            } else {
                expect(displayedColumnsChanged).toBeLessThanOrEqual(1);
            }
        }
    );
});
