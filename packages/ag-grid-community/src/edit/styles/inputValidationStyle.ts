import type { GridInputDateField } from '../../widgets/gridWidgetTypes';

export const INPUT_INVALID_CLASS = 'ag-cell-editor-input-invalid';

export function _addDateInputValidationStyleListeners(eEditor: GridInputDateField, eCell: HTMLElement): void {
    const input = eEditor.getInputElement();
    const refresh = () => _refreshDateInputValidationStyle(eCell, input);
    eEditor.addManagedElementListeners(input, {
        input: refresh,
        change: refresh,
        // Firefox can change segment validity without an input event.
        keyup: refresh,
        focus: refresh,
        blur: refresh,
    });
    eEditor.addDestroyFunc(() => eCell.classList.remove(INPUT_INVALID_CLASS));
    refresh();
}

export function _refreshDateInputValidationStyle(eCell: HTMLElement, input: HTMLInputElement): void {
    eCell.classList.toggle(INPUT_INVALID_CLASS, !input.validity.valid);
}
