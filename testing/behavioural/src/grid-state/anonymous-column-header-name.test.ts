import { findByText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi, GridState } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

/**
 * A column with neither `colId` nor `field` has no developer-provided identity, so the build names it by
 * position (`'0'`, `'1'`, `'2'`). Column state is keyed by that name, which means a user's header rename
 * follows the position rather than the column — reordering `columnDefs` between save and restore moves the
 * rename onto whichever column now occupies the slot.
 */
describe('Anonymous columns - header name state', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    const ONE: ColDef = { headerName: 'one', headerNameEditable: true, valueGetter: () => 'one' };
    const TWO: ColDef = { headerName: 'two', headerNameEditable: true, valueGetter: () => 'two' };
    const THREE: ColDef = { headerName: 'three', headerNameEditable: true, valueGetter: () => 'three' };

    async function createGrid(id: string, columnDefs: ColDef[], initialState?: GridState): Promise<GridApi> {
        const api = await gridMgr.createGridAndWait(id, {
            columnDefs,
            rowData: [{ id: 'r1' }],
            getRowId: (params) => params.data.id,
            initialState,
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
        return api;
    }

    /** Each column's displayed header alongside the value its `valueGetter` returns. */
    function headersAndValues(api: GridApi): [string, unknown][] {
        return api
            .getAllGridColumns()!
            .map((column) => [
                api.getDisplayNameForColumn(column, 'header'),
                api.getCellValue({ colKey: column, rowNode: api.getRowNode('r1')! }),
            ]);
    }

    /** Renames a column through the tool panel's "Edit Column Name" editor — the user-facing path. */
    async function renameViaEditor(api: GridApi, currentName: string, nextName: string): Promise<void> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        // The tool panel populates asynchronously after the grid renders, so poll until the column is listed.
        const { listPanel, rowIndex } = await waitFor(() => {
            const panel = (api.getToolPanelInstance('columns') as any)?.primaryColsPanel?.primaryColsListPanel;
            const index = ((panel?.getDisplayedColsList() as any[] | undefined) ?? []).findIndex(
                (item) => item.displayName === currentName
            );
            expect(index).toBeGreaterThanOrEqual(0);
            return { listPanel: panel, rowIndex: index };
        });
        listPanel['virtualList'].ensureIndexVisible(rowIndex);
        await asyncSetTimeout(0);
        const rendered = listPanel['virtualList'].getComponentAt(rowIndex).getGui() as HTMLElement;
        const entry = (rendered.closest('.ag-virtual-list-item') as HTMLElement | null) ?? rendered;
        entry.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));

        // findByText polls for the context-menu item.
        await userEvent.click(await findByText(gridDiv, 'Edit Column Name'));
        const input = await waitFor(() => {
            const editor = document.querySelector<HTMLInputElement>('.ag-column-header-edit-popup-editor input');
            expect(editor).toBeTruthy();
            return editor!;
        });
        input.value = nextName;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    }

    test('a header rename on an anonymous column is restored onto the column that holds its position, not the renamed one', async () => {
        const source = await createGrid('anonymous-header-source', [ONE, TWO, THREE]);
        // No colId and no field, so identity is the column's position in `columnDefs`.
        expect(source.getAllGridColumns()!.map((column) => column.getColId())).toEqual(['0', '1', '2']);
        await waitFor(() =>
            expect(headersAndValues(source)).toEqual([
                ['one', 'one'],
                ['two', 'two'],
                ['three', 'three'],
            ])
        );

        await renameViaEditor(source, 'two', 'edited');
        // The rename touches the header only; the value getter is untouched.
        await waitFor(() =>
            expect(headersAndValues(source)).toEqual([
                ['one', 'one'],
                ['edited', 'two'],
                ['three', 'three'],
            ])
        );

        // The rename is persisted against the positional id, with nothing tying it to the renamed column.
        const savedState = await waitFor(() => {
            const state = source.getState();
            expect(state.columnHeaderName).toEqual({ columnHeaderNames: [{ colId: '1', headerName: 'edited' }] });
            return state;
        });

        // Same three definitions, declared in a different order. Position 1 is now the 'three' column, so
        // the restored rename lands on it and the column the user actually renamed comes back as 'two'.
        const target = await createGrid('anonymous-header-target', [ONE, THREE, TWO], savedState);
        await waitFor(() =>
            expect(headersAndValues(target)).toEqual([
                ['one', 'one'],
                ['edited', 'three'],
                ['two', 'two'],
            ])
        );
    });
});
