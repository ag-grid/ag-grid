/*
 * Issue: updating the `toolbar` grid option destroys and recreates every toolbar item, so the
 * menu button that owns an open toolbar menu is replaced instead of refreshed.
 *
 * Setup: a toolbar with one agMenuToolbarItem. The menu is opened by clicking its button, then
 * api.updateGridOptions({ toolbar }) is called with the same items.
 *
 * Expected: IToolbarItem.refresh(params) is documented (iToolbar.ts) as being called when the
 * toolbar option updates so that components update in place instead of being destroyed and
 * recreated. The built-in menu item implements refresh, so the button element should be reused
 * and the open menu should stay open.
 *
 * Actual: AgToolbar.updateToolbar() always clears the element, destroys all items and rebuilds
 * them; refresh() is never called. The button is a new element (the original had aria-expanded=true,
 * the replacement does not). In happy-dom the `.ag-popup` element is still present after the update,
 * so the failing assertion is the button identity one, not the popup one.
 *
 * Reported on: AG Grid react 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 36.0.0
 * searched, in July 2026: "toolbar grid option updating toolbar items menu closes".
 */
import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ContextMenuModule, ToolbarModule } from 'ag-grid-enterprise';

const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            return this.parentElement;
        },
    });
});
afterAll(() => {
    if (originalOffsetParent) {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
    } else {
        delete (HTMLElement.prototype as any).offsetParent;
    }
});

describe('Toolbar update with open menu', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule, ContextMenuModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('updateGridOptions({ toolbar }) with same items keeps the open menu open', async () => {
        const toolbar = {
            items: [
                {
                    toolbarItem: 'agMenuToolbarItem' as const,
                    label: 'Export',
                    toolbarItemParams: { menuItems: [{ name: 'One', action: () => {} }] },
                },
            ],
        };
        const api = gridMgr.createGrid('toolbar-update-open-menu', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar,
        });
        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.click();
        expect(gridDiv.querySelector('.ag-popup')).not.toBeNull();

        api.updateGridOptions({ toolbar: { ...toolbar, items: [...toolbar.items] } });

        // The toolbar is rebuilt synchronously by updateGridOptions, so no wait is needed.
        expect(gridDiv.querySelector('.ag-popup')).not.toBeNull();
        expect(gridDiv.querySelector('.ag-toolbar-button')).toBe(button);
    });
});
