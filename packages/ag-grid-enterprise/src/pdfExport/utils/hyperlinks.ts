const SUPPORTED_URI_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

/**
 * Remove empty or unsupported hyperlink values while retaining accepted URIs exactly as supplied.
 * @param value - User-provided hyperlink.
 * @returns A supported external URI, or `undefined`.
 */
export function normaliseHyperlink(value: string | null | undefined): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmedValue = value.trim();
    const scheme = /^([a-z][a-z\d+.-]*):/i.exec(trimmedValue)?.[1].toLowerCase();
    return scheme && SUPPORTED_URI_SCHEMES.has(scheme) ? value : undefined;
}
