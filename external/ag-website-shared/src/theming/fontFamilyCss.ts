// Generic families and CSS-wide keywords are only keywords when unquoted -
// `serif` is the generic family, `"serif"` is a font actually named "serif".
const CSS_FONT_KEYWORDS = new Set([
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
    'ui-serif',
    'ui-sans-serif',
    'ui-monospace',
    'ui-rounded',
    'math',
    'emoji',
    'fangsong',
    'inherit',
    'initial',
    'unset',
    'revert',
    'revert-layer',
]);

interface FontFamily {
    name: string;
    quoted: boolean;
}

/**
 * Split a CSS font-family list into its families. Commas inside quotes or
 * inside a function such as `var(--a, b)` separate nothing, so they are not
 * treated as list separators.
 */
export const parseFontFamilyList = (css: string): FontFamily[] => {
    const families: FontFamily[] = [];
    let name = '';
    let quoted = false;
    let quote: string | null = null;
    let depth = 0;

    const pushFamily = () => {
        // Whitespace between the identifiers of an unquoted name is not
        // significant, but inside a quoted name it is part of the name.
        families.push({ name: quoted ? name : name.trim().replace(/\s+/g, ' '), quoted });
        name = '';
        quoted = false;
    };

    for (let i = 0, len = css.length; i < len; ++i) {
        const char = css[i];
        if (quote != null) {
            if (char === '\\' && i + 1 < len) {
                name += css[++i];
            } else if (char === quote) {
                quote = null;
            } else {
                name += char;
            }
        } else if (char === '"' || char === "'") {
            quote = char;
            quoted = true;
            if (name.trim() === '') {
                name = '';
            }
        } else if (char === '(') {
            ++depth;
            name += char;
        } else if (char === ')') {
            --depth;
            name += char;
        } else if (char === ',' && depth === 0) {
            pushFamily();
        } else {
            name += char;
        }
    }
    pushFamily();

    return families;
};

/**
 * Canonical form of a CSS font-family list, for comparing two lists that name
 * the same fonts. Quoting a name that does not need it does not change which
 * font it selects, so `"DM Sans", sans-serif` and `DM Sans, sans-serif`
 * normalise alike - but quoting that does change the meaning is preserved.
 */
export const normaliseFontFamilyList = (css: string): string =>
    parseFontFamilyList(css)
        .map(({ name, quoted }) =>
            !quoted && CSS_FONT_KEYWORDS.has(name.toLowerCase()) ? `keyword:${name}` : `name:${name}`
        )
        .join(',');
