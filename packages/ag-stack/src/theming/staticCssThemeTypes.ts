export type StaticCssThemeName = 'quartz' | 'alpine' | 'balham' | 'material';

/**
 * Options for `staticCssTheme`. Each part option names a Theming API part without its feature prefix,
 * e.g. `iconSet: 'quartzLight'` is `iconSetQuartzLight`, and replaces the part that `theme` uses.
 */
export interface StaticCssThemeOptions {
    /**
     * The Theming API theme whose parameters and parts this theme starts from, e.g. `'alpine'` for `themeAlpine`.
     * @default 'quartz'
     */
    theme?: StaticCssThemeName;
    buttonStyle?: 'base' | 'quartz' | 'alpine' | 'balham';
    checkboxStyle?: 'default';
    colorScheme?: 'variable' | 'light' | 'lightCold' | 'lightWarm' | 'dark' | 'darkBlue' | 'darkWarm';
    columnDropStyle?: 'bordered' | 'plain';
    /** Icon sets other than `'quartzRegular'` need their CSS file loading, e.g. `icon-set-quartz-light.css` for `'quartzLight'`. */
    iconSet?: 'quartzRegular' | 'quartzLight' | 'quartzBold' | 'alpine' | 'balham' | 'material';
    inputStyle?: 'base' | 'bordered' | 'underlined';
    tabStyle?: 'base' | 'quartz' | 'alpine' | 'material' | 'rolodex';
    /**
     * Use the CSS files that load each image as a separate SVG file, `ag-grid-linked.css` and `icon-set-*-linked.css`,
     * rather than the files with images embedded as data URLs.
     * @default false
     */
    useLinkedImages?: boolean;
}

/**
 * The options of `staticCssTheme` that choose a part.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type StaticCssThemePart = Exclude<keyof StaticCssThemeOptions, 'theme' | 'useLinkedImages'>;

export const staticCssThemeBrand: unique symbol = Symbol();

/** A theme whose CSS the application loads from the static files in `ag-grid-community/css`, created with `staticCssTheme`. */
export interface StaticCssTheme {
    readonly [staticCssThemeBrand]: true;
}

/** What the grid uses of a static CSS theme, typed as an interface so that code checking for one doesn't bundle the class. */
export interface _StaticCssThemeHooks extends StaticCssTheme {
    readonly options: Readonly<StaticCssThemeOptions>;
    _getCssClasses(): [inheritClass: string, applyClass: string];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _isStaticCssTheme = (theme: unknown): theme is _StaticCssThemeHooks =>
    typeof theme === 'object' && theme !== null && staticCssThemeBrand in theme;
