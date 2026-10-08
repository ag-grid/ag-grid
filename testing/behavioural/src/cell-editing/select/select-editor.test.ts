import { fireEvent, waitFor } from '@testing-library/dom';
import { RefPlaceholder } from 'ag-stack';
import { TestGridsManager, firePointerLikeClick, getAllRows } from 'ag-test-utils';

import { AgSelectSelector, Component, CustomEditorModule, SelectEditorModule, getGridElement } from 'ag-grid-community';
import type { GridApi, GridOptions, GridSelect, ICellEditorComp } from 'ag-grid-community';

/**
 * Behavioural coverage for the Select cell editor (`agSelectCellEditor`) honouring
 * `enterNavigatesVerticallyAfterEdit`: committing with Enter moves focus like the default Text Cell
 * Editor, while a click commit keeps the general non-navigation behaviour.
 */

const OPTION_SELECTOR = '.ag-list-item[role=option]';

/** Starts editing with an Enter keypress so the picker opens — `agSelectCellEditor` only shows its
 * list when the edit was started by Enter — then waits for the option list to render. */
async function openEditor(api: GridApi, rowIndex: number, colKey: string): Promise<void> {
    api.setFocusedCell(rowIndex, colKey);
    api.startEditingCell({ rowIndex, colKey, key: 'Enter' });
    await waitFor(() => expect(document.querySelector(OPTION_SELECTOR)).toBeTruthy());
}

/** Fires a keydown on the picker wrapper — the element AgSelect listens on for commit/navigate. */
function pressEnter(gridDiv: HTMLElement, shiftKey = false): void {
    const wrapper = gridDiv.querySelector<HTMLElement>('.ag-picker-field-wrapper');
    if (!wrapper) {
        throw new Error('AgSelect picker wrapper not found');
    }
    fireEvent.keyDown(wrapper, { key: 'Enter', shiftKey });
}

class ReadOnlySelectEditor extends Component implements ICellEditorComp {
    public readonly select: GridSelect<string> = RefPlaceholder;

    public postConstruct(): void {
        this.setTemplate({ tag: 'div', children: [{ tag: 'ag-select', ref: 'select' }] }, [AgSelectSelector], {
            select: {
                readOnly: true,
                value: 'Alpha',
                options: ['Alpha', 'Beta', 'Gamma'].map((value) => ({ value, text: value })),
            },
        });
    }

    public getValue(): string | null | undefined {
        return this.select.getValue();
    }
}

describe('Select cell editor', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [SelectEditorModule, CustomEditorModule],
    });

    afterEach(() => gridMgr.reset());

    const createGrid = (options: GridOptions): Promise<GridApi> => gridMgr.createGridAndWait('grid', options);

    const baseColDef = (params: object = {}) => ({
        field: 'a',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['Alpha', 'Beta', 'Gamma'], ...params },
    });

    const twoRows = [
        { id: '0', a: 'Alpha' },
        { id: '1', a: 'Beta' },
    ];

    test('read-only selects allow programmatic updates and can become editable again', async () => {
        const api = await createGrid({
            columnDefs: [{ field: 'a', editable: true, cellEditor: ReadOnlySelectEditor }],
            rowData: [{ a: 'Alpha' }],
        });
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const editor = api.getCellEditorInstances()[0] as ReadOnlySelectEditor;
        const select = editor.select;
        const wrapper = editor.getGui().querySelector<HTMLElement>('[role=combobox]')!;

        expect(wrapper.getAttribute('aria-readonly')).toBe('true');
        await firePointerLikeClick(wrapper);
        select.showPicker();
        expect(document.querySelector(OPTION_SELECTOR)).toBeNull();

        select.setValue('Beta');
        expect(wrapper.textContent?.trim()).toBe('Beta');
        select.setReadOnly(false);
        expect(wrapper.getAttribute('aria-readonly')).toBe('false');
        await firePointerLikeClick(wrapper);
        await waitFor(() => expect(document.querySelector(OPTION_SELECTOR)).not.toBeNull());

        select.setReadOnly(true);
        expect(wrapper.getAttribute('aria-expanded')).toBe('false');
        expect(document.querySelector(OPTION_SELECTOR)).toBeNull();
        expect(wrapper.textContent?.trim()).toBe('Beta');

        select.setReadOnly(false);
        await firePointerLikeClick(wrapper);
        const option = await waitFor(() => {
            const item = Array.from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR)).find(
                (element) => element.textContent?.trim() === 'Gamma'
            );
            expect(item).toBeTruthy();
            return item!;
        });
        await firePointerLikeClick(option);
        api.stopEditing();
        expect(api.getDisplayedRowAtIndex(0)?.data.a).toBe('Gamma');
    });

    describe('enterNavigatesVerticallyAfterEdit', () => {
        test('Enter commit moves focus to the cell below when the option is on', async () => {
            const api = await createGrid({
                columnDefs: [baseColDef()],
                rowData: twoRows,
                getRowId: (p) => p.data.id,
                enterNavigatesVerticallyAfterEdit: true,
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            await openEditor(api, 0, 'a');

            pressEnter(gridDiv);

            await waitFor(() => expect(api.getFocusedCell()?.rowIndex).toBe(1));
        });

        test('Enter commit after changing the value moves focus to the cell below', async () => {
            const api = await createGrid({
                columnDefs: [baseColDef()],
                rowData: twoRows,
                getRowId: (p) => p.data.id,
                enterNavigatesVerticallyAfterEdit: true,
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            await openEditor(api, 0, 'a');
            // No layout in happy-dom, so highlight navigation gates on checkVisibility — force it true.
            document
                .querySelectorAll<HTMLElement>(OPTION_SELECTOR)
                .forEach((el) => ((el as any).checkVisibility = () => true));

            const wrapper = gridDiv.querySelector<HTMLElement>('.ag-picker-field-wrapper')!;
            fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
            pressEnter(gridDiv);

            await waitFor(() => expect(api.getFocusedCell()?.rowIndex).toBe(1));
            expect(getAllRows(api)[0].data.a).toBe('Beta');
        });

        test('Shift+Enter commit moves focus to the cell above when the option is on', async () => {
            const api = await createGrid({
                columnDefs: [baseColDef()],
                rowData: twoRows,
                getRowId: (p) => p.data.id,
                enterNavigatesVerticallyAfterEdit: true,
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            await openEditor(api, 1, 'a');

            pressEnter(gridDiv, true);

            await waitFor(() => expect(api.getFocusedCell()?.rowIndex).toBe(0));
        });

        test('Enter commit does not move focus when the option is off (default)', async () => {
            const api = await createGrid({
                columnDefs: [baseColDef()],
                rowData: twoRows,
                getRowId: (p) => p.data.id,
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            await openEditor(api, 0, 'a');

            pressEnter(gridDiv);

            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
            expect(api.getFocusedCell()?.rowIndex).toBe(0);
        });

        test('a non-Enter (click) commit does not navigate even when the option is on', async () => {
            const api = await createGrid({
                columnDefs: [baseColDef()],
                rowData: twoRows,
                getRowId: (p) => p.data.id,
                enterNavigatesVerticallyAfterEdit: true,
            });

            await openEditor(api, 0, 'a');

            const option = Array.from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR)).find(
                (el) => el.textContent?.trim() === 'Gamma'
            )!;
            await firePointerLikeClick(option);

            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
            expect(getAllRows(api)[0].data.a).toBe('Gamma');
            expect(api.getFocusedCell()?.rowIndex).toBe(0);
        });
    });

    describe('untouched commit', () => {
        // The picker shows `values[0]` when the stored value is not an option, so an untouched commit
        // must keep the stored value; picking that same option is a real choice and must commit.
        test('opening and closing without picking keeps a value that is not in the list', async () => {
            const api = await createGrid({
                columnDefs: [baseColDef({ values: ['x', 'y'] })],
                rowData: [{ id: '0', a: 'zzz' }],
                getRowId: (p) => p.data.id,
            });

            await openEditor(api, 0, 'a');
            api.stopEditing();

            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
            expect(getAllRows(api)[0].data.a).toBe('zzz');
        });

        test('explicitly picking the fallback option commits it', async () => {
            const api = await createGrid({
                columnDefs: [baseColDef({ values: ['x', 'y'] })],
                rowData: [{ id: '0', a: 'zzz' }],
                getRowId: (p) => p.data.id,
            });

            await openEditor(api, 0, 'a');
            const option = Array.from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR)).find(
                (el) => el.textContent?.trim() === 'x'
            )!;
            await firePointerLikeClick(option);

            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
            expect(getAllRows(api)[0].data.a).toBe('x');
        });
    });
});
