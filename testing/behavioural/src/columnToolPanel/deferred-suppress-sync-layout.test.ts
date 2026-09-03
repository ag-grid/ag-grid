import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';

import type { AgColumn, ColDef, GridApi, IColumnStateUpdateStrategy } from 'ag-grid-community';
import { getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

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

        const expectedColCount = (params.columnDefs ?? baseColumnDefs).length;
        const toolPanel = await waitFor(() => {
            const panel = gridApi.getToolPanelInstance('columns') as any;
            expect(getDisplayedPrimaryColumnOrder(panel)).toHaveLength(expectedColCount);
            return panel;
        });

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

            await waitFor(() =>
                expect(gridApi.getColumnState().map((s) => s.colId)).toEqual([
                    'gold',
                    'athlete',
                    'age',
                    'country',
                    'sport',
                ])
            );

            gridApi.resetColumnState();

            await waitFor(() =>
                expect(gridApi.getColumnState().map((s) => s.colId)).toEqual([
                    'athlete',
                    'age',
                    'country',
                    'sport',
                    'gold',
                ])
            );
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

            // Staged changes should be reset
            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
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

            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
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

            // Wait for the move to land, then assert nothing was reset
            await waitFor(() => expect(gridApi.getColumnState().map((s) => s.colId)[0]).toBe('gold'));

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

            // Staged changes SHOULD be reset
            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
        });

        test('external newColumnsLoaded resets staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // setColumnDefs triggers newColumnsLoaded
            gridApi.setGridOption('columnDefs', baseColumnDefs);

            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
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

            await waitFor(() => {
                // The change should have been applied
                expect(gridApi.getColumn('athlete')!.isVisible()).toBe(false);
                // Apply button should now be disabled (no pending changes)
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
        });

        test('pinning does not reset staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            // External pinning
            gridApi.setColumnsPinned(['age'], 'left');

            // Wait for the pin to land, then assert nothing was reset
            await waitFor(() => expect(gridApi.getColumn('age')!.getPinned()).toBe('left'));

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

            // External resize — applied synchronously, so any reset would already have run
            gridApi.setColumnWidths([{ key: 'age', newWidth: 200 }]);

            // Staged changes should NOT be reset
            expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(true);
            expect(getApplyButton(toolPanelGui).disabled).toBe(false);
        });

        test('no reset if no pending changes', async () => {
            const { gridApi, toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const resetSpy = vi.spyOn(getUpdateStrategy(toolPanel), 'reset');

            // External sort change with no pending changes
            gridApi.applyColumnState({ state: [{ colId: 'age', sort: 'asc' }] });

            // Wait for the sort to land, then assert no reset happened
            await waitFor(() => expect(gridApi.getColumn('age')!.getSort()).toBe('asc'));

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

            // Staged changes should be reset because the grid state changed
            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
        });

        test('no-op applyColumnState clears staged changes', async () => {
            const { gridApi, toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });
            const athlete = gridApi.getColumn('athlete')! as AgColumn;

            const savedState = gridApi.getColumnState();

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            toolPanel.refreshDeferredUi();

            expect(getApplyButton(toolPanelGui).disabled).toBe(false);

            gridApi.applyColumnState({ state: savedState });

            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
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

            // Staged changes should be cleared
            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
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

            // Staged changes should be reset — the snapshot must detect function reference change
            await waitFor(() => {
                expect(getUpdateStrategy(toolPanel).hasPendingChanges(isDeferred(toolPanel))).toBe(false);
                expect(getApplyButton(toolPanelGui).disabled).toBe(true);
            });
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

    // A commit runs its role-column ops inside one beginColBatch/endColBatch. endColBatch flushes without the
    // `change` kind, so the batch must still animate a reorder and skip the legacy event for a lone reorder.
    describe('committing a batched role-column change', () => {
        const createGroupedGrid = async (columnDefs: ColDef[]) => {
            const gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData: [
                    { country: 'US', sport: 'Swimming', athlete: 'Phelps' },
                    { country: 'US', sport: 'Gymnastics', athlete: 'Biles' },
                    { country: 'RO', sport: 'Gymnastics', athlete: 'Weber' },
                ],
                groupDisplayType: 'multipleColumns',
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            const toolPanel = await waitFor(() => {
                const panel = gridApi.getToolPanelInstance('columns');
                expect(panel).toBeTruthy();
                return panel;
            });
            // let any column animation started during init clear before the tests observe it
            await nextAnimationFrame();
            return { gridApi, strategy: getUpdateStrategy(toolPanel) };
        };

        test('a lone reorder skips columnEverythingChanged and animates the reflow', async () => {
            const { gridApi, strategy } = await createGroupedGrid([
                { colId: 'country', field: 'country', rowGroup: true },
                { colId: 'sport', field: 'sport', rowGroup: true },
                { colId: 'athlete', field: 'athlete' },
            ]);
            const gridEl = getGridElement(gridApi)! as HTMLElement;
            expect(gridEl.querySelector('.ag-column-moving')).toBeNull();

            const country = gridApi.getColumn('country')! as AgColumn;
            const sport = gridApi.getColumn('sport')! as AgColumn;
            const everything: any[] = [];
            gridApi.addEventListener('columnEverythingChanged', (e) => everything.push(e));

            strategy.setRowGroupColumns(true, [sport, country], 'toolPanelUi');
            strategy.commit(true);

            // colAnimation tags the body synchronously (the class is only removed a frame later).
            expect(gridEl.querySelector('.ag-column-moving')).not.toBeNull();
            await asyncSetTimeout(0);
            expect(everything.length).toBe(0);
            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'country']);
            await new GridColumns(gridApi, 'batched reorder').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-sport "Sport" width:200
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── country "Country" width:200 rowGroup
                ├── sport "Sport" width:200 rowGroup
                └── athlete "Athlete" width:200
            `);
            await new GridRows(gridApi, 'batched reorder').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-sport:null ag-Grid-AutoColumn-country:null
                ├─┬ filler collapsed id:row-group-sport-Swimming ag-Grid-AutoColumn-sport:"Swimming" ag-Grid-AutoColumn-country:null
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-sport-Swimming-country-US ag-Grid-AutoColumn-country:"US"
                │ · └── LEAF hidden id:0 country:"US" sport:"Swimming" athlete:"Phelps"
                └─┬ filler collapsed id:row-group-sport-Gymnastics ag-Grid-AutoColumn-sport:"Gymnastics" ag-Grid-AutoColumn-country:null
                · ├─┬ LEAF_GROUP collapsed hidden id:row-group-sport-Gymnastics-country-US ag-Grid-AutoColumn-country:"US"
                · │ └── LEAF hidden id:1 country:"US" sport:"Gymnastics" athlete:"Biles"
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-sport-Gymnastics-country-RO ag-Grid-AutoColumn-country:"RO"
                · · └── LEAF hidden id:2 country:"RO" sport:"Gymnastics" athlete:"Weber"
            `);
        });

        test('adding a row group still raises columnEverythingChanged', async () => {
            const { gridApi, strategy } = await createGroupedGrid([
                { colId: 'country', field: 'country', rowGroup: true },
                { colId: 'sport', field: 'sport' },
                { colId: 'athlete', field: 'athlete' },
            ]);
            const country = gridApi.getColumn('country')! as AgColumn;
            const sport = gridApi.getColumn('sport')! as AgColumn;
            const everything: any[] = [];
            gridApi.addEventListener('columnEverythingChanged', (e) => everything.push(e));

            strategy.setRowGroupColumns(true, [country, sport], 'toolPanelUi');
            strategy.commit(true);

            await asyncSetTimeout(0);
            expect(everything.length).toBe(1);
            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
            await new GridColumns(gridApi, 'batched add').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── ag-Grid-AutoColumn-sport "Sport" width:200
                ├── country "Country" width:200 rowGroup
                └── athlete "Athlete" width:200
            `);
            await new GridRows(gridApi, 'batched add').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-sport:null
                ├─┬ filler collapsed id:row-group-country-US ag-Grid-AutoColumn-country:"US" ag-Grid-AutoColumn-sport:null
                │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-US-sport-Swimming ag-Grid-AutoColumn-sport:"Swimming"
                │ │ └── LEAF hidden id:0 country:"US" sport:"Swimming" athlete:"Phelps"
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-US-sport-Gymnastics ag-Grid-AutoColumn-sport:"Gymnastics"
                │ · └── LEAF hidden id:1 country:"US" sport:"Gymnastics" athlete:"Biles"
                └─┬ filler collapsed id:row-group-country-RO ag-Grid-AutoColumn-country:"RO" ag-Grid-AutoColumn-sport:null
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-RO-sport-Gymnastics ag-Grid-AutoColumn-sport:"Gymnastics"
                · · └── LEAF hidden id:2 country:"RO" sport:"Gymnastics" athlete:"Weber"
            `);
        });
    });
});
