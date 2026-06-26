import type { ColDef, GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('column tool panel custom layout preservation', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        { athlete: 'Michael Phelps', country: 'United States', sport: 'Swimming' },
        { athlete: 'Julian Weber', country: 'Romania', sport: 'Gymnastics' },
    ];

    // grid receives an "unsorted" order
    const baseColumnDefs: ColDef[] = [{ field: 'country' }, { field: 'athlete' }, { field: 'sport' }];

    // custom tool panel layout, alphabetical and independent of grid order
    const alphabeticalLayout: ColDef[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

    afterEach(() => {
        gridMgr.reset();
    });

    async function createGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: baseColumnDefs,
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            suppressSyncLayoutWithGrid: true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        return { gridApi, toolPanel };
    }

    function getDisplayedPrimaryColumnOrder(toolPanel: any): string[] {
        return toolPanel.primaryColsPanel.primaryColsListPanel
            .getDisplayedColsList()
            .filter((item: any) => !item.group)
            .map((item: any) => item.column.getColId());
    }

    test('custom layout is preserved when columnDefs are programmatically reset', async () => {
        const { gridApi, toolPanel } = await createGrid();

        gridApi.getToolPanelInstance('columns')!.setColumnLayout(alphabeticalLayout);
        await asyncSetTimeout(50);

        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'country', 'sport']);

        // reset columnDefs to a different order
        gridApi.setGridOption('columnDefs', [{ field: 'sport' }, { field: 'athlete' }, { field: 'country' }]);
        await asyncSetTimeout(50);

        // panel retains the custom alphabetical layout, not the new grid order
        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'country', 'sport']);
    });

    test('without a custom layout, columnDefs reset adopts the new colDef order', async () => {
        const { gridApi, toolPanel } = await createGrid();

        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['country', 'athlete', 'sport']);

        gridApi.setGridOption('columnDefs', [{ field: 'sport' }, { field: 'athlete' }, { field: 'country' }]);
        await asyncSetTimeout(50);

        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['sport', 'athlete', 'country']);
    });
});
