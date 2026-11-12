import type { AccentedSortOptions } from '../../interfaces/iSort';

/** Checks `accentedSort` is a boolean, or an object `Intl.Collator` accepts (an invalid locale tag throws a `RangeError`). */
export function validateAccentedSort(
    property: string,
    value: boolean | AccentedSortOptions | undefined
): string | null {
    if (value == null || typeof value === 'boolean') {
        return null;
    }
    if (typeof value !== 'object') {
        return `${property} must be a boolean or an object with \`locales\` and \`options\`, currently it is ${typeof value}.`;
    }
    try {
        new Intl.Collator(value.locales, value.options);
        return null;
    } catch (e) {
        return `${property} could not create an \`Intl.Collator\` (${(e as Error)?.message}), so the browser's default locale is used.`;
    }
}
