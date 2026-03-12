import { fireEvent, getByTestId, getByText } from '@testing-library/dom';
import type { ColDef, GridApi } from 'ag-grid-community';
import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import {
    createFakeServer,
    createServerSideDatasource,
} from '../../../../documentation/ag-grid-docs/src/content/docs/tool-panel-columns/_examples/deferred-apply-mode/fakeServer';
import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

describe('deferred column tool panel pivot mode', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        {
            athlete: 'Michael Phelps',
            age: 23,
            country: 'United States',
            year: 2008,
            date: '24/08/2008',
            sport: 'Swimming',
            gold: 8,
            silver: 0,
            bronze: 0,
            total: 8,
        },
        {
            athlete: 'Michael Phelps',
            age: 19,
            country: 'United States',
            year: 2004,
            date: '29/08/2004',
            sport: 'Swimming',
            gold: 6,
            silver: 0,
            bronze: 2,
            total: 8,
        },
        {
            athlete: 'Julian Weber',
            age: 24,
            country: 'Romania',
            year: 2000,
            date: '01/10/2000',
            sport: 'Gymnastics',
            gold: 2,
            silver: 1,
            bronze: 3,
            total: 6,
        },
    ];

    const baseColumnDefs: ColDef[] = [
        { field: 'athlete', minWidth: 200, enableRowGroup: true, enablePivot: true },
        { field: 'age', enableValue: true },
        { field: 'country', minWidth: 200, enableRowGroup: true, enablePivot: true, rowGroupIndex: 1 },
        { field: 'year', enableRowGroup: true, enablePivot: true, pivotIndex: 1 },
        { field: 'date', minWidth: 180, enableRowGroup: true, enablePivot: true },
        { field: 'sport', minWidth: 200, enableRowGroup: true, enablePivot: true, rowGroupIndex: 2 },
        { field: 'gold', hide: true, enableValue: true },
        { field: 'silver', hide: true, enableValue: true, aggFunc: 'sum' },
        { field: 'bronze', hide: true, enableValue: true, aggFunc: 'sum' },
        { headerName: 'Total', field: 'total', enableValue: true },
    ];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    async function createDeferredPivotModeGrid(): Promise<{
        gridApi: GridApi;
        toolPanelGui: HTMLElement;
        serverGetDataSpy: ReturnType<typeof vi.spyOn>;
    }> {
        const fakeServer = createFakeServer(rowData as any);
        const serverGetDataSpy = vi.spyOn(fakeServer, 'getData');
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { deferApply: true },
                    },
                ],
                defaultToolPanel: 'columns',
            },
            serverSideDatasource: createServerSideDatasource(fakeServer),
        });

        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanelGui: (gridApi.getToolPanelInstance('columns') as any).getGui(),
            serverGetDataSpy,
        };
    }

    async function createDeferredNonPivotGrid(columnDefs: ColDef[] = baseColumnDefs): Promise<{
        gridApi: GridApi;
        toolPanelGui: HTMLElement;
    }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { deferApply: true },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanelGui: (gridApi.getToolPanelInstance('columns') as any).getGui(),
        };
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

    function getDeferModeToggle(toolPanelGui: HTMLElement): HTMLInputElement {
        return toolPanelGui.querySelector('.ag-column-panel-defer-mode-toggle input[type="checkbox"]')!;
    }

    function getPivotModeToggle(toolPanelGui: HTMLElement): HTMLInputElement {
        return getByTestId(toolPanelGui, agTestIdFor.pivotModeSelect()) as HTMLInputElement;
    }

    function getSelectAllCheckbox(toolPanelGui: HTMLElement): HTMLInputElement {
        return getByTestId(toolPanelGui, agTestIdFor.columnPanelSelectHeaderCheckbox()) as HTMLInputElement;
    }

    function removeDropZonePill(toolPanelGui: HTMLElement, label: string): void {
        const pill = Array.from(toolPanelGui.querySelectorAll<HTMLElement>('[aria-label]')).find((element) =>
            element.getAttribute('aria-label')?.startsWith(label)
        );
        expect(pill).toBeTruthy();
        fireEvent.keyDown(pill!, { key: 'Delete' });
    }

    test('turning pivot mode off and applying should remove year header group text and update the grid option', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(gridApi.getGridOption('pivotMode')).toBe(true);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getGridOption('pivotMode')).toBe(false);

        const gridEl = getGridElement(gridApi)!;
        const hasYearHeaderGroupText = Array.from(gridEl.querySelectorAll('.ag-header-group-text')).some(
            (el) => el.textContent?.trim() === '2000'
        );
        expect(hasYearHeaderGroupText).toBe(false);
    });

    test('turning pivot mode off and cancelling should keep pivot mode on', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('turning defer mode off then turning pivot mode off updates the live grid immediately', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getDeferModeToggle(toolPanelGui).click();
        getPivotModeToggle(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
    });

    test('turning pivot mode back on after disabling and applying restores the previous pivot columns', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getPivotColumns()).toEqual([]);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('commit should make exactly one server call', async () => {
        const { gridApi, toolPanelGui, serverGetDataSpy } = await createDeferredPivotModeGrid();
        const initialCallCount = serverGetDataSpy.mock.calls.length;

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(serverGetDataSpy.mock.calls.length - initialCallCount).toBe(1);
    });

    test('select all and deselect all apply only after clicking Apply in non-pivot mode', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();
        const allColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'];

        getSelectAllCheckbox(toolPanelGui).click();

        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getApplyButton(toolPanelGui).click();

        expect(allColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);

        getSelectAllCheckbox(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();

        expect(allColumns.some((colId) => !gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('select all after staging pivot mode off applies visibility changes, not pivot-mode selection changes', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();
        const allColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'];

        getPivotModeToggle(toolPanelGui).click();
        getSelectAllCheckbox(toolPanelGui).click();

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(allColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('select all can be cancelled in non-pivot mode', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();

        getSelectAllCheckbox(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();

        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('silver')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('bronze')!.isVisible()).toBe(false);
    });

    test('removing a value pill in pivot mode stages the change until Apply', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);

        removeDropZonePill(toolPanelGui, 'sum of Bronze');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);

        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver']);
    });

    test('removing a value pill in pivot mode can be cancelled', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        removeDropZonePill(toolPanelGui, 'sum of Bronze');
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);
    });

    test('removing a row group pill in deferred mode applies only after clicking Apply', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        removeDropZonePill(toolPanelGui, 'Country');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getApplyButton(toolPanelGui).click();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport']);
    });

    test('removing a value pill in deferred mode is discarded by Cancel', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', rowGroup: true, enableRowGroup: true },
            { field: 'country', rowGroup: true, enableRowGroup: true },
            { field: 'gold', enableValue: true, aggFunc: 'sum' },
            { field: 'silver', enableValue: true, aggFunc: 'sum' },
            { field: 'bronze', enableValue: true },
        ]);

        removeDropZonePill(toolPanelGui, 'sum of Silver');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['gold', 'silver']);

        getCancelButton(toolPanelGui).click();

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['gold', 'silver']);
    });

    test('removing a pivot label pill in deferred pivot mode applies only after clicking Apply', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', enableRowGroup: true, enablePivot: true, rowGroup: true },
            { field: 'country', enableRowGroup: true, enablePivot: true },
            { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
            { field: 'age', enableValue: true, aggFunc: 'sum' },
        ]);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await asyncSetTimeout(50);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        removeDropZonePill(toolPanelGui, 'Year');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        getApplyButton(toolPanelGui).click();

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual([]);
    });

    test('defer mode footer buttons hide when defer mode is turned off', async () => {
        const { toolPanelGui } = await createDeferredNonPivotGrid();

        expect(getByText(toolPanelGui, 'Apply')).toBeTruthy();
        expect(getByText(toolPanelGui, 'Cancel')).toBeTruthy();

        getDeferModeToggle(toolPanelGui).click();

        expect(toolPanelGui.textContent).not.toContain('Apply');
        expect(toolPanelGui.textContent).not.toContain('Cancel');
    });
});
