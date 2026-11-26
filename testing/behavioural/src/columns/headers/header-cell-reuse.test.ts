import { waitFor } from '@testing-library/dom';
import { GridColumns, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, GridOptions, HeaderStyle, IHeaderComp, IHeaderParams } from 'ag-grid-community';
import {
    AllCommunityModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';
import {
    AllEnterpriseModule,
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
    SideBarModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

const modules = [ClientSideRowModelModule, ColumnApiModule];

describe('header cell reuse', () => {
    const gridsManager = new TestGridsManager({ modules });
    afterEach(() => gridsManager.reset());

    const headerCell = (root: HTMLElement, colId: string) =>
        root.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);

    const makeGrid = (n: number): { api: GridApi; root: HTMLElement } => {
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < n; i++) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}` });
        }
        const api = gridsManager.createGrid('reuse', { columnDefs, rowData: [{ c0: 1 }] });
        return { api, root: document.getElementById('reuse')! };
    };

    test.each(['setColumnsPinned', 'applyColumnState'] as const)(
        '%s refreshes pinned header styles and classes without recreating headers',
        async (method) => {
            const styleCalls: string[] = [];
            const classCalls: string[] = [];
            const api = await gridsManager.createGridAndWait(
                'reuse',
                {
                    defaultColDef: {
                        filter: 'agTextColumnFilter',
                        floatingFilter: true,
                        headerStyle: ({ column, floatingFilter }) => {
                            const pinned = column!.getPinned() ?? 'none';
                            styleCalls.push(`${column!.getColId()}:${floatingFilter}:${pinned}`);
                            return { '--pinned-side': String(pinned) };
                        },
                        headerClass: ({ column, floatingFilter }) => {
                            const pinned = column!.getPinned() ?? 'none';
                            classCalls.push(`${column!.getColId()}:${floatingFilter}:${pinned}`);
                            return `pinned-${pinned}`;
                        },
                    },
                    columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
                    rowData: [{ a: 'A', b: 'B', c: 'C' }],
                },
                { modules: [TextFilterModule] }
            );
            const root = document.getElementById('reuse')!;
            const headers = Array.from(root.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'));
            expect(headers).toHaveLength(6);

            for (const pinned of ['left', 'right', null] as const) {
                styleCalls.length = 0;
                classCalls.length = 0;

                if (method === 'setColumnsPinned') {
                    api.setColumnsPinned(['a', 'b'], pinned);
                } else {
                    api.applyColumnState({
                        state: [
                            { colId: 'a', pinned },
                            { colId: 'b', pinned },
                        ],
                    });
                }

                const side = pinned ?? 'none';
                expect(styleCalls.sort()).toEqual([
                    `a:false:${side}`,
                    `a:true:${side}`,
                    `b:false:${side}`,
                    `b:true:${side}`,
                ]);
                expect(classCalls.sort()).toEqual([
                    `a:false:${side}`,
                    `a:true:${side}`,
                    `b:false:${side}`,
                    `b:true:${side}`,
                ]);
                for (const header of headers) {
                    expect(root.contains(header)).toBe(true);
                    const expectedSide = header.getAttribute('col-id') === 'c' ? 'none' : side;
                    expect(header.style.getPropertyValue('--pinned-side')).toBe(expectedSide);
                    expect(Array.from(header.classList).filter((name) => name.startsWith('pinned-'))).toEqual([
                        `pinned-${expectedSide}`,
                    ]);
                }
            }
        }
    );

    test.each(['setColumnsPinned', 'applyColumnState'] as const)(
        '%s refreshes expandable group header styles without recreating headers',
        async (method) => {
            const styleCalls: string[] = [];
            const api = await gridsManager.createGridAndWait('reuse', {
                defaultColGroupDef: {
                    headerStyle: ({ columnGroup }) => {
                        const pinned = columnGroup!.getPinned();
                        styleCalls.push(`${columnGroup!.getGroupId()}:${pinned}`);
                        return { backgroundColor: pinned === 'left' ? 'orange' : 'unset' };
                    },
                },
                columnDefs: [
                    { groupId: 'name', children: [{ field: 'athlete' }, { field: 'country' }] },
                    {
                        groupId: 'sports',
                        children: [
                            { columnGroupShow: 'closed', field: 'total' },
                            { columnGroupShow: 'open', field: 'gold' },
                            { columnGroupShow: 'open', field: 'silver' },
                            { columnGroupShow: 'open', field: 'bronze' },
                        ],
                    },
                ],
                rowData: [{ athlete: 'A', country: 'B', total: 3, gold: 1, silver: 1, bronze: 1 }],
            });
            const root = document.getElementById('reuse')!;
            const header = root.querySelector<HTMLElement>('.ag-header-group-cell[col-id="sports_0"]')!;
            const colIds = ['total', 'gold', 'silver', 'bronze'];

            for (const expanded of [false, true]) {
                api.setColumnGroupOpened('sports', expanded);
                for (const pinned of ['left', null, 'right', 'left', null] as const) {
                    styleCalls.length = 0;
                    if (method === 'setColumnsPinned') {
                        api.setColumnsPinned(colIds, pinned);
                    } else {
                        api.applyColumnState({ state: colIds.map((colId) => ({ colId, pinned })) });
                    }

                    expect(styleCalls).toEqual([`sports:${pinned}`]);
                    expect(root.contains(header)).toBe(true);
                    expect(header.style.backgroundColor).toBe(pinned === 'left' ? 'orange' : 'unset');
                }
            }
        }
    );

    test('refreshes nested group styles and removes stale keys when pinned groups split and merge', async () => {
        const api = await gridsManager.createGridAndWait('reuse', {
            defaultColGroupDef: {
                headerStyle: ({ columnGroup }) => {
                    const pinned = columnGroup!.getPinned();
                    return pinned ? { backgroundColor: pinned === 'left' ? 'orange' : 'green' } : undefined;
                },
            },
            columnDefs: [
                {
                    groupId: 'outer',
                    children: [
                        {
                            groupId: 'inner',
                            children: [{ field: 'a', pinned: 'left' }, { field: 'b', pinned: 'right' }, { field: 'c' }],
                        },
                    ],
                },
            ],
            rowData: [{ a: 'A', b: 'B', c: 'C' }],
        });
        const root = document.getElementById('reuse')!;
        const expectGroupStyles = (backgrounds: string[]) => {
            for (const groupId of ['outer', 'inner']) {
                const headers = root.querySelectorAll<HTMLElement>(`.ag-header-group-cell[col-id^="${groupId}_"]`);
                expect(headers).toHaveLength(backgrounds.length);
                for (const [index, background] of backgrounds.entries()) {
                    const header = root.querySelector<HTMLElement>(
                        `.ag-header-group-cell[col-id="${groupId}_${index}"]`
                    );
                    expect(header?.style.backgroundColor).toBe(background);
                }
            }
        };

        expectGroupStyles(['orange', 'green', '']);
        // Removing the left fragment reuses its header for the unchanged right-pinned column.
        api.setColumnsPinned(['a'], null);
        expectGroupStyles(['green', '']);
        api.setColumnsPinned(['b'], null);
        expectGroupStyles(['']);
        api.setColumnsPinned(['c'], 'left');
        expectGroupStyles(['orange', '']);
        api.setColumnsPinned(['a', 'b'], 'left');
        expectGroupStyles(['orange']);
        api.setColumnsPinned(['a', 'b', 'c'], null);
        expectGroupStyles(['']);
    });

    test('a pin restyles the group headers whose section changes, and none staying in its section', async () => {
        const styledFor: string[] = [];
        const api = await gridsManager.createGridAndWait('reuse', {
            columnDefs: [
                {
                    groupId: 'g',
                    headerStyle: (params) => {
                        styledFor.push(String(params.columnGroup!.getPinned()));
                        return undefined;
                    },
                    children: [{ field: 'a', pinned: 'left' }, { field: 'b' }, { field: 'c' }],
                },
            ],
            rowData: [{ a: 'A', b: 'B', c: 'C' }],
        });
        styledFor.length = 0;

        // b joins the left fragment and leaves the centre one: both stay in their section
        api.setColumnsPinned(['b'], 'left');
        expect(styledFor).toEqual([]);

        // one fragment is left, its header the one that was pinned left
        api.setColumnsPinned(['a', 'b'], null);
        expect(styledFor).toEqual(['null']);
    });

    test('a header created for a pinned column asks its headerStyle once', async () => {
        const calls = new Map<string, number>();
        await gridsManager.createGridAndWait('reuse', {
            defaultColDef: {
                headerStyle: (params) => {
                    const colId = params.column!.getColId();
                    calls.set(colId, (calls.get(colId) ?? 0) + 1);
                    return undefined;
                },
            },
            columnDefs: [{ field: 'a', pinned: 'left' }, { field: 'b', pinned: 'right' }, { field: 'c' }],
            rowData: [{ a: 1, b: 2, c: 3 }],
        });

        expect([...calls].sort()).toEqual([
            ['a', 1],
            ['b', 1],
            ['c', 1],
        ]);
    });

    test('a column group header asks its headerStyle once when it is created', async () => {
        let calls = 0;
        await gridsManager.createGridAndWait('reuse', {
            columnDefs: [
                {
                    groupId: 'g',
                    headerStyle: () => {
                        ++calls;
                        return undefined;
                    },
                    children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }],
                },
            ],
            rowData: [{ a: 1, b: 2 }],
        });

        expect(calls).toBe(1);
    });

    test.each<HeaderStyle | null | undefined>([undefined, null, {}, { color: 'green' }])(
        'removes stale header styles when unpinning returns %j',
        async (unpinnedStyle) => {
            const pinnedStyle = Object.freeze({ backgroundColor: 'orange', '--pinned': 'yes' });
            const api = await gridsManager.createGridAndWait(
                'reuse',
                {
                    defaultColDef: {
                        filter: 'agTextColumnFilter',
                        floatingFilter: true,
                        headerStyle: ({ column }) => (column!.isPinned() ? pinnedStyle : unpinnedStyle),
                    },
                    columnDefs: [{ field: 'a' }, { field: 'b' }],
                    rowData: [{ a: 'A', b: 'B' }],
                },
                { modules: [TextFilterModule] }
            );
            const root = document.getElementById('reuse')!;
            const headers = Array.from(root.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'));
            expect(headers).toHaveLength(4);
            const widths = headers.map((header) => header.style.width);
            expect(widths.every(Boolean)).toBe(true);

            for (const pinned of ['left', null, 'right', null] as const) {
                api.setColumnsPinned(['a', 'b'], pinned);

                for (const [index, header] of headers.entries()) {
                    expect(root.contains(header)).toBe(true);
                    expect(header.style.backgroundColor).toBe(pinned ? 'orange' : '');
                    expect(header.style.getPropertyValue('--pinned')).toBe(pinned ? 'yes' : '');
                    expect(header.style.color).toBe(pinned ? '' : (unpinnedStyle?.color ?? ''));
                    expect(header.style.width).toBe(widths[index]);
                }
            }
        }
    );

    test('applies a retained shorthand after removing an old longhand header style', async () => {
        const api = await gridsManager.createGridAndWait('reuse', {
            columnDefs: [
                {
                    field: 'a',
                    headerStyle: ({ column }): HeaderStyle =>
                        column!.isPinned()
                            ? { border: '1px solid black', borderBottom: '3px solid orange' }
                            : { border: '1px solid black' },
                },
            ],
            rowData: [{ a: 'A' }],
        });
        const header = headerCell(document.getElementById('reuse')!, 'a')!;
        const initialBorder = header.style.borderBottom;
        expect(initialBorder).not.toBe('');

        for (const pinned of ['left', null, 'right', null] as const) {
            api.setColumnsPinned(['a'], pinned);
            expect(header.style.borderBottom).toBe(pinned ? '3px solid orange' : initialBorder);
        }
    });

    test('heavy hide/show churn keeps the final rendering correct', async () => {
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < 30; i++) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}`, hide: i !== 0 });
        }
        const api = gridsManager.createGrid('reuse', { columnDefs, rowData: [{ c0: 1 }] });
        const root = document.getElementById('reuse')!;
        const allIds = columnDefs.map((c) => c.colId!);

        // Slide a one-column visible window across all columns.
        for (let i = 1; i < 30; i++) {
            api.setColumnsVisible(allIds, false);
            api.setColumnsVisible([allIds[i]], true);
        }

        api.setColumnsVisible(allIds, true);
        const rendered = Array.from(root.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'))
            .map((e) => e.getAttribute('col-id'))
            .sort();
        expect(rendered).toEqual(allIds.slice().sort());
        await new GridColumns(api, 'all columns shown after churn').checkColumns(`
            CENTER
            ├── c0 "C0" width:200
            ├── c1 "C1" width:200
            ├── c2 "C2" width:200
            ├── c3 "C3" width:200
            ├── c4 "C4" width:200
            ├── c5 "C5" width:200
            ├── c6 "C6" width:200
            ├── c7 "C7" width:200
            ├── c8 "C8" width:200
            ├── c9 "C9" width:200
            ├── c10 "C10" width:200
            ├── c11 "C11" width:200
            ├── c12 "C12" width:200
            ├── c13 "C13" width:200
            ├── c14 "C14" width:200
            ├── c15 "C15" width:200
            ├── c16 "C16" width:200
            ├── c17 "C17" width:200
            ├── c18 "C18" width:200
            ├── c19 "C19" width:200
            ├── c20 "C20" width:200
            ├── c21 "C21" width:200
            ├── c22 "C22" width:200
            ├── c23 "C23" width:200
            ├── c24 "C24" width:200
            ├── c25 "C25" width:200
            ├── c26 "C26" width:200
            ├── c27 "C27" width:200
            ├── c28 "C28" width:200
            └── c29 "C29" width:200
        `);
    });

    test('removing a hidden column from the grid does not leave it rendered', async () => {
        const { api, root } = makeGrid(5);
        expect(headerCell(root, 'c4')).toBeTruthy();

        api.setColumnsVisible(['c4'], false);
        expect(headerCell(root, 'c4')).toBeNull();

        api.setGridOption('columnDefs', [
            { colId: 'c0', field: 'c0' },
            { colId: 'c1', field: 'c1' },
            { colId: 'c2', field: 'c2' },
            { colId: 'c3', field: 'c3' },
        ]);
        expect(headerCell(root, 'c4')).toBeNull();
        expect(headerCell(root, 'c0')).toBeTruthy();
        expect(headerCell(root, 'c3')).toBeTruthy();
        await new GridColumns(api, 'c4 removed from grid').checkColumns(`
            CENTER
            ├── c0 "C0" width:200
            ├── c1 "C1" width:200
            ├── c2 "C2" width:200
            └── c3 "C3" width:200
        `);
    });

    test('a column pinned by a listener on another column hiding gets its pinned header class', async () => {
        const api = gridsManager.createGrid('reuse', {
            columnDefs: [
                { colId: 'a', field: 'a' },
                {
                    colId: 'b',
                    field: 'b',
                    headerClass: (p) => (p.column?.getPinned() ? 'pinned-header' : 'free-header'),
                },
            ],
            rowData: [{ a: 1, b: 2 }],
        });
        const root = document.getElementById('reuse')!;
        const classes = () => Array.from(headerCell(root, 'b')!.classList).filter((name) => name.endsWith('-header'));
        await waitFor(() => expect(classes()).toEqual(['free-header']));
        api.getColumn('a')!.addEventListener('visibleChanged', () => api.setColumnsPinned(['b'], 'left'));

        api.setColumnsVisible(['a'], false);

        await waitFor(() => expect(classes()).toEqual(['pinned-header']));
        expect(api.getColumn('b')!.getPinned()).toBe('left');
    });

    test('a pin refreshes only the pinned column header class and style, and a hide then show of another column refreshes neither', async () => {
        const calls: { class: Record<string, number>; style: Record<string, number> } = {
            class: { a: 0, b: 0 },
            style: { a: 0, b: 0 },
        };
        const resetCalls = () => {
            calls.class = { a: 0, b: 0 };
            calls.style = { a: 0, b: 0 };
        };
        const api = gridsManager.createGrid('reuse', {
            defaultColDef: {
                headerClass: (p) => {
                    ++calls.class[p.column!.getColId()];
                    return p.column!.getPinned() ? 'pinned-header' : 'free-header';
                },
                headerStyle: (p): HeaderStyle => {
                    ++calls.style[p.column!.getColId()];
                    return { '--pinned-side': String(p.column!.getPinned() ?? 'none') };
                },
            },
            columnDefs: [
                { colId: 'a', field: 'a' },
                { colId: 'b', field: 'b' },
            ],
            rowData: [{ a: 1, b: 2 }],
        });
        const root = document.getElementById('reuse')!;
        const classesOf = (colId: string) =>
            Array.from(headerCell(root, colId)?.classList ?? []).filter((name) => name.endsWith('-header'));
        await waitFor(() =>
            expect({ a: classesOf('a'), b: classesOf('b') }).toEqual({ a: ['free-header'], b: ['free-header'] })
        );
        resetCalls();

        api.setColumnsPinned(['b'], 'left');
        await waitFor(() => expect(classesOf('b')).toEqual(['pinned-header']));

        expect(calls).toEqual({ class: { a: 0, b: 1 }, style: { a: 0, b: 1 } });

        resetCalls();
        api.setColumnsVisible(['a'], false);
        api.setColumnsVisible(['a'], true);
        await waitFor(() => expect(headerCell(root, 'a')).not.toBeNull());
        await asyncSetTimeout(0);

        // a's own cell is rebuilt, so only b's counts are asserted
        expect({ class: calls.class.b, style: calls.style.b }).toEqual({ class: 0, style: 0 });
    });

    test('a column pinned while hidden shows its pinned header class when shown', async () => {
        const api = gridsManager.createGrid('reuse', {
            columnDefs: [
                { colId: 'a', field: 'a' },
                {
                    colId: 'b',
                    field: 'b',
                    headerClass: (p) => (p.column?.getPinned() ? 'pinned-header' : 'free-header'),
                },
            ],
            rowData: [{ a: 1, b: 2 }],
        });
        const root = document.getElementById('reuse')!;
        const classes = () =>
            Array.from(headerCell(root, 'b')?.classList ?? []).filter((name) => name.endsWith('-header'));
        await waitFor(() => expect(classes()).toEqual(['free-header']));

        api.setColumnsVisible(['b'], false);
        api.setColumnsPinned(['b'], 'left');
        api.setColumnsVisible(['b'], true);

        await waitFor(() => expect(classes()).toEqual(['pinned-header']));
    });

    test('a value column header kept across a tree data change names its aggregation function as a new grid does', async () => {
        const options = (treeData: boolean) => ({
            treeData,
            columnDefs: [{ field: 'name' }, { field: 'amount', aggFunc: 'sum' }],
            rowData: [
                { id: '1', path: ['a'], name: 'a', amount: 1 },
                { id: '2', path: ['a', 'b'], name: 'b', amount: 2 },
            ],
            getDataPath: (data: { path: string[] }) => data.path,
        });
        const text = () =>
            document.querySelector('#reuse .ag-header-cell[col-id="amount"] .ag-header-cell-text')?.textContent;
        const treeModules = { modules: [RowGroupingModule, TreeDataModule] };

        gridsManager.createGrid('reuse', options(true), treeModules);
        await waitFor(() => expect(text()).toBe('sum(Amount)'));
        gridsManager.reset();

        const api = gridsManager.createGrid('reuse', options(false), treeModules);
        await waitFor(() => expect(text()).toBe('Amount'));
        const header = headerCell(document.getElementById('reuse')!, 'amount');

        api.setGridOption('treeData', true);
        await waitFor(() => expect(text()).toBe('sum(Amount)'));

        api.setGridOption('treeData', false);
        await waitFor(() => expect(text()).toBe('Amount'));
        expect(headerCell(document.getElementById('reuse')!, 'amount') === header).toBe(true);
    });

    test('a tree data change redraws only the headers whose name changes: a custom header component on an unchanged name is neither refreshed nor created again', async () => {
        const calls = { inits: 0, refreshes: 0 };
        class Header implements IHeaderComp {
            private readonly eGui = document.createElement('div');
            public init(params: IHeaderParams): void {
                ++calls.inits;
                this.eGui.textContent = params.displayName;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: IHeaderParams): boolean {
                ++calls.refreshes;
                this.eGui.textContent = params.displayName;
                return true;
            }
        }
        const api = gridsManager.createGrid(
            'reuse',
            {
                treeData: false,
                columnDefs: [
                    { field: 'name', headerComponent: Header },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', path: ['a'], name: 'a', amount: 1 },
                    { id: '2', path: ['a', 'b'], name: 'b', amount: 2 },
                ],
                getDataPath: (data: { path: string[] }) => data.path,
            },
            { modules: [RowGroupingModule, TreeDataModule] }
        );
        const root = document.getElementById('reuse')!;
        const amountText = () => headerCell(root, 'amount')?.querySelector('.ag-header-cell-text')?.textContent;
        const nameText = () => headerCell(root, 'name')?.textContent?.trim();
        await waitFor(() =>
            expect({ amount: amountText(), name: nameText() }).toEqual({ amount: 'Amount', name: 'Name' })
        );
        await asyncSetTimeout(0);
        const nameHeader = headerCell(root, 'name');
        const settled = { ...calls };
        expect(settled.inits).toBeGreaterThan(0);

        for (const treeData of [true, false]) {
            api.setGridOption('treeData', treeData);
            await waitFor(() => expect(amountText()).toBe(treeData ? 'sum(Amount)' : 'Amount'));
            await asyncSetTimeout(0);

            expect({
                calls: { ...calls },
                name: nameText(),
                nameKept: headerCell(root, 'name') === nameHeader,
            }).toEqual({
                calls: settled,
                name: 'Name',
                nameKept: true,
            });
        }
    });

    test('a value column header names its aggregation function while pivot mode is on, and drops it when it is turned off', async () => {
        const api = gridsManager.createGrid(
            'reuse',
            {
                columnDefs: [{ field: 'gold', headerName: 'Gold', aggFunc: 'sum' }],
                rowData: [{ gold: 1 }],
            },
            { modules: [AllCommunityModule, AllEnterpriseModule] }
        );
        const text = () =>
            document.querySelector('#reuse .ag-header-cell[col-id="gold"] .ag-header-cell-text')?.textContent;
        await waitFor(() => expect(text()).toBe('Gold'));

        api.setGridOption('pivotMode', true);
        await waitFor(() => expect(text()).toBe('sum(Gold)'));

        api.setGridOption('pivotMode', false);
        await waitFor(() => expect(text()).toBe('Gold'));
    });

    test('a custom group column redefined to show an unsorted row group column loses the sorted class of the one it showed', async () => {
        const defs = (shown: string): ColDef[] => [
            { colId: 'country', field: 'country', rowGroup: true, sort: 'asc', hide: true },
            { colId: 'sport', field: 'sport', rowGroup: true, hide: true },
            { colId: 'g', headerName: 'G', showRowGroup: shown, cellRenderer: 'agGroupCellRenderer' },
        ];
        const rowData = [
            { country: 'IE', sport: 's' },
            { country: 'FR', sport: 't' },
        ];
        const sortedClasses = () =>
            Array.from(
                document.querySelector('#reuse .ag-header-cell[col-id="g"] .ag-cell-label-container')?.classList ?? [
                    '<missing>',
                ]
            ).filter((name) => name.startsWith('ag-header-cell-sorted-'));
        const groupModules = { modules: [RowGroupingModule] };

        gridsManager.createGrid(
            'reuse',
            { columnDefs: defs('sport'), rowData, groupDisplayType: 'custom' },
            groupModules
        );
        await waitFor(() => expect(sortedClasses()).toEqual(['ag-header-cell-sorted-none']));
        gridsManager.reset();

        const api = gridsManager.createGrid(
            'reuse',
            { columnDefs: defs('country'), rowData, groupDisplayType: 'custom' },
            groupModules
        );
        await waitFor(() => expect(sortedClasses()).toContain('ag-header-cell-sorted-mixed'));

        api.setGridOption('columnDefs', defs('sport'));
        await waitFor(() => expect(sortedClasses()).toEqual(['ag-header-cell-sorted-none']));
    });

    const headerText = (root: HTMLElement, colId: string) =>
        headerCell(root, colId)?.querySelector('.ag-header-cell-text')?.textContent;

    test("a column's own listeners find its header redrawn, also ones added before its header cell was drawn", async () => {
        const api = gridsManager.createGrid('reuse', {
            columnDefs: [{ colId: 'a', headerName: 'One', hide: true }, { colId: 'b' }],
            rowData: [{}],
        });
        const root = document.getElementById('reuse')!;
        const seen: (string | null | undefined)[] = [];
        const a = api.getColumn('a')!;
        a.addEventListener('colDefChanged', () => seen.push(headerText(root, 'a')));
        a.addEventListener('headerNameChanged', () => seen.push(headerText(root, 'a')));
        api.setColumnsVisible(['a'], true);
        await waitFor(() => expect(headerText(root, 'a')).toBe('One'));

        api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'Two' }, { colId: 'b' }]);
        api.applyColumnState({ state: [{ colId: 'a', headerName: 'Three' }] });

        expect(seen).toEqual(['Two', 'Three']);
    });

    test('a column renamed by a listener on another column hiding shows its new name', async () => {
        const api = gridsManager.createGrid('reuse', {
            columnDefs: [{ colId: 'a', headerName: 'One' }, { colId: 'b' }],
            rowData: [{}],
        });
        const root = document.getElementById('reuse')!;
        await waitFor(() => expect(headerText(root, 'a')).toBe('One'));
        api.getColumn('b')!.addEventListener('visibleChanged', () => {
            api.applyColumnState({ state: [{ colId: 'a', headerName: 'Two' }] });
        });

        api.setColumnsVisible(['b'], false);

        expect(headerText(root, 'a')).toBe('Two');
    });

    test('a redefined column refreshes its header component once, and not again when another column is redefined', async () => {
        const refreshes: string[] = [];
        class Header implements IHeaderComp {
            private readonly eGui = document.createElement('div');
            public init(params: IHeaderParams): void {
                this.eGui.textContent = params.displayName;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: IHeaderParams): boolean {
                refreshes.push(`${params.column.getColId()}:${params.displayName}`);
                return true;
            }
        }
        const columnDefs = (a: string, b: string): ColDef[] => [
            { colId: 'a', headerName: a, headerComponent: Header },
            { colId: 'b', headerName: b, headerComponent: Header },
        ];
        const api = gridsManager.createGrid('reuse', { columnDefs: columnDefs('A1', 'B1'), rowData: [{}] });
        const root = document.getElementById('reuse')!;
        await waitFor(() => expect(headerCell(root, 'b')?.textContent?.trim()).toBe('B1'));

        api.setGridOption('columnDefs', columnDefs('A2', 'B1'));
        expect(refreshes).toEqual(['a:A2']);

        api.setGridOption('columnDefs', columnDefs('A2', 'B2'));
        expect(refreshes).toEqual(['a:A2', 'b:B2']);
    });

    test('an options change redefining a column and changing a header option refreshes each header component once', async () => {
        const refreshes: string[] = [];
        class Header implements IHeaderComp {
            private readonly eGui = document.createElement('div');
            public init(params: IHeaderParams): void {
                this.eGui.textContent = params.displayName;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: IHeaderParams): boolean {
                refreshes.push(`${params.column.getColId()}:${params.displayName}`);
                return true;
            }
        }
        const columnDefs = (a: string): ColDef[] => [
            { colId: 'a', headerName: a, headerComponent: Header },
            { colId: 'b', headerName: 'B', headerComponent: Header },
        ];
        const api = gridsManager.createGrid('reuse', { columnDefs: columnDefs('A1'), rowData: [{}] });
        const root = document.getElementById('reuse')!;
        await waitFor(() => expect(headerCell(root, 'b')?.textContent?.trim()).toBe('B'));

        api.updateGridOptions({ columnDefs: columnDefs('A2'), suppressMenuHide: true });
        expect(refreshes.sort()).toEqual(['a:A2', 'b:B']);

        refreshes.length = 0;
        api.updateGridOptions({ suppressMenuHide: false, columnDefs: columnDefs('A3') });
        expect(refreshes.sort()).toEqual(['a:A3', 'b:B']);
    });

    /** Each header element's tag, classes, attributes and own text, in document order, less the generated ids. */
    const headerSignature = (root: HTMLElement): string[] =>
        Array.from(root.querySelector('.ag-header')!.querySelectorAll('*'), (el) => {
            const attributes = Array.from(el.attributes)
                .filter(
                    (attr) => !/^(id|comp-id|class|for|data-testid|aria-labelledby|aria-describedby)$/.test(attr.name)
                )
                .map((attr) => `${attr.name}=${attr.value.split(';').sort().join(';')}`)
                .sort();
            const text = Array.from(el.childNodes, (node) =>
                node.nodeType === 3 ? node.textContent!.trim() : ''
            ).join('');
            return [el.tagName, Array.from(el.classList).sort().join('.'), ...attributes, text].join(' ');
        });

    const autoGroupCheckbox = { mode: 'multiRow', checkboxLocation: 'autoGroupColumn' };
    test.each<[keyof GridOptions, unknown, unknown]>([
        ['suppressHeaderFocus', false, true],
        ['suppressHeaderFocus', true, false],
        ['suppressMovableColumns', false, true],
        ['suppressMovableColumns', true, false],
        ['suppressMenuHide', true, false],
        ['suppressMenuHide', false, true],
        ['suppressAggFuncInHeader', false, true],
        ['suppressAggFuncInHeader', true, false],
        ['enableAdvancedFilter', false, true],
        ['enableAdvancedFilter', true, false],
        ['cellSelection', false, { enableColumnSelection: true }],
        ['cellSelection', { enableColumnSelection: true }, false],
        ['rowSelection', undefined, { mode: 'multiRow' }],
        ['rowSelection', { mode: 'multiRow' }, undefined],
        [
            'rowSelection',
            { mode: 'multiRow', checkboxLocation: 'autoGroupColumn', headerCheckbox: false },
            autoGroupCheckbox,
        ],
        [
            'rowSelection',
            autoGroupCheckbox,
            { mode: 'multiRow', checkboxLocation: 'autoGroupColumn', headerCheckbox: false },
        ],
        ['groupHeaderHeight', undefined, 20],
        ['groupHeaderHeight', 0, undefined],
    ])(
        'a grid given %s %j then %j shows the header of a grid created with the latter',
        async (option, before, after) => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    {
                        headerName: 'Group',
                        children: [
                            { field: 'a', filter: true, floatingFilter: true },
                            { field: 'b', aggFunc: 'sum' },
                        ],
                    },
                    { field: 'c', rowGroup: true, hide: true },
                ],
                rowData: [{ a: 1, b: 2, c: 'x' }],
            };
            const allModules = { modules: [AllCommunityModule, AllEnterpriseModule] };
            const api = gridsManager.createGrid('reuse', { ...gridOptions, [option]: before }, allModules);
            const changed = document.getElementById('reuse')!;
            await asyncSetTimeout(0);
            const signatureBefore = headerSignature(changed);

            api.updateGridOptions({ [option]: after });
            gridsManager.createGrid('created', { ...gridOptions, [option]: after }, allModules);

            const created = document.getElementById('created')!;
            await waitFor(() => expect(headerSignature(changed)).toEqual(headerSignature(created)));
            expect(headerSignature(changed)).not.toEqual(signatureBefore);
        }
    );

    type HeaderRefresh = { colId: string; enableFilterButton: boolean; displayName: string };
    const recordingHeader = (refreshes: HeaderRefresh[]) =>
        class Header implements IHeaderComp {
            private readonly eGui = document.createElement('div');
            public init(params: IHeaderParams): void {
                this.render(params);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: IHeaderParams): boolean {
                this.render(params);
                refreshes.push({
                    colId: params.column.getColId(),
                    enableFilterButton: params.enableFilterButton,
                    displayName: params.displayName,
                });
                return true;
            }
            private render(params: IHeaderParams): void {
                this.eGui.textContent = `${params.displayName} filterButton:${params.enableFilterButton} menu:${params.enableMenu}`;
            }
        };

    test.each<['on' | 'off', 'enableAdvancedFilter' | 'suppressMenuHide']>([
        ['on', 'enableAdvancedFilter'],
        ['on', 'suppressMenuHide'],
        ['off', 'enableAdvancedFilter'],
        ['off', 'suppressMenuHide'],
    ])(
        'one update turning the advanced filter %s and changing a header option, %s given first, shows the header of a new grid and redraws each header component once',
        async (advancedFilter, firstKey) => {
            const refreshes: HeaderRefresh[] = [];
            const gridOptions = (headerRefreshes: HeaderRefresh[]): GridOptions => ({
                columnDefs: [
                    { colId: 'a', filter: true, headerComponent: recordingHeader(headerRefreshes) },
                    {
                        colId: 'b',
                        filter: true,
                        floatingFilter: true,
                        headerComponent: recordingHeader(headerRefreshes),
                    },
                ],
                rowData: [{ a: 1, b: 2 }],
            });
            const turnedOn = advancedFilter === 'on';
            const finalOptions: GridOptions = { enableAdvancedFilter: turnedOn, suppressMenuHide: turnedOn };
            const change: GridOptions =
                firstKey === 'enableAdvancedFilter'
                    ? { enableAdvancedFilter: turnedOn, suppressMenuHide: turnedOn }
                    : { suppressMenuHide: turnedOn, enableAdvancedFilter: turnedOn };
            const allModules = { modules: [AllCommunityModule, AllEnterpriseModule] };
            const api = gridsManager.createGrid(
                'reuse',
                { ...gridOptions(refreshes), enableAdvancedFilter: !turnedOn, suppressMenuHide: !turnedOn },
                allModules
            );
            const changed = document.getElementById('reuse')!;
            await waitFor(() => expect(headerCell(changed, 'b')?.textContent).toContain('B'));
            const signatureBefore = headerSignature(changed);
            refreshes.length = 0;

            api.updateGridOptions(change);
            gridsManager.createGrid('created', { ...gridOptions([]), ...finalOptions }, allModules);

            const created = document.getElementById('created')!;
            await waitFor(() => expect(headerSignature(changed)).toEqual(headerSignature(created)));
            expect(headerSignature(changed)).not.toEqual(signatureBefore);
            await asyncSetTimeout(0);

            expect(refreshes.map((refresh) => refresh.colId).sort()).toEqual(['a', 'b']);
            expect(refreshes.find((refresh) => refresh.colId === 'a')?.enableFilterButton).toBe(!turnedOn);
        }
    );

    test('one update redefining a column and changing the advanced filter, in either key order, redraws that column header component once with its new name', async () => {
        const refreshes: HeaderRefresh[] = [];
        const Header = recordingHeader(refreshes);
        const columnDefs = (headerName: string): ColDef[] => [
            { colId: 'a', headerName, filter: true, headerComponent: Header },
            { colId: 'b', headerName: 'B', filter: true, headerComponent: Header },
        ];
        const api = gridsManager.createGrid(
            'reuse',
            { columnDefs: columnDefs('A1'), rowData: [{ a: 1, b: 2 }] },
            { modules: [AllCommunityModule, AllEnterpriseModule] }
        );
        const root = document.getElementById('reuse')!;
        await waitFor(() => expect(headerCell(root, 'a')?.textContent).toContain('A1'));
        const refreshed = () => refreshes.map((refresh) => `${refresh.colId}:${refresh.displayName}`).sort();

        refreshes.length = 0;
        api.updateGridOptions({ columnDefs: columnDefs('A2'), enableAdvancedFilter: true });
        await waitFor(() => expect(headerCell(root, 'a')?.textContent).toContain('A2'));
        await asyncSetTimeout(0);
        expect(refreshed()).toEqual(['a:A2', 'b:B']);

        refreshes.length = 0;
        api.updateGridOptions({ enableAdvancedFilter: false, columnDefs: columnDefs('A3') });
        await waitFor(() => expect(headerCell(root, 'a')?.textContent).toContain('A3'));
        await asyncSetTimeout(0);
        expect(refreshed()).toEqual(['a:A3', 'b:B']);
    });

    test.each<['suppressMenuHide' | 'enableAdvancedFilter', 'first' | 'last']>([
        ['suppressMenuHide', 'first'],
        ['suppressMenuHide', 'last'],
        ['enableAdvancedFilter', 'first'],
        ['enableAdvancedFilter', 'last'],
    ])(
        'one update removing a column and changing %s, given %s, calls no header callback of the column once it is gone',
        async (option, position) => {
            const calledOnceGone: string[] = [];
            const keptRefreshes: string[] = [];
            class Header implements IHeaderComp {
                private readonly eGui = document.createElement('div');
                public init(params: IHeaderParams): void {
                    this.eGui.textContent = params.displayName;
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
                public refresh(params: IHeaderParams): boolean {
                    if (params.column.getColId() !== 'b') {
                        keptRefreshes.push('refresh:a');
                    } else if (!params.api.getColumn('b')) {
                        calledOnceGone.push('refresh');
                    }
                    return true;
                }
            }
            const colDef = (colId: string): ColDef => ({
                colId,
                headerName: colId,
                headerComponent: Header,
                headerStyle: (params) => {
                    if (params.column?.getColId() === 'b' && !params.api.getColumn('b')) {
                        calledOnceGone.push('headerStyle');
                    }
                    return undefined;
                },
            });
            const api = gridsManager.createGrid(
                'reuse',
                { columnDefs: [colDef('a'), colDef('b')], rowData: [{}] },
                { modules: [AllCommunityModule, AllEnterpriseModule] }
            );
            const root = document.getElementById('reuse')!;
            await waitFor(() => expect(headerCell(root, 'b')?.textContent).toContain('b'));

            const columnDefs = [colDef('a')];
            api.updateGridOptions(
                position === 'first' ? { [option]: true, columnDefs } : { columnDefs, [option]: true }
            );
            await waitFor(() => expect(headerCell(root, 'b')).toBeNull());

            expect(calledOnceGone).toEqual([]);
            expect(keptRefreshes).toContain('refresh:a');
        }
    );

    test('two header options a column listener sets in one update both reach the header', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
        };
        const api = gridsManager.createGrid('reuse', {
            ...gridOptions,
            suppressMenuHide: true,
            suppressHeaderFocus: false,
        });
        const changed = document.getElementById('reuse')!;
        await asyncSetTimeout(0);
        api.getColumn('b')!.addEventListener('visibleChanged', () => {
            api.setGridOption('suppressMenuHide', false);
            api.setGridOption('suppressHeaderFocus', true);
        });

        api.setColumnsVisible(['b'], false);
        const created = gridsManager.createGrid('created', {
            ...gridOptions,
            suppressMenuHide: false,
            suppressHeaderFocus: true,
        });
        created.setColumnsVisible(['b'], false);

        const createdRoot = document.getElementById('created')!;
        await waitFor(() => expect(headerSignature(changed)).toEqual(headerSignature(createdRoot)));
    });

    /** A header component counting its creations, showing the column's display name. */
    const countingHeader = (counter: { inits: number }) =>
        class CountingHeader implements IHeaderComp {
            private readonly eGui = document.createElement('div');
            public init(params: IHeaderParams): void {
                ++counter.inits;
                this.eGui.textContent = params.displayName;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: IHeaderParams): boolean {
                this.eGui.textContent = params.displayName;
                return true;
            }
        };
    const columnHeaderCells = (api: GridApi) =>
        Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'));
    /** The text of each header cell, column and group, row by row in document order. */
    const headerRowTexts = (api: GridApi) =>
        Array.from(getGridElement(api)!.querySelectorAll('.ag-header-row'), (row) =>
            Array.from(row.querySelectorAll('.ag-header-cell, .ag-header-group-cell'), (cell) =>
                cell.textContent!.trim()
            )
        );
    const columnsToolPanel: GridOptions['sideBar'] = { toolPanels: ['columns'], defaultToolPanel: 'columns' };
    const deferredColumnsToolPanel: GridOptions['sideBar'] = {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: { buttons: ['apply', 'cancel'] },
            },
        ],
        defaultToolPanel: 'columns',
    };
    const toolPanelModules = { modules: [RowGroupingModule, PivotModule, ColumnsToolPanelModule, SideBarModule] };

    test('setting the same column definitions while the columns tool panel is shown keeps every header cell and creates no header component', async () => {
        const counter = { inits: 0 };
        const api = gridsManager.createGrid(
            'reuse',
            {
                defaultColDef: { headerComponent: countingHeader(counter) },
                columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
                rowData: [{ a: 1, b: 2, c: 3 }],
                sideBar: columnsToolPanel,
            },
            toolPanelModules
        );
        await waitFor(() =>
            expect({
                panelShown: api.isToolPanelShowing(),
                headers: columnHeaderCells(api).map((cell) => cell.textContent!.trim()),
            }).toEqual({ panelShown: true, headers: ['A', 'B', 'C'] })
        );
        await asyncSetTimeout(0);
        const before = columnHeaderCells(api);
        counter.inits = 0;

        api.setGridOption('columnDefs', api.getColumnDefs());
        await asyncSetTimeout(0);

        expect({ inits: counter.inits, kept: columnHeaderCells(api).map((cell, i) => cell === before[i]) }).toEqual({
            inits: 0,
            kept: [true, true, true],
        });
    });

    type PivotStep = { pivotMode: boolean; inits: number; headerRows: string[][] };

    /** Turns pivot mode on then off, recording the header components created and the header shown after each step. */
    const pivotRoundTrip = async (
        sideBar: GridOptions['sideBar'] | undefined,
        turnPivotMode: (api: GridApi, on: boolean) => void
    ): Promise<PivotStep[]> => {
        const counter = { inits: 0 };
        const api = gridsManager.createGrid(
            'reuse',
            {
                defaultColDef: { headerComponent: countingHeader(counter) },
                columnDefs: [
                    { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
                    { field: 'year', pivot: true, enableRowGroup: true, enablePivot: true },
                    { field: 'gold', aggFunc: 'sum', enableValue: true },
                    { field: 'athlete' },
                ],
                rowData: [
                    { country: 'IE', year: 2000, gold: 1, athlete: 'A' },
                    { country: 'FR', year: 2004, gold: 2, athlete: 'B' },
                ],
                ...(sideBar ? { sideBar } : {}),
            },
            toolPanelModules
        );
        // The plain column shows only outside pivot mode, so its header tells each step has landed.
        const settle = async (on: boolean) => {
            await waitFor(() =>
                expect({
                    pivotMode: api.isPivotMode(),
                    plainColumnShown: columnHeaderCells(api).some((cell) => cell.getAttribute('col-id') === 'athlete'),
                }).toEqual({ pivotMode: on, plainColumnShown: !on })
            );
            await asyncSetTimeout(0);
        };
        await settle(false);
        const steps: PivotStep[] = [];
        for (const on of [true, false]) {
            counter.inits = 0;
            turnPivotMode(api, on);
            await settle(on);
            steps.push({ pivotMode: on, inits: counter.inits, headerRows: headerRowTexts(api) });
        }
        gridsManager.reset();
        return steps;
    };
    const setPivotMode = (api: GridApi, on: boolean) => api.setGridOption('pivotMode', on);

    test('pivot mode turned on and off by the API while the columns tool panel is shown creates as many header components as without the side bar', async () => {
        const withoutSideBar = await pivotRoundTrip(undefined, setPivotMode);
        expect(withoutSideBar[0].headerRows).not.toEqual(withoutSideBar[1].headerRows);

        const withSideBar = await pivotRoundTrip(columnsToolPanel, setPivotMode);

        expect(withSideBar).toEqual(withoutSideBar);
    });

    test.each([
        ['immediate', columnsToolPanel],
        ['deferred', deferredColumnsToolPanel],
    ] as const)(
        "pivot mode turned on and off by the %s columns tool panel's toggle shows the header and creates the header components the API gives without the side bar",
        async (mode, sideBar) => {
            const withoutSideBar = await pivotRoundTrip(undefined, setPivotMode);
            expect(withoutSideBar[0].headerRows).not.toEqual(withoutSideBar[1].headerRows);

            const withToggle = await pivotRoundTrip(sideBar, (api) => {
                const root = getGridElement(api)!;
                root.querySelector<HTMLInputElement>('.ag-pivot-mode-select input')!.click();
                if (mode === 'deferred') {
                    Array.from(root.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button'))
                        .find((button) => button.textContent?.trim() === 'Apply')!
                        .click();
                }
            });

            expect(withToggle).toEqual(withoutSideBar);
        }
    );

    test('with formulas available, a cell edit starting and stopping calls no method of a header component beyond IHeaderComp, and the default header goes through the same edit', async () => {
        const calls: string[] = [];
        class Header implements IHeaderComp {
            private readonly eGui = document.createElement('div');
            public init(params: IHeaderParams): void {
                this.eGui.textContent = params.displayName;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return true;
            }
            // names the grid's own header component answers to
            public onCellEditingChanged(...args: unknown[]): void {
                calls.push(`onCellEditingChanged(${args.length})`);
            }
            public setFormulaRefShown(...args: unknown[]): void {
                calls.push(`setFormulaRefShown(${args.length})`);
            }
        }
        const editing = async (api: GridApi) => {
            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));
            const whileEditing = api.getEditingCells().length;
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
            await asyncSetTimeout(0);
            return whileEditing;
        };
        // the formula module's headers follow cell edits
        const allModules = { modules: [AllEnterpriseModule] };

        const custom = gridsManager.createGrid(
            'reuse',
            {
                columnDefs: [{ colId: 'a', field: 'a', editable: true, headerComponent: Header }],
                rowData: [{ a: 1 }],
            },
            allModules
        );
        await waitFor(() => expect(headerCell(document.getElementById('reuse')!, 'a')).not.toBeNull());
        const customWhileEditing = await editing(custom);

        const standard = gridsManager.createGrid(
            'default',
            { columnDefs: [{ colId: 'a', field: 'a', editable: true }], rowData: [{ a: 1 }] },
            allModules
        );
        await waitFor(() => expect(headerCell(document.getElementById('default')!, 'a')).not.toBeNull());
        const standardWhileEditing = await editing(standard);

        expect({
            editingStarted: [customWhileEditing, standardWhileEditing],
            editingAfter: [custom.getEditingCells().length, standard.getEditingCells().length],
            calls,
        }).toEqual({ editingStarted: [1, 1], editingAfter: [0, 0], calls: [] });
    });
});
