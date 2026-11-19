// The calculated-column dialog as a user drives it; no grid manager, so each harness can share it.
import { getByRole, waitFor } from '@testing-library/dom';
import { clickSelectOption, openPicker } from 'ag-test-utils';

/** The most recently opened dialog, or null: a live-apply dialog stays open after Apply. */
export function newestCalculatedColumnDialog(): HTMLElement | null {
    const dialogs = document.querySelectorAll<HTMLElement>('.ag-calculated-column-form');
    return dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;
}

/** The most recently opened dialog: a live-apply dialog stays open after Apply. */
export function getCalculatedColumnDialog(): HTMLElement {
    const dialog = newestCalculatedColumnDialog();
    if (!dialog) {
        throw new Error('no calculated-column dialog is open');
    }
    return dialog;
}

/** Waits for the dialog an Add opened, newer than `previous` (the newest before it): Add always opens its own. */
export function waitForNewCalculatedColumnDialog(previous: HTMLElement | null): Promise<HTMLElement> {
    return waitFor(() => {
        const dialog = newestCalculatedColumnDialog();
        if (!dialog || dialog === previous) {
            throw new Error('the Add has not opened its calculated-column dialog yet');
        }
        return dialog;
    });
}

export function getExpressionInput(): HTMLTextAreaElement {
    const input = getCalculatedColumnDialog().querySelector<HTMLTextAreaElement>('textarea');
    if (!input) {
        throw new Error('the calculated-column dialog has no expression input');
    }
    return input;
}

export function setExpression(expression: string): void {
    const input = getExpressionInput();
    input.value = expression;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function setTitle(title: string): void {
    const input = getByRole<HTMLInputElement>(getCalculatedColumnDialog(), 'textbox', { name: 'Title' });
    input.value = title;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function getDialogButton(label: string): HTMLButtonElement {
    const button = Array.from(getCalculatedColumnDialog().querySelectorAll<HTMLButtonElement>('button')).find(
        (element) => element.textContent?.trim() === label
    );
    if (!button) {
        throw new Error(`the calculated-column dialog has no "${label}" button`);
    }
    return button;
}

export function clickDialogButton(label: string): void {
    getDialogButton(label).click();
}

export async function selectDataType(label: string): Promise<void> {
    await openPicker(getCalculatedColumnDialog().querySelector('.ag-select')!);
    await clickSelectOption(label);
}
