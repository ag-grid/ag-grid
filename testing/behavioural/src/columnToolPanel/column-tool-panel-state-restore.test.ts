import { waitFor } from '@testing-library/dom';

import type { ColDef, ColGroupDef, GridApi, SideBarDef } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

const COLUMNS_SIDEBAR: SideBarDef = { toolPanels: ['columns'], defaultToolPanel: 'columns' };

const rowData = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States' },
    { athlete: 'Natalie Coughlin', age: 25, country: 'United States' },
];

const groupCols: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'Group A',
        groupId: 'groupA',
        children: [{ field: 'athlete' }, { field: 'age' }],
    },
    { field: 'country' },
];

async function openColumnsPanel(api: GridApi): Promise<any> {
    return waitFor(() => {
        const panel = api.getToolPanelInstance('columns') as any;
        const list = panel?.primaryColsPanel?.primaryColsListPanel;
        if (!list || list.getDisplayedColsList().length === 0) {
            throw new Error('Columns tool panel has not rendered yet');
        }
        return panel;
    });
}

/** True when a column group row is expanded in the rendered virtual list (children are displayed). */
function isColumnGroupExpanded(panel: any, groupId: string): boolean {
    const list = panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList();
    const groupItem = list.find((item: any) => item.group && item.columnGroup?.groupId === groupId);
    return !!groupItem?.expanded;
}

describe('Columns Tool Panel state restore', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridsManager.reset());

    test('api.setState restores the Columns Tool Panel expanded group state (authoritative)', async () => {
        // grid1: groups default expanded — live-collapse Group A so the saved state omits it.
        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: groupCols,
            rowData,
            sideBar: COLUMNS_SIDEBAR,
        });
        const panel1 = await openColumnsPanel(api1);
        expect(isColumnGroupExpanded(panel1, 'groupA')).toBe(true);

        panel1.primaryColsPanel.collapseGroups(['groupA']);
        await waitFor(() => expect(isColumnGroupExpanded(panel1, 'groupA')).toBe(false));

        const state = api1.getState();
        expect(state.sideBar?.toolPanels?.columns?.expandedGroupIds ?? []).not.toContain('groupA');

        // grid2: a fresh grid, group defaults to expanded. Opening the panel sets the internal latch.
        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: groupCols,
            rowData,
            sideBar: COLUMNS_SIDEBAR,
        });
        const panel2Initial = await openColumnsPanel(api2);
        expect(isColumnGroupExpanded(panel2Initial, 'groupA')).toBe(true);

        // Restore via api.setState: the saved state has Group A collapsed, so the live-expanded group
        // must collapse (authoritative lossless round-trip).
        api2.setState(state);

        await waitFor(() => {
            const panel2 = api2.getToolPanelInstance('columns') as any;
            expect(isColumnGroupExpanded(panel2, 'groupA')).toBe(false);
        });
        expect(api2.getState().sideBar?.toolPanels?.columns?.expandedGroupIds ?? []).not.toContain('groupA');
    });

    test('api.setState restores an expanded Columns Tool Panel group', async () => {
        // grid1: leave Group A expanded (default), capture the state.
        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: groupCols,
            rowData,
            sideBar: COLUMNS_SIDEBAR,
        });
        const panel1 = await openColumnsPanel(api1);
        expect(isColumnGroupExpanded(panel1, 'groupA')).toBe(true);
        const state = api1.getState();
        expect(state.sideBar?.toolPanels?.columns?.expandedGroupIds ?? []).toContain('groupA');

        // grid2: open panel, live-collapse Group A so the assertion discriminates.
        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: groupCols,
            rowData,
            sideBar: COLUMNS_SIDEBAR,
        });
        const panel2Initial = await openColumnsPanel(api2);
        panel2Initial.primaryColsPanel.collapseGroups(['groupA']);
        await waitFor(() => expect(isColumnGroupExpanded(panel2Initial, 'groupA')).toBe(false));

        api2.setState(state);
        await waitFor(() => {
            const panel2 = api2.getToolPanelInstance('columns') as any;
            expect(isColumnGroupExpanded(panel2, 'groupA')).toBe(true);
        });
    });
});
