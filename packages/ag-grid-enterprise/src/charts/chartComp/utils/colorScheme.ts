/**
 * Integrated charts are rendered to a canvas, so - unlike the rest of the grid - they cannot pick up
 * the grid's colour scheme from CSS. Without `chartThemes` the stock (light) chart themes are used
 * regardless, leaving a grid on a dark theme with a light chart beside it.
 *
 * The scheme is read back off the DOM rather than off the theme object, because a theme is not
 * always the source of truth for it: legacy CSS themes, `colorSchemeVariable` (which follows the
 * browser's preference) and application-level overrides of `--ag-background-color` all decide it
 * outside the theming API.
 */
import { _createElement } from 'ag-grid-community';

const AG_BACKGROUND_COLOR = '--ag-background-color';

/** Above this relative luminance (0 black, 255 white) the background counts as light. */
const LIGHT_LUMINANCE_THRESHOLD = 128;

/** Below this alpha the background shows whatever is behind it, so it says nothing about the scheme. */
const MIN_OPAQUE_ALPHA = 0.5;

/**
 * Whether the grid renders against a dark background, or `undefined` when it cannot be determined -
 * no element, no grid background, or an environment that does not resolve CSS variables (jsdom).
 */
export function isDarkColorScheme(element: HTMLElement | null | undefined): boolean | undefined {
    const view = element?.ownerDocument?.defaultView;
    if (!view) {
        return undefined;
    }

    const rgb = parseRgb(resolveBackgroundColor(view, element));

    return rgb ? getRelativeLuminance(rgb) < LIGHT_LUMINANCE_THRESHOLD : undefined;
}

/**
 * The dark variants of the stock chart themes, for theme names that have one. A name without a dark
 * variant - a custom theme, or one this version of AG Charts does not ship - is left alone.
 */
export function toDarkThemeNames(themeNames: string[], stockThemes: Record<string, unknown>): string[] {
    return themeNames.map((themeName) => {
        const darkName = `${themeName}-dark`;
        return themeName.endsWith('-dark') || !(darkName in stockThemes) ? themeName : darkName;
    });
}

/**
 * The grid's background colour as the browser resolves it. `--ag-background-color` is emitted as
 * authored - `hsl()`, `color-mix()`, a `var()` chain - so it is only readable as a colour by painting
 * it onto an element and asking for the computed value.
 */
function resolveBackgroundColor(view: Window, element: HTMLElement): string {
    const probe = _createElement({ tag: 'span' });
    // The probe must be in the tree to inherit the grid's variables, but must not be seen or measured.
    probe.style.cssText = 'position:absolute;left:-99999px;top:-99999px;visibility:hidden';
    probe.style.setProperty('background-color', `var(${AG_BACKGROUND_COLOR})`);

    element.appendChild(probe);
    const background = view.getComputedStyle(probe).backgroundColor;
    probe.remove();

    return background;
}

/** Rec. 709 coefficients - a perceptual approximation, enough to answer "is this dark or light". */
function getRelativeLuminance([r, g, b]: [number, number, number]): number {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** `rgb()` and `rgba()` are the only forms a computed background colour takes. */
function parseRgb(color: string): [number, number, number] | undefined {
    const channels = /^rgba?\(([^)]*)\)$/i
        .exec(color)?.[1]
        .split(/[\s,/]+/)
        .filter((part) => part !== '');
    if (!channels || channels.length < 3) {
        return undefined;
    }

    if (channels[3] !== undefined && parseFloat(channels[3]) < MIN_OPAQUE_ALPHA) {
        return undefined;
    }

    const rgb = channels.slice(0, 3).map((channel) => parseFloat(channel));

    return rgb.some((value) => !isFinite(value)) ? undefined : (rgb as [number, number, number]);
}
