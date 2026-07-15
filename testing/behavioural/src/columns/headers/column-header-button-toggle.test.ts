import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';

let restoreOffsetParent: (() => void) | undefined;

function enableOffsetParentPolyfill(): void {
    if (restoreOffsetParent) {
        return;
    }
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            return this.closest('.ag-measurement-container') ? null : this.parentElement;
        },
    });
    restoreOffsetParent = () => {
        if (original) {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', original);
        } else {
            delete (HTMLElement.prototype as { offsetParent?: unknown }).offsetParent;
        }
        restoreOffsetParent = undefined;
    };
}

function press(el: HTMLElement): void {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    // A real mouse click reports a click count via `detail`; keyboard/programmatic clicks report 0.
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
}

describe('column header button toggles its popup closed on second click (AG-16350)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, ColumnMenuModule],
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
    });

    test('column menu (⋮) button: a second click closes the menu and it stays closed', async () => {
        enableOffsetParentPolyfill();

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            suppressMenuHide: true,
        };

        const api: GridApi = await gridsManager.createGridAndWait('menu-toggle-grid', gridOptions);
        const eGridDiv = TestGridsManager.getHTMLElement(api)!;
        const menuButton = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;
        expect(menuButton).toBeTruthy();

        // First click: opens the menu.
        press(menuButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);

        // Second click on the same button: should simply close the menu, not close-and-reopen.
        press(menuButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(0);
    });

    test('filter button: a second click closes the filter popup and it stays closed', async () => {
        enableOffsetParentPolyfill();

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'athlete', filter: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
        };

        const api: GridApi = await gridsManager.createGridAndWait('filter-toggle-grid', gridOptions);
        const eGridDiv = TestGridsManager.getHTMLElement(api)!;
        const filterButton = eGridDiv.querySelector<HTMLElement>('.ag-header-cell-filter-button')!;
        expect(filterButton).toBeTruthy();

        // First click: opens the filter popup.
        press(filterButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);

        // Second click on the same button: should simply close the filter popup, not close-and-reopen.
        press(filterButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(0);
    });

    test('floating filter funnel button: a second click closes the filter popup and it stays closed', async () => {
        enableOffsetParentPolyfill();

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
        };

        const api: GridApi = await gridsManager.createGridAndWait('floating-filter-toggle-grid', gridOptions);
        const eGridDiv = TestGridsManager.getHTMLElement(api)!;
        const funnelButton = eGridDiv.querySelector<HTMLElement>('.ag-floating-filter-button-button')!;
        expect(funnelButton).toBeTruthy();

        // First click: opens the filter popup.
        press(funnelButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);

        // Second click on the same button: should simply close the filter popup, not close-and-reopen.
        press(funnelButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(0);
    });

    test('floating filter funnel button: keyboard activation (click without mousedown) closes an open popup', async () => {
        enableOffsetParentPolyfill();

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
        };

        const api: GridApi = await gridsManager.createGridAndWait('floating-filter-keyboard-grid', gridOptions);
        const eGridDiv = TestGridsManager.getHTMLElement(api)!;
        const funnelButton = eGridDiv.querySelector<HTMLElement>('.ag-floating-filter-button-button')!;
        expect(funnelButton).toBeTruthy();

        // Open via mouse.
        press(funnelButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);

        // Keyboard activation of a focused button dispatches a `click` with no preceding `mousedown`,
        // so nothing closes the popup via the document listener — the button handler must close it itself.
        funnelButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(0);
    });

    test('floating filter funnel button: a cancelled mouse press does not swallow a later keyboard activation', async () => {
        enableOffsetParentPolyfill();

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
        };

        const api: GridApi = await gridsManager.createGridAndWait('floating-filter-cancelled-press-grid', gridOptions);
        const eGridDiv = TestGridsManager.getHTMLElement(api)!;
        const funnelButton = eGridDiv.querySelector<HTMLElement>('.ag-floating-filter-button-button')!;
        expect(funnelButton).toBeTruthy();

        // Open via mouse.
        press(funnelButton);
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);

        // Press down on the button (closing the popup via the document listener) but release off it: the `click`
        // never arrives, so the captured open-state must not linger and swallow the next activation.
        funnelButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(0);

        // A subsequent keyboard activation must reopen the popup, not be swallowed by the stale mousedown.
        funnelButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await asyncSetTimeout(10);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);
    });
});
