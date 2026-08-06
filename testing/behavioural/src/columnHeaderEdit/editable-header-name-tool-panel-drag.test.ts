import { waitFor } from '@testing-library/dom';

import type { GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { DragEventDispatcher, TestGridsManager } from '../test-utils';

/**
 * The columns tool panel builds its drag source once per rendered item, so the drag-ghost label must be
 * resolved when the drag starts rather than captured at construction — otherwise a rename made while the
 * item stays mounted leaves the ghost showing the pre-rename name.
 */
describe('Editable header name — columns tool panel drag ghost', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridMgr.reset());

    const rowData = [{ athlete: 'Michael Phelps', country: 'United States' }];

    const labels = () =>
        Array.from(document.querySelectorAll('.ag-column-select-column-label')).map((e) => e.textContent);

    async function dragGhostLabel(selector: string): Promise<string> {
        const handle = await waitFor(() => {
            const found = document.querySelector(selector);
            expect(found).not.toBeNull();
            return found!;
        });
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        // jsdom has no hit-testing; the tool panel is not a drop target, so an empty hit list is correct.
        const ownerDocument = handle.ownerDocument;
        const originalElementsFromPoint = ownerDocument.elementsFromPoint?.bind(ownerDocument);
        ownerDocument.elementsFromPoint = () => [];
        try {
            await dispatcher.startDrag(handle, 10, 10);
            await dispatcher.movePointer(handle, 60, 60);
            const label = await waitFor(() => {
                const found = document.querySelector('.ag-dnd-ghost-label');
                expect(found).not.toBeNull();
                return found!;
            });
            return label.textContent ?? '';
        } finally {
            await dispatcher.finishDrag(handle);
            ownerDocument.elementsFromPoint = originalElementsFromPoint as typeof ownerDocument.elementsFromPoint;
            await waitFor(() => expect(document.querySelector('.ag-dnd-ghost-label')).toBeNull());
        }
    }

    async function createGrid(columnDefs: any[]): Promise<GridApi> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        });
        return api;
    }

    test('a column item drag ghost shows the edited name', async () => {
        const api = await createGrid([{ field: 'athlete', headerNameEditable: true }, { field: 'country' }]);
        const handle = '.ag-column-select-column .ag-column-select-column-drag-handle';

        expect(await dragGhostLabel(handle)).toBe('Athlete');

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() => expect(labels()).toContain('Renamed'));

        expect(await dragGhostLabel(handle)).toBe('Renamed');
    });

    test('a column group item drag ghost shows the edited group name', async () => {
        const api = await createGrid([
            {
                headerName: 'Participant',
                groupId: 'participant',
                headerNameEditable: true,
                children: [{ field: 'athlete' }, { field: 'country' }],
            },
        ]);
        const handle = '.ag-column-select-column-group-drag-handle';

        expect(await dragGhostLabel(handle)).toBe('Participant');

        api.setState({
            columnGroup: {
                openColumnGroupIds: ['participant'],
                headerNames: [{ groupId: 'participant', headerName: 'Renamed Group' }],
            },
        });
        await waitFor(() => expect(labels()).toContain('Renamed Group'));

        expect(await dragGhostLabel(handle)).toBe('Renamed Group');
    });
});
