import { GridColumns, TestGridsManager } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, HeaderStyle } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, TextFilterModule } from 'ag-grid-community';

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
                        headerClass: ({ column }) => {
                            const pinned = column!.getPinned() ?? 'none';
                            classCalls.push(`${column!.getColId()}:${pinned}`);
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
                expect(classCalls.sort()).toEqual([`a:${side}`, `b:${side}`]);
                for (const header of headers) {
                    expect(root.contains(header)).toBe(true);
                    const expectedSide = header.getAttribute('col-id') === 'c' ? 'none' : side;
                    expect(header.style.getPropertyValue('--pinned-side')).toBe(expectedSide);
                    if (!header.classList.contains('ag-floating-filter')) {
                        expect(Array.from(header.classList).filter((name) => name.startsWith('pinned-'))).toEqual([
                            `pinned-${expectedSide}`,
                        ]);
                    }
                }
            }
        }
    );

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
});
