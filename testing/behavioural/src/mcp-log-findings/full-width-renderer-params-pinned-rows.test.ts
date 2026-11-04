/*
 * Issue: changing fullWidthCellRendererParams at runtime does not refresh full width renderers of pinned rows
 * supplied as data (pinnedTopRowData / pinnedBottomRowData).
 *
 * Setup: client-side row model, one body row and one pinned top row, isFullWidthRow returns true for every row
 * (including the pinned one), and a fullWidthCellRenderer that displays a value taken from
 * fullWidthCellRendererParams. enableRowPinning is not set. After render, the grid option
 * fullWidthCellRendererParams is changed with api.setGridOption().
 *
 * Expected: the grid re-creates full width rows when fullWidthCellRendererParams changes (the grid registers a
 * property listener that calls redrawRows(), documented as removing rows from the DOM and recreating them from
 * scratch), so both the body and the pinned full width renderers show the new params.
 *
 * Actual: the body full width row shows the new params, but the pinned full width row keeps its old controller
 * and renderer and still shows the old params.
 *
 * Reported on: AG Grid react 33.2.4.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 33.2.4 (October 2026) searched
 * for "full width rows fullWidthCellRendererParams changes refresh renderer pinned rows".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';

describe('fullWidthCellRendererParams change with pinned rows', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, PinnedRowModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('pinned full width renderer receives the new params', async () => {
        class Renderer {
            private eGui = document.createElement('div');
            init(params: any) {
                this.eGui.className = 'fw-renderer';
                this.eGui.textContent = params.label;
            }
            getGui() {
                return this.eGui;
            }
        }

        const api = await gridMgr.createGridAndWait('fullWidthPinned', {
            columnDefs: [{ field: 'x' }],
            rowData: [{ x: 'body' }],
            pinnedTopRowData: [{ x: 'pinned' }],
            isFullWidthRow: () => true,
            fullWidthCellRenderer: Renderer,
            fullWidthCellRendererParams: { label: 'old' },
        });

        const pinnedText = () =>
            document.querySelector<HTMLElement>('.ag-grid-pinned-top-rows .fw-renderer')?.textContent;
        const bodyText = () =>
            Array.from(document.querySelectorAll<HTMLElement>('.fw-renderer')).find(
                (el) => !el.closest('.ag-grid-pinned-top-rows')
            )?.textContent;

        api.setGridOption('fullWidthCellRendererParams', { label: 'new' });

        await waitFor(() => expect(bodyText()).toBe('new'));
        await waitFor(() => expect(pinnedText()).toBe('new'));
    });
});
