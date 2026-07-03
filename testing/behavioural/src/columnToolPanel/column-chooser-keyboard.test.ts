import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColumnMenuModule, ToolbarModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForEvent } from '../test-utils';

// The chooser's open/close focus management relies on `_isVisible`, which checks
// `offsetParent`. jsdom does not compute layout, so `offsetParent` is always null —
// polyfill it so the focus code can see the rendered panel and the toolbar button.
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

describe('Column Chooser keyboard navigation', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule, ColumnMenuModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('pressing Escape closes the chooser and returns focus to the button that opened it', async () => {
        const api = gridMgr.createGrid('column-chooser-escape', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        key: 'showColumnChooser',
                        label: 'Columns',
                        action: (params) => params.api.showColumnChooser(),
                    },
                ],
            },
        });
        await new GridColumns(api, `column chooser escape setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `column chooser escape setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button).not.toBeNull();

        button.focus();
        expect(document.activeElement).toBe(button);

        button.click();
        expect(gridDiv.querySelector('.ag-popup')).not.toBeNull();

        // The popup attaches its document-level keydown listener via `setTimeout(0)` to avoid
        // reacting to the click that opened it. Yield one tick so Escape is observed.
        await asyncSetTimeout(0);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
        expect(document.activeElement).toBe(button);
    });
});
