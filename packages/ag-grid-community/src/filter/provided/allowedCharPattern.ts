import type { GridInputNumberField, GridInputTextField } from '../../widgets/gridWidgetTypes';

/**
 * Wrapping a character class again would only ever match two characters. No `g`, or `lastIndex` would
 * carry between the characters `test` is asked about one by one.
 */
export const compileCharPattern = (allowedCharPattern: string): RegExp | null => {
    const isCharClass = allowedCharPattern.startsWith('[') && allowedCharPattern.endsWith(']');
    try {
        return new RegExp(isCharClass ? allowedCharPattern : `[${allowedCharPattern}]`);
    } catch {
        return null; // Reported at configuration; not thrown, as this runs while the header and panel are built.
    }
};

/** Holds an input to the characters its column admits, sharing the pattern its column already compiled. */
export const installAllowedCharPattern = (
    field: GridInputTextField | GridInputNumberField,
    pattern: RegExp | null | undefined
): void => {
    if (!pattern) {
        return;
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
