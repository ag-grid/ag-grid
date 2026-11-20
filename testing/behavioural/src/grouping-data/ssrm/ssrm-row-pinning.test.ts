import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    TestGridsManager,
    fireGridPointerDown,
    polyfillOffsetParent,
    waitForNoLoadingRows,
} from 'ag-test-utils';

import type { DefaultMenuItem, GridOptions, MenuItemDef } from 'ag-grid-community';
import { GridStateModule, PinnedRowModule, enableDevValidations, getGridElement } from 'ag-grid-community';
import { ContextMenuModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface RowData {
    id: string;
}

const ROWS: RowData[] = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));

function rightClick(element: HTMLElement): void {
    fireGridPointerDown(element, { button: 2, buttons: 2 });
    element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

describe('Manual row pinning with the Server-Side Row Model', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            PinnedRowModule,
            ContextMenuModule,
            GridStateModule,
        ],
    });
    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [309] }); // `enableRowPinning` is client-side only
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        vi.restoreAllMocks();
    });

    function createGrid(id: string, options: GridOptions<RowData>) {
        return gridsManager.createGrid(id, {
            columnDefs: [{ field: 'id' }],
            rowModelType: 'serverSide',
            getRowId: ({ data }) => data.id,
            serverSideDatasource: {
                getRows: (params) =>
                    setTimeout(() =>
                        params.success({ rowData: ROWS, rowCount: ROWS.length, grandTotalData: { id: 'total' } })
                    ),
            },
            enableRowPinning: true,
            ...options,
        });
    }

    test('isRowPinned pins nothing, before or after a purge', async () => {
        const api = createGrid('ssrmPinIsRowPinned', { isRowPinned: (node) => (node.id === '0' ? 'top' : null) });
        await waitForNoLoadingRows(api);
        expect(api.getRowNode('0')).toBeDefined();
        expect(api.getPinnedTopRowCount()).toBe(0);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);
        expect(api.getPinnedTopRowCount()).toBe(0);
    });

    test('with a fixed grand total, a row pinning state pins only the grand total', async () => {
        const api = createGrid('ssrmPinState', { grandTotalRow: 'pinnedBottom' });
        await waitForNoLoadingRows(api);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        api.setState({ rowPinning: { top: ['3'], bottom: ['5'] } });
        await waitForNoLoadingRows(api);
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(api.getPinnedBottomRowCount()).toBe(1);
    });

    test('the context menu offers no Pin Row, by default or when listed', async () => {
        let defaultItems: DefaultMenuItem[] | undefined;
        let called = false;
        let listed: (DefaultMenuItem | MenuItemDef)[] = [];
        const api = createGrid('ssrmPinMenu', {
            getContextMenuItems: (params) => {
                defaultItems = params.defaultItems;
                called = true;
                return listed;
            },
        });
        await waitForNoLoadingRows(api);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = () => gridDiv.querySelector<HTMLElement>('[row-index="0"] [col-id="id"]')!;

        rightClick(cell());
        await waitFor(() => expect(called).toBe(true));
        expect(defaultItems ?? []).not.toContain('pinRowSubMenu');

        listed = ['pinRowSubMenu', { name: 'Custom' }];
        rightClick(cell());
        await waitFor(() => expect(document.querySelector('.ag-menu-option')).not.toBeNull());
        const names = Array.from(document.querySelectorAll('.ag-menu-option-text'), (el) => el.textContent);
        expect(names).not.toContain('Pin Row');
        expect(names).toContain('Custom');
    });
});
