import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

/** With apply buttons enabled the pill removal is only drafted, so commit has to preserve the removal:
 *  a naive "record the remaining columns" draft is replayed through `setColumns`, which re-seats every
 *  hierarchy virtual of the columns that remain and brings the pill back on Apply. */
describe('removing a groupHierarchy pill in deferred (apply-button) mode', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridMgr.reset());

    const rowData = [
        { date: '2008-08-24', country: 'United States', total: 8 },
        { date: '2004-08-29', country: 'United States', total: 8 },
        { date: '2000-10-01', country: 'Romania', total: 6 },
    ];

    const createGrid = async (options: Partial<GridOptions>) => {
        const api = await gridMgr.createGridAndWait('deferred-hierarchy-pill-removal', {
            columnDefs: [
                { field: 'date', enableRowGroup: true, enablePivot: true, groupHierarchy: ['year', 'month'] },
                { field: 'country', enableRowGroup: true, enablePivot: true },
                { field: 'total', aggFunc: 'sum' },
            ],
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel'] as const },
                    },
                ],
                defaultToolPanel: 'columns',
            },
            ...options,
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeTruthy();
            return panel;
        });
        return { api, toolPanel };
    };

    const dropZoneGui = (panel: any): HTMLElement => panel.getGui() as HTMLElement;

    const pillTexts = (panel: any): (string | null)[] =>
        Array.from(dropZoneGui(panel).querySelectorAll('.ag-column-drop-cell-text')).map((el) => el.textContent);

    const clickRemove = (panel: any, index: number): void => {
        const buttons = dropZoneGui(panel).querySelectorAll('.ag-column-drop-cell-button');
        const button = buttons[index] as HTMLElement | undefined;
        if (!button) {
            throw new Error(`no remove button at index ${index} (found ${buttons.length})`);
        }
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    const clickApply = (api: GridApi): void => {
        const apply = Array.from(
            getGridElement(api)!.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')
        ).find((button) => button.textContent?.trim() === 'Apply');
        expect(apply).toBeTruthy();
        apply!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    const rowGroupColIds = (api: GridApi) => api.getRowGroupColumns().map((col) => col.getColId());
    const pivotColIds = (api: GridApi) => api.getPivotColumns().map((col) => col.getColId());

    const YEAR = 'ag-Grid-HierarchyColumn-date-year';
    const MONTH = 'ag-Grid-HierarchyColumn-date-month';

    test('the removed row group level stays removed after Apply', async () => {
        const { api, toolPanel } = await createGrid({});
        api.setRowGroupColumns(['date']);
        await waitFor(() => expect(rowGroupColIds(api)).toEqual([YEAR, MONTH, 'date']));

        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date (Year)', 'Date (Month)', 'Date']));

        clickRemove(rowGroupPanel, 0);

        // Drafted only: the pill goes, the live model is untouched until Apply.
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date (Month)', 'Date']));
        expect(rowGroupColIds(api)).toEqual([YEAR, MONTH, 'date']);

        clickApply(api);

        await waitFor(() => expect(rowGroupColIds(api)).toEqual([MONTH, 'date']));
        expect(pillTexts(rowGroupPanel)).toEqual(['Date (Month)', 'Date']);
    });

    test('consecutive drafted removals all stick on one Apply', async () => {
        const { api, toolPanel } = await createGrid({});
        api.setRowGroupColumns(['date']);
        await waitFor(() => expect(rowGroupColIds(api)).toEqual([YEAR, MONTH, 'date']));

        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date (Year)', 'Date (Month)', 'Date']));

        clickRemove(rowGroupPanel, 0);
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date (Month)', 'Date']));
        clickRemove(rowGroupPanel, 0);
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date']));

        clickApply(api);

        await waitFor(() => expect(rowGroupColIds(api)).toEqual(['date']));
    });

    test('a drafted removal followed by re-adding the same level via a full set is not suppressed', async () => {
        const { api, toolPanel } = await createGrid({});
        api.setRowGroupColumns(['date']);
        await waitFor(() => expect(rowGroupColIds(api)).toEqual([YEAR, MONTH, 'date']));

        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date (Year)', 'Date (Month)', 'Date']));

        clickRemove(rowGroupPanel, 0);
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date (Month)', 'Date']));

        // A full-list set is a pure function of its list, exactly as in immediate mode — it re-seats the
        // hierarchy and the earlier drafted removal must not survive it.
        rowGroupPanel.updateItems(
            [YEAR, MONTH, 'date'].map((colId) => api.getColumn(colId)).filter((col) => !!col) as any
        );
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Date (Year)', 'Date (Month)', 'Date']));

        clickApply(api);

        await waitFor(() => expect(rowGroupColIds(api)).toEqual([YEAR, MONTH, 'date']));
    });

    test('the removed pivot level stays removed after Apply', async () => {
        const { api, toolPanel } = await createGrid({ pivotMode: true, pivotPanelShow: 'always' });
        api.setPivotColumns(['date']);
        await waitFor(() => expect(pivotColIds(api)).toEqual([YEAR, MONTH, 'date']));

        const pivotPanel = toolPanel.pivotDropZonePanel;
        await waitFor(() => expect(pillTexts(pivotPanel)).toEqual(['Date (Year)', 'Date (Month)', 'Date']));

        clickRemove(pivotPanel, 0);

        await waitFor(() => expect(pillTexts(pivotPanel)).toEqual(['Date (Month)', 'Date']));
        expect(pivotColIds(api)).toEqual([YEAR, MONTH, 'date']);

        clickApply(api);

        await waitFor(() => expect(pivotColIds(api)).toEqual([MONTH, 'date']));
    });
});
