// Reads the design system's custom properties straight out of the live stylesheet.
//
// The previous style guide listed every token name in hand-written arrays, which meant the page
// silently fell behind `_root.scss` whenever a token was added - by the time this was written it
// was missing the green scale, the dev scale, `--color-bg-tertiary`, the logo/positive/negative
// colours, the text and code colours, and every link token. Scanning the stylesheet instead makes
// omission impossible: if a token exists, it shows up.
import { parseColour, toHex } from './colour';
import type { Rgb } from './colour';

export type Theme = 'light' | 'dark';

export interface Token {
    /** Full custom property name, including the leading `--`. */
    name: string;
    /** Name with the group prefix stripped, for display: `--color-gray-500` -> `gray-500`. */
    label: string;
    /** Author value as written in the stylesheet, e.g. `var(--color-white)`. */
    raw: Record<Theme, string | undefined>;
    /**
     * Author value with every `var()` reference substituted, e.g.
     * `color-mix(in srgb, #182230, #101828 50%)`. This is what gets handed to the browser to
     * resolve, and it lets the dark value be computed without flipping the page into dark mode.
     */
    substituted: Record<Theme, string | undefined>;
}

export interface ResolvedToken extends Token {
    /** Browser-computed value per theme, e.g. `rgb(255, 255, 255)`. */
    computed: Record<Theme, string | undefined>;
    /** Parsed sRGB per theme; undefined when the token is not a colour. */
    rgb: Record<Theme, Rgb | undefined>;
    /** Hex per theme, for handing to a designer. */
    hex: Record<Theme, string | undefined>;
    /** The chain of token names walked to reach a literal, excluding this token. */
    aliasChain: Record<Theme, string[]>;
}

const LIGHT_SELECTOR = ':root';
const DARK_SELECTOR = '[data-dark-mode="true"]';

const isStyleRule = (rule: CSSRule): rule is CSSStyleRule => rule.type === CSSRule.STYLE_RULE;

/**
 * Normalises attribute-selector quoting before matching.
 *
 * `_root.scss` writes the dark selector with single quotes, but `selectorText` is the browser's
 * *serialisation* of the parsed selector, and browsers re-emit attribute values with double
 * quotes. Matching the source spelling therefore never fires, and every dark value silently falls
 * back to its light counterpart - which looks correct for the abstract palette, where the two
 * genuinely are the same, and is wrong everywhere else.
 */
const normaliseSelector = (selectorText: string): string => selectorText.replace(/'/g, '"');

/**
 * Collects every custom property declared by rules matching `selectorMatch`.
 *
 * Later declarations win, mirroring the cascade for rules of equal specificity. Cross-origin
 * sheets throw on `cssRules` access, so those are skipped rather than allowed to abort the scan.
 *
 * Declarations inside a conditional group (`@media`, `@supports`) are deliberately *not*
 * collected. The design system uses one - the wide-viewport `--layout-horizontal-margins`
 * override - and picking it up would report a value that only applies above 920px as though it
 * were the token's value. The base declaration is the token; responsive overrides are documented
 * in prose instead.
 */
const collectDeclarations = (selectorMatch: (selectorText: string) => boolean): Map<string, string> => {
    const declarations = new Map<string, string>();

    const visit = (rules: CSSRuleList) => {
        for (let i = 0; i < rules.length; ++i) {
            const rule = rules[i];

            if (!isStyleRule(rule) || !selectorMatch(normaliseSelector(rule.selectorText))) {
                continue;
            }

            const { style } = rule;
            for (let j = 0; j < style.length; ++j) {
                const property = style[j];
                if (property.startsWith('--')) {
                    declarations.set(property, style.getPropertyValue(property).trim());
                }
            }
        }
    };

    for (const sheet of Array.from(document.styleSheets)) {
        try {
            visit(sheet.cssRules);
        } catch {
            // Cross-origin sheet - nothing of ours lives there.
        }
    }

    return declarations;
};

const VAR_PATTERN = /var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/;

/**
 * Substitutes `var()` references using `primary`, falling back to `fallback` (the light map) so a
 * dark-mode token that aliases a value only declared in `:root` still resolves.
 *
 * Returns the substituted string plus the token names visited, which is the alias chain the guide
 * shows so a developer can see `--color-bg-primary -> --color-white -> #fff` at a glance.
 */
const substituteVars = (
    value: string,
    primary: Map<string, string>,
    fallback: Map<string, string>
): { value: string; chain: string[] } => {
    const chain: string[] = [];
    const seen = new Set<string>();
    let current = value;

    // Bounded so a circular alias cannot spin here; the design system has none, but a malformed
    // token should degrade to a visible half-substituted string rather than hang the page.
    for (let depth = 0; depth < 32; ++depth) {
        const match = VAR_PATTERN.exec(current);
        if (!match) {
            break;
        }

        const [expression, name, inlineFallback] = match;
        const referenced = primary.get(name) ?? fallback.get(name) ?? inlineFallback?.trim();

        if (referenced == null || seen.has(name)) {
            // Unresolvable or circular: leave the `var()` in place so it is visibly unresolved.
            break;
        }

        seen.add(name);
        chain.push(name);
        current = current.replace(expression, referenced);
    }

    return { value: current, chain };
};

/** Strips the conventional group prefix from a token name for display. */
const labelFor = (name: string): string => name.replace(/^--(color|text|layout|radius|shadow|icon)-/, '');

/**
 * Builds the token list for both themes in one pass. Call once on mount - it touches every
 * stylesheet rule, so it is not something to run per render.
 */
export const readTokens = (): Token[] => {
    const light = collectDeclarations((selector) => selector.includes(LIGHT_SELECTOR));
    const dark = collectDeclarations((selector) => selector.includes(DARK_SELECTOR));

    const names = Array.from(new Set([...light.keys(), ...dark.keys()])).sort();

    return names.map((name) => {
        const lightRaw = light.get(name);
        const darkRaw = dark.get(name) ?? lightRaw;

        return {
            name,
            label: labelFor(name),
            raw: { light: lightRaw, dark: dark.get(name) },
            substituted: {
                light: lightRaw == null ? undefined : substituteVars(lightRaw, light, light).value,
                dark: darkRaw == null ? undefined : substituteVars(darkRaw, dark, light).value,
            },
        };
    });
};

/**
 * Resolves each token's value through the browser and parses the result as a colour.
 *
 * Values are pushed through a probe element's `background-color` rather than read from
 * `:root`, because that is the only way to get a computed value for the *dark* theme while the
 * page is still in light mode (and vice versa) - the substituted string has no `var()` left in
 * it, so it no longer depends on which theme is active.
 */
export const resolveTokens = (tokens: Token[]): ResolvedToken[] => {
    const probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
    document.body.appendChild(probe);

    const light = new Map(tokens.map((token) => [token.name, token.raw.light ?? '']));
    const dark = new Map(tokens.map((token) => [token.name, token.raw.dark ?? token.raw.light ?? '']));

    const compute = (value: string | undefined): string | undefined => {
        if (value == null || value.includes('var(')) {
            return undefined;
        }
        // A value the browser rejects leaves the previous computed colour in place, so clear
        // first and treat an unchanged empty result as "not a colour".
        probe.style.backgroundColor = '';
        probe.style.backgroundColor = value;
        if (probe.style.backgroundColor === '') {
            return undefined;
        }
        return getComputedStyle(probe).backgroundColor;
    };

    try {
        return tokens.map((token) => {
            const computedLight = compute(token.substituted.light);
            const computedDark = compute(token.substituted.dark);
            const rgbLight = computedLight == null ? undefined : parseColour(computedLight);
            const rgbDark = computedDark == null ? undefined : parseColour(computedDark);

            return {
                ...token,
                computed: { light: computedLight, dark: computedDark },
                rgb: { light: rgbLight, dark: rgbDark },
                hex: { light: rgbLight && toHex(rgbLight), dark: rgbDark && toHex(rgbDark) },
                aliasChain: {
                    light: token.raw.light ? substituteVars(token.raw.light, light, light).chain : [],
                    dark: token.raw.dark ? substituteVars(token.raw.dark, dark, light).chain : [],
                },
            };
        });
    } finally {
        probe.remove();
    }
};

/** Tokens whose name starts with `prefix`, in declaration-name order. */
export const withPrefix = <T extends Token>(tokens: T[], prefix: string): T[] =>
    tokens.filter((token) => token.name.startsWith(prefix));

/**
 * Tokens matching `prefix` but excluding any that also match one of `except`. Used to pull, say,
 * the abstract `--color-gray-*` scale apart from the `--color-util-gray-*` aliases.
 */
export const withPrefixExcept = <T extends Token>(tokens: T[], prefix: string, except: string[]): T[] =>
    withPrefix(tokens, prefix).filter((token) => !except.some((excluded) => token.name.startsWith(excluded)));

/** True when the token resolved to a colour in at least one theme. */
export const isColourToken = (token: ResolvedToken): boolean => token.rgb.light != null || token.rgb.dark != null;
