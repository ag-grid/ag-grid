import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridRows, TestGridsManager, asyncSetTimeout, clipboardUtils, waitForEvent } from 'ag-test-utils';

import type { GridApi, IServerSideGetRowsParams } from 'ag-grid-community';
import { ColumnApiModule, PinnedRowModule, TextFilterModule, getGridElement } from 'ag-grid-community';
import { AdvancedFilterModule, ClipboardModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('Clipboard Paste Behaviour: empty grid', () => {
    const gridMgr = new TestGridsManager({ modules: [ClipboardModule, PinnedRowModule] });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];

    function viewportOf(api: GridApi): HTMLElement {
        return getGridElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;
    }

    test('clicking the empty viewport and pressing Ctrl+V hands the clipboard to processDataFromClipboard', async () => {
        const pasted: string[][][] = [];
        const api = gridMgr.createGrid('emptyPasteClick', {
            columnDefs,
            rowData: [],
            processDataFromClipboard: (params) => {
                const data = params.data;
                pasted.push(data);
                api.applyTransaction({ add: data.map(([athlete, age]) => ({ athlete, age })) });
                return null;
            },
        });
        await asyncSetTimeout(0);

        const user = userEvent.setup({ skipHover: true });
        // userEvent.setup installs its own clipboard
        clipboardUtils.init();
        clipboardUtils.setText('Ann\t30\nBob\t40');
        await user.click(viewportOf(api));
        expect(document.activeElement).toBe(viewportOf(api));

        await user.keyboard('{Control>}v{/Control}');

        await waitFor(() =>
            expect(pasted).toEqual([
                [
                    ['Ann', '30'],
                    ['Bob', '40'],
                ],
            ])
        );
        await new GridRows(api, 'rows added by the callback').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Ann" age:"30"
            └── LEAF id:1 athlete:"Bob" age:"40"
        `);
        // the viewport stops being focusable once rows exist, so focus moves to the first cell
        expect(api.getFocusedCell()).toMatchObject({ rowIndex: 0, column: { colId: 'athlete' } });
        expect(document.activeElement?.getAttribute('col-id')).toBe('athlete');
        expect(viewportOf(api).hasAttribute('tabindex')).toBe(false);
    });

    test('no cell is focused while the empty viewport pastes, though one had focus before the rows went', async () => {
        const focusedInCallback: unknown[] = [];
        let cancelPaste = true;
        const api = gridMgr.createGrid('emptyPasteStaleCell', {
            columnDefs,
            rowData: [{ athlete: 'Ann' }],
            processDataFromClipboard: (params) => {
                focusedInCallback.push(api.getFocusedCell());
                return cancelPaste ? null : params.data;
            },
        });
        await asyncSetTimeout(0);
        const user = userEvent.setup({ skipHover: true });
        clipboardUtils.init();
        clipboardUtils.setText('Bob');

        await user.click(getGridElement(api)!.querySelector<HTMLElement>('[col-id="athlete"][role="gridcell"]')!);
        expect(api.getFocusedCell()).toMatchObject({ rowIndex: 0 });
        api.setGridOption('rowData', []);
        await user.click(viewportOf(api));
        await user.keyboard('{Control>}v{/Control}');
        await waitFor(() => expect(focusedInCallback).toEqual([null]));

        let cellFocusedCount = 0;
        api.addEventListener('cellFocused', () => cellFocusedCount++);
        cancelPaste = false;
        const pasteEnd = waitForEvent('pasteEnd', api);
        await user.keyboard('{Control>}v{/Control}');
        await pasteEnd;
        expect(cellFocusedCount).toBe(0);
        expect(document.activeElement).toBe(viewportOf(api));
    });

    test('with a focusable overlay, Tab from the header reaches the empty viewport then the overlay, Shift+Tab walks back, and a redraw keeps focus', async () => {
        const api = gridMgr.createGrid('emptyPasteOverlay', {
            columnDefs,
            rowData: [],
            overlayNoRowsTemplate: '<button>Add a row</button>',
        });
        await asyncSetTimeout(0);
        const user = userEvent.setup({ skipHover: true });

        api.setFocusedHeader('age');
        await user.keyboard('{Tab}');
        expect(document.activeElement).toBe(viewportOf(api));
        await user.keyboard('{Tab}');
        expect(document.activeElement?.textContent).toBe('Add a row');
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement).toBe(viewportOf(api));
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement?.closest('.ag-header-cell')?.getAttribute('col-id')).toBe('age');

        await user.click(viewportOf(api));
        api.redrawRows();
        expect(document.activeElement).toBe(viewportOf(api));
    });

    test('with suppressClipboardApi, the paste gives focus back to the viewport, then to the rows it adds', async () => {
        let pasteCount = 0;
        const api = gridMgr.createGrid('emptyPasteLegacy', {
            columnDefs,
            rowData: [],
            suppressClipboardApi: true,
            processDataFromClipboard: (params) => {
                const data = params.data;
                pasteCount++;
                if (data[0][0] !== 'skip') {
                    api.applyTransaction({ add: data.map(([athlete]) => ({ athlete })) });
                }
                return null;
            },
        });
        await asyncSetTimeout(0);
        const user = userEvent.setup({ skipHover: true });
        const pasteText = async (text: string) => {
            await user.keyboard('{Control>}v{/Control}');
            const textArea = document.activeElement;
            if (!(textArea instanceof HTMLTextAreaElement)) {
                throw new Error('Expected the temporary paste textarea');
            }
            textArea.value = text;
        };

        const outside = document.body.appendChild(document.createElement('button'));
        try {
            // focus moved on before the paste completes is left where it is
            await user.click(viewportOf(api));
            await pasteText('skip');
            outside.focus();
            await waitFor(() => expect(pasteCount).toBe(1));
            expect(document.activeElement).toBe(outside);
        } finally {
            outside.remove();
        }

        await user.click(viewportOf(api));
        await pasteText('skip');
        await waitFor(() => expect(pasteCount).toBe(2));
        expect(document.activeElement).toBe(viewportOf(api));

        await pasteText('Ann');
        await waitFor(() => expect(document.activeElement?.getAttribute('col-id')).toBe('athlete'));
        expect(api.getDisplayedRowAtIndex(0)?.data).toEqual({ athlete: 'Ann' });
    });

    test.each([false, true])(
        'with suppressClipboardApi, rows arriving during the paste receive the focus it gives back unless suppressFocusAfterRefresh (%s)',
        async (suppressFocusAfterRefresh) => {
            let pasteCount = 0;
            const api = gridMgr.createGrid('emptyPasteLegacyRowsArrive', {
                columnDefs,
                rowData: [],
                suppressClipboardApi: true,
                suppressFocusAfterRefresh,
                processDataFromClipboard: () => {
                    pasteCount++;
                    return null;
                },
            });
            await asyncSetTimeout(0);
            const user = userEvent.setup({ skipHover: true });

            await user.click(viewportOf(api));
            await user.keyboard('{Control>}v{/Control}');
            expect(document.activeElement).toBeInstanceOf(HTMLTextAreaElement);
            api.setGridOption('rowData', [{ athlete: 'Ann' }]);

            await waitFor(() => expect(pasteCount).toBe(1));
            expect(api.getFocusedCell()?.column.getColId() ?? null).toBe(suppressFocusAfterRefresh ? null : 'athlete');
        }
    );

    test('the viewport focus stands in for a cell only while the grid is empty', async () => {
        const api = gridMgr.createGrid('emptyPasteViewportFocusWithRows', {
            columnDefs,
            rowData: [{ athlete: 'Ann' }],
        });
        await asyncSetTimeout(0);
        api.setFocusedCell(0, 'athlete');

        // a browser may focus the scrolling viewport itself, which must not clear the focused cell
        viewportOf(api).dispatchEvent(new FocusEvent('focus'));
        expect(api.getFocusedCell()?.column.getColId()).toBe('athlete');
    });

    test('rows replacing the empty grid take focus only from the focused viewport, unless suppressFocusAfterRefresh', async () => {
        const api = gridMgr.createGrid('emptyPasteHandover', { columnDefs, rowData: [] });
        await asyncSetTimeout(0);
        const user = userEvent.setup({ skipHover: true });
        const outside = document.body.appendChild(document.createElement('button'));
        try {
            outside.focus();
            api.setGridOption('rowData', [{ athlete: 'Ann' }]);
            await waitFor(() =>
                expect(getGridElement(api)!.querySelector('[col-id="athlete"][role="gridcell"]')).not.toBeNull()
            );
            expect(document.activeElement).toBe(outside);
        } finally {
            outside.remove();
        }

        api.updateGridOptions({ rowData: [], suppressFocusAfterRefresh: true });
        await waitFor(() => expect(viewportOf(api).getAttribute('tabindex')).toBe('-1'));
        await user.click(viewportOf(api));
        api.setGridOption('rowData', [{ athlete: 'Ann' }]);
        await waitFor(() => expect(viewportOf(api).hasAttribute('tabindex')).toBe(false));
        expect(api.getFocusedCell()).toBeNull();
    });

    test('Tab or ArrowDown from the header reaches the empty viewport, where Cmd+V pastes, and Shift+Tab or ArrowUp returns', async () => {
        const pasted: string[][][] = [];
        const api = gridMgr.createGrid('emptyPasteTab', {
            columnDefs,
            rowData: [],
            processDataFromClipboard: (params) => {
                pasted.push(params.data);
                return null;
            },
        });
        await asyncSetTimeout(0);

        const user = userEvent.setup({ skipHover: true });
        // userEvent.setup installs its own clipboard
        clipboardUtils.init();
        clipboardUtils.setText('Ann');
        api.setFocusedHeader('age');
        await user.keyboard('{Tab}');
        expect(document.activeElement).toBe(viewportOf(api));

        await user.keyboard('{Meta>}v{/Meta}');
        await waitFor(() => expect(pasted).toEqual([[['Ann']]]));
        expect(document.activeElement).toBe(viewportOf(api));

        await user.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement?.closest('.ag-header-cell')?.getAttribute('col-id')).toBe('age');

        api.setFocusedHeader('athlete');
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(viewportOf(api));
        await user.keyboard('{ArrowUp}');
        expect(document.activeElement?.closest('.ag-header-cell')?.getAttribute('col-id')).toBe('athlete');

        await user.keyboard('{ArrowDown}{Tab}');
        expect(getGridElement(api)!.contains(document.activeElement)).toBe(false);
    });

    test('ArrowUp from the empty viewport goes to the last header once the column focus came from is hidden or the grid was refilled', async () => {
        const api = gridMgr.createGrid(
            'emptyPasteHiddenColumn',
            { columnDefs, rowData: [] },
            { modules: [ColumnApiModule] }
        );
        await asyncSetTimeout(0);
        const user = userEvent.setup({ skipHover: true });

        api.setFocusedHeader('athlete');
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(viewportOf(api));
        api.setColumnsVisible(['athlete'], false);
        await user.keyboard('{ArrowUp}');
        expect(document.activeElement?.closest('.ag-header-cell')?.getAttribute('col-id')).toBe('age');

        // the column is remembered for one empty spell only
        api.setColumnsVisible(['athlete'], true);
        api.setFocusedHeader('athlete');
        await user.keyboard('{ArrowDown}');
        api.setGridOption('rowData', [{ athlete: 'Ann' }]);
        api.setGridOption('rowData', []);
        await user.click(viewportOf(api));
        await user.keyboard('{ArrowUp}');
        expect(document.activeElement?.closest('.ag-header-cell')?.getAttribute('col-id')).toBe('age');
    });

    test('Shift+Tab from the empty viewport reaches the Advanced Filter in the header, as from a first-row cell', async () => {
        const api = gridMgr.createGrid(
            'emptyPasteAdvancedFilter',
            { columnDefs, rowData: [], enableAdvancedFilter: true },
            { modules: [AdvancedFilterModule, TextFilterModule] }
        );
        await asyncSetTimeout(0);
        const user = userEvent.setup({ skipHover: true });

        await user.click(viewportOf(api));
        await user.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement?.closest('.ag-advanced-filter-header')).not.toBeNull();
    });

    test('with header focus suppressed, Shift+Tab from the empty viewport hands focus out of the grid, as from a first-row cell', async () => {
        const api = gridMgr.createGrid('emptyPasteNoHeaderFocus', {
            columnDefs,
            rowData: [],
            suppressHeaderFocus: true,
        });
        await asyncSetTimeout(0);
        const viewport = viewportOf(api);
        await userEvent.setup({ skipHover: true }).click(viewport);

        // the grid moves focus to its top tab guard so the browser's own Shift+Tab then leaves the grid
        viewport.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
        );
        expect(document.activeElement?.classList.contains('ag-tab-guard-top')).toBe(true);
    });

    test('only Ctrl+V on the viewport itself pastes, and not once the key is handled or paste is turned off', async () => {
        const pasted: string[][][] = [];
        const api = gridMgr.createGrid(
            'emptyPasteKeyTarget',
            {
                columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true }],
                rowData: [],
                processDataFromClipboard: (params) => {
                    pasted.push(params.data);
                    return null;
                },
            },
            { modules: [TextFilterModule] }
        );
        await asyncSetTimeout(0);
        const user = userEvent.setup({ skipHover: true });
        clipboardUtils.init();
        clipboardUtils.setText('Ann');
        const pasteOnViewport = async () => {
            await user.click(viewportOf(api));
            await user.keyboard('{Control>}v{/Control}');
        };
        const preventPaste = (e: KeyboardEvent) => e.preventDefault();

        api.setFocusedHeader('athlete');
        await user.keyboard('{Control>}v{/Control}');
        await user.click(getGridElement(api)!.querySelector<HTMLElement>('.ag-floating-filter input')!);
        await user.keyboard('{Control>}v{/Control}');
        getGridElement(api)!.addEventListener('keydown', preventPaste, true);
        await pasteOnViewport();
        getGridElement(api)!.removeEventListener('keydown', preventPaste, true);
        await user.click(viewportOf(api));
        api.setGridOption('suppressClipboardPaste', true);
        await user.keyboard('{Control>}v{/Control}');
        api.setGridOption('suppressClipboardPaste', false);

        await pasteOnViewport();
        await waitFor(() => expect(pasted).toEqual([[['Ann']]]));
    });

    test('a loading grid, whose row count is unknown, is not focusable until it loads with no rows', async () => {
        let pending: IServerSideGetRowsParams | undefined;
        const api = gridMgr.createGrid(
            'emptyPasteUnknownCount',
            {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params) => {
                        pending = params;
                    },
                },
            },
            { modules: [ServerSideRowModelModule] }
        );
        await waitFor(() => expect(pending?.request).toMatchObject({ startRow: 0 }));
        expect(viewportOf(api).hasAttribute('tabindex')).toBe(false);

        pending!.success({ rowData: [], rowCount: 0 });
        await waitFor(() => expect(viewportOf(api).getAttribute('tabindex')).toBe('-1'));
    });

    test('a viewport that cannot take focus leaves the Tab that tried it to the browser', async () => {
        const api = gridMgr.createGrid('emptyPasteInert', { columnDefs, rowData: [] });
        await asyncSetTimeout(0);

        api.setFocusedHeader('age');
        const header = document.activeElement!;
        viewportOf(api).setAttribute('inert', '');
        const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        header.dispatchEvent(tab);
        expect(tab.defaultPrevented).toBe(false);
    });

    test('the viewport is focusable only while the grid shows no rows and paste is available', async () => {
        const api = gridMgr.createGrid(
            'emptyPasteFocusable',
            { columnDefs, rowData: [], defaultColDef: { filter: true } },
            { modules: [TextFilterModule] }
        );
        const isFocusable = () => viewportOf(api).getAttribute('tabindex') === '-1';
        await waitFor(() => expect(isFocusable()).toBe(true));

        api.setGridOption('suppressClipboardPaste', true);
        expect(isFocusable()).toBe(false);
        api.setFocusedHeader('athlete');
        await userEvent.setup({ skipHover: true }).keyboard('{Tab}{Tab}');
        expect(getGridElement(api)!.contains(document.activeElement)).toBe(false);
        api.setGridOption('suppressClipboardPaste', false);
        expect(isFocusable()).toBe(true);

        api.setGridOption('suppressCellFocus', true);
        expect(isFocusable()).toBe(false);
        api.setGridOption('suppressCellFocus', false);
        expect(isFocusable()).toBe(true);

        api.setGridOption('pinnedTopRowData', [{ athlete: 'Pinned' }]);
        await waitFor(() => expect(isFocusable()).toBe(false));
        api.setGridOption('pinnedTopRowData', []);
        await waitFor(() => expect(isFocusable()).toBe(true));

        api.setGridOption('rowData', [{ athlete: 'Ann' }]);
        await waitFor(() => expect(isFocusable()).toBe(false));
        // a filter hiding every row leaves the grid showing none
        api.setFilterModel({ athlete: { filterType: 'text', type: 'equals', filter: 'Bob' } });
        await waitFor(() => expect(isFocusable()).toBe(true));
        api.setFilterModel(null);
        await waitFor(() => expect(isFocusable()).toBe(false));

        const gridsWithoutClipboard = new TestGridsManager();
        try {
            const plain = gridsWithoutClipboard.createGrid('emptyNoClipboard', { columnDefs, rowData: [] });
            await asyncSetTimeout(0);
            expect(viewportOf(plain).hasAttribute('tabindex')).toBe(false);
        } finally {
            gridsWithoutClipboard.reset();
        }
    });
});
