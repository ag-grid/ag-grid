import { findByText, fireEvent, getAllByText, getByText, waitFor } from '@testing-library/dom';
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
        const toolPanelGui = await waitFor(() => {
            const panel = gridDiv.querySelector<HTMLElement>('.ag-column-panel');
            expect(panel).not.toBeNull();
            return panel!;
        });

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

    test('focus returns to the same part of a split column group', async () => {
        const { gridApi, gridDiv, viewport } = await createGrid(
            ['cancel', 'apply'],
            [
                { headerName: 'Medals', groupId: 'medals', children: [{ field: 'silver' }, { field: 'total' }] },
                { field: 'athlete' },
            ]
        );
        gridApi.moveColumns(['athlete'], 1);
        const getMedalsRows = () =>
            getAllByText(viewport, 'Medals').map((label) => label.closest('.ag-virtual-list-item') as HTMLElement);
        await waitFor(() => expect(getMedalsRows()).toHaveLength(2));

        const secondPart = getMedalsRows()[1];
        secondPart.focus();
        fireEvent.keyDown(secondPart, { key: 'F10', shiftKey: true });
        const option = (await findByText(gridDiv, 'Group by Medals')).closest('.ag-menu-option') as HTMLElement;
        option.focus();
        await userEvent.keyboard('{Enter}');

        await waitFor(() => {
            const rows = getMedalsRows();
            expect(rows[1].isConnected).toBe(true);
            expect(document.activeElement).toBe(rows[1]);
        });
    });

    test.each<[string, ColumnToolPanelAction[], (toolPanelGui: HTMLElement, viewport: HTMLElement) => HTMLElement]>([
        ['Cancel', ['cancel', 'apply'], (toolPanelGui) => getButton(toolPanelGui, 'Cancel')],
        [
            'Reset when there is no Cancel button',
            ['reset', 'apply'],
            (toolPanelGui) => getButton(toolPanelGui, 'Reset'),
        ],
        ['the column list when there is no other button', ['apply'], (_gui, viewport) => getRow(viewport, 'Athlete')],
    ])('pressing Enter on Apply moves focus to %s', async (_name, buttons, getFocusTarget) => {
        const { gridApi, gridDiv, viewport, toolPanelGui } = await createGrid(buttons);
        await runMenuItemFromKeyboard(gridDiv, viewport, 'Silver', 'Add Silver to values');
        await expectRowFocused(viewport, 'Silver');

        const apply = getButton(toolPanelGui, 'Apply');
        apply.focus();
        fireEvent.keyDown(apply, { key: 'Enter' });

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver']);
        expect(apply.disabled).toBe(true);
        await waitFor(() => expect(document.activeElement).toBe(getFocusTarget(toolPanelGui, viewport)));
    });

    test('pressing Enter on Apply moves focus to the search input when the search matches no columns', async () => {
        const { gridApi, gridDiv, viewport, toolPanelGui } = await createGrid(['apply']);
        await runMenuItemFromKeyboard(gridDiv, viewport, 'Silver', 'Add Silver to values');
        await expectRowFocused(viewport, 'Silver');

        const searchInput = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-column-select-header-filter-wrapper input'
        )!;
        await userEvent.type(searchInput, 'no such column');
        await waitFor(() => expect(viewport.classList.contains('ag-hidden')).toBe(true));

        const apply = getButton(toolPanelGui, 'Apply');
        apply.focus();
        fireEvent.keyDown(apply, { key: 'Enter' });

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver']);
        await waitFor(() => expect(document.activeElement).toBe(searchInput));
    });

    test('Apply leaves focus alone when it did not hold focus', async () => {
        const { gridDiv, viewport, toolPanelGui } = await createGrid(['cancel', 'apply']);
        await runMenuItemFromKeyboard(gridDiv, viewport, 'Silver', 'Add Silver to values');
        await expectRowFocused(viewport, 'Silver');

        getButton(toolPanelGui, 'Apply').click();

        expect(document.activeElement).toBe(getRow(viewport, 'Silver'));
    });
});
