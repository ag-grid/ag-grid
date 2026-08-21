import type { BeanCollection } from '../../context/context';
import type { GridInputNumberField, GridInputTextField } from '../../widgets/gridWidgetTypes';

/** Holds an input to the characters its column admits. */
export const installAllowedCharPattern = (
    field: GridInputTextField | GridInputNumberField,
    allowedCharPattern: string | null | undefined,
    beans: BeanCollection
): void => {
    if (!allowedCharPattern) {
        return;
    }
    // Wrapping a character class again would only ever match two characters. No `g`, or `lastIndex` would
    // carry between the characters `test` is asked about one by one.
    const isCharClass = allowedCharPattern.startsWith('[') && allowedCharPattern.endsWith(']');
    let pattern: RegExp;
    try {
        pattern = new RegExp(isCharClass ? allowedCharPattern : `[${allowedCharPattern}]`);
    } catch {
        beans.log.warn(327, { pattern: allowedCharPattern });
        return; // Not thrown: this runs while the header and the filter panel are built.
    }

    field.addManagedElementListeners(field.getInputElement(), {
        beforeinput: (e: InputEvent) => {
            const inputType = e.inputType;
            // A deletion brings nothing in, and a composition cannot be cancelled, so an IME is not held to it.
            if (!inputType?.startsWith('insert') || inputType === 'insertCompositionText') {
                return;
            }
            // Paste and drop carry their text on the transfer, leaving `data` empty or absent by browser.
            const inserted = e.data || e.dataTransfer?.getData('text/plain');
            if (!inserted || !e.cancelable) {
                return;
            }
            for (const char of inserted) {
                if (!pattern.test(char)) {
                    e.preventDefault();
                    return;
                }
            }
        },
    });
};
