/*
 * Issue: updating the `toolbar` grid option while an agMenuToolbarItem menu is open replaces the
 * menu's button instead of refreshing it. The menu stays open, but the new button reports
 * aria-expanded="false", and when the menu closes keyboard focus is not returned to the button.
 *
 * Setup: a toolbar with one agMenuToolbarItem. The menu is opened by clicking its button, then
 * api.updateGridOptions({ toolbar }) is called with the same items, then Escape closes the menu.
 *
 * Expected: IToolbarItem.refresh(params) is documented (iToolbar.ts and the toolbar docs component
 * interface) as being called when the `toolbar` option updates, with the component kept when it
 * returns true; the built-in menu item implements refresh. So the button stays the same element,
 * keeps aria-expanded="true" while its menu is open and, as without an update, receives focus when
 * Escape closes the menu.
 *
 * Actual (36.3.0, headless Chrome): the button is a new element with aria-expanded="false" while the
 * menu is still open, and after Escape focus moves to the document body instead of the button.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Not reported by a client; found while
 * reviewing the same feature, prompted by a coding agent on React 36.0.0 that searched, in July
 * 2026: "toolbar grid option updating toolbar items menu closes".
 */
import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
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

// TODO: disabled due to AG-19223 - re-enable once fixed
describe.skip('Toolbar update with an open menu', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule, ContextMenuModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('updateGridOptions({ toolbar }) keeps the menu button expanded and focus returns to it on Escape', async () => {
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
        const user = userEvent.setup({ skipHover: true });
        const getButton = () => gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;

        await user.click(getButton());
        await waitFor(() => expect(gridDiv.querySelector('.ag-popup .ag-menu')).not.toBeNull());
        await waitFor(() => expect(gridDiv.querySelector('.ag-popup')!.contains(document.activeElement)).toBe(true));

        api.updateGridOptions({ toolbar: { ...toolbar, items: [...toolbar.items] } });

        expect(gridDiv.querySelector('.ag-popup .ag-menu')).not.toBeNull();
        expect(getButton().getAttribute('aria-expanded')).toBe('true');

        await user.keyboard('{Escape}');
        await waitFor(() => expect(gridDiv.querySelector('.ag-popup .ag-menu')).toBeNull());
        expect(document.activeElement).toBe(getButton());
    });
});
