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

    const createFirstLeafComp = (primaryColsListPanel: any): any => {
        const firstLeafItem = primaryColsListPanel.getDisplayedColsList().find((item: any) => !item.group);
        if (!firstLeafItem) {
            throw new Error('Expected a leaf column item in the primary columns list');
        }

        return primaryColsListPanel.createComponentFromItem(firstLeafItem, document.createElement('div'));
    };

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
        const gridApi = gridMgr.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });
        await asyncSetTimeout(1);

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

    test('shares deferred callbacks through tool panel params across list and leaf components', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const toolPanel = getToolPanel(gridApi);
        const primaryColsPanel = toolPanel.primaryColsPanel as any;
        const primaryColsListPanel = primaryColsPanel.primaryColsListPanel as any;
        const toolPanelParams = toolPanel.params as any;
        const listParams = primaryColsListPanel.params as any;

        const firstLeafComp = createFirstLeafComp(primaryColsListPanel);

        const leafParams = firstLeafComp.params as any;
        const deferredVisibilityUpdate = toolPanelParams.onDeferredVisibilityColumnStateUpdate;

        expect(typeof deferredVisibilityUpdate).toBe('function');
        expect(listParams).toBe(toolPanelParams);
        expect(leafParams).toBe(toolPanelParams);
        expect(listParams.onDeferredVisibilityColumnStateUpdate).toBe(deferredVisibilityUpdate);
        expect(leafParams.onDeferredVisibilityColumnStateUpdate).toBe(deferredVisibilityUpdate);

        deferredVisibilityUpdate([{ colId: 'athlete', hide: true }]);
        await asyncSetTimeout(1);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        leafParams.onDeferredVisibilityColumnStateUpdate([{ colId: 'athlete', hide: false }]);
        await asyncSetTimeout(1);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
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

    test('applies deferred value column reorder in the same order as staged', async () => {
        const gridApi = gridMgr.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: true,
        });
        await asyncSetTimeout(1);

        gridApi.setValueColumns(['athlete', 'age']);
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['athlete', 'age']);
        expect(gridApi.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['athlete', 'age']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        const toolPanel = getToolPanel(gridApi);
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!athleteCol || !ageCol) {
            throw new Error('Expected athlete and age columns to exist');
        }

        toolPanel.onDeferredValueColumnsUpdate([ageCol, athleteCol]);
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['athlete', 'age']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['age', 'athlete']);
        expect(gridApi.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['age', 'athlete']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('preserves external value agg func updates while deferred value reorder is pending', async () => {
        const gridApi = gridMgr.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: true,
        });
        await asyncSetTimeout(1);

        gridApi.setValueColumns(['athlete', 'age']);
        await asyncSetTimeout(1);

        const toolPanel = getToolPanel(gridApi);
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!athleteCol || !ageCol) {
            throw new Error('Expected athlete and age columns to exist');
        }

        // Stage reorder only (no staged agg-func change).
        toolPanel.onDeferredValueColumnsUpdate([ageCol, athleteCol]);
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        // External change outside CTP while pending is dirty.
        gridApi.applyColumnState({
            state: [{ colId: 'athlete', aggFunc: 'max' }],
        });
        await asyncSetTimeout(1);
        expect(gridApi.getColumn('athlete')!.getAggFunc()).toBe('max');

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['age', 'athlete']);
        expect(gridApi.getColumn('athlete')!.getAggFunc()).toBe('max');
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('preserves external row group updates when only pivot mode is staged', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        togglePivotModeFromToolPanel(gridApi);
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        // External update in untouched dimension while deferred state is dirty.
        gridApi.setRowGroupColumns(['country']);
        await asyncSetTimeout(1);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country']);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('preserves external visibility updates on untouched columns', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        // Stage a visibility change for athlete only.
        setDeferredVisibilityFromToolPanel(gridApi, 'athlete', false);
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        // External visibility update for a different column.
        gridApi.applyColumnState({
            state: [{ colId: 'country', hide: true }],
        });
        await asyncSetTimeout(1);
        expect(gridApi.getColumn('country')!.isVisible()).toBe(false);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('country')!.isVisible()).toBe(false);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('preserves external reorder for untouched row-group columns during deferred rebase', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        // Start with two grouped columns.
        gridApi.setRowGroupColumns(['athlete', 'age']);
        await asyncSetTimeout(1);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['athlete', 'age']);

        const toolPanel = getToolPanel(gridApi);
        const countryCol = gridApi.getColumn('country');
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!countryCol || !athleteCol || !ageCol) {
            throw new Error('Expected country, athlete and age columns to exist');
        }

        // Stage inserting a new row-group column at the front.
        toolPanel.onDeferredRowGroupColumnsUpdate([countryCol, athleteCol, ageCol]);
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        // External update reorders the existing grouped columns while deferred state is dirty.
        gridApi.setRowGroupColumns(['age', 'athlete']);
        await asyncSetTimeout(1);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['age', 'athlete']);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        // Expected: staged insertion is preserved, untouched existing order follows external update.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'age', 'athlete']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('preserves external value membership/order updates when only value agg is staged', async () => {
        const gridApi = gridMgr.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: true,
        });
        await asyncSetTimeout(1);

        gridApi.setValueColumns(['athlete', 'age']);
        await asyncSetTimeout(1);

        const toolPanel = getToolPanel(gridApi);
        const ageCol = gridApi.getColumn('age');
        if (!ageCol) {
            throw new Error('Expected age column to exist');
        }

        // Stage agg update only, no staged value order/membership changes.
        toolPanel.onDeferredValueColumnAggFuncUpdate(ageCol, 'avg');
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        // External update changes membership/order in untouched dimension.
        gridApi.setValueColumns(['country', 'age']);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['country', 'age']);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['country', 'age']);
        expect(gridApi.getColumn('age')!.getAggFunc()).toBe('avg');
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('preserves external reorder for untouched value columns during deferred rebase', async () => {
        const gridApi = gridMgr.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: true,
        });
        await asyncSetTimeout(1);

        // Start with three value columns so staged change is order-only (no membership add/remove).
        gridApi.setValueColumns(['athlete', 'age', 'country']);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['athlete', 'age', 'country']);

        const toolPanel = getToolPanel(gridApi);
        const countryCol = gridApi.getColumn('country');
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!countryCol || !athleteCol || !ageCol) {
            throw new Error('Expected country, athlete and age columns to exist');
        }

        // Stage moving country to the front.
        toolPanel.onDeferredValueColumnsUpdate([countryCol, athleteCol, ageCol]);
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        // External update reorders existing value columns while deferred state is dirty.
        gridApi.setValueColumns(['age', 'athlete', 'country']);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['age', 'athlete', 'country']);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        // Expected: staged move is preserved, untouched existing order follows external update.
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['country', 'age', 'athlete']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('preserves latest external reorder for untouched value columns across repeated external updates', async () => {
        const gridApi = gridMgr.createGrid('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: true,
        });
        await asyncSetTimeout(1);

        gridApi.setValueColumns(['athlete', 'age', 'country']);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['athlete', 'age', 'country']);

        const toolPanel = getToolPanel(gridApi);
        const countryCol = gridApi.getColumn('country');
        const athleteCol = gridApi.getColumn('athlete');
        const ageCol = gridApi.getColumn('age');
        if (!countryCol || !athleteCol || !ageCol) {
            throw new Error('Expected country, athlete and age columns to exist');
        }

        // Stage moving country to the front.
        toolPanel.onDeferredValueColumnsUpdate([countryCol, athleteCol, ageCol]);
        await asyncSetTimeout(1);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        // Repeated external reorders of untouched value columns while deferred state is dirty.
        gridApi.setValueColumns(['age', 'athlete', 'country']);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['age', 'athlete', 'country']);

        gridApi.setValueColumns(['athlete', 'age', 'country']);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['athlete', 'age', 'country']);

        gridApi.setValueColumns(['age', 'athlete', 'country']);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['age', 'athlete', 'country']);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        // Expected: staged move is preserved, untouched existing order follows latest external update.
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['country', 'age', 'athlete']);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);
    });

    test('removing deferred value column does not mutate grid until Apply', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        const toolPanel = getToolPanel(gridApi);
        const athleteCol = gridApi.getColumn('athlete');
        if (!athleteCol) {
            throw new Error('Expected athlete column to exist');
        }

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        toolPanel.onDeferredValueColumnsUpdate([athleteCol]);
        await asyncSetTimeout(1);
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        toolPanel.onDeferredValueColumnsUpdate([]);
        await asyncSetTimeout(1);

        // Removing the staged value column reverts pending state back to applied state.
        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual([]);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        getButtons(gridApi).applyButton.click();
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

    test('applies deferred visibility changes when pivot mode is toggled on', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: false,
        });

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(true);

        const toolPanel = getToolPanel(gridApi);
        togglePivotModeFromToolPanel(gridApi);
        setDeferredVisibilityFromToolPanel(gridApi, 'athlete', false);
        await asyncSetTimeout(1);

        // Staged only, applied grid state unchanged before Apply.
        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(true);
        expect(getButtons(gridApi).applyButton.disabled).toBe(false);

        getButtons(gridApi).applyButton.click();
        await asyncSetTimeout(1);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getColumn('athlete')!.isVisible()).toBe(false);
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
