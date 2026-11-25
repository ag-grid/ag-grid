import { TestGridsManager, openMenuOption } from 'ag-test-utils';

import type { GridApi, MenuItemDef } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

describe('menu item keyboard selection', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnMenuModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    async function openMenuItem(menuItem: MenuItemDef): Promise<{ api: GridApi; item: HTMLElement }> {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            getColumnMenuItems: () => [menuItem],
        });
        api.showColumnMenu('athlete');
        const item = (await openMenuOption(menuItem.name)).closest<HTMLElement>('.ag-menu-option')!;
        item.focus();
        return { api, item };
    }

    function dispatchKey(target: HTMLElement, type: 'keydown' | 'keyup', key: string, repeat = false): void {
        target.dispatchEvent(new KeyboardEvent(type, { key, repeat, bubbles: true, cancelable: true }));
    }

    test('holding Space on a checkable item acts once, when Space is released', async () => {
        const action = vi.fn();
        const { item } = await openMenuItem({ name: 'Toggle', checked: true, suppressCloseOnSelect: true, action });

        dispatchKey(item, 'keydown', KeyCode.SPACE);
        dispatchKey(item, 'keydown', KeyCode.SPACE, true);
        dispatchKey(item, 'keydown', KeyCode.SPACE, true);
        expect(action).not.toHaveBeenCalled();

        dispatchKey(item, 'keyup', KeyCode.SPACE);
        expect(action).toHaveBeenCalledTimes(1);
    });

    test('Enter on a checkable item acts when pressed', async () => {
        const action = vi.fn();
        const { item } = await openMenuItem({ name: 'Toggle', checked: false, suppressCloseOnSelect: true, action });

        dispatchKey(item, 'keydown', KeyCode.ENTER);
        expect(action).toHaveBeenCalledTimes(1);
    });

    test('Space on an item that is not checkable acts when pressed', async () => {
        const action = vi.fn();
        const { item } = await openMenuItem({ name: 'Action', action });

        dispatchKey(item, 'keydown', KeyCode.SPACE);
        expect(action).toHaveBeenCalledTimes(1);
    });
});
