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

const EXPAND_ALL_NAME = 'Expand All Column Groups';
const COLLAPSE_ALL_NAME = 'Collapse All Column Groups';

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

    function expectNameAndState(control: HTMLElement, name: string, expanded: string): void {
        expect(control.getAttribute('aria-label')).toBe(name);
        expect(control.getAttribute('aria-expanded')).toBe(expanded);
    }

    async function expectToggledByKeyboard(container: Element): Promise<void> {
        const control = getExpandControl(container);

        expect(control.getAttribute('role')).toBe('button');
        expectNameAndState(control, COLLAPSE_ALL_NAME, 'true');

        const space = pressKey(control, ' ');
        expect(space.defaultPrevented).toBe(true);
        await waitFor(() => expectNameAndState(control, EXPAND_ALL_NAME, 'false'));

        const enter = pressKey(control, 'Enter');
        expect(enter.defaultPrevented).toBe(true);
        await waitFor(() => expectNameAndState(control, COLLAPSE_ALL_NAME, 'true'));

        pressKey(control, 'Enter');
        await waitFor(() => expectNameAndState(control, EXPAND_ALL_NAME, 'false'));
    }

    test('columns tool panel control has button role, name and state, and toggles with Enter and Space', async () => {
        const api = await createGrid(true);
        const panel = getGridElement(api)!.querySelector('.ag-column-panel')!;

        await expectToggledByKeyboard(panel);
    });

    test('names the expand and reports collapsed when only some groups are expanded, and activating expands all', async () => {
        const api = await createGrid(true);
        const panel = getGridElement(api)!.querySelector('.ag-column-panel')!;
        const control = getExpandControl(panel);

        api.getToolPanelInstance('columns')!.collapseColumnGroups(['athleteDetails']);
        await waitFor(() => expectNameAndState(control, EXPAND_ALL_NAME, 'false'));

        pressKey(control, 'Enter');
        await waitFor(() => expectNameAndState(control, COLLAPSE_ALL_NAME, 'true'));
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
