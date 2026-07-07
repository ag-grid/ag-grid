import type { MockInstance } from 'vitest';

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

    // Option 1 semantics: setColumnLayout owns the panel. A columnDefs reset that changes the set of
    // columns leaves the panel frozen (removed 'sport' stays, added 'gold' is not shown) and emits no
    // invalid colId warning, since the panel is not rebuilt from the grid.
    test('columnDefs reset that adds/removes columns leaves the custom layout frozen and warns nothing', async () => {
        const consoleWarnSpy: MockInstance = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            const { gridApi, toolPanel } = await createGrid();

            gridApi.getToolPanelInstance('columns')!.setColumnLayout(alphabeticalLayout);
            await asyncSetTimeout(50);

            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'country', 'sport']);

            consoleWarnSpy.mockClear();

            // drop 'sport', add 'gold'
            gridApi.setGridOption('columnDefs', [{ field: 'country' }, { field: 'athlete' }, { field: 'gold' }]);
            await asyncSetTimeout(50);

            // panel stays exactly as set: removed 'sport' remains, added 'gold' is not shown
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'country', 'sport']);

            expect(consoleWarnSpy).not.toHaveBeenCalled();
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    // Mirrors AG-16228 TC step 3b under Option 1: once setColumnLayout is called the panel is frozen -
    // a columnDefs reset that adds/removes columns must NOT alter the panel; it stays exactly as set until
    // the app calls setColumnLayout again. Removed 'sport' stays; added 'gold' does not appear.
    test('AG-16228 TC 3b (Option 1): columnDefs add/remove reset leaves the custom layout frozen', async () => {
        const fiveColDefs: ColDef[] = [
            { field: 'sport' },
            { field: 'year' },
            { field: 'country' },
            { field: 'age' },
            { field: 'athlete' },
        ];
        const customOrder: ColDef[] = [
            { field: 'age' },
            { field: 'athlete' },
            { field: 'country' },
            { field: 'sport' },
            { field: 'year' },
        ];

        const gridApi = await gridMgr.createGridAndWait('tcGrid', {
            columnDefs: fiveColDefs,
            rowData: [{ age: 23, athlete: 'A', country: 'US', sport: 'Swimming', year: 2004 }],
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
        await asyncSetTimeout(50);
        const toolPanel = gridApi.getToolPanelInstance('columns') as any;

        // step 2: custom order
        gridApi.getToolPanelInstance('columns')!.setColumnLayout(customOrder);
        await asyncSetTimeout(50);
        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['age', 'athlete', 'country', 'sport', 'year']);

        // step 3b: reset columnDefs removing 'sport', adding 'gold'
        gridApi.setGridOption('columnDefs', [
            { field: 'gold' },
            { field: 'year' },
            { field: 'country' },
            { field: 'age' },
            { field: 'athlete' },
        ]);
        await asyncSetTimeout(50);

        // Option 1: panel stays exactly as set in step 2
        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['age', 'athlete', 'country', 'sport', 'year']);
    });
});
