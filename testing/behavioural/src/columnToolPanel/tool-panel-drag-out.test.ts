import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher, TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('columns tool panel drag out of the grid', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridMgr.reset());

    const hides = { hideIcon: true, notAllowed: false };
    const notAllowed = { hideIcon: false, notAllowed: true };

    async function createGrid(columnDefs: (ColDef | ColGroupDef)[]): Promise<GridApi> {
        return gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        });
    }

    // Drags the tool panel item with the given label out of the grid and reads the ghost the user sees while out.
    async function dragOutOfGrid(itemSelector: string, label: string) {
        // happy-dom gives the virtual list no height, so the viewport needs one before it renders every item
        const viewport = document.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
        const handle = await waitFor(() => {
            const items = Array.from(document.querySelectorAll(itemSelector));
            const item = items.find((found) => found.textContent!.trim() === label);
            if (!item) {
                throw new Error(
                    `no tool panel item "${label}" among ${items.map((found) => found.textContent!.trim())}`
                );
            }
            return item.querySelector('[class*="-drag-handle"]')!;
        });
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(handle, 10, 10);
            await dispatcher.movePointer(handle, 60, 60);
            await dispatcher.movePointer(document.body, 5000, 5000);
            await waitFor(() => expect(document.querySelector('.ag-dnd-ghost-icon')).not.toBeNull());
            const ghost = document.querySelector('.ag-dnd-ghost')!;
            return {
                hideIcon: ghost.querySelector('.ag-dnd-ghost-icon .ag-icon-eye-slash') != null,
                notAllowed: ghost.classList.contains('ag-dnd-ghost-not-allowed'),
            };
        } finally {
            await dispatcher.finishDrag(document.body);
            await waitFor(() => expect(document.querySelector('.ag-dnd-ghost')).toBeNull());
        }
    }

    // TODO: disabled due to AG-19380 - re-enable once fixed
    test.skip('dragging a column item out of the grid shows the hide icon only when the drop would hide the column', async () => {
        await createGrid([
            { field: 'a', headerName: 'Locked', lockVisible: true },
            { field: 'b', headerName: 'Plain' },
        ]);

        const locked = await dragOutOfGrid('.ag-column-select-column', 'Locked');
        const plain = await dragOutOfGrid('.ag-column-select-column', 'Plain');

        expect({ locked, plain }).toEqual({ locked: notAllowed, plain: hides });
    });
});
