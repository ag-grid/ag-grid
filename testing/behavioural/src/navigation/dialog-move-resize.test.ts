import { waitFor, within } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, clickMenuOption, polyfillOffsetParent } from 'ag-test-utils';

import type { GridApi, GridOptions, NotesDataSource } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const MOVE_RESIZE_INSTRUCTIONS =
    'Arrow keys move the dialog, and Shift with the arrow keys resizes it. Press Enter to finish or Escape to cancel.';
const MOVE_INSTRUCTIONS = 'Arrow keys move the dialog. Press Enter to finish or Escape to cancel.';
const MOVE_BUTTONS = ['Move Left', 'Move Up', 'Move Down', 'Move Right'];
const RESIZE_BUTTONS = ['Narrower', 'Wider', 'Shorter', 'Taller'];

/**
 * Dialogs can be moved and resized without dragging (WCAG 2.1.1 and 2.5.7). The Move and Resize button in the title
 * bar starts a mode in which the arrow keys move the dialog, Shift with the arrow keys resizes it, Enter finishes and
 * Escape cancels; step buttons do the same for pointer users. The geometry needs real layout, so it is covered by the
 * grid e2e spec; these tests cover the states, keys and labels.
 */
describe('Moving and resizing dialogs without dragging', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });
    let restoreOffsetParent: (() => void) | undefined;

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        document.body.replaceChildren();
    });

    const createGrid = (gridOptions: GridOptions = {}): Promise<GridApi> =>
        gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete', headerNameEditable: true }, { field: 'age' }],
            rowData: [{ athlete: 'Michael Phelps', age: 23 }],
            ...gridOptions,
        });

    const waitForDialog = (selector = '.ag-dialog'): Promise<HTMLElement> =>
        waitFor(() => {
            const dialog = document.querySelector<HTMLElement>(selector);
            expect(dialog).not.toBeNull();
            return dialog!;
        });

    async function openColumnChooser(gridOptions?: GridOptions): Promise<{ api: GridApi; dialog: HTMLElement }> {
        const api = await createGrid(gridOptions);
        api.showColumnChooser();
        return { api, dialog: await waitForDialog() };
    }

    const getToggle = (dialog: HTMLElement): HTMLElement =>
        within(dialog).getByRole('button', { name: 'Move and Resize' });

    /** By label rather than role: the step buttons are hidden until the mode starts. */
    const getStepButton = (dialog: HTMLElement, name: string): HTMLButtonElement => {
        const button = dialog.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);
        expect(button).not.toBeNull();
        return button!;
    };

    /** The grid's live region. Zero-width spaces are stripped from its text. */
    const getAnnouncement = (api: GridApi): string =>
        (
            getGridElement(api)!.querySelector('.ag-root-wrapper > .ag-aria-description-container')?.textContent ?? ''
        ).replaceAll('​', '');

    function pressKey(el: HTMLElement, key: string, shiftKey = false): KeyboardEvent {
        const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
        el.dispatchEvent(event);
        return event;
    }

    async function startWithKeyboard(dialog: HTMLElement): Promise<HTMLElement> {
        const toggle = getToggle(dialog);
        toggle.focus();
        await userEvent.keyboard('{Enter}');
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
        return toggle;
    }

    test('the title bar has a Move and Resize button, a Tab stop ahead of Close', async () => {
        const { dialog } = await openColumnChooser();
        const toggle = getToggle(dialog);
        const titleBarButtons = Array.from(
            dialog.querySelectorAll<HTMLElement>('.ag-panel-title-bar-buttons > button:not(.ag-hidden)')
        ).map((button) => button.getAttribute('aria-label'));

        expect(toggle.tagName).toBe('BUTTON');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(toggle).not.toHaveAttribute('tabindex');
        expect(titleBarButtons).toEqual(['Move and Resize', 'Close']);
        expect(dialog).not.toHaveClass('ag-dialog-move-resize-active');
    });

    test('Enter on the button starts the mode, keeps focus on it and announces the keys', async () => {
        const { api, dialog } = await openColumnChooser();
        const toggle = await startWithKeyboard(dialog);

        expect(dialog).toHaveClass('ag-dialog-move-resize-active');
        expect(toggle).toHaveFocus();
        await waitFor(() => expect(getAnnouncement(api)).toContain(MOVE_RESIZE_INSTRUCTIONS));
    });

    test('in the mode, the arrow keys, with or without Shift, are kept from the page', async () => {
        const { dialog } = await openColumnChooser();
        const toggle = await startWithKeyboard(dialog);

        for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) {
            expect(pressKey(toggle, key).defaultPrevented).toBe(true);
            expect(pressKey(toggle, key, true).defaultPrevented).toBe(true);
        }
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('Escape cancels the mode without closing the dialog, and closes it once the mode has ended', async () => {
        const { dialog } = await openColumnChooser();
        const toggle = await startWithKeyboard(dialog);

        await userEvent.keyboard('{Escape}');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(dialog).not.toHaveClass('ag-dialog-move-resize-active');
        expect(dialog.isConnected).toBe(true);

        await userEvent.keyboard('{Escape}');
        expect(dialog.isConnected).toBe(false);
    });

    test('Enter, Tab or focusing the dialog content ends the mode', async () => {
        const { dialog } = await openColumnChooser();
        const toggle = await startWithKeyboard(dialog);

        await userEvent.keyboard('{Enter}');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(toggle).toHaveFocus();
        expect(dialog.isConnected).toBe(true);

        await startWithKeyboard(dialog);
        await userEvent.tab();
        expect(toggle).toHaveAttribute('aria-pressed', 'false');

        await startWithKeyboard(dialog);
        dialog.querySelector<HTMLInputElement>('.ag-column-select-header-filter-wrapper input')!.focus();
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    test('clicking the button turns the mode on and off', async () => {
        const { dialog } = await openColumnChooser();
        const toggle = getToggle(dialog);

        await userEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-pressed', 'true');

        await userEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(dialog).not.toHaveClass('ag-dialog-move-resize-active');
        expect(dialog.querySelector('.ag-dialog-move-resize-bar')).toHaveClass('ag-hidden');
    });

    test('the mode shows a bar under the title bar, with a labelled group for position, width and height', async () => {
        const { dialog } = await openColumnChooser();
        const bar = dialog.querySelector<HTMLElement>('.ag-dialog-move-resize-bar')!;
        expect(dialog.querySelector('.ag-panel-title-bar')!.nextElementSibling).toBe(bar);
        expect(bar).toHaveClass('ag-hidden');

        await userEvent.click(getToggle(dialog));

        expect(bar).not.toHaveClass('ag-hidden');
        const groups = within(bar).getAllByRole('group');
        expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual(['Position', 'Width', 'Height']);
        expect(groups.map((group) => group.textContent!.trim())).toEqual(['Position', 'Width', 'Height']);
        expect(
            within(groups[0])
                .getAllByRole('button')
                .map((b) => b.getAttribute('aria-label'))
        ).toEqual(MOVE_BUTTONS);
        expect(
            [...within(groups[1]).getAllByRole('button'), ...within(groups[2]).getAllByRole('button')].map((b) =>
                b.getAttribute('aria-label')
            )
        ).toEqual(RESIZE_BUTTONS);
    });

    test('the step buttons are native buttons outside the Tab order, and clicking one keeps the mode and focus', async () => {
        const { dialog } = await openColumnChooser();
        const toggle = getToggle(dialog);
        await userEvent.click(toggle);

        for (const name of [...MOVE_BUTTONS, ...RESIZE_BUTTONS]) {
            const button = getStepButton(dialog, name);
            expect(button.tagName).toBe('BUTTON');
            expect(button).toHaveAttribute('tabindex', '-1');
        }

        await userEvent.click(getStepButton(dialog, 'Move Right'));
        await userEvent.click(getStepButton(dialog, 'Wider'));
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
        expect(toggle).toHaveFocus();
    });

    test('a dialog that only moves, Edit Column Name, offers no resizing and Escape cancels without closing', async () => {
        const api = await createGrid();
        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await clickMenuOption('Edit Column Name');
        const dialog = await waitForDialog('.ag-dialog:has(.ag-column-header-edit-popup-editor)');
        // the dialog focuses its input a task after opening, which would take focus from the button
        await waitFor(() => expect(dialog.querySelector('.ag-column-header-edit-popup-editor input')).toHaveFocus());

        const toggle = await startWithKeyboard(dialog);
        expect(dialog.querySelector('.ag-dialog-position-buttons')).not.toHaveClass('ag-hidden');
        expect(dialog.querySelector('.ag-dialog-width-buttons')).toHaveClass('ag-hidden');
        expect(dialog.querySelector('.ag-dialog-height-buttons')).toHaveClass('ag-hidden');
        await waitFor(() => expect(getAnnouncement(api)).toContain(MOVE_INSTRUCTIONS));
        expect(getAnnouncement(api)).not.toContain('resizes');

        await userEvent.keyboard('{Escape}');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(dialog.isConnected).toBe(true);
    });

    test('a dialog without a title bar, the notes popup, has no Move and Resize button', async () => {
        const notesDataSource: NotesDataSource = {
            getNote: () => ({ text: 'Note' }),
            setNote: () => {},
        };
        const api = await createGrid({
            getRowId: ({ data }) => data.athlete,
            noteTrigger: 'click',
            notesDataSource,
        });

        getGridElement(api)!.querySelector<HTMLElement>('.ag-cell[col-id="athlete"]')!.click();
        const dialog = await waitForDialog('.ag-notes-popup');

        expect(dialog.querySelector('.ag-dialog-move-resize-button')).toBeNull();
    });

    test('the labels and instructions can be localised', async () => {
        const { api, dialog } = await openColumnChooser({
            localeText: {
                ariaLabelMoveAndResize: 'Verschieben und Größe ändern',
                ariaLabelWider: 'Breiter',
                ariaDialogMoveResizeInstructions: 'Pfeiltasten verschieben den Dialog.',
            },
        });
        const toggle = within(dialog).getByRole('button', { name: 'Verschieben und Größe ändern' });

        await userEvent.click(toggle);

        expect(getStepButton(dialog, 'Breiter')).toBeInTheDocument();
        await waitFor(() => expect(getAnnouncement(api)).toContain('Pfeiltasten verschieben den Dialog.'));
    });
});
