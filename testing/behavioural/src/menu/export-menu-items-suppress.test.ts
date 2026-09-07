import { TestGridsManager, menuOption, openMenuOption, polyfillOffsetParent } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

/** Fire a real `contextmenu` MouseEvent on the first body cell, as a right-click would. */
function openCellContextMenu(): void {
    const cell = document.querySelector('.ag-cell[col-id="athlete"]') as HTMLElement;
    cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

const rowData = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States' },
    { athlete: 'Missy Franklin', age: 17, country: 'United States' },
];

/** token, its rendered label, and the grid option that suppresses it. */
const exportTokens = [
    ['csvExport', 'CSV Export', 'suppressCsvExport'],
    ['excelExport', 'Excel Export', 'suppressExcelExport'],
    ['pdfExport', 'PDF Export', 'suppressPdfExport'],
] as const;

describe('suppressCsvExport / suppressExcelExport / suppressPdfExport hide explicitly-named export menu items', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule, ClientSideRowModelModule, ValidationModule],
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    async function createGrid(id: string, options: Partial<GridOptions>) {
        const api = await gridMgr.createGridAndWait(id, {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            ...options,
        } as GridOptions);
        restoreOffsetParent = polyfillOffsetParent();
        return api;
    }

    describe.each(exportTokens)('%s', (token, label, suppressOption) => {
        test('is not rendered at the top level when the suppress option is enabled', async () => {
            await createGrid(`${token}-top-suppressed`, {
                [suppressOption]: true,
                getContextMenuItems: () => [token, { name: 'Sentinel' }],
            });

            openCellContextMenu();

            await openMenuOption('Sentinel');
            expect(menuOption(label)).toBeNull();
        });

        test('is rendered at the top level when the suppress option is not enabled', async () => {
            await createGrid(`${token}-top-shown`, {
                getContextMenuItems: () => [token, { name: 'Sentinel' }],
            });

            openCellContextMenu();

            await openMenuOption(label);
        });

        test('is not rendered inside a user-supplied sub menu when the suppress option is enabled', async () => {
            // The sub menu carries a second, never-suppressed item so that it still renders — waiting
            // for that item is what proves the sub menu opened before the absence is asserted.
            await createGrid(`${token}-submenu-suppressed`, {
                [suppressOption]: true,
                getContextMenuItems: () => [{ name: 'More', subMenu: [token, { name: 'Sibling' }] }],
            });

            openCellContextMenu();

            const more = await openMenuOption('More');
            more.closest<HTMLElement>('.ag-menu-option')!.dispatchEvent(
                new MouseEvent('mouseenter', { bubbles: true })
            );

            await openMenuOption('Sibling');
            expect(menuOption(label)).toBeNull();
        });

        test('is rendered inside a user-supplied sub menu when the suppress option is not enabled', async () => {
            await createGrid(`${token}-submenu-shown`, {
                getContextMenuItems: () => [{ name: 'More', subMenu: [token] }],
            });

            openCellContextMenu();

            const more = await openMenuOption('More');
            more.closest<HTMLElement>('.ag-menu-option')!.dispatchEvent(
                new MouseEvent('mouseenter', { bubbles: true })
            );

            await openMenuOption(label);
        });

        test('is filtered out of the built-in export sub menu, leaving the other two export items', async () => {
            await createGrid(`${token}-export-submenu`, {
                [suppressOption]: true,
                getContextMenuItems: () => ['export'],
            });

            openCellContextMenu();

            const exportItem = await openMenuOption('Export');
            exportItem
                .closest<HTMLElement>('.ag-menu-option')!
                .dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

            const others = exportTokens.filter(([otherToken]) => otherToken !== token);
            await openMenuOption(others[0][1]);
            expect(menuOption(others[1][1])).not.toBeNull();
            expect(menuOption(label)).toBeNull();
        });

        test('is not rendered when named through colDef.contextMenuItems', async () => {
            await createGrid(`${token}-coldef`, {
                [suppressOption]: true,
                columnDefs: [{ field: 'athlete', contextMenuItems: [token, { name: 'Sentinel' }] }, { field: 'age' }],
            });

            openCellContextMenu();

            await openMenuOption('Sentinel');
            expect(menuOption(label)).toBeNull();
        });

        test('is not rendered when named through the column menu', async () => {
            const api = await createGrid(`${token}-column-menu`, {
                [suppressOption]: true,
                getColumnMenuItems: () => [token, { name: 'Sentinel' }],
            });

            api.showColumnMenu('athlete');

            await openMenuOption('Sentinel');
            expect(menuOption(label)).toBeNull();
        });
    });

    test('the built-in export sub menu is not rendered at all when every export type is suppressed', async () => {
        await createGrid('export-all-suppressed', {
            suppressCsvExport: true,
            suppressExcelExport: true,
            suppressPdfExport: true,
            getContextMenuItems: () => ['export', { name: 'Sentinel' }],
        });

        openCellContextMenu();

        await openMenuOption('Sentinel');
        expect(menuOption('Export')).toBeNull();
    });
});
