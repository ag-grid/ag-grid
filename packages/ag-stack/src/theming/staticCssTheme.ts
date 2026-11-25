import type {
    StaticCssTheme,
    StaticCssThemeDefaults,
    StaticCssThemeOptions,
    StaticCssThemePart,
    _StaticCssThemeHooks,
} from './staticCssThemeTypes';
import { staticCssThemeBrand } from './staticCssThemeTypes';
import { kebabCase } from './themeUtils';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _STATIC_CSS_THEME_CLASS = 'ag-static-css-theme';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _STATIC_CSS_INHERIT_CLASS = 'ag-static-css-inherit';

/**
 * The CSS class that activates a part in static CSS themes, e.g. `tabStyleMaterial` => `ag-theme-part-tab-style-material`.
 * Passing a feature name, e.g. `tabStyle`, gives the prefix shared by all parts of that feature.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _themePartClass = (partOrFeatureName: string) => `ag-theme-part-${kebabCase(partOrFeatureName)}`;

/**
 * The CSS class that lets a part chosen in place of the theme's default override the theme's params, e.g. `ag-theme-override-tab-style-material`.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _themePartOverrideClass = (partName: string) => `ag-theme-override-${kebabCase(partName)}`;

/**
 * The name of a part in static CSS theme classes and files, e.g. `iconSet` and `quartzLight` give `icon-set-quartz-light`.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _staticCssPartName = (feature: string, value: string) => kebabCase(`${feature}-${value}`);

/**
 * The name, without `.css`, of the static CSS file with the grid's styles, `ag-grid` or `ag-grid-linked`.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _staticCssGridFile = (linked: boolean) => (linked ? 'ag-grid-linked' : 'ag-grid');

/**
 * The name, without `.css`, of the static CSS file for an icon set, e.g. `icon-set-quartz-light` or `icon-set-quartz-light-linked`.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _staticCssIconSetFile = (iconSet: string, linked: boolean) =>
    `${_staticCssPartName('iconSet', iconSet)}${linked ? '-linked' : ''}`;

/**
 * The parts of the Theming API theme that each `defaults` value names, in the order the themes add them.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _STATIC_CSS_THEME_DEFAULT_PARTS: {
    readonly [D in StaticCssThemeDefaults]: {
        readonly [P in StaticCssThemePart]-?: NonNullable<StaticCssThemeOptions[P]>;
    };
} = {
    quartz: {
        buttonStyle: 'quartz',
        checkboxStyle: 'default',
        colorScheme: 'variable',
        iconSet: 'quartzRegular',
        tabStyle: 'quartz',
        inputStyle: 'bordered',
        columnDropStyle: 'bordered',
    },
    alpine: {
        buttonStyle: 'alpine',
        checkboxStyle: 'default',
        colorScheme: 'variable',
        iconSet: 'alpine',
        tabStyle: 'alpine',
        inputStyle: 'bordered',
        columnDropStyle: 'bordered',
    },
    balham: {
        buttonStyle: 'balham',
        checkboxStyle: 'default',
        colorScheme: 'variable',
        iconSet: 'balham',
        tabStyle: 'rolodex',
        inputStyle: 'bordered',
        columnDropStyle: 'plain',
    },
    material: {
        buttonStyle: 'base',
        checkboxStyle: 'default',
        colorScheme: 'variable',
        iconSet: 'material',
        tabStyle: 'material',
        inputStyle: 'underlined',
        columnDropStyle: 'plain',
    },
};

class StaticCssThemeImpl implements _StaticCssThemeHooks {
    public readonly [staticCssThemeBrand] = true as const;
    private cssClasses?: [inheritClass: string, applyClass: string];

    constructor(public readonly options: Readonly<StaticCssThemeOptions>) {}

    public _getCssClasses(): [inheritClass: string, applyClass: string] {
        if (!this.cssClasses) {
            const { options } = this;
            const defaults = options.defaults ?? 'quartz';
            const defaultParts = _STATIC_CSS_THEME_DEFAULT_PARTS[defaults] ?? _STATIC_CSS_THEME_DEFAULT_PARTS.quartz;
            let applyClass = `${_STATIC_CSS_THEME_CLASS} ag-theme-${defaults}`;
            const features = Object.keys(defaultParts) as StaticCssThemePart[];
            for (let i = 0, len = features.length; i < len; ++i) {
                const feature = features[i];
                const chosen = options[feature];
                const partName = `${feature}-${chosen ?? defaultParts[feature]}`;
                const partClass = _themePartClass(partName);
                const linked = feature === 'iconSet' && options.useLinkedImages;
                applyClass += ' ' + (linked ? partClass + '-linked' : partClass);
                if (chosen != null && chosen !== defaultParts[feature]) {
                    applyClass += ' ' + _themePartOverrideClass(partName);
                }
            }
            this.cssClasses = [_STATIC_CSS_INHERIT_CLASS, applyClass];
        }
        return this.cssClasses;
    }
}

/**
 * Create a theme for applications that load the grid's CSS from static files rather than letting the
 * grid inject it, e.g. to meet a Content Security Policy. Load `ag-grid-community/css/ag-grid.css` yourself,
 * and the icon set's file if it is not `'quartzRegular'`, or with `useLinkedImages` the `-linked.css` files.
 *
 * @param options the theme to start from and parts to use in place of its own, e.g. `{ colorScheme: 'dark' }`
 */
export const staticCssTheme = (options: StaticCssThemeOptions = {}): StaticCssTheme =>
    new StaticCssThemeImpl({ ...options });
