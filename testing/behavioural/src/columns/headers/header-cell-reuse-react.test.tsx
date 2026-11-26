import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';
import { afterEach, describe, expect, it, onTestFinished } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent, HeaderStyle, IHeaderComp, IHeaderParams } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import {
    AdvancedFilterModule,
    CellSelectionModule,
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
    SideBarModule,
    TreeDataModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

const rowData = [{ c0: 1, c1: 2, c2: 3, c3: 4, c4: 5 }];
const columnDefs: ColDef[] = [0, 1, 2, 3, 4].map((i) => ({ colId: `c${i}`, field: `c${i}` }));
const ids = columnDefs.map((c) => c.colId!);

describe('React header cell reuse', () => {
    afterEach(() => cleanup());

    it('the header height follows group rows, floating filters and pivot mode, and its overflow class the spanning columns', async () => {
        const apiRef: { current?: GridApi } = {};
        const flat: ColDef[] = [
            { field: 'c0', rowGroup: true },
            { field: 'c1', pivot: true },
            { field: 'c2', aggFunc: 'sum' },
        ];
        const container = render(
            <AgGridReact
                rowData={rowData}
                columnDefs={flat}
                headerHeight={30}
                groupHeaderHeight={40}
                floatingFiltersHeight={20}
                pivotHeaderHeight={35}
                pivotGroupHeaderHeight={45}
                modules={[AllCommunityModule, RowGroupingModule, PivotModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        ).container;
        const state = () => {
            const header = container.querySelector<HTMLElement>('.ag-header');
            return [header?.style.height, header?.classList.contains('ag-header-allow-overflow')];
        };
        await waitFor(() => expect(state()).toEqual(['31px', true]));

        act(() =>
            apiRef.current!.setGridOption('columnDefs', [{ headerName: 'G', children: [flat[0], flat[1]] }, flat[2]])
        );
        await waitFor(() => expect(state()).toEqual(['71px', true]));
        act(() => apiRef.current!.setGridOption('defaultColDef', { filter: true, floatingFilter: true }));
        await waitFor(() => expect(state()).toEqual(['91px', true]));
        act(() => apiRef.current!.setGridOption('pivotMode', true));
        await waitFor(() => expect(state()).toEqual(['101px', true]));
        act(() => apiRef.current!.setGridOption('pivotMode', false));
        await waitFor(() => expect(state()).toEqual(['91px', true]));
        act(() =>
            apiRef.current!.setGridOption('columnDefs', [
                { field: 'c0', rowGroup: false, suppressSpanHeaderHeight: true },
                { field: 'c2', aggFunc: null, suppressSpanHeaderHeight: true },
                { field: 'c3', hide: true },
            ])
        );
        await waitFor(() => expect(state()).toEqual(['51px', false]));
        act(() => apiRef.current!.setColumnsVisible(['c3'], true));
        await waitFor(() => expect(state()).toEqual(['51px', true]));
    });

    it('cleans up header styles when pinning and unpinning', async () => {
        const apiRef: { current?: GridApi } = {};
        const { container } = render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs.slice(0, 2)}
                defaultColDef={{
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    headerStyle: ({ column }): HeaderStyle =>
                        column!.isPinned()
                            ? {
                                  backgroundColor: 'orange',
                                  border: '1px solid black',
                                  borderBottom: '3px solid orange',
                              }
                            : { border: '1px solid black' },
                }}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const headers = () => Array.from(container.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'));
        await waitFor(() => expect(headers()).toHaveLength(4));

        for (const pinned of ['left', null, 'right', null] as const) {
            act(() => apiRef.current!.setColumnsPinned(['c0', 'c1'], pinned));
            await waitFor(() => {
                for (const header of headers()) {
                    expect(header.style.backgroundColor).toBe(pinned ? 'orange' : '');
                    expect(header.style.borderBottom).toBe(pinned ? '3px solid orange' : '1px solid black');
                }
            });
        }
    });

    it('a header cell takes the pinned header class when its column is pinned, and the free one when unpinned', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[
                    columnDefs[0],
                    {
                        ...columnDefs[1],
                        headerClass: (p) => (p.column?.getPinned() ? 'pinned-header' : 'free-header'),
                    },
                ]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const classes = () =>
            Array.from(document.querySelector('.ag-header-cell[col-id="c1"]')?.classList ?? []).filter((name) =>
                name.endsWith('-header')
            );
        await waitFor(() => expect(classes()).toEqual(['free-header']));

        act(() => apiRef.current!.setColumnsPinned(['c1'], 'left'));
        await waitFor(() => expect(classes()).toEqual(['pinned-header']));

        act(() => apiRef.current!.setColumnsPinned(['c1'], null));
        await waitFor(() => expect(classes()).toEqual(['free-header']));
    });

    it('refreshes group header styles when pinning, splitting and merging groups', async () => {
        const apiRef: { current?: GridApi } = {};
        const { container } = render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[{ groupId: 'group', children: columnDefs.slice(0, 2) }]}
                defaultColGroupDef={{
                    headerStyle: ({ columnGroup }) =>
                        columnGroup!.getPinned() === 'left' ? { backgroundColor: 'orange' } : undefined,
                }}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const backgrounds = () =>
            Array.from(
                container.querySelectorAll<HTMLElement>('.ag-header-group-cell[col-id]'),
                (header) => header.style.backgroundColor
            ).sort();
        await waitFor(() => expect(backgrounds()).toEqual(['']));

        for (const pinned of ['left', 'right', null] as const) {
            act(() => apiRef.current!.setColumnsPinned(['c0'], pinned));
            await waitFor(() => {
                const expected = pinned === 'left' ? ['', 'orange'] : ['', ''];
                expect(backgrounds()).toEqual(pinned ? expected : ['']);
            });
        }
        act(() => apiRef.current!.setColumnsPinned(['c0', 'c1'], 'left'));
        await waitFor(() => expect(backgrounds()).toEqual(['orange']));
        act(() => apiRef.current!.setColumnsPinned(['c0', 'c1'], null));
        await waitFor(() => expect(backgrounds()).toEqual(['']));
    });

    it('hide-all then show-all renders correct headers (pooled-ctrl remount is safe)', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );

        const colIds = () => screen.queryAllByRole('columnheader').map((h) => h.getAttribute('col-id'));

        await waitFor(() => expect(colIds()).toEqual(ids));

        // Hidden columns must not be rendered.
        act(() => apiRef.current!.setColumnsVisible(ids, false));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(0));

        // Re-show: pooled ctrls are reused and React remounts the cells correctly.
        act(() => apiRef.current!.setColumnsVisible(ids, true));
        await waitFor(() => expect(colIds()).toEqual(ids));

        // A single-column round-trip also stays correct.
        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(colIds()).toEqual(['c0', 'c1', 'c3', 'c4']));
        act(() => apiRef.current!.setColumnsVisible(['c2'], true));
        await waitFor(() => expect(colIds()).toEqual(ids));
    });

    it('a header cell remounted in another lane highlights the ranges covering it', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule, CellSelectionModule]}
                cellSelection={{ enableHeaderHighlight: true }}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const highlighted = () =>
            Array.from(document.querySelectorAll('.ag-header-range-highlight'), (cell) => cell.getAttribute('col-id'));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));

        act(() => apiRef.current!.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['c1'] }));
        await waitFor(() => expect(highlighted()).toEqual(['c1']));

        // a header cell moved to another lane is drawn in a new element
        const before = document.querySelector('.ag-header-cell[col-id="c1"]');
        act(() => apiRef.current!.setColumnsPinned(['c1'], 'left'));
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="c1"]')).not.toBe(before));
        await waitFor(() => expect(highlighted()).toEqual(['c1']));

        // the remounted cell's own highlight has to follow the ranges, not just its first draw
        act(() => apiRef.current!.clearCellSelection());
        await waitFor(() => expect(highlighted()).toEqual([]));
        act(() => apiRef.current!.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['c1', 'c3'] }));
        await waitFor(() => expect(highlighted()).toEqual(['c1', 'c3']));
    });

    it('a header asked for focus before it mounts takes it, also from an input, unless focus has since moved out of the grid', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </React.StrictMode>
        );
        const header = () => document.querySelector('.ag-header-cell[col-id="c2"]');
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));
        const input = document.body.appendChild(document.createElement('input'));
        onTestFinished(() => input.remove());

        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(header()).toBeNull());
        act(() => {
            apiRef.current!.setColumnsVisible(['c2'], true);
            apiRef.current!.setFocusedHeader('c2');
        });
        await waitFor(() => expect(document.activeElement).toBe(header()));

        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(header()).toBeNull());
        act(() => {
            apiRef.current!.setColumnsVisible(['c2'], true);
            apiRef.current!.setFocusedHeader('c2');
            input.focus();
        });
        await waitFor(() => expect(header()).not.toBeNull());
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(document.activeElement).toBe(input);

        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(header()).toBeNull());
        input.blur();
        act(() => {
            apiRef.current!.setColumnsVisible(['c2'], true);
            apiRef.current!.setFocusedHeader('c2');
            input.focus();
            apiRef.current!.setFocusedHeader('c2');
        });
        await waitFor(() => expect(document.activeElement).toBe(header()));
    });

    it('a header asked for focus before it mounts leaves focus moved between two inputs of another component', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </React.StrictMode>
        );
        const header = () => document.querySelector('.ag-header-cell[col-id="c2"]');
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));
        const widget = document.body.appendChild(document.createElement('div'));
        onTestFinished(() => widget.remove());
        const widgetRoot = widget.attachShadow({ mode: 'open' });
        const first = widgetRoot.appendChild(document.createElement('input'));
        const second = widgetRoot.appendChild(document.createElement('input'));

        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(header()).toBeNull());
        first.focus();
        act(() => {
            apiRef.current!.setColumnsVisible(['c2'], true);
            apiRef.current!.setFocusedHeader('c2');
            second.focus();
        });
        await waitFor(() => expect(header()).not.toBeNull());
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(widgetRoot.activeElement).toBe(second);
    });

    it('of headers and cells asked for focus before they mount, the one asked last takes it', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </React.StrictMode>
        );
        const header = (colId: string) => () => document.querySelector(`.ag-header-cell[col-id="${colId}"]`);
        const cell = () => document.querySelector('.ag-cell[col-id="c2"]');
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));
        const expectLastAskedFocused = async (askBoth: (api: GridApi) => void, focused: () => Element | null) => {
            act(() => apiRef.current!.setColumnsVisible(['c2', 'c3'], false));
            await waitFor(() => expect(header('c3')()).toBeNull());
            (document.activeElement as HTMLElement).blur();
            act(() => {
                apiRef.current!.setColumnsVisible(['c2', 'c3'], true);
                askBoth(apiRef.current!);
            });
            await waitFor(() => expect(cell()).not.toBeNull());
            await act(async () => {
                await asyncSetTimeout(0);
            });
            expect(document.activeElement).toBe(focused());
        };

        await expectLastAskedFocused((api) => {
            api.setFocusedHeader('c2');
            api.setFocusedCell(0, 'c2');
        }, cell);
        await expectLastAskedFocused((api) => {
            api.setFocusedCell(0, 'c2');
            api.setFocusedHeader('c2');
        }, header('c2'));
        await expectLastAskedFocused((api) => {
            api.setFocusedHeader('c2');
            api.setFocusedHeader('c3');
        }, header('c3'));
        await expectLastAskedFocused((api) => {
            api.setFocusedHeader('c3');
            api.setFocusedHeader('c2');
        }, header('c2'));
    });

    it('a header cell shows its column filtered, also one told while it is remounted in another lane', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs.map((colDef) => ({ ...colDef, filter: 'agNumberColumnFilter' }))}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const filtered = () =>
            Array.from(document.querySelectorAll('.ag-header-cell-filtered'), (cell) => cell.getAttribute('col-id'));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));

        act(() => apiRef.current!.setFilterModel({ c1: { filterType: 'number', type: 'equals', filter: 2 } }));
        await waitFor(() => expect(filtered()).toEqual(['c1']));

        const before = document.querySelector('.ag-header-cell[col-id="c3"]');
        act(() => {
            apiRef.current!.setColumnsPinned(['c3'], 'left');
            apiRef.current!.setFilterModel({ c3: { filterType: 'number', type: 'equals', filter: 4 } });
        });
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="c3"]')).not.toBe(before));
        await waitFor(() => expect(filtered()).toEqual(['c3']));
    });

    it('a header cell shows its column sorted at first render, after a sort, after a pin of the sorted column and after a sort change there', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs.slice(0, 3).map((colDef, i) => (i === 0 ? { ...colDef, sort: 'asc' } : colDef))}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const sortedClasses = () => {
            const result: Record<string, string[]> = Object.create(null);
            for (const header of document.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]')) {
                result[header.getAttribute('col-id')!] = Array.from(
                    header.querySelector('.ag-cell-label-container')!.classList
                )
                    .filter((c) => c.startsWith('ag-header-cell-sorted-'))
                    .sort();
            }
            return result;
        };
        const sorted = (c0: string, c1: string, c2: string) => ({
            c0: [`ag-header-cell-sorted-${c0}`],
            c1: [`ag-header-cell-sorted-${c1}`],
            c2: [`ag-header-cell-sorted-${c2}`],
        });
        await waitFor(() => expect(sortedClasses()).toEqual(sorted('asc', 'none', 'none')));

        act(() => {
            apiRef.current!.applyColumnState({ state: [{ colId: 'c1', sort: 'desc' }], defaultState: { sort: null } });
        });
        await waitFor(() => expect(sortedClasses()).toEqual(sorted('none', 'desc', 'none')));

        const before = document.querySelector('.ag-header-cell[col-id="c1"]');
        act(() => apiRef.current!.setColumnsPinned(['c1'], 'left'));
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="c1"]')).not.toBe(before));
        await waitFor(() => expect(sortedClasses()).toEqual(sorted('none', 'desc', 'none')));

        act(() => {
            apiRef.current!.applyColumnState({ state: [{ colId: 'c1', sort: 'asc' }], defaultState: { sort: null } });
        });
        await waitFor(() => expect(sortedClasses()).toEqual(sorted('none', 'asc', 'none')));
    });

    it("a value column's header names its aggregation function, and follows a change of it", async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={[{ country: 'IE', gold: 1 }]}
                columnDefs={[
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', headerName: 'Gold', aggFunc: 'sum' },
                ]}
                modules={[AllCommunityModule, RowGroupingModule, PivotModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const headerText = () =>
            document.querySelector('.ag-header-cell[col-id="gold"] .ag-header-cell-text')?.textContent;
        await waitFor(() => expect(headerText()).toBe('sum(Gold)'));

        act(() => apiRef.current!.setColumnAggFunc('gold', 'avg'));
        await waitFor(() => expect(headerText()).toBe('avg(Gold)'));

        act(() => apiRef.current!.removeValueColumns(['gold']));
        await waitFor(() => expect(headerText()).toBe('Gold'));

        act(() => apiRef.current!.addValueColumns(['gold']));
        await waitFor(() => expect(headerText()).toBe('avg(Gold)'));
    });

    it("a value column's header names its aggregation function once tree data is turned on, and drops it when turned off", async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={[
                    { path: ['a'], amount: 1 },
                    { path: ['a', 'b'], amount: 2 },
                ]}
                columnDefs={[{ field: 'amount', aggFunc: 'sum' }]}
                getDataPath={(data: { path: string[] }) => data.path}
                modules={[AllCommunityModule, RowGroupingModule, TreeDataModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const headerText = () =>
            document.querySelector('.ag-header-cell[col-id="amount"] .ag-header-cell-text')?.textContent;
        await waitFor(() => expect(headerText()).toBe('Amount'));

        act(() => apiRef.current!.setGridOption('treeData', true));
        await waitFor(() => expect(headerText()).toBe('sum(Amount)'));

        act(() => apiRef.current!.setGridOption('treeData', false));
        await waitFor(() => expect(headerText()).toBe('Amount'));
    });

    it('the header rows and cells leave the tab order while an exclusive overlay is shown, and return after', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={[{ c0: 1, c1: 2 }]}
                columnDefs={columnDefs.slice(0, 2)}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const tabIndexes = () => ({
            rows: Array.from(document.querySelectorAll('.ag-header-row')).map((el) => el.getAttribute('tabindex')),
            cells: Array.from(document.querySelectorAll('.ag-header-cell')).map((el) => el.getAttribute('tabindex')),
        });
        await waitFor(() => expect(tabIndexes()).toEqual({ rows: ['0'], cells: ['-1', '-1'] }));

        act(() => apiRef.current!.setGridOption('loading', true));
        await waitFor(() => expect(tabIndexes()).toEqual({ rows: [null], cells: [null, null] }));

        act(() => apiRef.current!.setGridOption('loading', false));
        await waitFor(() => expect(tabIndexes()).toEqual({ rows: ['0'], cells: ['-1', '-1'] }));
    });

    it("a column's own listeners find its header redrawn, also ones added before its header cell was drawn", async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[{ colId: 'a', headerName: 'One', hide: true }, { colId: 'b' }]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        await waitFor(() => expect(apiRef.current?.getColumn('a')?.getColId()).toBe('a'));
        const api = apiRef.current!;
        const headerText = () =>
            document.querySelector('.ag-header-cell[col-id="a"] .ag-header-cell-text')?.textContent;
        const seen: (string | null | undefined)[] = [];
        const a = api.getColumn('a')!;
        a.addEventListener('colDefChanged', () => seen.push(headerText()));
        a.addEventListener('headerNameChanged', () => seen.push(headerText()));
        act(() => api.setColumnsVisible(['a'], true));
        await waitFor(() => expect(headerText()).toBe('One'));

        act(() => api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'Two' }, { colId: 'b' }]));
        act(() => {
            api.applyColumnState({ state: [{ colId: 'a', headerName: 'Three' }] });
        });

        expect(seen).toEqual(['Two', 'Three']);
    });

    it('a column shown and redefined before its header cell mounts shows the new definition', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[{ colId: 'a', headerName: 'One', hide: true }, { colId: 'b' }]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        await waitFor(() => expect(document.querySelectorAll('.ag-header-cell[col-id="b"]')).toHaveLength(1));
        const api = apiRef.current!;

        act(() => {
            api.setColumnsVisible(['a'], true);
            api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'Two' }, { colId: 'b' }]);
        });

        await waitFor(() =>
            expect(document.querySelector('.ag-header-cell[col-id="a"] .ag-header-cell-text')?.textContent).toBe('Two')
        );
    });

    it('a column shown as column selection is turned on, before its header cell mounts, shows its header', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[{ colId: 'a', headerName: 'One', hide: true }, { colId: 'b' }]}
                modules={[AllCommunityModule, CellSelectionModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        await waitFor(() => expect(document.querySelectorAll('.ag-header-cell[col-id="b"]')).toHaveLength(1));
        const api = apiRef.current!;

        act(() => {
            api.setColumnsVisible(['a'], true);
            api.setGridOption('cellSelection', { enableColumnSelection: true });
        });

        await waitFor(() =>
            expect(document.querySelector('.ag-header-cell[col-id="a"] .ag-header-cell-text')?.textContent).toBe('One')
        );
    });

    it('turning the advanced filter on swaps the floating filter row for the advanced filter bar, and off brings the row back', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[
                    { colId: 'a', filter: true },
                    { colId: 'b', filter: true, floatingFilter: true },
                ]}
                modules={[AllCommunityModule, AdvancedFilterModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const shown = () => {
            const button = document.querySelector(
                '.ag-header-cell[col-id="a"]:not(.ag-floating-filter) .ag-header-cell-filter-button'
            );
            return {
                floatingFilterRow: document.querySelector('.ag-header-row-filter') != null,
                floatingFilterCells: Array.from(
                    document.querySelectorAll('.ag-header-row-filter .ag-header-cell'),
                    (cell) => cell.getAttribute('col-id')
                ),
                advancedFilterBar: document.querySelector('.ag-advanced-filter-header') != null,
                filterButton: button != null && !button.classList.contains('ag-hidden'),
            };
        };
        const advancedFilterOff = {
            floatingFilterRow: true,
            floatingFilterCells: ['a', 'b'],
            advancedFilterBar: false,
            filterButton: true,
        };
        await waitFor(() => expect(shown()).toEqual(advancedFilterOff));

        act(() => apiRef.current!.setGridOption('enableAdvancedFilter', true));
        await waitFor(() =>
            expect(shown()).toEqual({
                floatingFilterRow: false,
                floatingFilterCells: [],
                advancedFilterBar: true,
                filterButton: false,
            })
        );

        act(() => apiRef.current!.setGridOption('enableAdvancedFilter', false));
        await waitFor(() => expect(shown()).toEqual(advancedFilterOff));
    });

    it('an update removing a column and changing a header option calls no headerStyle of the column once it is gone', async () => {
        const apiRef: { current?: GridApi } = {};
        const calledOnceGone: string[] = [];
        const colDef = (colId: string): ColDef => ({
            colId,
            headerStyle: (params) => {
                if (params.column?.getColId() === 'b' && !params.api.getColumn('b')) {
                    calledOnceGone.push('headerStyle');
                }
                return undefined;
            },
        });
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[colDef('a'), colDef('b')]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        await waitFor(() => expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(2));

        act(() => apiRef.current!.updateGridOptions({ columnDefs: [colDef('a')], suppressMenuHide: true }));
        await waitFor(() => expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(1));

        expect(calledOnceGone).toEqual([]);
    });

    it('a column with a floating filter shown and pinned before its header cells mount shows them pinned', async () => {
        const apiRef: { current?: GridApi } = {};
        const filter = { filter: 'agTextColumnFilter', floatingFilter: true };
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={[
                    { colId: 'a', hide: true, headerStyle: { color: 'red' }, ...filter },
                    { colId: 'b', ...filter },
                ]}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        await waitFor(() => expect(document.querySelectorAll('.ag-header-cell[col-id="b"]')).toHaveLength(2));
        const api = apiRef.current!;

        act(() => {
            api.setColumnsVisible(['a'], true);
            api.setColumnsPinned(['a'], 'left');
        });

        await waitFor(() =>
            expect(
                Array.from(document.querySelectorAll<HTMLElement>('.ag-header-cell[col-id="a"]'), (cell) => [
                    cell.classList.contains('ag-floating-filter'),
                    cell.style.color,
                ])
            ).toEqual([
                [false, 'red'],
                [true, 'red'],
            ])
        );
    });

    it('setting the same column definitions while the columns tool panel is shown keeps every header cell and creates no header component', async () => {
        const apiRef: { current?: GridApi } = {};
        const counter = { inits: 0 };
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
        }
        render(
            <React.StrictMode>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs.slice(0, 3)}
                    defaultColDef={{ headerComponent: CountingHeader }}
                    sideBar={{ toolPanels: ['columns'], defaultToolPanel: 'columns' }}
                    modules={[
                        AllCommunityModule,
                        RowGroupingModule,
                        PivotModule,
                        ColumnsToolPanelModule,
                        SideBarModule,
                    ]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </React.StrictMode>
        );
        const headerCells = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-header-cell[col-id]'));
        await waitFor(() =>
            expect({
                panelShown: apiRef.current?.isToolPanelShowing(),
                headers: headerCells().map((cell) => cell.textContent!.trim()),
            }).toEqual({ panelShown: true, headers: ['C0', 'C1', 'C2'] })
        );
        await act(async () => {
            await asyncSetTimeout(0);
        });
        const before = headerCells();
        counter.inits = 0;

        act(() => apiRef.current!.setGridOption('columnDefs', apiRef.current!.getColumnDefs()));
        await act(async () => {
            await asyncSetTimeout(0);
        });

        expect({ inits: counter.inits, kept: headerCells().map((cell, i) => cell === before[i]) }).toEqual({
            inits: 0,
            kept: [true, true, true],
        });
    });
});
