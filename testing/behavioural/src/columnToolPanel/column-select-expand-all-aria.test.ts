import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColGroupDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const COLUMN_DEFS: ColGroupDef[] = [
    {
        groupId: 'athleteDetails',
        headerName: 'Athlete Details',
        children: [{ field: 'athlete' }, { field: 'country' }],
    },
    {
        groupId: 'medals',
        headerName: 'Medals',
        children: [{ field: 'gold' }, { field: 'silver' }],
    },
];

const EXPAND_ALL_NAME = 'Expand or Collapse All Column Groups';

describe('column select expand/collapse-all control accessibility', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid(withSideBar: boolean): Promise<GridApi> {
        return gridsManager.createGridAndWait('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: [{ athlete: 'A', country: 'B', gold: 1, silver: 2 }],
            ...(withSideBar ? { sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' } } : {}),
        });
    }

    function getExpandControl(container: Element): HTMLElement {
        const el = container.querySelector<HTMLElement>('.ag-column-select-header-icon');
        expect(el).not.toBeNull();
        return el!;
    }

    function pressKey(el: HTMLElement, key: string): KeyboardEvent {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        el.dispatchEvent(event);
        return event;
    }

    async function expectToggledByKeyboard(container: Element): Promise<void> {
        const control = getExpandControl(container);

        expect(control.getAttribute('role')).toBe('button');
        expect(control.getAttribute('aria-label')).toBe(EXPAND_ALL_NAME);
        expect(control.getAttribute('aria-expanded')).toBe('true');

        const space = pressKey(control, ' ');
        expect(space.defaultPrevented).toBe(true);
        await waitFor(() => expect(control.getAttribute('aria-expanded')).toBe('false'));

        const enter = pressKey(control, 'Enter');
        expect(enter.defaultPrevented).toBe(true);
        await waitFor(() => expect(control.getAttribute('aria-expanded')).toBe('true'));

        pressKey(control, 'Enter');
        await waitFor(() => expect(control.getAttribute('aria-expanded')).toBe('false'));
    }

    test('columns tool panel control has button role, name and state, and toggles with Enter and Space', async () => {
        const api = await createGrid(true);
        const panel = getGridElement(api)!.querySelector('.ag-column-panel')!;

        await expectToggledByKeyboard(panel);
    });

    test('aria-expanded is false when only some groups are expanded, and activating expands all', async () => {
        const api = await createGrid(true);
        const panel = getGridElement(api)!.querySelector('.ag-column-panel')!;
        const control = getExpandControl(panel);

        api.getToolPanelInstance('columns')!.collapseColumnGroups(['athleteDetails']);
        await waitFor(() => expect(control.getAttribute('aria-expanded')).toBe('false'));

        pressKey(control, 'Enter');
        await waitFor(() => expect(control.getAttribute('aria-expanded')).toBe('true'));
    });

    test('choose columns dialog control has button role, name and state, and toggles with Enter and Space', async () => {
        const api = await createGrid(false);
        api.showColumnChooser();

        const dialog = await waitFor(() => {
            const el = document.querySelector('.ag-column-select');
            expect(el).not.toBeNull();
            return el!;
        });

        await expectToggledByKeyboard(dialog);
    });
});
