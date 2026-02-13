import type { ColDef, GridApi, SideBarDef } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

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
        const cancelButton = buttons.find((button) => !button.classList.contains('ag-column-panel-buttons-apply-button'));

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

    const setColumnSelectionFromToolPanel = (gridApi: GridApi, colId: string, selected: boolean): void => {
        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        const listPanel = toolPanel?.primaryColsPanel?.primaryColsListPanel as any;
        const displayedColsList = listPanel?.getDisplayedColsList?.() as any[] | undefined;
        const rowIndex = displayedColsList?.findIndex((item) => !item.group && item.column?.getColId?.() === colId);
        const listItemComp = rowIndex != null && rowIndex >= 0 ? listPanel?.virtualList?.getComponentAt(rowIndex) : null;
        listItemComp?.onSelectAllChanged?.(selected);
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
        expect(applyButton.disabled).toBe(true);
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

        setColumnSelectionFromToolPanel(gridApi, 'athlete', false);
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(applyButton.disabled).toBe(false);

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

        setColumnSelectionFromToolPanel(gridApi, 'athlete', false);
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(applyButton.disabled).toBe(false);

        cancelButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(applyButton.disabled).toBe(true);
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
        expect(applyButton.disabled).toBe(true);
    });
});
