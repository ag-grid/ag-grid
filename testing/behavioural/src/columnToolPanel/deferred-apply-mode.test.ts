import type { AgColumn, ColDef, GridApi, SideBarDef } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { moveItem } from '../../../../packages/ag-grid-enterprise/src/columnToolPanel/columnMoveUtils';
import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Columns Tool Panel Deferred Apply Mode', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const columnDefs: ColDef[] = [
        { field: 'athlete', enablePivot: true, enableRowGroup: true, enableValue: true },
        { field: 'age', enablePivot: true, enableRowGroup: true, enableValue: true },
        { field: 'country', enablePivot: true, enableRowGroup: true, enableValue: true },
    ];

    const rowData = [
        { athlete: 'Athlete A', age: 20, country: 'UK' },
        { athlete: 'Athlete B', age: 21, country: 'USA' },
    ];

    const sideBar: SideBarDef = {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columnsToolPanel',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                    deferApply: true,
                    buttons: ['apply', 'cancel'],
                },
            },
        ],
        defaultToolPanel: 'columns',
    };

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    const getButtons = (gridApi: GridApi): { applyButton: HTMLButtonElement; cancelButton: HTMLButtonElement } => {
        const gridDiv = getGridElement(gridApi)! as HTMLElement;
        const buttons = Array.from(gridDiv.querySelectorAll('button.ag-column-panel-buttons-button'));
        const applyButton = buttons.find((button) => button.classList.contains('ag-column-panel-buttons-apply-button'));
        const cancelButton = buttons.find(
            (button) => !button.classList.contains('ag-column-panel-buttons-apply-button')
        );

        if (!applyButton || !cancelButton) {
            throw new Error('Expected Apply and Cancel buttons to be rendered in the column tool panel');
        }

        return { applyButton: applyButton as HTMLButtonElement, cancelButton: cancelButton as HTMLButtonElement };
    };

    const togglePivotModeFromToolPanel = (gridApi: GridApi): void => {
        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        const pivotModePanel = toolPanel?.pivotModePanel as any;
        const toggle = pivotModePanel?.cbPivotMode as any;
        toggle?.toggle();
    };

    const getToolPanel = (gridApi: GridApi): any => gridApi.getToolPanelInstance('columns') as any;

    const setDeferredVisibilityFromToolPanel = (gridApi: GridApi, colId: string, visible: boolean): void => {
        const toolPanel = getToolPanel(gridApi);
        toolPanel.onDeferredVisibilityColumnStateUpdate([{ colId, hide: !visible }]);
    };

    const stageComboChangesFromToolPanel = (gridApi: GridApi): void => {
        const toolPanel = getToolPanel(gridApi);
        const countryCol = gridApi.getColumn('country');
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!countryCol || !athleteCol || !ageCol) {
            throw new Error('Expected country, athlete and age columns to exist');
        }
        togglePivotModeFromToolPanel(gridApi);
        toolPanel.onDeferredRowGroupColumnsUpdate([countryCol]);
        toolPanel.onDeferredPivotColumnsUpdate([athleteCol]);
        toolPanel.onDeferredValueColumnsUpdate([ageCol]);
        toolPanel.onDeferredValueColumnAggFuncUpdate(ageCol, 'sum');
        setDeferredVisibilityFromToolPanel(gridApi, 'athlete', false);
    };

    test('does not apply pivot mode until Apply is clicked', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const { applyButton } = getButtons(gridApi);
        expect(applyButton.disabled).toBe(true);

        togglePivotModeFromToolPanel(gridApi);
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(applyButton.disabled).toBe(false);

        applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(applyButton.disabled).toBe(true);
    });

    test('discards deferred pivot mode change when Cancel is clicked', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const { applyButton, cancelButton } = getButtons(gridApi);
        expect(applyButton.disabled).toBe(true);

        togglePivotModeFromToolPanel(gridApi);
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(applyButton.disabled).toBe(false);

        cancelButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('does not apply column visibility change until Apply is clicked', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const { applyButton } = getButtons(gridApi);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(applyButton.disabled).toBe(true);

        setDeferredVisibilityFromToolPanel(gridApi, 'athlete', false);
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(false);
        expect(applyButton.disabled).toBe(true);
    });

    test('discards deferred column visibility change when Cancel is clicked', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const { applyButton, cancelButton } = getButtons(gridApi);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(applyButton.disabled).toBe(true);

        setDeferredVisibilityFromToolPanel(gridApi, 'athlete', false);
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        cancelButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('select all checkbox controls checkbox state and stages changes in deferred mode', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const toolPanel = getToolPanel(gridApi);
        const primaryColsPanel = toolPanel.primaryColsPanel as any;
        const primaryColsListPanel = primaryColsPanel.primaryColsListPanel as any;
        const primaryColsHeaderPanel = primaryColsPanel.primaryColsHeaderPanel as any;

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(gridApi.getColumn('age')!.isVisible()).toBe(true);
        expect(gridApi.getColumn('country')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        primaryColsListPanel.doSetSelectedAll(false);
        await asyncSetTimeout(1);

        // Header and child checkbox state are updated...
        expect(primaryColsHeaderPanel.eSelect.getValue()).toBe(false);
        // ...but applied grid visibility is unchanged until an explicit deferred action is staged and applied.
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(gridApi.getColumn('age')!.isVisible()).toBe(true);
        expect(gridApi.getColumn('country')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);
    });

    test('default checkbox state follows current grid visibility state', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', enablePivot: true, enableRowGroup: true, enableValue: true },
                { field: 'age', hide: true, enablePivot: true, enableRowGroup: true, enableValue: true },
                { field: 'country', enablePivot: true, enableRowGroup: true, enableValue: true },
            ],
            rowData,
            sideBar,
            pivotMode: false,
        });

        const toolPanel = getToolPanel(gridApi);
        const isCheckedInToolPanel = toolPanel.isColumnCheckedInToolPanel.bind(toolPanel) as (
            column: any,
            pivotMode: boolean
        ) => boolean;

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(gridApi.getColumn('age')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('country')!.isVisible()).toBe(true);

        expect(isCheckedInToolPanel(gridApi.getColumn('athlete'), false)).toBe(true);
        expect(isCheckedInToolPanel(gridApi.getColumn('age'), false)).toBe(false);
        expect(isCheckedInToolPanel(gridApi.getColumn('country'), false)).toBe(true);
    });

    test('clicking select all checks all column checkboxes in deferred mode', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const toolPanel = getToolPanel(gridApi);
        const primaryColsPanel = toolPanel.primaryColsPanel as any;
        const primaryColsListPanel = primaryColsPanel.primaryColsListPanel as any;
        const primaryColsHeaderPanel = primaryColsPanel.primaryColsHeaderPanel as any;

        const getRenderedSelectionStates = (): boolean[] => {
            const states: boolean[] = [];
            primaryColsListPanel.virtualList.forEachRenderedRow((comp: any) => {
                if (!comp.modelItem?.group) {
                    states.push(!!comp.isSelected());
                }
            });
            return states;
        };

        primaryColsListPanel.doSetSelectedAll(false);
        await asyncSetTimeout(1);

        expect(getRenderedSelectionStates().every((selected) => !selected)).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        primaryColsHeaderPanel.eSelect.getInputElement().click();
        await asyncSetTimeout(1);

        expect(getRenderedSelectionStates().every((selected) => selected)).toBe(true);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(gridApi.getColumn('age')!.isVisible()).toBe(true);
        expect(gridApi.getColumn('country')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('does not apply value aggregation function change until Apply is clicked', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const { applyButton } = getButtons(gridApi);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(applyButton.disabled).toBe(true);

        const toolPanel = getToolPanel(gridApi);
        toolPanel.onDeferredValueColumnAggFuncUpdate(gridApi.getColumn('age'), 'sum');
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(applyButton.disabled).toBe(false);

        applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['age']);
        expect(gridApi.getColumn('age')!.getAggFunc()).toBe('sum');
        expect(applyButton.disabled).toBe(true);
    });

    test('discards deferred value aggregation function change when Cancel is clicked', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const { applyButton, cancelButton } = getButtons(gridApi);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(applyButton.disabled).toBe(true);

        const toolPanel = getToolPanel(gridApi);
        toolPanel.onDeferredValueColumnAggFuncUpdate(gridApi.getColumn('age'), 'sum');
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(applyButton.disabled).toBe(false);

        cancelButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('does not apply row group column reorder until Apply is clicked', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        gridApi.setRowGroupColumns(['athlete', 'age']);
        await asyncSetTimeout(1);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['athlete', 'age']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        const toolPanel = getToolPanel(gridApi);
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!athleteCol || !ageCol) {
            throw new Error('Expected athlete and age columns to exist');
        }

        toolPanel.onDeferredRowGroupColumnsUpdate([ageCol, athleteCol]);
        await asyncSetTimeout(1);

        // Reorder is staged only while deferred mode is dirty.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['athlete', 'age']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['age', 'athlete']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('column move order applies synchronously and is preserved after Apply', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const getColumnOrder = () =>
            gridApi
                .getAllDisplayedColumns()
                .slice(0, 3)
                .map((col) => col.getColId());
        expect(getColumnOrder()).toEqual(['athlete', 'age', 'country']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        const toolPanel = getToolPanel(gridApi);
        const primaryColsPanel = toolPanel.primaryColsPanel as any;
        const primaryColsListPanel = primaryColsPanel.primaryColsListPanel as any;
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!athleteCol || !ageCol) {
            throw new Error('Expected athlete and age columns to exist');
        }

        // Move athlete below age through the same move utility used by the CTP.
        moveItem(primaryColsListPanel.beans, [athleteCol as AgColumn], {
            component: { column: ageCol } as any,
            position: 'bottom',
            rowIndex: 1,
        });
        await asyncSetTimeout(1);

        // Reordering is synchronous: order changes immediately and does not create pending changes.
        expect(getColumnOrder()).toEqual(['age', 'athlete', 'country']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(getColumnOrder()).toEqual(['age', 'athlete', 'country']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('applies combined deferred pivot, visibility and aggregation changes together', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual([]);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual([]);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        stageComboChangesFromToolPanel(gridApi);
        await asyncSetTimeout(1);

        // Staged only, nothing applied yet
        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual([]);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual([]);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(false);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country']);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['athlete']);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['age']);
        expect(gridApi.getColumn('age')!.getAggFunc()).toBe('sum');
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('cancels combined deferred pivot, visibility and aggregation changes together', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        stageComboChangesFromToolPanel(gridApi);
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        getButtons(gridApi).cancelButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual([]);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual([]);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });
});
