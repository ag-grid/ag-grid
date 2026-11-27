import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { ALL_SEVERITIES, LEGACY_FILTER_WARNING_IDS, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type {
    ColDef,
    Column,
    ColumnGroup,
    ColumnStateUpdatedEvent,
    GridApi,
    ICellRendererComp,
    ICellRendererParams,
    IFilterComp,
    IHeaderComp,
    IHeaderParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    CustomFilterModule,
    RowSelectionModule,
    ScrollApiModule,
    enableDevValidations,
    getGridElement,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, ShowValuesAsModule } from 'ag-grid-enterprise';

// Listening to a deprecated event raises deprecation #306, which the global throw-on-validation setup would throw on.
beforeEach(() => {
    enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [306] });
});

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
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
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

    test('the columns drawn after sizeColumnsToFit at an unchanged total are those of a new grid with the same widths', async () => {
        const count = 30;
        const colDefs = () => Array.from({ length: count }, (_, i) => ({ field: 'c' + i }));
        const rowData = [Object.fromEntries(Array.from({ length: count }, (_, i) => ['c' + i, i]))];
        const limits = (wide: boolean) =>
            Array.from({ length: count }, (_, i) => {
                const wideMin = i === 0 ? 390 : 90;
                return { key: 'c' + i, minWidth: wide ? wideMin : 100 };
            });
        const ids = (selector: string, api: GridApi) =>
            Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>(selector)).map((el) =>
                el.getAttribute('col-id')
            );
        const drawn = (api: GridApi) => ({
            virtual: api.getAllDisplayedVirtualColumns().map((c) => c.getColId()),
            headers: ids('.ag-header-cell', api),
            cells: ids('.ag-row[row-index="0"] .ag-cell', api),
        });
        const totalWidth = (api: GridApi) => api.getColumns()!.reduce((sum, c) => sum + c.getActualWidth(), 0);

        for (const [first, second] of [
            [true, false],
            [false, true],
        ]) {
            const order = first ? 'wide then even' : 'even then wide';
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: colDefs(),
                rowData,
                suppressColumnVirtualisation: false,
            });
            await asyncSetTimeout(0);
            api.sizeColumnsToFit({ columnLimits: limits(first) });
            const firstTotal = totalWidth(api);
            api.sizeColumnsToFit({ columnLimits: limits(second) });
            const sameTotal = firstTotal === totalWidth(api);
            const widths = api.getColumns()!.map((c) => c.getActualWidth());
            await asyncSetTimeout(0);
            const fitted = drawn(api);
            gridsManager.reset();

            const fresh = gridsManager.createGrid('myGrid', {
                columnDefs: colDefs().map((def, i) => ({ ...def, width: widths[i] })),
                rowData,
                suppressColumnVirtualisation: false,
            });
            await asyncSetTimeout(0);
            expect({ order, sameTotal, drawn: fitted }).toEqual({ order, sameTotal: true, drawn: drawn(fresh) });
            gridsManager.reset();
        }
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

    // TODO: disabled due to AG-18901 - re-enable once fixed
    test.skip('a column listener told of a move reads the row as moved', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        await waitFor(() => expect(drawnRow(api)).toBe('a:100px b:100px c:100px'));
        const seen: string[] = [];
        api.getColumn('b')!.addEventListener('leftChanged', () => seen.push(drawnRow(api)));

        api.moveColumns(['a'], 2);

        expect(seen).toEqual(['b:100px c:100px a:100px']);
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
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
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

    test('a widthChanged listener throwing during setColumnWidths throws to the caller, and the next resize raises its own columnResized', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            defaultColDef: { width: 100 },
            rowData: [{}],
        });
        const resized: string[] = [];
        api.addEventListener('columnResized', (event) =>
            resized.push(
                `${(event.columns ?? []).map((column) => column.getColId())}:${event.finished}:${event.source}`
            )
        );
        let failing = true;
        api.getColumn('a')!.addEventListener('widthChanged', () => {
            if (failing) {
                throw new Error('listener boom');
            }
        });

        expect(() => api.setColumnWidths([{ key: 'a', newWidth: 333 }])).toThrow('listener boom');
        failing = false;
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        resized.length = 0;

        api.setColumnWidths([
            { key: 'a', newWidth: 150 },
            { key: 'c', newWidth: 222 },
        ]);

        await waitFor(() => expect(resized).toEqual(['a,c:true:api']), { timeout: 500 });
        expect(contiguousLefts(api)).toEqual(['a@0', 'b@150', 'c@250']);
        expect(api.getColumn('c')!.getActualWidth()).toBe(222);
    });

    test('a columnStateUpdated listener throwing during setColumnsPinned throws out of the call and still pins the column', async () => {
        const api = createGrid();
        api.getColumn('a')!.addEventListener('columnStateUpdated', () => {
            throw new Error('listener boom');
        });

        expect(() => api.setColumnsPinned(['a'], 'left')).toThrow('listener boom');
        expect(api.getDisplayedLeftColumns().map((column) => column.getColId())).toEqual(['p', 'a']);
    });

    /** The grid events of the operations on `api`, each with the columns it names. */
    const listenToGridEvents = (api: GridApi): string[] => {
        const seen: string[] = [];
        const ids = (columns: Column[] | null) => (columns ?? []).map((column) => column.getColId()).join(',');
        api.addEventListener('columnPinned', (event) =>
            seen.push(`columnPinned:${ids(event.columns)}:${event.pinned}`)
        );
        api.addEventListener('columnResized', (event) =>
            seen.push(`columnResized:${ids(event.columns)}:${event.finished}:${event.source}`)
        );
        api.addEventListener('virtualColumnsChanged', () => seen.push('virtualColumnsChanged'));
        api.addEventListener('displayedColumnsChanged', () => seen.push('displayedColumnsChanged'));
        return seen;
    };

    test.each([
        ['autoSizeColumns', (grid: GridApi) => grid.autoSizeColumns(['a', 'b']), 'a,b'],
        ['autoSizeAllColumns', (grid: GridApi) => grid.autoSizeAllColumns(), 'a,b,c'],
    ])(
        'a widthChanged listener throwing during %s rejects it, and the next one raises its own columnResized',
        async (_name, call, sized) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                defaultColDef: { width: 100 },
                rowData: [{}],
            });
            const seen = listenToGridEvents(api);
            let failing = true;
            api.getColumn('a')!.addEventListener('widthChanged', () => {
                if (failing) {
                    throw new Error('listener boom');
                }
            });
            // autosize settles asynchronously, so its listener's error rejects rather than throws from the call
            const rejections: unknown[] = [];
            const onRejection = (reason: unknown) => rejections.push(reason);
            process.on('unhandledRejection', onRejection);
            try {
                call(api);
                await waitFor(() => expect(rejections).toEqual([new Error('listener boom')]), { timeout: 500 });
                failing = false;
                await asyncSetTimeout(0);
                await asyncSetTimeout(0);

                // widths the autosize changes again
                api.setColumnWidths([
                    { key: 'a', newWidth: 150 },
                    { key: 'b', newWidth: 150 },
                    { key: 'c', newWidth: 150 },
                ]);
                await asyncSetTimeout(0);
                await asyncSetTimeout(0);
                seen.length = 0;
                call(api);

                const autosizeEvents = ['displayedColumnsChanged', `columnResized:${sized}:true:autosizeColumns`];
                await waitFor(() => expect(seen).toEqual(autosizeEvents), { timeout: 500 });
                await asyncSetTimeout(0);
                expect({ seen, rejections }).toEqual({
                    seen: autosizeEvents,
                    rejections: [new Error('listener boom')],
                });
            } finally {
                process.off('unhandledRejection', onRejection);
            }
        }
    );

    test('a cell renderer throwing in a column an autosize reveals rejects it, and the next autosize raises its columnResized naming every column it resized', async () => {
        let failing = false;
        class RevealedRenderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(): void {
                if (failing) {
                    throw new Error('renderer boom');
                }
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return true;
            }
        }
        const autosized: string[] = [];
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < 9; ++i) {
            autosized.push(`c${i}`);
            columnDefs.push({ colId: `c${i}`, width: 200, cellRenderer: RevealedRenderer });
        }
        columnDefs.push({ colId: 'flex', flex: 1, minWidth: 50 });
        // cells drawn as the pass reveals them, so a renderer's error is thrown from inside the autosize
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{}],
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        const widths = () => api.getColumns()!.map((column) => column.getActualWidth());
        const resized: string[] = [];
        api.addEventListener('columnResized', (event) =>
            resized.push(`${(event.columns ?? []).map((column) => column.getColId())}:${event.source}`)
        );
        const rejections: unknown[] = [];
        const onRejection = (reason: unknown) => rejections.push(reason);
        process.on('unhandledRejection', onRejection);
        try {
            failing = true;
            api.autoSizeColumns(autosized);
            await waitFor(() => expect(rejections).toEqual([new Error('renderer boom')]), { timeout: 500 });
            failing = false;
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            // the widths of the columns the autosize changes again
            api.applyColumnState({ state: autosized.map((colId) => ({ colId, width: 200 })) });
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
            resized.length = 0;
            const before = widths();
            api.autoSizeColumns(autosized);
            await waitFor(() => expect(resized).not.toEqual([]), { timeout: 500 });
            await asyncSetTimeout(0);
            const after = widths();
            const changed = api
                .getColumns()!
                .filter((_column, i) => after[i] !== before[i])
                .map((column) => column.getColId());

            expect({ changed, resized, rejections }).toEqual({
                changed: [...autosized, 'flex'],
                resized: [`${changed}:autosizeColumns`],
                rejections: [new Error('renderer boom')],
            });
        } finally {
            process.off('unhandledRejection', onRejection);
        }
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
        modules: [ClientSideRowModelModule, ColumnApiModule, PivotModule, RowNumbersModule],
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
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            CustomFilterModule,
            RowGroupingModule,
            RowSelectionModule,
            ShowValuesAsModule,
        ],
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

    test('after a listener threw late in a call, the next call changing a sort twice tells its column once, of the sort it ends with', () => {
        const api = createGrid();
        const a = api.getColumn('a')!;
        const b = api.getColumn('b')!;
        const toldBeforeThrow: string[] = [];
        for (const colId of ['b', 'c']) {
            api.getColumn(colId)!.addEventListener('visibleChanged', () => toldBeforeThrow.push(colId));
        }
        let armed = true;
        api.getColumn('d')!.addEventListener('visibleChanged', () => {
            if (armed) {
                armed = false;
                throw new Error('listener failed');
            }
        });

        expect(() =>
            api.applyColumnState({
                state: [
                    { colId: 'b', hide: true },
                    { colId: 'c', hide: true },
                    { colId: 'd', hide: true },
                ],
            })
        ).toThrow('listener failed');
        expect({ armed, toldBeforeThrow }).toEqual({ armed: false, toldBeforeThrow: ['b', 'c'] });

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

    test('a listener throwing during applyColumnState throws to the caller, and the next call tells its columns, and only those', () => {
        const api = createGrid();
        const c = api.getColumn('c')!;
        const seen: string[] = [];
        let failing = true;
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            if (failing) {
                throw new Error('listener failed');
            }
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
        failing = false;
        seen.length = 0;

        api.applyColumnState({
            state: [
                { colId: 'a', hide: true },
                { colId: 'c', hide: false },
            ],
        });

        expect(seen).toEqual(['true:b,c,d']);
    });

    test('a filter refresh throwing during a columnDefs update throws to the caller, and the next update raises its own grid events and refreshes every filter', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [...LEGACY_FILTER_WARNING_IDS, 306] });
        const refreshed: string[] = [];
        let failing = true;
        class ThrowingFilter implements IFilterComp {
            private readonly eGui = document.createElement('div');
            public init() {}
            public getGui() {
                return this.eGui;
            }
            public isFilterActive() {
                return false;
            }
            public doesFilterPass() {
                return true;
            }
            public getModel() {
                return null;
            }
            public setModel() {}
            public refresh(): boolean {
                if (failing) {
                    throw new Error('filter refresh failed');
                }
                refreshed.push('name');
                return true;
            }
        }
        class RecordingFilter extends ThrowingFilter {
            public override refresh(): boolean {
                refreshed.push('habitat');
                return true;
            }
        }
        const defs = (x: number): ColDef[] => [
            { colId: 'name', filter: ThrowingFilter, filterParams: { x } },
            { colId: 'habitat', filter: RecordingFilter, filterParams: { x } },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs(1),
            rowData: [{}, {}],
        });
        await asyncSetTimeout(0);
        const nameFilter = await api.getColumnFilterInstance('name');
        const habitatFilter = await api.getColumnFilterInstance('habitat');
        expect([nameFilter instanceof ThrowingFilter, habitatFilter instanceof RecordingFilter]).toEqual([true, true]);
        const raised = { newColumnsLoaded: 0, displayedColumnsChanged: 0, columnEverythingChanged: 0 };
        for (const event of ['newColumnsLoaded', 'displayedColumnsChanged', 'columnEverythingChanged'] as const) {
            api.addEventListener(event, () => ++raised[event]);
        }

        expect(() => api.setGridOption('columnDefs', [...defs(2), { colId: 'extra' }])).toThrow(
            'filter refresh failed'
        );

        failing = false;
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        raised.newColumnsLoaded = 0;
        raised.displayedColumnsChanged = 0;
        raised.columnEverythingChanged = 0;
        refreshed.length = 0;

        api.setGridOption('columnDefs', [...defs(3), { colId: 'other' }]);

        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        const header = (colId: string) =>
            getGridElement(api)!.querySelector(`.ag-header-cell[col-id="${colId}"]`) !== null;
        expect({
            raised,
            displayed: ids(api.getAllDisplayedColumns()),
            headers: { extra: header('extra'), other: header('other') },
            refreshed: [...refreshed].sort(),
        }).toEqual({
            raised: { newColumnsLoaded: 1, displayedColumnsChanged: 1, columnEverythingChanged: 1 },
            displayed: 'name,habitat,other',
            headers: { extra: false, other: true },
            refreshed: ['habitat', 'name'],
        });
    });

    test('a cell renderer refresh throwing during a columnDefs update throws to the caller, and the next update redraws every column it redefines', async () => {
        let failing = true;
        class ThrowingRenderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init() {}
            public getGui() {
                return this.eGui;
            }
            public refresh(): boolean {
                if (failing) {
                    throw new Error('cell refresh failed');
                }
                return true;
            }
        }
        const defs = (x: number, bPrefix: string, cPrefix: string): ColDef[] => [
            { colId: 'a', field: 'a', cellRenderer: ThrowingRenderer, cellRendererParams: { x } },
            { colId: 'b', field: 'b', valueFormatter: (p) => `${bPrefix}${p.value}` },
            { colId: 'c', field: 'c', valueFormatter: (p) => `${cPrefix}${p.value}` },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs(1, 'b0:', 'c0:'),
            rowData: [
                { a: 1, b: 2, c: 3 },
                { a: 4, b: 5, c: 6 },
            ],
        });
        await asyncSetTimeout(0);
        const texts = (colId: string) =>
            [...getGridElement(api)!.querySelectorAll(`.ag-row .ag-cell[col-id="${colId}"]`)].map(
                (cell) => cell.textContent!
            );
        const cellTexts = () => ({ b: texts('b'), c: texts('c') });
        expect(cellTexts()).toEqual({ b: ['b0:2', 'b0:5'], c: ['c0:3', 'c0:6'] });

        expect(() => api.setGridOption('columnDefs', defs(2, 'B:', 'C:'))).toThrow('cell refresh failed');

        failing = false;
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        api.setGridOption('columnDefs', defs(3, 'X:', 'Y:'));

        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(cellTexts()).toEqual({ b: ['X:2', 'X:5'], c: ['Y:3', 'Y:6'] });
    });

    test('a cell renderer refresh throwing for one row throws to the caller, and the next update redraws every row of its column', async () => {
        let failing = true;
        type LabelParams = ICellRendererParams & { label: string };
        class LabelRenderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(params: LabelParams) {
                this.eGui.textContent = `${params.label}${params.value}`;
            }
            public getGui() {
                return this.eGui;
            }
            public refresh(params: LabelParams): boolean {
                if (failing && params.data.id === 'r1') {
                    throw new Error('cell refresh failed');
                }
                this.eGui.textContent = `${params.label}${params.value}`;
                return true;
            }
        }
        const defs = (label: string): ColDef[] => [
            { colId: 'a', field: 'a', cellRenderer: LabelRenderer, cellRendererParams: { label } },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs('old:'),
            rowData: [
                { id: 'r1', a: 1 },
                { id: 'r2', a: 2 },
                { id: 'r3', a: 3 },
            ],
            getRowId: (params) => params.data.id,
        });
        const cellText = (rowId: string) =>
            getGridElement(api)!.querySelector(`.ag-row[row-id="${rowId}"] .ag-cell[col-id="a"]`)?.textContent;
        await waitFor(() => expect(cellText('r3')).toBe('old:3'), { timeout: 1000 });
        expect({ r2: cellText('r2'), r3: cellText('r3') }).toEqual({ r2: 'old:2', r3: 'old:3' });

        expect(() => api.setGridOption('columnDefs', defs('new:'))).toThrow('cell refresh failed');
        failing = false;
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        api.setGridOption('columnDefs', defs('newer:'));

        await waitFor(
            () =>
                expect({ r1: cellText('r1'), r2: cellText('r2'), r3: cellText('r3') }).toEqual({
                    r1: 'newer:1',
                    r2: 'newer:2',
                    r3: 'newer:3',
                }),
            { timeout: 1000 }
        );
    });

    test('a listener throwing during an update another listener makes throws from the outer call, not into the listener, and the next update raises its own events', () => {
        const api = createGrid();
        const seen: string[] = [];
        const caught: string[] = [];
        let nesting = true;
        let failing = true;
        api.getColumn('a')!.addEventListener('visibleChanged', () => {
            if (!nesting) {
                return;
            }
            try {
                api.setColumnsVisible(['b', 'd'], false);
            } catch {
                caught.push('caught');
            }
        });
        api.getColumn('b')!.addEventListener('visibleChanged', () => {
            if (failing) {
                throw new Error('listener failed');
            }
        });
        api.getColumn('d')!.addEventListener('visibleChanged', () => seen.push('d'));

        expect(() => api.applyColumnState({ state: [{ colId: 'a', hide: true }] })).toThrow('listener failed');
        expect(caught).toEqual([]);

        failing = false;
        nesting = false;
        api.applyColumnState({
            state: [
                { colId: 'a', hide: false },
                { colId: 'b', hide: false },
                { colId: 'd', hide: false },
            ],
        });
        expect(ids(api.getAllDisplayedColumns())).toBe('a,b,c,d');
        nesting = true;
        seen.length = 0;

        api.applyColumnState({ state: [{ colId: 'a', hide: true }] });

        expect({ seen, caught, displayed: ids(api.getAllDisplayedColumns()) }).toEqual({
            seen: ['d'],
            caught: [],
            displayed: 'c',
        });
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

    test('a columnDefs update redefining two columns raises colDefChanged on them, in a call adding a column too', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        const cellText = (colId: string) =>
            api.getGridElement()?.querySelector(`.ag-row[row-index="0"] [col-id="${colId}"]`)?.textContent;
        const heard: { on: string; a: string | null | undefined; b: string | null | undefined }[] = [];
        for (const on of ['a', 'b']) {
            api.getColumn(on)!.addEventListener('colDefChanged', () =>
                heard.push({ on, a: cellText('a'), b: cellText('b') })
            );
        }
        expect({ a: cellText('a'), b: cellText('b') }).toEqual({ a: '1', b: '2' });
        const redefine = (prefix: string, extraDefs: ColDef[]) =>
            api.setGridOption('columnDefs', [
                { field: 'a', valueFormatter: (p) => prefix + p.value },
                { field: 'b', valueFormatter: (p) => prefix + p.value },
                { field: 'c' },
                ...extraDefs,
            ]);

        redefine('x', []);
        await waitFor(() => expect(heard.length).toBeGreaterThanOrEqual(2), { timeout: 300 });

        redefine('y', [{ field: 'd' }]);
        await waitFor(() => expect(heard.length).toBeGreaterThanOrEqual(4), { timeout: 300 });
    });

    test('columns redefined with others are told of their new definitions, in a call adding a column too', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        const cellText = (colId: string) =>
            api.getGridElement()?.querySelector(`.ag-row[row-index="0"] [col-id="${colId}"]`)?.textContent;
        const heard: { on: string; a: string | null | undefined; b: string | null | undefined }[] = [];
        for (const on of ['a', 'b']) {
            api.getColumn(on)!.addEventListener('colDefChanged', () =>
                heard.push({ on, a: cellText('a'), b: cellText('b') })
            );
        }
        expect({ a: cellText('a'), b: cellText('b') }).toEqual({ a: '1', b: '2' });

        api.setGridOption('columnDefs', [
            { field: 'a', valueFormatter: (p) => 'x' + p.value },
            { field: 'b', valueFormatter: (p) => 'x' + p.value },
            { field: 'c' },
        ]);
        await waitFor(() => expect(heard.length).toBeGreaterThanOrEqual(2), { timeout: 300 });

        heard.length = 0;
        api.setGridOption('columnDefs', [
            { field: 'a', valueFormatter: (p) => 'y' + p.value },
            { field: 'b', valueFormatter: (p) => 'y' + p.value },
            { field: 'c' },
            { field: 'd' },
        ]);
        await waitFor(() => expect(heard.length).toBeGreaterThanOrEqual(2), { timeout: 300 });
    });
});
