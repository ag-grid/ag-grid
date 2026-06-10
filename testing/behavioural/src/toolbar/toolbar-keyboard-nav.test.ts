import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

// jsdom's `offsetParent` is null for all elements because it does not compute layout. The
// toolbar's arrow-key navigation uses `_findFocusableElements`, which filters by `_isVisible` —
// which in turn checks `offsetParent` via `_isInDOM`. Polyfill `offsetParent` so the navigation
// logic sees the rendered toolbar buttons. Matches what a real browser reports for a visible
// button attached to the document.
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

function dispatchKeyDown(target: HTMLElement, key: string): boolean {
    return target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('Toolbar keyboard navigation', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, QuickFilterModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    async function renderThreeButtonToolbar(id: string, opts: { enableRtl?: boolean } = {}) {
        const api = gridMgr.createGrid(id, {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            enableRtl: opts.enableRtl,
            toolbar: {
                items: [
                    { key: 'one', label: 'One', icon: 'maximize', action: () => {} },
                    { key: 'two', label: 'Two', icon: 'maximize', action: () => {} },
                    { key: 'three', label: 'Three', icon: 'maximize', action: () => {} },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
        const buttons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('.ag-toolbar-button'));
        expect(buttons).toHaveLength(3);
        return { api, toolbar, buttons };
    }

    test('ArrowRight moves focus to the next toolbar button', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-right');

        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);

        dispatchKeyDown(buttons[0], 'ArrowRight');

        expect(document.activeElement).toBe(buttons[1]);
    });

    test('ArrowLeft moves focus to the previous toolbar button', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-left');

        buttons[2].focus();
        expect(document.activeElement).toBe(buttons[2]);

        dispatchKeyDown(buttons[2], 'ArrowLeft');

        expect(document.activeElement).toBe(buttons[1]);
    });

    test('Home moves focus to the first toolbar button', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-home');

        buttons[2].focus();
        expect(document.activeElement).toBe(buttons[2]);

        dispatchKeyDown(buttons[2], 'Home');

        expect(document.activeElement).toBe(buttons[0]);
    });

    test('End moves focus to the last toolbar button', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-end');

        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);

        dispatchKeyDown(buttons[0], 'End');

        expect(document.activeElement).toBe(buttons[2]);
    });

    test('ArrowRight at the end does not wrap around', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-no-wrap-right');

        buttons[2].focus();
        dispatchKeyDown(buttons[2], 'ArrowRight');

        expect(document.activeElement).toBe(buttons[2]);
    });

    test('ArrowLeft at the start does not wrap around', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-no-wrap-left');

        buttons[0].focus();
        dispatchKeyDown(buttons[0], 'ArrowLeft');

        expect(document.activeElement).toBe(buttons[0]);
    });

    test('ArrowRight moves focus to the previous button in RTL mode', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-rtl-right', { enableRtl: true });

        buttons[1].focus();
        dispatchKeyDown(buttons[1], 'ArrowRight');

        expect(document.activeElement).toBe(buttons[0]);
    });

    test('ArrowLeft moves focus to the next button in RTL mode', async () => {
        const { buttons } = await renderThreeButtonToolbar('kbd-rtl-left', { enableRtl: true });

        buttons[1].focus();
        dispatchKeyDown(buttons[1], 'ArrowLeft');

        expect(document.activeElement).toBe(buttons[2]);
    });

    test('focusing a toolbar item scrolls it into view', async () => {
        // The toolbar scrolls horizontally (overflow-x: auto) rather than clipping, so focusing
        // an item that is off-screen to the right must scroll the toolbar to reveal it.
        const { toolbar, buttons } = await renderThreeButtonToolbar('kbd-focusin-scroll');

        // jsdom computes no layout, so make the toolbar a horizontal scroll container and give
        // it and the target button rects that place the button beyond the toolbar's right edge.
        toolbar.style.overflowX = 'auto';
        const rect = (left: number, right: number) => ({ left, right, width: right - left }) as DOMRect;
        toolbar.getBoundingClientRect = () => rect(0, 100);
        const target = buttons[2];
        target.getBoundingClientRect = () => rect(150, 200);

        expect(toolbar.scrollLeft).toBe(0);

        target.focus();

        // The toolbar scrolls right so the button's right edge (200) aligns with the toolbar's (100).
        expect(toolbar.scrollLeft).toBe(100);
    });

    test('arrow keys inside an input toolbar item do not move toolbar focus', async () => {
        const api = gridMgr.createGrid('kbd-input-bailout', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [{ key: 'one', label: 'One', icon: 'maximize', action: () => {} }, 'agQuickFilterToolbarItem'],
            },
        });
        await new GridColumns(api, `arrow keys inside an input toolbar item do not move toolbar focus setup`)
            .checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
        await new GridRows(api, `arrow keys inside an input toolbar item do not move toolbar focus setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
        const input = toolbar.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
        const button = toolbar.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;

        input.focus();
        expect(document.activeElement).toBe(input);

        dispatchKeyDown(input, 'ArrowLeft');
        expect(document.activeElement).toBe(input);
        expect(document.activeElement).not.toBe(button);
        await new GridRows(api, `arrow keys inside an input toolbar item do not move toolbar focus final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `
        );
    });
});
