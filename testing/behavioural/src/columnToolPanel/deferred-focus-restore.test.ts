import { findByText, fireEvent, getByText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, ColumnToolPanelAction, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('deferred column tool panel keeps keyboard focus', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'silver' }, { field: 'total' }];

    afterEach(() => {
        gridMgr.reset();
    });

    async function createGrid(
        buttons: ColumnToolPanelAction[],
        defs: (ColDef | ColGroupDef)[] = columnDefs
    ): Promise<{ gridApi: GridApi; gridDiv: HTMLElement; viewport: HTMLElement; toolPanelGui: HTMLElement }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: defs,
            rowData: [{ athlete: 'Michael Phelps', silver: 0, total: 8 }],
            defaultColDef: { enableValue: true, enableRowGroup: true },
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const gridDiv = getGridElement(gridApi)! as HTMLElement;
        const toolPanelGui = await waitFor(() => (gridApi.getToolPanelInstance('columns') as any).getGui());

        // happy-dom needs a viewport height to render the virtual-list rows.
        const viewport = toolPanelGui.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement;
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
        await waitFor(() => expect(viewport.querySelector('.ag-virtual-list-item')).not.toBeNull());

        return { gridApi, gridDiv, viewport, toolPanelGui };
    }

    /** Re-queried every time, as a deferred update replaces the row elements. */
    function getRow(viewport: HTMLElement, label: string): HTMLElement {
        return getByText(viewport, label).closest('.ag-virtual-list-item') as HTMLElement;
    }

    function getButton(toolPanelGui: HTMLElement, label: string): HTMLButtonElement {
        return getByText(toolPanelGui.querySelector('.ag-column-panel-buttons')!, label) as HTMLButtonElement;
    }

    async function runMenuItemFromKeyboard(
        gridDiv: HTMLElement,
        viewport: HTMLElement,
        rowLabel: string,
        itemLabel: string
    ): Promise<void> {
        const row = getRow(viewport, rowLabel);
        row.focus();
        fireEvent.keyDown(row, { key: 'F10', shiftKey: true });
        const option = (await findByText(gridDiv, itemLabel)).closest('.ag-menu-option') as HTMLElement;
        option.focus();
        await userEvent.keyboard('{Enter}');
    }

    async function expectRowFocused(viewport: HTMLElement, label: string): Promise<void> {
        await waitFor(() => {
            const row = getRow(viewport, label);
            expect(row.isConnected).toBe(true);
            expect(document.activeElement).toBe(row);
        });
    }

    test('focus returns to the column row after adding it to and removing it from values', async () => {
        const { gridApi, gridDiv, viewport } = await createGrid(['cancel', 'apply']);

        await runMenuItemFromKeyboard(gridDiv, viewport, 'Total', 'Add Total to values');
        await expectRowFocused(viewport, 'Total');

        await runMenuItemFromKeyboard(gridDiv, viewport, 'Total', 'Remove Total from values');
        await expectRowFocused(viewport, 'Total');
        expect(gridApi.getValueColumns()).toEqual([]);
    });

    test('focus returns to the column group row after grouping by it', async () => {
        const { gridDiv, viewport } = await createGrid(
            ['cancel', 'apply'],
            [{ headerName: 'Medals', groupId: 'medals', children: [{ field: 'silver' }, { field: 'total' }] }]
        );

        await runMenuItemFromKeyboard(gridDiv, viewport, 'Medals', 'Group by Medals');
        await expectRowFocused(viewport, 'Medals');
    });

    test.each<[string, ColumnToolPanelAction[], string | null]>([
        ['Cancel', ['cancel', 'apply'], 'Cancel'],
        ['Reset when there is no Cancel button', ['reset', 'apply'], 'Reset'],
        ['the column list when there is no other button', ['apply'], null],
    ])('pressing Enter on Apply moves focus to %s', async (_name, buttons, focusLabel) => {
        const { gridApi, gridDiv, viewport, toolPanelGui } = await createGrid(buttons);
        await runMenuItemFromKeyboard(gridDiv, viewport, 'Silver', 'Add Silver to values');
        await expectRowFocused(viewport, 'Silver');

        const apply = getButton(toolPanelGui, 'Apply');
        apply.focus();
        fireEvent.keyDown(apply, { key: 'Enter' });

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver']);
        expect(apply.disabled).toBe(true);
        if (focusLabel) {
            expect(document.activeElement).toBe(getButton(toolPanelGui, focusLabel));
        } else {
            await expectRowFocused(viewport, 'Athlete');
        }
    });

    test('Apply leaves focus alone when it did not hold focus', async () => {
        const { gridDiv, viewport, toolPanelGui } = await createGrid(['cancel', 'apply']);
        await runMenuItemFromKeyboard(gridDiv, viewport, 'Silver', 'Add Silver to values');
        await expectRowFocused(viewport, 'Silver');

        getButton(toolPanelGui, 'Apply').click();

        expect(document.activeElement).toBe(getRow(viewport, 'Silver'));
    });
});
