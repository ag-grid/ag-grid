import type { AgColumn, ColDef, GridApi, IColumnStateUpdateStrategy } from 'ag-grid-community';
import { setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { moveItem } from '../../../../packages/ag-grid-enterprise/src/columnToolPanel/columnMoveUtils';
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

    async function createGrid(params: { suppressSyncLayoutWithGrid?: boolean; columnDefs?: ColDef[] } = {}): Promise<{
        gridApi: GridApi;
        toolPanel: any;
        toolPanelGui: HTMLElement;
    }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: params.columnDefs ?? baseColumnDefs,
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

    function getCancelButton(toolPanelGui: HTMLElement): HTMLButtonElement {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).find(
            (button) => button.textContent?.trim() === 'Cancel'
        )!;
    }

    function getDisplayedPrimaryColumnOrder(toolPanel: any): string[] {
        return toolPanel.primaryColsPanel.primaryColsListPanel
            .getDisplayedColsList()
            .filter((item: any) => !item.group)
            .map((item: any) => item.column.getColId());
    }

    function getPrimaryColumnOrder(toolPanel: any): string[] {
        return toolPanel.beans.colModel.getColDefCols().map((col: any) => col.getColId());
    }

    async function dragColumnBefore(toolPanel: any, movingLabel: string, targetLabel: string): Promise<void> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const virtualList = listPanel['virtualList'];
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const movingItem = displayedColsList.find((item: any) => item.displayName === movingLabel);
        const targetIndex = displayedColsList.findIndex((item: any) => item.displayName === targetLabel);

        expect(movingItem).toBeTruthy();
        expect(targetIndex).toBeGreaterThanOrEqual(0);

        virtualList.ensureIndexVisible(targetIndex);
        await asyncSetTimeout(50);

        let component = virtualList.getComponentAt(targetIndex) as any;
        if (!component) {
            component = listPanel['createComponentFromItem'](
                displayedColsList[targetIndex],
                document.createElement('div')
            );
        }

        moveItem(
            toolPanel.beans,
            [movingItem.column as AgColumn],
            {
                rowIndex: targetIndex,
                position: 'top',
                component,
            },
            {
                buttons: ['apply', 'cancel'] as const,
            }
        );
        await asyncSetTimeout(50);
    }

    async function dragColumnToEnd(toolPanel: any, label: string): Promise<void> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const virtualList = listPanel['virtualList'];
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const lastIndex = displayedColsList.length - 1;
        const movingItem = displayedColsList.find((item: any) => item.displayName === label);

        expect(movingItem).toBeTruthy();

        virtualList.ensureIndexVisible(lastIndex);
        await asyncSetTimeout(50);

        let component = virtualList.getComponentAt(lastIndex) as any;
        if (!component) {
            component = listPanel['createComponentFromItem'](
                displayedColsList[lastIndex],
                document.createElement('div')
            );
        }

        moveItem(
            toolPanel.beans,
            [movingItem.column as AgColumn],
            {
                rowIndex: lastIndex,
                position: 'bottom',
                component,
            },
            {
                buttons: ['apply', 'cancel'] as const,
            }
        );
        await asyncSetTimeout(50);
    }

    describe('column reordering', () => {
        test('allows column reordering in CTP when suppressSyncLayoutWithGrid and deferred mode', async () => {
            const { toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });

            const initialOrder = getDisplayedPrimaryColumnOrder(toolPanel);
            expect(initialOrder).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);

            await dragColumnToEnd(toolPanel, 'Athlete');

            const newOrder = getDisplayedPrimaryColumnOrder(toolPanel);
            expect(newOrder).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);
        });

        test('shows deferred column order after drag and reverts on cancel', async () => {
            const { toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });

            await dragColumnToEnd(toolPanel, 'Athlete');

            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);

            // Grid column order is unchanged
            expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);

            getCancelButton(toolPanelGui).click();
            await asyncSetTimeout(50);

            // Reverts to colDef order
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);
        });

        test('applies deferred column order on commit', async () => {
            const { toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });

            await dragColumnToEnd(toolPanel, 'Athlete');

            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);

            getApplyButton(toolPanelGui).click();
            await asyncSetTimeout(50);

            // After apply, colDef order should be updated
            expect(getPrimaryColumnOrder(toolPanel)).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);
        });

        test('sequential drags use draft order not live order for target position', async () => {
            // Columns initial order: athlete, age, country, sport, gold
            const { toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });

            // Drag 1: move 'athlete' to end → draft: [age, country, sport, gold, athlete]
            await dragColumnToEnd(toolPanel, 'Athlete');
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);

            // Grid live order is still unchanged
            expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);

            // Drag 2: move 'age' before 'sport' in the draft order → draft: [country, sport, age, gold, athlete]
            // This drag uses the draft order for the target index calculation.
            // Previously (bug), it used the live order and placed 'age' in the wrong position.
            await dragColumnBefore(toolPanel, 'Age', 'Sport');
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['country', 'age', 'sport', 'gold', 'athlete']);
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
    });

    describe('initial state and fallback', () => {
        test('initial render shows colDef order when suppressSyncLayoutWithGrid is true', async () => {
            const { toolPanel } = await createGrid({ suppressSyncLayoutWithGrid: true });

            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);
        });

        test('after cancel, CTP reverts to colDef order', async () => {
            const { toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });

            await dragColumnToEnd(toolPanel, 'Athlete');
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);

            getCancelButton(toolPanelGui).click();
            await asyncSetTimeout(50);

            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'sport', 'gold']);
        });

        test('after apply, CTP shows colDef order matching applied state', async () => {
            const { toolPanel, toolPanelGui } = await createGrid({ suppressSyncLayoutWithGrid: true });

            await dragColumnToEnd(toolPanel, 'Athlete');

            getApplyButton(toolPanelGui).click();
            await asyncSetTimeout(50);

            // After apply, the colDef order was updated by commit, and the CTP shows it
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);
            expect(getPrimaryColumnOrder(toolPanel)).toEqual(['age', 'country', 'sport', 'gold', 'athlete']);
        });
    });
});
