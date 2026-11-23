import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { getColumnEntry } from '../columnToolPanel/toolPanelContextMenuHarness';

/** Menus opened without a grid event (tool panel context menu, hover-opened sub menus) must still be stamped. */
describe('popup menu test IDs', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const columnDefs: ColDef[] = [
        { field: 'athlete', enableRowGroup: true },
        {
            field: 'age',
            columnMenuItems: [
                { name: 'A Custom Item', action: () => {} },
                { name: 'Custom Sub Menu', subMenu: [{ name: 'Black', action: () => {} }] },
            ],
        },
    ];
    const rowData = [{ athlete: 'Michael Phelps', age: 23 }];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    async function createGrid(): Promise<GridApi> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        return api;
    }

    /** Runs out pending stamping passes (two macrotasks at 0 ms debounces), so only the menu opening stamps it. */
    const drainStampingPasses = async () => {
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
    };

    function menuTestIds(gridDiv: HTMLElement): { menus: (string | null)[]; options: (string | null)[] } {
        return {
            menus: Array.from(gridDiv.querySelectorAll('.ag-menu-list'), (menu) => menu.getAttribute('data-testid')),
            options: Array.from(gridDiv.querySelectorAll('.ag-menu-option'), (option) =>
                option.getAttribute('data-testid')
            ),
        };
    }

    test('the Columns Tool Panel context menu is stamped when it opens', async () => {
        const api = await createGrid();
        const gridDiv = getGridElement(api)! as HTMLElement;

        // Locating the entry scrolls the virtual list, which schedules a stamping pass of its own.
        const entry = await getColumnEntry(api.getToolPanelInstance('columns'), gridDiv, 'Athlete');
        await drainStampingPasses();

        entry.dispatchEvent(
            new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
        );

        await waitFor(() => {
            const { menus, options } = menuTestIds(gridDiv);
            expect(menus).toEqual([agTestIdFor.menu()]);
            expect(options).toContain(agTestIdFor.menuOption('Group by Athlete'));
        });
    });

    test('a sub menu opened by hovering its parent item is stamped when it opens', async () => {
        const api = await createGrid();
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.showColumnMenu('age');
        const subMenuItem = await waitFor(() => {
            const item = gridDiv.querySelector<HTMLElement>(
                `[data-testid="${agTestIdFor.menuOption('Custom Sub Menu')}"]`
            );
            expect(item).not.toBeNull();
            return item!;
        });
        await drainStampingPasses();

        subMenuItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));

        await waitFor(() => {
            const { menus, options } = menuTestIds(gridDiv);
            expect(menus).toEqual([agTestIdFor.menu(), agTestIdFor.menu()]);
            expect(options).toContain(agTestIdFor.menuOption('Black'));
        });
    });
});
