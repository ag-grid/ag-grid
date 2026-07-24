export const MENU_ITEM_SEPARATOR = 'separator';

/**
 * Collapse repeated separators and drop any stranded at the start or end of the list. Mutates in place.
 */
export function _normaliseSeparators<T>(array: T[], separator: T) {
    if (!array?.length) {
        return;
    }

    let writeIndex = 0;
    let lastItemWasSeparator = true;

    for (const item of array) {
        const isSeparator = item === separator;

        if (isSeparator && lastItemWasSeparator) {
            continue;
        }

        array[writeIndex++] = item;
        lastItemWasSeparator = isSeparator;
    }

    if (writeIndex > 0 && array[writeIndex - 1] === separator) {
        writeIndex--;
    }

    array.length = writeIndex;
}
