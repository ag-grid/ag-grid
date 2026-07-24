/**
 * Remove empty hyperlink values while retaining the URI exactly as supplied.
 * @param value - User-provided hyperlink.
 * @returns A non-empty URI, or `undefined`.
 */
export function normaliseHyperlink(value: string | null | undefined): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
}
