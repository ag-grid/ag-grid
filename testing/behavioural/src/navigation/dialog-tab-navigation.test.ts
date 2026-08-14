import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { GridApi, GridOptions, NotesDataSource, TabToNextGridContainerParams } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';
import { ColumnMenuModule, NotesModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

interface RowData {
    a: number;
    b: number;
}

interface FocusFixture {
    after: HTMLButtonElement;
    api: GridApi<RowData>;
    dialog: HTMLElement;
    final: HTMLButtonElement;
    host: HTMLElement;
}

describe('Dialog tab navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnMenuModule, NotesModule, PaginationModule],
    });
    const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
    let agHiddenStyle: HTMLStyleElement;

    beforeAll(() => {
        // give ag-hidden its real meaning in jsdom so hidden elements (e.g. the unused
        // pagination panel's tab guards) are untabbable, matching real browsers
        agHiddenStyle = document.createElement('style');
        agHiddenStyle.textContent = '.ag-hidden { display: none !important; }';
        document.head.appendChild(agHiddenStyle);
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            configurable: true,
            get() {
                return this.parentNode;
            },
        });
    });

    afterAll(() => {
        agHiddenStyle.remove();
        if (originalOffsetParent) {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
        } else {
            Reflect.deleteProperty(HTMLElement.prototype, 'offsetParent');
        }
    });

    afterEach(() => {
        gridsManager.reset();
        document.body.replaceChildren();
    });

    /** 'end' = external popup parent after the buttons, 'between' = between grid and buttons, 'none' = grid-parented. */
    type PopupParentPlacement = 'end' | 'between' | 'none';

    async function createFocusFixture(
        gridOptions: GridOptions<RowData> = {},
        popupParentPlacement: PopupParentPlacement = 'end'
    ): Promise<FocusFixture> {
        const host = document.createElement('div');
        const before = document.createElement('button');
        const grid = document.createElement('div');
        const after = document.createElement('button');
        const popupParent = document.createElement('div');
        const final = document.createElement('button');

        before.textContent = 'before';
        after.textContent = 'after';
        final.textContent = 'final';

        if (popupParentPlacement === 'between') {
            host.append(before, grid, popupParent, after, final);
        } else {
            host.append(before, grid, after, popupParent, final);
        }

        document.body.appendChild(host);

        const api = await gridsManager.createGridAndWait<RowData>(grid, {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
            ...(popupParentPlacement === 'none' ? {} : { popupParent }),
            ...gridOptions,
        });
        api.showColumnChooser();

        const dialogParent = popupParentPlacement === 'none' ? grid : popupParent;
        const dialog = await waitFor(() => {
            const element = dialogParent.querySelector<HTMLElement>('.ag-dialog');
            expect(element).not.toBeNull();
            return element!;
        });

        return { after, api, dialog, final, host };
    }

    test('skips the physical dialog position after focus leaves the dialog', async () => {
        const { after, final } = await createFocusFixture();
        const user = userEvent.setup();

        after.focus();
        await user.tab();
        expect(final).toHaveFocus();
    });

    test('enters the dialog through logical reverse navigation from after the grid', async () => {
        const { after, dialog } = await createFocusFixture();
        const user = userEvent.setup();

        after.focus();
        await user.tab({ shift: true });

        expect(dialog.contains(document.activeElement)).toBe(true);
        expect(document.activeElement).not.toHaveClass('ag-tab-guard');
        expect((document.activeElement as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
    });

    /** Deactivates nested tab guards (e.g. the column chooser's virtual list guards) so entry exercises the dialog's own guard, not an inner one. */
    function deactivateInnerTabGuards(dialog: HTMLElement): void {
        dialog.querySelectorAll<HTMLElement>('.ag-tab-guard').forEach((guard) => {
            if (guard.parentElement !== dialog) {
                guard.removeAttribute('tabindex');
            }
        });
    }

    test('skips a visible clear button when entering the dialog', async () => {
        const { after, dialog } = await createFocusFixture();
        const user = userEvent.setup();
        const filterInput = dialog.querySelector<HTMLInputElement>('.ag-column-select-header-filter-wrapper input')!;

        filterInput.value = 'a';
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
        const clearButton = dialog.querySelector<HTMLButtonElement>('.ag-input-field-clear-button')!;
        expect(clearButton).not.toHaveClass('ag-hidden');

        // demote every other control so the visible clear button (which follows the
        // filter input in the DOM) is the boundary candidate on reverse entry
        deactivateInnerTabGuards(dialog);
        dialog
            .querySelectorAll<HTMLElement>('input, select, button, textarea, [href], [tabindex]:not(.ag-tab-guard)')
            .forEach((element) => {
                if (element !== filterInput && element !== clearButton) {
                    element.tabIndex = -1;
                }
            });

        after.focus();
        await user.tab({ shift: true });

        expect(document.activeElement).toBe(filterInput);
        expect(document.activeElement).not.toBe(clearButton);
    });

    test('falls back to managed focus when the dialog has no tabbable content', async () => {
        const { after, dialog } = await createFocusFixture();
        const user = userEvent.setup();

        deactivateInnerTabGuards(dialog);
        dialog
            .querySelectorAll<HTMLElement>('input, select, button, textarea, [href], [tabindex]:not(.ag-tab-guard)')
            .forEach((element) => (element.tabIndex = -1));

        after.focus();
        await user.tab({ shift: true });

        expect(dialog.contains(document.activeElement)).toBe(true);
        expect(document.activeElement).not.toHaveClass('ag-tab-guard');
        expect((document.activeElement as HTMLElement).tabIndex).toBe(-1);
    });

    test('routes the bottom dialog guard to the element after the grid', async () => {
        const { after, dialog } = await createFocusFixture();
        const activeElement = document.activeElement as HTMLElement;
        expect(dialog.contains(activeElement)).toBe(true);

        const bottomGuard = dialog.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom');
        expect(bottomGuard).not.toBeNull();
        bottomGuard!.focus();

        await waitFor(() => expect(after).toHaveFocus());
    });

    test.each([false, true])(
        'routes the last dialog tab stop outside the grid with the default popup parent (pagination: %s)',
        async (pagination) => {
            const { after, dialog } = await createFocusFixture({ pagination }, 'none');
            const bottomGuard = dialog.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom');
            expect(bottomGuard).not.toBeNull();
            bottomGuard!.focus();

            expect(after).toHaveFocus();
        }
    );

    test('does not re-enter an externally parented dialog positioned between the grid and the next element', async () => {
        const { after, dialog } = await createFocusFixture({}, 'between');
        const bottomGuard = dialog.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom');
        expect(bottomGuard).not.toBeNull();
        bottomGuard!.focus();

        expect(after).toHaveFocus();
        expect(dialog.contains(document.activeElement)).toBe(false);
    });

    test('removes a closed dialog from reverse logical navigation', async () => {
        const { after, api, dialog } = await createFocusFixture();
        const user = userEvent.setup();

        api.hideColumnChooser();
        expect(dialog.isConnected).toBe(false);

        after.focus();
        await user.tab({ shift: true });
        expect(document.activeElement?.closest('.ag-dialog')).toBeNull();
    });

    test('preserves browser-default navigation requested by tabToNextGridContainer, invoking it once', async () => {
        const tabToNextGridContainer = vi.fn((_params: TabToNextGridContainerParams<RowData>) => false);
        const { after, dialog, final } = await createFocusFixture({ tabToNextGridContainer });

        const bottomGuard = dialog.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom');
        expect(bottomGuard).not.toBeNull();
        bottomGuard!.focus();

        expect(tabToNextGridContainer).toHaveBeenCalledTimes(1);
        expect(tabToNextGridContainer).toHaveBeenCalledWith(
            expect.objectContaining({ backwards: false, previousContainer: 'dialog', nextContainer: 'external' })
        );
        expect(after).not.toHaveFocus();
        expect(bottomGuard).not.toHaveFocus();
        expect(final).toHaveFocus();
    });

    test('preserves the current dialog focus when requested by tabToNextGridContainer', async () => {
        const tabToNextGridContainer = vi.fn((_params: TabToNextGridContainerParams<RowData>) => true);
        const { dialog } = await createFocusFixture({ tabToNextGridContainer });
        const filterInput = dialog.querySelector<HTMLElement>('.ag-column-select-header-filter-wrapper input');
        const innerBottomGuard = dialog.querySelector<HTMLElement>('.ag-column-select-list .ag-tab-guard-bottom');
        expect(filterInput).not.toBeNull();
        expect(innerBottomGuard).not.toBeNull();
        filterInput!.focus();
        innerBottomGuard!.focus();

        const bottomGuard = dialog.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom');
        expect(bottomGuard).not.toBeNull();
        bottomGuard!.focus();

        expect(tabToNextGridContainer).toHaveBeenCalledTimes(1);
        expect(filterInput).toHaveFocus();
    });

    test('follows native positive tab index order when leaving the dialog', async () => {
        const { after, dialog, final } = await createFocusFixture({ tabIndex: 5 });
        after.tabIndex = 2;
        final.tabIndex = 7;

        const bottomGuard = dialog.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom');
        expect(bottomGuard).not.toBeNull();
        bottomGuard!.focus();

        expect(final).toHaveFocus();
    });

    describe('modal notes dialog', () => {
        async function createNotesFixture() {
            const host = document.createElement('div');
            const grid = document.createElement('div');
            const after = document.createElement('button');
            const popupParent = document.createElement('div');
            host.append(grid, after, popupParent);
            document.body.appendChild(host);

            const notesDataSource: NotesDataSource = {
                getNote: () => ({ text: 'Note' }),
                setNote: () => {},
            };
            await gridsManager.createGridAndWait<RowData>(grid, {
                columnDefs: [{ field: 'a' }, { field: 'b' }],
                rowData: [{ a: 1, b: 2 }],
                getRowId: ({ data }) => String(data.a),
                noteTrigger: 'click',
                notesDataSource,
                popupParent,
            });

            const cell = grid.querySelector<HTMLElement>('.ag-cell[col-id="a"]');
            expect(cell).not.toBeNull();
            cell!.click();

            const dialog = await waitFor(() => {
                const element = popupParent.querySelector<HTMLElement>('.ag-notes-popup');
                expect(element).not.toBeNull();
                return element!;
            });
            const editor = dialog.querySelector<HTMLTextAreaElement>('.ag-text-area-input');
            expect(editor).not.toBeNull();

            return { after, dialog, editor: editor! };
        }

        test.each([
            ['Tab', false],
            ['Shift+Tab', true],
        ])('keeps focus in the notes editor on %s', async (_key, backwards) => {
            const { dialog, editor } = await createNotesFixture();
            editor.focus();

            const event = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Tab',
                shiftKey: backwards,
            });
            editor.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(true);
            expect(dialog.contains(document.activeElement)).toBe(true);
            expect(editor).toHaveFocus();
        });

        test('does not enter the notes dialog through reverse logical navigation', async () => {
            const { after, dialog } = await createNotesFixture();
            const user = userEvent.setup();

            after.focus();
            await user.tab({ shift: true });

            expect(dialog.contains(document.activeElement)).toBe(false);
        });
    });
});
