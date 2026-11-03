import { getByRole } from '@testing-library/dom';
import {
    TestGridsManager,
    clickMenuOption,
    fireGridPointerDown,
    openMenuOption,
    polyfillOffsetParent,
} from 'ag-test-utils';

import type { MenuItemDef } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const columnDefs = [{ field: 'athlete' }];
const rowData = [{ athlete: 'Michael Phelps' }];

const menuItems: MenuItemDef[] = [
    { name: 'Delete', ariaLabel: 'Delete row' },
    { name: 'Archive', ariaLabel: 'Archive row', disabled: true },
    { name: 'Plain' },
    {
        name: 'More',
        ariaLabel: 'More row actions',
        subMenu: [{ name: 'Copy', ariaLabel: 'Copy row' }, { name: 'Print' }],
    },
];

function rightClickFirstCell(gridDiv: HTMLElement): void {
    const cell = gridDiv.querySelector<HTMLElement>('[row-index="0"] [col-id="athlete"]')!;
    fireGridPointerDown(cell, { button: 2, buttons: 2 });
    cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

async function menuContaining(optionName: string): Promise<HTMLElement> {
    return (await openMenuOption(optionName)).closest<HTMLElement>('[role="menu"]')!;
}

describe('MenuItemDef ariaLabel', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });
    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    /** Asserts the accessible names of the top-level items and the sub menu items of an open menu. */
    async function expectAccessibleNames(): Promise<void> {
        const menu = await menuContaining('Delete');

        getByRole(menu, 'menuitem', { name: 'Delete row' });
        expect(getByRole(menu, 'menuitem', { name: 'Plain' }).hasAttribute('aria-label')).toBe(false);
        expect(getByRole(menu, 'menuitem', { name: 'Archive row' }).getAttribute('aria-disabled')).toBe('true');
        expect(getByRole(menu, 'menuitem', { name: 'More row actions' }).getAttribute('aria-haspopup')).toBe('menu');

        await clickMenuOption('More');
        const subMenu = await menuContaining('Copy');

        getByRole(subMenu, 'menuitem', { name: 'Copy row' });
        getByRole(subMenu, 'menuitem', { name: 'Print' });
    }

    test('column menu items use ariaLabel as their accessible name, and fall back to name', async () => {
        const api = await gridMgr.createGridAndWait('menu-aria-label-column', {
            columnDefs,
            rowData,
            getColumnMenuItems: () => menuItems,
        });

        api.showColumnMenu('athlete');
        await expectAccessibleNames();
    });

    test('context menu items use ariaLabel as their accessible name, and fall back to name', async () => {
        const api = await gridMgr.createGridAndWait('menu-aria-label-context', {
            columnDefs,
            rowData,
            getContextMenuItems: () => menuItems,
        });

        rightClickFirstCell(getGridElement(api)! as HTMLElement);
        await expectAccessibleNames();
    });
});
