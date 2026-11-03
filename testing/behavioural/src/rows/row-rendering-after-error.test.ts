import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import {
    CellSpanModule,
    ClientSideRowModelModule,
    PinnedRowModule,
    RenderApiModule,
    ScrollApiModule,
} from 'ag-grid-community';
import type {
    GridApi,
    ICellRendererComp,
    ICellRendererParams,
    IsFullWidthRowParams,
    VirtualRowRemovedEvent,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

type Row = { id: string; a: string };

const buildRows = (count: number, prefix = 'row'): Row[] =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}`, a: `${prefix}-${i}` }));

describe('Row rendering after an error while rows are drawn', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule, RenderApiModule, ScrollApiModule, RowGroupingModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const renderedRowIds = (api: GridApi<Row>) =>
        Array.from(TestGridsManager.getHTMLElement(api)!.querySelectorAll('.ag-row'))
            .map((row) => row.getAttribute('row-id'))
            .sort();

    const cellText = (api: GridApi<Row>, rowId: string) =>
        TestGridsManager.getHTMLElement(api)!.querySelector(`.ag-row[row-id="${rowId}"] .ag-cell[col-id="a"]`)
            ?.textContent;

    /** Records the rows `isFullWidthRow` is asked about (once per row drawn, and on each data change) and removed. */
    function trackRows() {
        let throwFor: string | undefined;
        const askedRowIds: string[] = [];
        const removedRowIds: string[] = [];
        return {
            askedRowIds,
            removedRowIds,
            throwOnceFor: (id: string) => {
                throwFor = id;
            },
            isFullWidthRow: (params: IsFullWidthRowParams<Row>) => {
                const id = params.rowNode.id!;
                if (id === throwFor) {
                    throwFor = undefined;
                    throw new Error('isFullWidthRow failed');
                }
                askedRowIds.push(id);
                return false;
            },
            onVirtualRowRemoved: (event: VirtualRowRemovedEvent<Row>) => removedRowIds.push(event.node.id!),
        };
    }

    /** `isFullWidthRow` throws once, for the first row whose id is `throwFor`. */
    function throwOnceFor(throwFor: string) {
        let thrown = false;
        return (params: IsFullWidthRowParams<Row>) => {
            if (!thrown && params.rowNode.id === throwFor) {
                thrown = true;
                throw new Error('isFullWidthRow failed');
            }
            return false;
        };
    }

    test('an update that threw shows the rows drawn before the throw, the next update draws its rows, and every row removed reports virtualRowRemoved once', async () => {
        const removedRowIds: (string | undefined)[] = [];
        const api = await gridMgr.createGridAndWait<Row>('rowsAfterThrowingUpdate', {
            columnDefs: [{ field: 'a' }],
            rowData: buildRows(3),
            getRowId: (p) => p.data.id,
            isFullWidthRow: throwOnceFor('bad-1'),
            onVirtualRowRemoved: (event) => removedRowIds.push(event.node.id),
        });
        await waitFor(() => expect(renderedRowIds(api)).toEqual(['row-0', 'row-1', 'row-2']));

        expect(() => api.setGridOption('rowData', buildRows(2, 'bad'))).toThrow('isFullWidthRow failed');
        await waitFor(() => expect(renderedRowIds(api)).toEqual(['bad-0']));

        api.setGridOption('rowData', buildRows(2, 'next'));
        await waitFor(() => expect(renderedRowIds(api)).toEqual(['next-0', 'next-1']));
        await waitFor(() => expect(removedRowIds.sort()).toEqual(['bad-0', 'row-0', 'row-1', 'row-2']));
    });

    test('a scroll after an update that threw counts the rows of the update and keeps the rows shown', async () => {
        const api = await gridMgr.createGridAndWait<Row>('scrollAfterThrowingUpdate', {
            columnDefs: [{ field: 'a' }],
            rowData: buildRows(3),
            getRowId: (p) => p.data.id,
            rowHeight: 25,
            rowBuffer: 30,
            suppressRowVirtualisation: false,
            isFullWidthRow: throwOnceFor('next-1'),
        });
        const gridElement = TestGridsManager.getHTMLElement(api)!;
        const ariaRowCount = () => gridElement.querySelector('.ag-grid-viewport')!.getAttribute('aria-rowcount');
        const rowElement = (id: string) => gridElement.querySelector(`.ag-row[row-id="${id}"]`);
        expect(ariaRowCount()).toBe('4');

        expect(() => api.setGridOption('rowData', buildRows(200, 'next'))).toThrow('isFullWidthRow failed');
        await waitFor(() => expect(rowElement('next-0')).not.toBeNull());
        const shownRow = rowElement('next-0');
        api.ensureIndexVisible(20, 'top');

        await waitFor(() => expect(renderedRowIds(api)).toContain('next-45'));
        expect({ ariaRowCount: ariaRowCount(), sameRow: rowElement('next-0') === shownRow }).toEqual({
            ariaRowCount: '201',
            sameRow: true,
        });
    });

    test('pinned rows replaced by an update that threw are drawn by the next row data update, each destroyed once, and the rows shown refresh on a data change', async () => {
        const rows = trackRows();
        rows.throwOnceFor('q-1');
        const api = await gridMgr.createGridAndWait<Row>('pinnedAfterThrow', {
            columnDefs: [{ field: 'a' }],
            rowData: buildRows(1),
            pinnedTopRowData: buildRows(2, 'p'),
            getRowId: (p) => p.data.id,
            isFullWidthRow: rows.isFullWidthRow,
            onVirtualRowRemoved: rows.onVirtualRowRemoved,
        });

        expect(() => api.setGridOption('pinnedTopRowData', buildRows(2, 'q'))).toThrow('isFullWidthRow failed');
        api.setGridOption('rowData', buildRows(1, 'next'));
        await waitFor(() => expect(renderedRowIds(api)).toEqual(['next-0', 'q-0', 'q-1']));
        const isPinned = (id: string) => !id.startsWith('row-') && !id.startsWith('next-');
        const drawnPinnedRowIds = rows.askedRowIds.splice(0).filter(isPinned);

        api.getPinnedTopRow(0)!.setData({ id: 'q-0', a: 'changed' });
        expect(rows.askedRowIds).toEqual(['q-0']);

        api.setGridOption('pinnedTopRowData', []);
        await waitFor(() => expect(rows.removedRowIds.filter(isPinned).sort()).toEqual(drawnPinnedRowIds.sort()));
    });

    test('rows redrawn by redrawRows with rowNodes that threw stay live and shown, and each redraw replaces a row once', async () => {
        const rows = trackRows();
        const api = await gridMgr.createGridAndWait<Row>('redrawRowAfterThrow', {
            columnDefs: [{ field: 'a' }],
            rowData: buildRows(2),
            getRowId: (p) => p.data.id,
            isFullWidthRow: rows.isFullWidthRow,
            onVirtualRowRemoved: rows.onVirtualRowRemoved,
        });
        const row1 = api.getRowNode('row-1')!;
        rows.throwOnceFor('row-1');

        expect(() => api.redrawRows({ rowNodes: [row1] })).toThrow('isFullWidthRow failed');
        rows.askedRowIds.length = 0;
        api.redrawRows({ rowNodes: [row1] });
        expect(rows.askedRowIds).toEqual(['row-1']);
        api.setGridOption('rowData', buildRows(2));
        rows.askedRowIds.length = 0;

        row1.setData({ id: 'row-1', a: 'changed' });
        expect(rows.askedRowIds).toEqual(['row-1']);

        const row0 = api.getRowNode('row-0')!;
        rows.throwOnceFor('row-1');
        expect(() => api.redrawRows({ rowNodes: [row0, row1] })).toThrow('isFullWidthRow failed');
        row0.setData({ id: 'row-0', a: 'row-0 changed' });
        await waitFor(() => expect(cellText(api, 'row-0')).toBe('row-0 changed'));
        api.setGridOption('rowData', []);
        await waitFor(() => expect(rows.removedRowIds.sort()).toEqual(['row-0', 'row-0', 'row-1', 'row-1']));
    });

    test('after a scroll whose sticky rows threw, the group row is drawn in the body when scrolled back to, the same scroll again draws its rows, and every sticky row drawn is destroyed once', async () => {
        const rows = trackRows();
        rows.throwOnceFor('row-group-g1-B-g2-X');
        const api = await gridMgr.createGridAndWait<Row & { g1: string; g2: string }>('stickyAfterThrow', {
            columnDefs: [
                { field: 'g1', rowGroup: true, hide: true },
                { field: 'g2', rowGroup: true, hide: true },
                { field: 'a' },
            ],
            rowData: Array.from({ length: 200 }, (_, i) => ({
                id: `row-${i}`,
                a: `row-${i}`,
                g1: i < 100 ? 'A' : 'B',
                g2: i % 100 < 50 ? 'X' : 'Y',
            })),
            getRowId: (p) => p.data.id,
            groupDefaultExpanded: -1,
            rowHeight: 25,
            suppressRowVirtualisation: false,
            isFullWidthRow: rows.isFullWidthRow,
            onVirtualRowRemoved: rows.onVirtualRowRemoved,
        });
        const groupRowIds = (ids: string[]) => ids.filter((id) => id.startsWith('row-group')).sort();
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-0'));
        rows.askedRowIds.length = 0;
        rows.removedRowIds.length = 0;

        expect(() => api.ensureIndexVisible(140, 'top')).toThrow('isFullWidthRow failed');
        api.ensureIndexVisible(95, 'top');
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-group-g1-B'));
        rows.throwOnceFor('row-group-g1-B-g2-X');
        expect(() => api.ensureIndexVisible(140, 'top')).toThrow('isFullWidthRow failed');
        api.ensureIndexVisible(140, 'top');
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-140'));
        api.ensureIndexVisible(0, 'top');

        await waitFor(() => expect(renderedRowIds(api)).toContain('row-0'));
        await waitFor(() => expect(groupRowIds(rows.removedRowIds)).toEqual(groupRowIds(rows.askedRowIds)));
        expect(groupRowIds(rows.askedRowIds)).toContain('row-group-g1-B');
    });

    test('a sticky row whose redraw threw stays shown as a sticky row, and the next redraw replaces it, at the top and the bottom', async () => {
        const rows = trackRows();
        const api = await gridMgr.createGridAndWait<Row & { g1: string; g2: string }>('stickyRedrawThrew', {
            columnDefs: [
                { field: 'g1', rowGroup: true, hide: true },
                { field: 'g2', rowGroup: true, hide: true },
                { field: 'a' },
            ],
            rowData: Array.from({ length: 200 }, (_, i) => ({
                id: `row-${i}`,
                a: `row-${i}`,
                g1: i < 100 ? 'A' : 'B',
                g2: i % 100 < 50 ? 'X' : 'Y',
            })),
            getRowId: (p) => p.data.id,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowHeight: 25,
            suppressRowVirtualisation: false,
            isFullWidthRow: rows.isFullWidthRow,
            onVirtualRowRemoved: rows.onVirtualRowRemoved,
        });
        const gridElement = TestGridsManager.getHTMLElement(api)!;
        const groupBX = api.getRowNode('row-group-g1-B-g2-X')!;
        const footerBX = groupBX.sibling;
        const stickyRow = (section: 'top' | 'bottom', id: string) =>
            gridElement.querySelector(`.ag-grid-sticky-${section}-rows-container .ag-row[row-id="${id}"]`);
        const removals = (id: string) => rows.removedRowIds.filter((removedId) => removedId === id);
        api.ensureIndexVisible(115, 'top');
        await waitFor(() => expect(stickyRow('top', groupBX.id!)).not.toBeNull());
        await waitFor(() => expect(stickyRow('bottom', footerBX.id!)).not.toBeNull());

        rows.throwOnceFor(groupBX.id!);
        expect(() => api.redrawRows({ rowNodes: [groupBX] })).toThrow('isFullWidthRow failed');
        await waitFor(() => expect(stickyRow('top', groupBX.id!)).not.toBeNull());
        const shownRow = stickyRow('top', groupBX.id!);
        expect(removals(groupBX.id!)).toEqual([]);

        api.redrawRows({ rowNodes: [groupBX] });
        await waitFor(() => expect(stickyRow('top', groupBX.id!)).not.toBe(shownRow));
        expect(stickyRow('top', groupBX.id!)).not.toBeNull();
        await waitFor(() => expect(removals(groupBX.id!)).toEqual([groupBX.id]));

        rows.throwOnceFor(footerBX.id!);
        expect(() => api.redrawRows({ rowNodes: [footerBX] })).toThrow('isFullWidthRow failed');
        await waitFor(() => expect(stickyRow('bottom', footerBX.id!)).not.toBeNull());
        const shownFooter = stickyRow('bottom', footerBX.id!);
        expect(removals(footerBX.id!)).toEqual([]);

        api.redrawRows({ rowNodes: [footerBX] });
        await waitFor(() => expect(stickyRow('bottom', footerBX.id!)).not.toBe(shownFooter));
        expect(stickyRow('bottom', footerBX.id!)).not.toBeNull();
        await waitFor(() => expect(removals(footerBX.id!)).toEqual([footerBX.id]));
    });

    test('a scroll whose new bottom sticky row threw shows the top sticky rows it had set', async () => {
        const rows = trackRows();
        const api = await gridMgr.createGridAndWait<Row & { g1: string; g2: string }>('stickyBottomThrew', {
            columnDefs: [
                { field: 'g1', rowGroup: true, hide: true },
                { field: 'g2', rowGroup: true, hide: true },
                { field: 'a' },
            ],
            rowData: Array.from({ length: 200 }, (_, i) => ({
                id: `row-${i}`,
                a: `row-${i}`,
                g1: i < 100 ? 'A' : 'B',
                g2: i % 100 < 50 ? 'X' : 'Y',
            })),
            getRowId: (p) => p.data.id,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowHeight: 25,
            suppressRowVirtualisation: false,
            isFullWidthRow: rows.isFullWidthRow,
        });
        const gridElement = TestGridsManager.getHTMLElement(api)!;
        const viewport = gridElement.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const groupB = api.getRowNode('row-group-g1-B')!;
        const footerBX = api.getRowNode('row-group-g1-B-g2-X')!.sibling;
        const stickyRow = (section: 'top' | 'bottom', id: string) =>
            gridElement.querySelector(`.ag-grid-sticky-${section}-rows-container .ag-row[row-id="${id}"]`);
        // a scroll is drawn in an animation frame, where its throw is caught to be asserted
        const frameErrors: unknown[] = [];
        const requestAnimationFrame = window.requestAnimationFrame.bind(window);
        const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
            requestAnimationFrame((time) => {
                try {
                    callback(time);
                } catch (e) {
                    frameErrors.push(e);
                }
            })
        );
        onTestFinished(() => frameSpy.mockRestore());
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-0'));
        expect(stickyRow('top', groupB.id!)).toBeNull();

        rows.throwOnceFor(footerBX.id!);
        viewport.scrollTop = 115 * 25;
        viewport.dispatchEvent(new Event('scroll'));
        await waitFor(() => expect(frameErrors).toEqual([new Error('isFullWidthRow failed')]));

        expect(stickyRow('top', groupB.id!)).not.toBeNull();
    });

    test('a scroll whose new spanned cell threw shows its rows and the span when scrolled within them', async () => {
        let askedForThrowRow = 0;
        const api = await gridMgr.createGridAndWait<Row>(
            'spannedScrollThrew',
            {
                columnDefs: [
                    { field: 'a', spanRows: true },
                    { colId: 'b', field: 'id' },
                ],
                enableCellSpan: true,
                rowData: Array.from({ length: 200 }, (_, i) => ({ id: `r${i}`, a: `s${Math.floor(i / 2)}` })),
                getRowId: (p) => p.data.id,
                rowHeight: 25,
                suppressRowVirtualisation: false,
                // a span's first row is asked by the span cache, its row, then its span, so the third ask is the span's
                isFullWidthRow: (params) => {
                    if (params.rowNode.id === 'r150' && ++askedForThrowRow === 3) {
                        throw new Error('isFullWidthRow failed');
                    }
                    return false;
                },
            },
            { modules: [CellSpanModule] }
        );
        const gridElement = TestGridsManager.getHTMLElement(api)!;
        const viewport = gridElement.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const frameErrors: unknown[] = [];
        const requestAnimationFrame = window.requestAnimationFrame.bind(window);
        const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
            requestAnimationFrame((time) => {
                try {
                    callback(time);
                } catch (e) {
                    frameErrors.push(e);
                }
            })
        );
        onTestFinished(() => frameSpy.mockRestore());
        const scrollTo = (top: number) => {
            viewport.scrollTop = top;
            viewport.dispatchEvent(new Event('scroll'));
        };

        scrollTo(150 * 25);
        await waitFor(() => expect(frameErrors).toEqual([new Error('isFullWidthRow failed')]));
        scrollTo(150 * 25 + 3);

        await waitFor(() => expect(gridElement.querySelector('.ag-spanned-row[row-id="r150"]')).not.toBeNull());
        expect(gridElement.querySelector('.ag-row[row-id="r151"]')).not.toBeNull();
    });

    test('a row whose cell threw while redrawn by redrawRows stays shown', async () => {
        let throwFor: string | undefined;
        const api = await gridMgr.createGridAndWait<Row>('redrawRowsCellThrew', {
            columnDefs: [
                {
                    field: 'a',
                    valueFormatter: (params) => {
                        if (params.node!.id === throwFor) {
                            throwFor = undefined;
                            throw new Error('valueFormatter failed');
                        }
                        return params.value;
                    },
                },
            ],
            rowData: buildRows(3),
            getRowId: (p) => p.data.id,
            suppressAnimationFrame: true,
        });
        await waitFor(() => expect(cellText(api, 'row-1')).toBe('row-1'));

        throwFor = 'row-1';
        expect(() => api.redrawRows({ rowNodes: [api.getRowNode('row-1')!] })).toThrow('valueFormatter failed');
        expect(cellText(api, 'row-1')).toBe('row-1');
    });

    test('a row whose cell threw while drawn leaves nothing behind and reports virtualRowRemoved once: a column change formats each row shown once', async () => {
        const formattedRowIds: string[] = [];
        const removedRowIds: string[] = [];
        let throwFor: string | undefined;
        const api = await gridMgr.createGridAndWait<Row>('cellThrew', {
            columnDefs: [
                {
                    field: 'a',
                    valueFormatter: (params) => {
                        const id = params.node!.id!;
                        if (id === throwFor) {
                            throwFor = undefined;
                            throw new Error('valueFormatter failed');
                        }
                        formattedRowIds.push(id);
                        return params.value;
                    },
                },
                { colId: 'b', field: 'a' },
            ],
            rowData: buildRows(1),
            getRowId: (p) => p.data.id,
            onVirtualRowRemoved: (event) => removedRowIds.push(event.node.id!),
        });

        throwFor = 'next-1';
        expect(() => api.setGridOption('rowData', buildRows(2, 'next'))).toThrow('valueFormatter failed');
        api.setGridOption('rowData', buildRows(2, 'next'));
        await waitFor(() => expect(renderedRowIds(api)).toEqual(['next-0', 'next-1']));
        await waitFor(() => expect(removedRowIds.sort()).toEqual(['next-1', 'row-0']));
        formattedRowIds.length = 0;

        api.setColumnsVisible(['a'], false);
        api.setColumnsVisible(['a'], true);
        await waitFor(() => expect(cellText(api, 'next-1')).toBe('next-1'));
        expect(formattedRowIds.sort()).toEqual(['next-0', 'next-1']);
    });

    test('an update whose spanned cell threw shows each span once, and a column change formats each span shown once, after it and after spans are removed, and a refresh after a reorder keeping the spans formats them in the new order', async () => {
        const formattedRowIds: string[] = [];
        const removedRowIds: string[] = [];
        let throwFor: string | undefined;
        let askedForThrowRow = 0;
        const spanRows = (ids: string[]) => ids.map((id) => ({ id, a: id.slice(0, -1) }));
        const api = await gridMgr.createGridAndWait<Row>(
            'spannedCellThrew',
            {
                columnDefs: [
                    {
                        field: 'a',
                        spanRows: true,
                        valueFormatter: (params) => {
                            formattedRowIds.push(params.node!.id!);
                            return params.value;
                        },
                    },
                    { colId: 'b', field: 'id' },
                ],
                enableCellSpan: true,
                rowData: spanRows(['x0', 'x1', 'y0', 'y1']),
                getRowId: (p) => p.data.id,
                // a span's first row is asked by the span cache, its row, then its span, so the third ask is the span's
                isFullWidthRow: (params) => {
                    if (params.rowNode.id === throwFor && ++askedForThrowRow === 3) {
                        throwFor = undefined;
                        throw new Error('isFullWidthRow failed');
                    }
                    return false;
                },
                onVirtualRowRemoved: (event) => removedRowIds.push(event.node.id!),
            },
            { modules: [CellSpanModule] }
        );
        const spannedRowIds = () =>
            Array.from(TestGridsManager.getHTMLElement(api)!.querySelectorAll('.ag-spanned-row'))
                .map((row) => row.getAttribute('row-id'))
                .sort();
        await waitFor(() => expect(spannedRowIds()).toEqual(['x0', 'y0']));
        const spannedRow = (id: string) =>
            TestGridsManager.getHTMLElement(api)!.querySelector(`.ag-spanned-row[row-id="${id}"]`);
        const shownX0 = spannedRow('x0');

        throwFor = 'w0';
        expect(() => api.setGridOption('rowData', spanRows(['x0', 'x1', 'y0', 'y1', 'z0', 'z1', 'w0', 'w1']))).toThrow(
            'isFullWidthRow failed'
        );
        await waitFor(() => expect(spannedRowIds()).toEqual(['w0', 'x0', 'y0', 'z0']));
        expect(spannedRow('x0')).toBe(shownX0);
        formattedRowIds.length = 0;

        api.setColumnsVisible(['a'], false);
        api.setColumnsVisible(['a'], true);
        await waitFor(() => expect(formattedRowIds.sort()).toEqual(['w0', 'x0', 'y0', 'z0']));

        api.setGridOption('rowData', spanRows(['x0', 'x1', 'y0', 'y1']));
        await waitFor(() => expect(spannedRowIds()).toEqual(['x0', 'y0']));
        // the row and its span
        await waitFor(() => expect(removedRowIds.filter((id) => id === 'w0')).toEqual(['w0', 'w0']));
        formattedRowIds.length = 0;
        api.setColumnsVisible(['a'], false);
        api.setColumnsVisible(['a'], true);
        await waitFor(() => expect(formattedRowIds.sort()).toEqual(['x0', 'y0']));

        api.setGridOption('rowData', spanRows(['y0', 'y1', 'x0', 'x1']));
        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.id).toBe('y0'));
        formattedRowIds.length = 0;
        api.refreshCells({ columns: ['a'], force: true });
        expect(formattedRowIds).toEqual(['y0', 'x0']);
    });

    test('a scroll whose new sticky row threw draws its rows when scrolled within them', async () => {
        const rows = trackRows();
        const api = await gridMgr.createGridAndWait<Row & { g1: string; g2: string }>('stickyScrollWithinRows', {
            columnDefs: [
                { field: 'g1', rowGroup: true, hide: true },
                { field: 'g2', rowGroup: true, hide: true },
                { field: 'a' },
            ],
            rowData: Array.from({ length: 200 }, (_, i) => ({
                id: `row-${i}`,
                a: `row-${i}`,
                g1: i < 100 ? 'A' : 'B',
                g2: i % 100 < 50 ? 'X' : 'Y',
            })),
            getRowId: (p) => p.data.id,
            groupDefaultExpanded: -1,
            rowHeight: 25,
            suppressRowVirtualisation: false,
            isFullWidthRow: rows.isFullWidthRow,
        });
        const viewport = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const scrollTo = (top: number) => {
            viewport.scrollTop = top;
            viewport.dispatchEvent(new Event('scroll'));
        };
        // a scroll is drawn in an animation frame, where its throw is caught to be asserted
        const frameErrors: unknown[] = [];
        const requestAnimationFrame = window.requestAnimationFrame.bind(window);
        const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
            requestAnimationFrame((time) => {
                try {
                    callback(time);
                } catch (e) {
                    frameErrors.push(e);
                }
            })
        );
        onTestFinished(() => frameSpy.mockRestore());

        // group rows B and B-Y are display rows 103 and 155: partly scrolled out at row * 25 + 5 they stick, at row * 25 not
        rows.throwOnceFor('row-group-g1-B');
        scrollTo(103 * 25 + 5);
        await waitFor(() => expect(frameErrors).toEqual([new Error('isFullWidthRow failed')]));
        scrollTo(103 * 25);
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-100'));
        expect(renderedRowIds(api)).not.toContain('row-0');

        rows.throwOnceFor('row-group-g1-B-g2-Y');
        scrollTo(155 * 25 + 5);
        await waitFor(() => expect(frameErrors).toHaveLength(2));
        scrollTo(155 * 25);

        await waitFor(() => expect(renderedRowIds(api)).toContain('row-150'));
        expect(renderedRowIds(api)).not.toContain('row-100');
    });

    test('a cell renderer that throws while a scroll is drawn leaves the other rows of the scroll rendered', async () => {
        let throwFor: string | undefined;
        class Renderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(params: ICellRendererParams<Row>): void {
                if (params.node.id === throwFor) {
                    throwFor = undefined;
                    throw new Error('cell renderer failed');
                }
                this.eGui.textContent = params.value;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }
        const api = await gridMgr.createGridAndWait<Row>('rendererThrewInFrame', {
            columnDefs: [{ field: 'a', cellRenderer: Renderer }],
            rowData: buildRows(200),
            getRowId: (p) => p.data.id,
            rowHeight: 25,
            suppressRowVirtualisation: false,
        });
        await waitFor(() => expect(cellText(api, 'row-0')).toBe('row-0'));
        const viewport = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;

        // a scroll is drawn in animation frames, where the throw is caught to be asserted
        const frameErrors: unknown[] = [];
        const requestAnimationFrame = window.requestAnimationFrame.bind(window);
        const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
            requestAnimationFrame((time) => {
                try {
                    callback(time);
                } catch (e) {
                    frameErrors.push(e);
                }
            })
        );
        onTestFinished(() => frameSpy.mockRestore());
        throwFor = 'row-150';
        viewport.scrollTop = 150 * 25;
        viewport.dispatchEvent(new Event('scroll'));

        await waitFor(() => expect(frameErrors).toEqual([new Error('cell renderer failed')]));
        await waitFor(() => {
            const shownRowIds = renderedRowIds(api).filter((id) => id !== 'row-150');
            expect(shownRowIds).toContain('row-160');
            expect(shownRowIds.map((id) => cellText(api, id!))).toEqual(shownRowIds);
        });
    });

    test('a flush of animation frames that throws leaves one frame requested, which draws the rest', async () => {
        let throwFor: string | undefined;
        class Renderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(params: ICellRendererParams<Row>): void {
                if (params.node.id === throwFor) {
                    throwFor = undefined;
                    throw new Error('cell renderer failed');
                }
                this.eGui.textContent = params.value;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }
        const api = await gridMgr.createGridAndWait<Row>('flushThrew', {
            columnDefs: [{ field: 'a', cellRenderer: Renderer }],
            rowData: buildRows(200),
            getRowId: (p) => p.data.id,
            rowHeight: 25,
            suppressRowVirtualisation: false,
        });
        await waitFor(() => expect(cellText(api, 'row-0')).toBe('row-0'));
        const viewport = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const requestedFrames: FrameRequestCallback[] = [];
        const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            requestedFrames.push(callback);
            return requestedFrames.length;
        });
        onTestFinished(() => frameSpy.mockRestore());

        throwFor = 'row-150';
        viewport.scrollTop = 150 * 25;
        viewport.dispatchEvent(new Event('scroll'));
        expect(requestedFrames).toHaveLength(1);
        expect(() => api.flushAllAnimationFrames()).toThrow('cell renderer failed');
        expect(requestedFrames).toHaveLength(1);

        while (requestedFrames.length) {
            requestedFrames.shift()!(0);
        }
        expect(cellText(api, 'row-160')).toBe('row-160');

        viewport.scrollTop = 0;
        viewport.dispatchEvent(new Event('scroll'));
        expect(api.isAnimationFrameQueueEmpty()).toBe(false);
        api.flushAllAnimationFrames();
        expect({ queueEmpty: api.isAnimationFrameQueueEmpty(), row0: cellText(api, 'row-0') }).toEqual({
            queueEmpty: true,
            row0: 'row-0',
        });
    });

    test('a cell renderer that throws while a scroll restores focus leaves the scrolls after it drawing only their new rows', async () => {
        let throwFor: string | undefined;
        class Renderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(params: ICellRendererParams<Row>): void {
                if (params.node.id === throwFor) {
                    throwFor = undefined;
                    throw new Error('cell renderer failed');
                }
                this.eGui.textContent = params.value;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return false;
            }
        }
        const readRowIds: string[] = [];
        const api = await gridMgr.createGridAndWait<Row & { g1: string }>('focusRestoreThrew', {
            columnDefs: [
                { field: 'g1', rowGroup: true, hide: true },
                { field: 'a', cellRenderer: Renderer },
                {
                    colId: 'count',
                    aggFunc: 'sum',
                    valueGetter: (params) => {
                        readRowIds.push(params.node!.id!);
                        return 1;
                    },
                },
            ],
            rowData: Array.from({ length: 200 }, (_, i) => ({
                id: `row-${i}`,
                a: `row-${i}`,
                g1: i < 100 ? 'A' : 'B',
            })),
            getRowId: (p) => p.data.id,
            groupDefaultExpanded: -1,
            rowHeight: 25,
            suppressRowVirtualisation: false,
        });
        const gridElement = TestGridsManager.getHTMLElement(api)!;
        const viewport = gridElement.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const scrollTo = (top: number) => {
            viewport.scrollTop = top;
            viewport.dispatchEvent(new Event('scroll'));
        };
        // a scroll is drawn in an animation frame, where its throw is caught to be asserted
        const frameErrors: unknown[] = [];
        const requestAnimationFrame = window.requestAnimationFrame.bind(window);
        const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
            requestAnimationFrame((time) => {
                try {
                    callback(time);
                } catch (e) {
                    frameErrors.push(e);
                }
            })
        );
        onTestFinished(() => frameSpy.mockRestore());
        await waitFor(() => expect(cellText(api, 'row-0')).toBe('row-0'));
        api.setFocusedCell(0, 'a');
        expect(document.activeElement?.closest('.ag-row')?.getAttribute('row-id')).toBe('row-group-g1-A');

        // the focused group row sticks once scrolled, and its sticky renderer throws as focus is restored
        throwFor = 'row-group-g1-A';
        scrollTo(5);
        await waitFor(() => expect(frameErrors).toEqual([new Error('cell renderer failed')]));
        readRowIds.length = 0;
        scrollTo(10 * 25);
        await waitFor(() => expect(cellText(api, 'row-15')).toBe('row-15'));
        scrollTo(12 * 25);
        await waitFor(() => expect(cellText(api, 'row-21')).toBe('row-21'));
        scrollTo(14 * 25);

        await waitFor(() => expect(cellText(api, 'row-23')).toBe('row-23'));
        expect(readRowIds.filter((id) => id === 'row-5')).toEqual([]);
    });

    test('a scroll that threw shows the rows drawn before the throw, and scrolling to where it threw draws the rest', async () => {
        const api = await gridMgr.createGridAndWait<Row>('rowsAfterThrowingScroll', {
            columnDefs: [{ field: 'a' }],
            rowData: buildRows(200),
            getRowId: (p) => p.data.id,
            rowHeight: 25,
            suppressRowVirtualisation: false,
            isFullWidthRow: throwOnceFor('row-100'),
        });
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-0'));
        expect(renderedRowIds(api)).not.toContain('row-100');

        expect(() => api.ensureIndexVisible(100, 'top')).toThrow('isFullWidthRow failed');
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-99'));
        expect(renderedRowIds(api)).not.toContain('row-0');

        api.ensureIndexVisible(100, 'top');
        await waitFor(() => expect(renderedRowIds(api)).toContain('row-100'));
        expect(renderedRowIds(api)).not.toContain('row-0');
        api.setGridOption('rowData', buildRows(200, 'next'));
        await waitFor(() => expect(renderedRowIds(api)).toContain('next-100'));
        expect(renderedRowIds(api)).not.toContain('row-100');
    });

    test('a redraw started while rows are drawn by an update or a scroll still reports error #252 unless the rendered rows stay the same, and the next update draws', async () => {
        const redrawErrors: string[] = [];
        let rowBuffer = 10;
        const tryRedraw = (label: string, redraw: () => void) => {
            try {
                redraw();
            } catch (e) {
                redrawErrors.push(`${label} ${e}`);
            }
        };
        const api = await gridMgr.createGridAndWait<Row>('redrawWhileDrawing', {
            columnDefs: [{ field: 'a' }],
            rowData: buildRows(1),
            getRowId: (p) => p.data.id,
            rowHeight: 25,
            rowBuffer,
            suppressRowVirtualisation: false,
            isFullWidthRow: (params) => {
                const id = params.rowNode.id;
                if (id === 'nested-0' || id === 'nested-150') {
                    tryRedraw(`${id} redrawRows`, () => api.redrawRows());
                    tryRedraw(`${id} rowBuffer`, () => api.setGridOption('rowBuffer', ++rowBuffer));
                    tryRedraw(`${id} redrawRows`, () => api.redrawRows());
                    tryRedraw(`${id} ensureIndexVisible`, () =>
                        api.ensureIndexVisible(id === 'nested-0' ? 0 : 150, 'top')
                    );
                }
                return false;
            },
        });

        api.setGridOption('rowData', buildRows(200, 'nested'));
        api.ensureIndexVisible(150, 'top');

        expect(redrawErrors).toEqual(
            ['nested-0', 'nested-150'].flatMap((id) => [
                expect.stringMatching(new RegExp(`^${id} redrawRows .*error #252`)),
                expect.stringMatching(new RegExp(`^${id} rowBuffer .*error #252`)),
                expect.stringMatching(new RegExp(`^${id} redrawRows .*error #252`)),
            ])
        );
        await waitFor(() => expect(renderedRowIds(api)).toContain('nested-150'));
        api.setGridOption('rowData', buildRows(200, 'next'));
        await waitFor(() => expect(renderedRowIds(api)).toContain('next-150'));
    });
});
