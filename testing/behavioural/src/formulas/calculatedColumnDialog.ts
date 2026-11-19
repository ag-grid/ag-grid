// The calculated-column dialog as a user drives it; no grid manager, so each harness can share it.
import { getByRole } from '@testing-library/dom';
import { clickSelectOption, openPicker } from 'ag-test-utils';

/** The most recently opened dialog: a live-apply dialog stays open after Apply. */
export function getCalculatedColumnDialog(): HTMLElement {
    const dialogs = document.querySelectorAll<HTMLElement>('.ag-calculated-column-form');
    expect(dialogs.length).toBeGreaterThan(0);
    return dialogs[dialogs.length - 1];
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
