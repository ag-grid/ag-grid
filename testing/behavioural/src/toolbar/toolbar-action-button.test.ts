import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColumnMenuModule, ToolbarModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForEvent } from '../test-utils';

// Column chooser dialog focus management checks visibility via `offsetParent`. jsdom does not
// compute layout, so expose attached elements as visible for these behavioural tests.
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

describe('Toolbar action button item', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('label-only: renders visible label, title and aria-label fall back to label', async () => {
        const api = gridMgr.createGrid('action-button-label-only', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        label: 'Auto Size All',
                        icon: 'maximize',
                        action: () => {},
                    },
                ],
            },
        });
        await new GridColumns(api, `label-only: renders visible label, title and aria-label fall back to label setup`)
            .checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
        await new GridRows(api, `label-only: renders visible label, title and aria-label fall back to label setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.getAttribute('title')).toBe('Auto Size All');
        expect(button.getAttribute('aria-label')).toBe('Auto Size All');
        expect(button.querySelector('.ag-icon')).not.toBeNull();
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(false);
        expect(label.textContent).toBe('Auto Size All');
        await new GridRows(
            api,
            `label-only: renders visible label, title and aria-label fall back to label final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('tooltip-only: renders icon-only button with tooltip and aria-label from tooltip', async () => {
        const api = gridMgr.createGrid('action-button-tooltip-only', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'resetColumns',
                        tooltip: 'Reset Columns',
                        icon: 'minimize',
                        action: () => {},
                    },
                ],
            },
        });
        await new GridColumns(
            api,
            `tooltip-only: renders icon-only button with tooltip and aria-label from tooltip setup`
        ).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `tooltip-only: renders icon-only button with tooltip and aria-label from tooltip setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.getAttribute('title')).toBe('Reset Columns');
        expect(button.getAttribute('aria-label')).toBe('Reset Columns');
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(true);
        await new GridRows(
            api,
            `tooltip-only: renders icon-only button with tooltip and aria-label from tooltip final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('label and tooltip: tooltip wins for title and aria-label; label is still shown', async () => {
        const api = gridMgr.createGrid('action-button-label-and-tooltip', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        label: 'Auto Size',
                        tooltip: 'Auto-size all columns',
                        icon: 'maximize',
                        action: () => {},
                    },
                ],
            },
        });
        await new GridColumns(
            api,
            `label and tooltip: tooltip wins for title and aria-label; label is still shown setup`
        ).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `label and tooltip: tooltip wins for title and aria-label; label is still shown setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.getAttribute('title')).toBe('Auto-size all columns');
        expect(button.getAttribute('aria-label')).toBe('Auto-size all columns');
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(false);
        expect(label.textContent).toBe('Auto Size');
        await new GridRows(
            api,
            `label and tooltip: tooltip wins for title and aria-label; label is still shown final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });

    test('neither label nor tooltip: icon-only with no title or aria-label', async () => {
        const api = gridMgr.createGrid('action-button-no-text', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        icon: 'maximize',
                        action: () => {},
                    },
                ],
            },
        });
        await new GridColumns(api, `neither label nor tooltip: icon-only with no title or aria-label setup`)
            .checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
        await new GridRows(api, `neither label nor tooltip: icon-only with no title or aria-label setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.hasAttribute('title')).toBe(false);
        expect(button.hasAttribute('aria-label')).toBe(false);
        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.classList.contains('ag-hidden')).toBe(true);
        await new GridRows(api, `neither label nor tooltip: icon-only with no title or aria-label final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `
        );
    });

    test('invokes action with grid api, context and key on click', async () => {
        const action = vitest.fn();
        const api = gridMgr.createGrid('action-button-click', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            context: { userContext: 'hello' },
            toolbar: {
                items: [
                    {
                        key: 'autoSizeAll',
                        label: 'Auto Size All',
                        icon: 'maximize',
                        action,
                    },
                ],
            },
        });
        await new GridColumns(api, `invokes action with grid api, context and key on click setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `invokes action with grid api, context and key on click setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.click();

        expect(action).toHaveBeenCalledTimes(1);
        const [params] = action.mock.calls[0];
        expect(params.api).toBe(api);
        expect(params.context).toEqual({ userContext: 'hello' });
        expect(params.key).toBe('autoSizeAll');
        await new GridRows(api, `invokes action with grid api, context and key on click final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });
});

describe('Toolbar action button item with column chooser', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule, ColumnMenuModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('pressing Escape from column chooser returns focus to the toolbar button', async () => {
        const api = gridMgr.createGrid('action-button-column-chooser-escape', {
            columnDefs: [{ field: 'name' }, { field: 'country' }],
            rowData: [{ name: 'Alice', country: 'Ireland' }],
            toolbar: {
                items: [
                    {
                        key: 'showColumnChooser',
                        tooltip: 'Open Column Chooser',
                        icon: 'columns',
                        action: (params) => params.api.showColumnChooser(),
                    },
                ],
            },
        });
        await new GridColumns(api, `pressing Escape from column chooser returns focus to the toolbar button setup`)
            .checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── country "Country" width:200
        `);
        await new GridRows(api, `pressing Escape from column chooser returns focus to the toolbar button setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" country:"Ireland"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.focus();
        button.click();

        expect(gridDiv.querySelector('.ag-dialog')).not.toBeNull();
        expect(document.activeElement).not.toBe(button);

        await asyncSetTimeout(0);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        await asyncSetTimeout(0);

        expect(gridDiv.querySelector('.ag-dialog')).toBeNull();
        expect(document.activeElement).toBe(button);
        await new GridRows(api, `pressing Escape from column chooser returns focus to the toolbar button final state`)
            .check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" country:"Ireland"
        `);
    });
});
