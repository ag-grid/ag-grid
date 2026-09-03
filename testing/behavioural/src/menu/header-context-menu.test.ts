import { waitFor } from '@testing-library/dom';
import { TestGridsManager, menuOption, polyfillOffsetParent } from 'ag-test-utils';

import { AllEnterpriseModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

function fireContextMenu(element: HTMLElement): void {
    element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

describe('header context menu on empty header space (AG-18411)', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const rowData = [{ athlete: 'Michael Phelps', age: 23, country: 'United States' }];

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    test('right-clicking the empty header space opens the column chooser context menu', async () => {
        await gridMgr.createGridAndWait('header-ctx-empty', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
            rowData,
        });
        restoreOffsetParent = polyfillOffsetParent();

        fireContextMenu(document.querySelector('.ag-header-row') as HTMLElement);

        await waitFor(() => expect(menuOption('Choose Columns')).not.toBeNull());
        expect(menuOption('Reset Columns')).not.toBeNull();
    });

    test("right-clicking a real header cell opens only that column's menu", async () => {
        await gridMgr.createGridAndWait('header-ctx-cell', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
            rowData,
        });
        restoreOffsetParent = polyfillOffsetParent();

        fireContextMenu(document.querySelector('.ag-header-cell') as HTMLElement);

        await waitFor(() => expect(menuOption('Pin Column')).not.toBeNull());
        expect(document.querySelectorAll('.ag-menu')).toHaveLength(1);
    });

    test("right-clicking a column group header opens only that group's menu", async () => {
        await gridMgr.createGridAndWait('header-ctx-group', {
            columnDefs: [
                { headerName: 'Athlete Details', children: [{ field: 'athlete' }, { field: 'age' }] },
                { field: 'country' },
            ],
            rowData,
        });
        restoreOffsetParent = polyfillOffsetParent();

        fireContextMenu(document.querySelector('.ag-header-group-cell') as HTMLElement);

        await waitFor(() => expect(document.querySelectorAll('.ag-menu')).toHaveLength(1));
    });
});
