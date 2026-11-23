// Custom property namespaces owned by the design system. A var() reference in
// one of these must resolve to a declaration somewhere in the website styles;
// anything else (e.g. --btn-roll-i) is component-local and left alone.
export const TOKEN_PREFIXES = ['--color-', '--text-', '--layout-', '--radius-', '--shadow-', '--spacing-'];

// Raw palette steps such as --color-gray-500. They do not change between light
// and dark mode, unlike the semantic (--color-fg-primary) and util
// (--color-util-gray-500) tokens built on top of them.
const PALETTE_TOKEN = /^--color-[a-z]+-\d+$/;

// Captures the variable name, and whether a Sass interpolation follows it
// (var(--color-code-#{$name})), which makes the full name unknowable statically.
const VAR_REFERENCE = /var\(\s*(--[\w-]*)(#\{)?/g;

export function findVarReferences(value) {
    return Array.from(value.matchAll(VAR_REFERENCE), (match) => ({
        name: match[1],
        interpolated: match[2] !== undefined,
    }));
}

// A doubled hyphen after the leading -- (---color-x, --text--fs-xl) is always a typo.
export function isMalformedToken(name) {
    return name.startsWith('---') || name.indexOf('--', 2) !== -1;
}

export function isTokenShaped(name) {
    return isMalformedToken(name) || TOKEN_PREFIXES.some((prefix) => name.startsWith(prefix));
}

export function isPaletteToken(name) {
    return PALETTE_TOKEN.test(name);
}
