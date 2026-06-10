import type { AgColumn, ColDef, GridApi, IColumnStateUpdateStrategy } from 'ag-grid-community';
import { setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('deferred column tool panel with suppressSyncLayoutWithGrid', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        { athlete: 'Michael Phelps', age: 23, country: 'United States', sport: 'Swimming', gold: 8 },
        { athlete: 'Julian Weber', age: 24, country: 'Romania', sport: 'Gymnastics', gold: 2 },
    ];

    const baseColumnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'gold' },
    ];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    async function createGrid(
        params: { suppressSyncLayoutWithGrid?: boolean; columnDefs?: ColDef[]; aggFuncs?: Record<string, any> } = {}
    ): Promise<{
        gridApi: GridApi;
        toolPanel: any;
        toolPanelGui: HTMLElement;
    }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: params.columnDefs ?? baseColumnDefs,
            rowData,
            aggFuncs: params.aggFuncs,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            buttons: ['apply', 'cancel'] as const,
                            suppressSyncLayoutWithGrid: params.suppressSyncLayoutWithGrid ?? true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        return {
            gridApi,
            toolPanel,
            toolPanelGui: toolPanel.getGui(),
        };
    }

    function getUpdateStrategy(toolPanel: any): IColumnStateUpdateStrategy {
        return toolPanel.beans.columnStateUpdateStrategy;
    }

    function isDeferred(toolPanel: any): boolean {
        return !!toolPanel['isDeferModeEnabled'];
    }

    function getApplyButton(toolPanelGui: HTMLElement): HTMLButtonElement {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).find(
            (button) => button.textContent?.trim() === 'Apply'
        )!;
    }

    function getDisplayedPrimaryColumnOrder(toolPanel: any): string[] {
        return toolPanel.primaryColsPanel.primaryColsListPanel
            .getDisplayedColsList()
            .filter((item: any) => !item.group)
            .map((item: any) => item.column.getColId());
    }

    describe('column reordering', () => {
        test('blocks column reordering in CTP when suppressSyncLayoutWithGrid is true in deferred mode', async () => {
            const { toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });

            // No ToolPanel-type drag sources should be registered
            const dndService = toolPanel.beans.dragAndDrop;
            const toolPanelDragSources = (dndService as any).dragSourceAndParamsList
                .map((entry: any) => entry.dragSource)
                .filter((ds: any) => ds.type === 0); // DragSourceType.ToolPanel = 0
            expect(toolPanelDragSources).toHaveLength(0);

            // moveItemCallback should be a no-op (order unchanged after calling it)
            const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
            const virtualList = listPanel['virtualList'];
            const displayedColsList = listPanel.getDisplayedColsList() as any[];
            const firstItem = displayedColsList[0];

            expect(virtualList['moveItemCallback']).toBeDefined();
            virtualList['moveItemCallback'](firstItem, false);

            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);
        });
    });

    describe('resetColumnState after a tool-panel primary reorder', () => {
        test('restores the original colDef order, not the reordered primary list', async () => {
            const { gridApi, toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: false });
            const gold = gridApi.getColumn('gold')! as AgColumn;

            getUpdateStrategy(toolPanel).moveColumns(false, [gold], 0, 'toolPanelUi');
            await asyncSetTimeout(50);

            expect(gridApi.getColumnState().map((s) => s.colId)).toEqual([
                'gold',
                'athlete',
                'age',
                'country',
                'sport',
            ]);

            gridApi.resetColumnState();
            await asyncSetTimeout(50);

            expect(gridApi.getColumnState().map((s) => s.colId)).toEqual([
                'athlete',
                'age',
                'country',
                'sport',
                'gold',
            ]);
        });
    });

    describe('external change resets staged changes', () => {
        test('external sort change resets staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            // Stage a visibility change
            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External sort change
            gridApi.applyColumnState({ state: [{ colId: 'age', sort: 'asc' }] });
            await asyncSetTimeout(50);

            // Staged changes should be reset
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('external column visibility change resets staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const age = gridApi.getColumn('age')! as AgColumn;

            // Stage a sort change
            getUpdateStrategy(toolPanel).progressSortFromEvent(true, age, new MouseEvent('click'));
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External visibility change
            gridApi.setColumnsVisible(['gold'], false);
            await asyncSetTimeout(50);

            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('external column move does NOT reset staged changes when suppressSyncLayoutWithGrid is true', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            // Stage a visibility change
            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External column move
            gridApi.moveColumns(['gold'], 0);
            await asyncSetTimeout(50);

            // Staged changes should NOT be reset because suppressSyncLayoutWithGrid is true
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(true);
            expect(getApplyButton(toolPanelGui).disabled).toBe(false);
        });

        test('external column move DOES reset staged changes when suppressSyncLayoutWithGrid is false', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: false });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            // Stage a visibility change
            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External column move
            gridApi.moveColumns(['gold'], 0);
            await asyncSetTimeout(50);

            // Staged changes SHOULD be reset
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('external newColumnsLoaded resets staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // setColumnDefs triggers newColumnsLoaded
            gridApi.setGridOption('columnDefs', baseColumnDefs);
            await asyncSetTimeout(50);

            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('commit does not trigger external reset (isCommitting guard)', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: false });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            // Stage a visibility change
            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);
            expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);

            // Apply commits staged changes — this fires grid events, but should NOT reset
            getApplyButton(toolPanelGui).click();
            await asyncSetTimeout(50);

            // The change should have been applied
            expect(gridApi.getColumn('athlete')!.isVisible()).toBe(false);
            // Apply button should now be disabled (no pending changes)
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('pinning does not reset staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External pinning
            gridApi.setColumnsPinned(['age'], 'left');
            await asyncSetTimeout(50);

            // Staged changes should NOT be reset
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(true);
            expect(getApplyButton(toolPanelGui).disabled).toBe(false);
        });

        test('resizing does not reset staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External resize
            gridApi.setColumnWidths([{ key: 'age', newWidth: 200 }]);
            await asyncSetTimeout(50);

            // Staged changes should NOT be reset
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(true);
            expect(getApplyButton(toolPanelGui).disabled).toBe(false);
        });

        test('no reset if no pending changes', async () => {
            const { gridApi, toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const resetSpy = vi.spyOn(getUpdateStrategy(toolPanel), 'reset');

            // External sort change with no pending changes
            gridApi.applyColumnState({ state: [{ colId: 'age', sort: 'asc' }] });
            await asyncSetTimeout(50);

            // reset should not have been called since there were no pending changes
            expect(resetSpy).not.toHaveBeenCalled();
        });

        test('external aggFunc change resets staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({
                suppressSyncLayoutWithGrid: true,
                columnDefs: [
                    { field: 'athlete' },
                    { field: 'age', enableValue: true, aggFunc: 'sum' },
                    { field: 'country' },
                    { field: 'sport' },
                    { field: 'gold' },
                ],
            });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            // Stage a visibility change
            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External aggFunc change (value col IDs stay the same, only aggFunc changes)
            gridApi.applyColumnState({ state: [{ colId: 'age', aggFunc: 'max' }] });
            await asyncSetTimeout(50);

            // Staged changes should be reset because the grid state changed
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('no-op applyColumnState clears staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            const savedState = gridApi.getColumnState();

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            gridApi.applyColumnState({ state: savedState });
            await asyncSetTimeout(50);

            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('no-op resetColumnState clears staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            // Stage a visibility change
            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // Reset columns — no-op since staged changes haven't been applied
            gridApi.resetColumnState();
            await asyncSetTimeout(50);

            // Staged changes should be cleared
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });

        test('external aggFunc change with custom function resets staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({
                suppressSyncLayoutWithGrid: true,
                aggFuncs: {
                    customSum: (params: any) => params.values.reduce((a: number, b: number) => a + b, 0),
                    customMax: (params: any) => Math.max(...params.values),
                },
                columnDefs: [
                    { field: 'athlete' },
                    { field: 'age', enableValue: true, aggFunc: 'customSum' },
                    { field: 'country' },
                    { field: 'sport' },
                    { field: 'gold' },
                ],
            });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            // Stage a visibility change
            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External aggFunc change: swap one custom function for another
            gridApi.applyColumnState({ state: [{ colId: 'age', aggFunc: 'customMax' }] });
            await asyncSetTimeout(50);

            // Staged changes should be reset — the snapshot must detect function reference change
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
            expect(getApplyButton(toolPanelGui).disabled).toBe(true);
        });
    });

    describe('drag icon feedback', () => {
        function createColumnComp(toolPanel: any): any {
            const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
            const displayedColsList = listPanel.getDisplayedColsList() as any[];
            const firstColumnItem = displayedColsList.find((item: any) => !item.group);
            return listPanel['createComponentFromItem'](firstColumnItem, document.createElement('div'));
        }

        function getToolPanelDragSources(toolPanel: any): any[] {
            const dndService = toolPanel.beans.dragAndDrop;
            return (dndService as any).dragSourceAndParamsList
                .map((entry: any) => entry.dragSource)
                .filter((ds: any) => ds.type === 0); // DragSourceType.ToolPanel = 0
        }

        test('no drag sources registered when suppressSyncLayoutWithGrid is true in deferred mode', async () => {
            const { toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });

            const dragSources = getToolPanelDragSources(toolPanel);
            expect(dragSources).toHaveLength(0);
        });

        test('drag icon is notAllowed in deferred mode when suppressSyncLayoutWithGrid is false', async () => {
            const { toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: false });
            createColumnComp(toolPanel);

            const dragSources = getToolPanelDragSources(toolPanel);
            expect(dragSources.length).toBeGreaterThan(0);

            for (const ds of dragSources) {
                expect(ds.getDefaultIconName()).toBe('notAllowed');
            }
        });
    });

    describe('initial state and fallback', () => {
        test('initial render shows colDef order when suppressSyncLayoutWithGrid is true', async () => {
            const { toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });

            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);
        });
    });
});
