import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, ToolbarModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForEvent } from '../test-utils';

// `_focusInto` (used to focus the menu list on open and the button on close) relies on
// `_isVisible`, which checks `offsetParent`. jsdom does not compute layout, so
// `offsetParent` is always null — polyfill it so the focus-management code can find the
// rendered menu items and the toolbar button.
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

describe('Toolbar menu item (agMenuToolbarItem)', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule, ContextMenuModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('renders icon, label and chevron when menuItems are provided', async () => {
        const api = gridMgr.createGrid('menu-item-renders', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            icon: 'save',
                            menuItems: [{ name: 'One', action: () => {} }],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button).not.toBeNull();
        expect(button.hasAttribute('disabled')).toBe(false);
        expect(button.getAttribute('title')).toBe('Export');
        expect(button.getAttribute('aria-label')).toBe('Export');

        const label = button.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
        expect(label.textContent).toBe('Export');
        expect(label.classList.contains('ag-hidden')).toBe(false);

        const chevron = button.querySelector<HTMLElement>('.ag-toolbar-button-chevron')!;
        expect(chevron.classList.contains('ag-hidden')).toBe(false);
        expect(chevron.querySelector('.ag-icon')).not.toBeNull();
    });

    test('without menuItems the button is disabled and the chevron is hidden', async () => {
        const api = gridMgr.createGrid('menu-item-empty', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            icon: 'save',
                            menuItems: [],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.hasAttribute('disabled')).toBe(true);
        const chevron = button.querySelector<HTMLElement>('.ag-toolbar-button-chevron')!;
        expect(chevron.classList.contains('ag-hidden')).toBe(true);

        // Clicking a disabled <button> is a no-op: no popup should appear.
        button.click();
        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
    });

    test('clicking the button opens a popup with the configured menu items', async () => {
        const api = gridMgr.createGrid('menu-item-click-opens', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            menuItems: [
                                { name: 'CSV', action: () => {} },
                                { name: 'Excel', action: () => {} },
                            ],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;

        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
        button.click();

        const popup = gridDiv.querySelector<HTMLElement>('.ag-popup')!;
        expect(popup).not.toBeNull();
        const menuList = popup.querySelector<HTMLElement>('.ag-menu-list')!;
        expect(menuList).not.toBeNull();
        expect(menuList.getAttribute('role')).toBe('menu');

        const itemNames = Array.from(popup.querySelectorAll('.ag-menu-option-text')).map((el) => el.textContent);
        expect(itemNames).toEqual(['CSV', 'Excel']);
    });

    test('pressing Escape closes the popup and returns focus to the button', async () => {
        const api = gridMgr.createGrid('menu-item-escape', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            menuItems: [{ name: 'CSV', action: () => {} }],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.click();
        expect(gridDiv.querySelector('.ag-popup')).not.toBeNull();

        // The popup attaches its document-level keydown/mousedown listeners via `setTimeout(0)`
        // to avoid reacting to the click that opened it. Yield one tick so Escape is observed.
        await asyncSetTimeout(0);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
        expect(document.activeElement).toBe(button);
    });

    test('mousedown outside the popup closes it and returns focus to the button', async () => {
        const api = gridMgr.createGrid('menu-item-outside-click', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            menuItems: [{ name: 'CSV', action: () => {} }],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.click();
        expect(gridDiv.querySelector('.ag-popup')).not.toBeNull();

        await asyncSetTimeout(0);

        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
        expect(document.activeElement).toBe(button);
    });

    test('refresh with populated menuItems enables a previously empty menu item', async () => {
        const api = gridMgr.createGrid('menu-item-refresh', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            menuItems: [],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        let button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.hasAttribute('disabled')).toBe(true);

        api.setGridOption('toolbar', {
            items: [
                {
                    toolbarItem: 'agMenuToolbarItem',
                    toolbarItemParams: {
                        label: 'Export',
                        menuItems: [{ name: 'CSV', action: () => {} }],
                    },
                },
            ],
        });

        button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        expect(button.hasAttribute('disabled')).toBe(false);
        const chevron = button.querySelector<HTMLElement>('.ag-toolbar-button-chevron')!;
        expect(chevron.classList.contains('ag-hidden')).toBe(false);

        button.click();
        expect(gridDiv.querySelector('.ag-popup')).not.toBeNull();
    });
});

describe('Toolbar menu item (agMenuToolbarItem) without a menu module', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
        vi.restoreAllMocks();
    });

    test('logs a module-registration error and does not open a popup on click', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const api = gridMgr.createGrid('menu-item-no-menu-module', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            menuItems: [{ name: 'CSV', action: () => {} }],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        expect(errorSpy).toHaveBeenCalled();

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.click();
        expect(gridDiv.querySelector('.ag-popup')).toBeNull();
    });
});

describe('Toolbar menu item (agMenuToolbarItem) with ColumnMenuModule only', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ToolbarModule, ColumnMenuModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('clicking the button opens a popup when only ColumnMenuModule is registered', async () => {
        const api = gridMgr.createGrid('menu-item-column-menu-only', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        toolbarItemParams: {
                            label: 'Export',
                            menuItems: [{ name: 'CSV', action: () => {} }],
                        },
                    },
                ],
            },
        });

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
        button.click();
        const popup = gridDiv.querySelector<HTMLElement>('.ag-popup')!;
        expect(popup).not.toBeNull();
        const itemNames = Array.from(popup.querySelectorAll('.ag-menu-option-text')).map((el) => el.textContent);
        expect(itemNames).toEqual(['CSV']);
    });
});
