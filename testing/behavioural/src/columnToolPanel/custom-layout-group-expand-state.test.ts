import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, ColumnToolPanelState, GridApi, GridState } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('column tool panel custom layout group expand state (AG-18218)', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [{ athlete: 'Michael Phelps', country: 'United States', sport: 'Swimming' }];

    const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

    // custom tool panel layout, grouping every column under a single top-level group
    const customLayout: ColGroupDef[] = [
        {
            headerName: 'Athlete Details',
            groupId: 'athleteDetails',
            children: [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }],
        },
    ];

    afterEach(() => {
        gridMgr.reset();
    });

    async function createGrid(
        gridId: string,
        initialState?: GridState,
        gridColumnDefs: (ColDef | ColGroupDef)[] = columnDefs
    ): Promise<GridApi> {
        const gridApi = await gridMgr.createGridAndWait(gridId, {
            columnDefs: gridColumnDefs,
            rowData,
            initialState,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { suppressSyncLayoutWithGrid: true },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await waitFor(() => expect(gridApi.getToolPanelInstance('columns')).toBeDefined());
        gridApi.getToolPanelInstance('columns')!.setColumnLayout(customLayout);

        return gridApi;
    }

    function getGroupExpandedStates(gridApi: GridApi): Record<string, boolean> {
        const listPanel = (gridApi.getToolPanelInstance('columns') as any).primaryColsPanel.primaryColsListPanel;
        const res: Record<string, boolean> = {};
        for (const item of listPanel.allColsTree) {
            if (item.group) {
                res[item.columnGroup.groupId] = item.expanded;
            }
        }
        return res;
    }

    function getSavedExpandedGroupIds(state: GridState): string[] {
        return (state.sideBar?.toolPanels?.columns as ColumnToolPanelState).expandedGroupIds;
    }

    test('collapsed custom layout group is restored from grid state', async () => {
        const gridApi = await createGrid('stateGrid');

        await waitFor(() => expect(getGroupExpandedStates(gridApi)).toEqual({ athleteDetails: true }));

        gridApi.getToolPanelInstance('columns')!.collapseColumnGroups(['athleteDetails']);
        expect(getGroupExpandedStates(gridApi)).toEqual({ athleteDetails: false });

        const state = gridApi.getState();
        expect(getSavedExpandedGroupIds(state)).toEqual([]);

        gridMgr.reset();

        const restoredApi = await createGrid('restoredGrid', state);

        expect(getGroupExpandedStates(restoredApi)).toEqual({ athleteDetails: false });
    });

    test('expanded custom layout group stays expanded when restored from grid state', async () => {
        const gridApi = await createGrid('stateGrid2');

        await waitFor(() => expect(getGroupExpandedStates(gridApi)).toEqual({ athleteDetails: true }));

        const state = gridApi.getState();
        expect(getSavedExpandedGroupIds(state)).toEqual(['athleteDetails']);

        gridMgr.reset();

        const restoredApi = await createGrid('restoredGrid2', state);

        expect(getGroupExpandedStates(restoredApi)).toEqual({ athleteDetails: true });
    });

    test('restored state survives a grid layout whose groups the custom layout does not have', async () => {
        // the panel first builds the grid's own group, which the saved state knows nothing about
        const groupedColumnDefs: ColGroupDef[] = [
            {
                headerName: 'Grid Group',
                groupId: 'gridGroup',
                children: columnDefs,
            },
        ];

        const gridApi = await createGrid('groupedGrid', undefined, groupedColumnDefs);

        await waitFor(() => expect(getGroupExpandedStates(gridApi)).toEqual({ athleteDetails: true }));

        gridApi.getToolPanelInstance('columns')!.collapseColumnGroups(['athleteDetails']);
        const state = gridApi.getState();
        expect(getSavedExpandedGroupIds(state)).toEqual([]);

        gridMgr.reset();

        const restoredApi = await createGrid('restoredGroupedGrid', state, groupedColumnDefs);

        expect(getGroupExpandedStates(restoredApi)).toEqual({ athleteDetails: false });
    });
});
