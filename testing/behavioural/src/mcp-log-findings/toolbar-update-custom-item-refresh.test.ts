/*
 * Issue: updating the `toolbar` grid option never calls `refresh` on toolbar item components. Every
 * item is destroyed and recreated, even a custom component that implements `refresh` and returns true.
 *
 * Setup: a toolbar with one plain JavaScript custom item component that implements init, getGui,
 * refresh (returning true) and destroy. api.updateGridOptions({ toolbar }) is then called with the
 * same item and changed toolbarItemParams.
 *
 * Expected: the IToolbarItem.refresh JSDoc (iToolbar.ts) and the toolbar docs component interface
 * say refresh is "Called when the `toolbar` grid option updates. Return `true` if the component
 * updates itself with the new params. Return `false` (or omit) to have the grid destroy and recreate
 * the component." So refresh is called once with the new params, and the component is kept.
 *
 * Actual: refresh is never called; the component is destroyed and a new instance is created.
 *
 * This is a companion to toolbar-update-keeps-open-menu.test.ts. It uses a custom component to show
 * that the fault is in the toolbar never calling refresh, not in the built-in agMenuToolbarItem.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 36.0.0
 * searched, in July 2026: "toolbar grid option updating toolbar items menu closes".
 */
import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

describe('Toolbar update with a custom item that implements refresh', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('updateGridOptions({ toolbar }) calls refresh and keeps the component', async () => {
        const created: CountingItem[] = [];
        const refreshParams: IToolbarItemParams[] = [];
        let destroyed = 0;

        class CountingItem implements IToolbarItemComp {
            private eGui!: HTMLElement;

            init(params: IToolbarItemParams) {
                created.push(this);
                this.eGui = document.createElement('span');
                this.eGui.className = 'counting-item';
                this.eGui.textContent = params.toolbarItemParams.text;
            }

            getGui() {
                return this.eGui;
            }

            refresh(params: IToolbarItemParams) {
                refreshParams.push(params);
                this.eGui.textContent = params.toolbarItemParams.text;
                return true;
            }

            destroy() {
                destroyed++;
            }
        }

        const api = gridMgr.createGrid('toolbar-custom-item-refresh', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: { items: [{ toolbarItem: CountingItem, toolbarItemParams: { text: 'one' } }] },
        });
        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const element = gridDiv.querySelector('.counting-item');
        expect(element?.textContent).toBe('one');
        expect(created).toHaveLength(1);

        api.updateGridOptions({
            toolbar: { items: [{ toolbarItem: CountingItem, toolbarItemParams: { text: 'two' } }] },
        });

        // The toolbar is rebuilt synchronously by updateGridOptions, so no wait is needed.
        expect(refreshParams.map((p) => p.toolbarItemParams.text)).toEqual(['two']);
        expect(destroyed).toBe(0);
        expect(created).toHaveLength(1);
        expect(gridDiv.querySelector('.counting-item')).toBe(element);
        expect(element?.textContent).toBe('two');
    });
});
