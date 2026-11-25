import type { StaticCssThemeOptions, StaticCssThemePart } from 'ag-stack';
import { _STATIC_CSS_THEME_DEFAULT_PARTS, _staticCssIconSetFile } from 'ag-stack';

/**
 * Legacy theme variables that Theming API themes do not read, mapped to the variable that replaces
 * them, or null where there is none. Variables that both theming systems read must never be listed here.
 */
const LEGACY_ONLY_VARIABLES: Record<string, string | null> = {
    '--ag-grid-size': '--ag-spacing',
    '--ag-active-color': '--ag-accent-color',
    '--ag-alpine-active-color': '--ag-accent-color',
    '--ag-balham-active-color': '--ag-accent-color',
    '--ag-material-accent-color': '--ag-accent-color',
    '--ag-material-primary-color': '--ag-primary-color',
    '--ag-advanced-filter-column-pill-color': '--ag-advanced-filter-builder-column-pill-color',
    '--ag-advanced-filter-join-pill-color': '--ag-advanced-filter-builder-join-pill-color',
    '--ag-advanced-filter-option-pill-color': '--ag-advanced-filter-builder-option-pill-color',
    '--ag-advanced-filter-value-pill-color': '--ag-advanced-filter-builder-value-pill-color',
    '--ag-borders': null,
    '--ag-borders-critical': null,
    '--ag-borders-input': '--ag-input-border',
    '--ag-borders-input-invalid': '--ag-input-invalid-border',
    '--ag-borders-secondary': null,
    '--ag-borders-side-button': null,
    '--ag-card-radius': '--ag-border-radius',
    '--ag-cell-horizontal-border': '--ag-column-border',
    '--ag-chart-menu-pill-select-button-color': null,
    '--ag-checkbox-background-color': null,
    '--ag-checkbox-checked-color': null,
    '--ag-checkbox-indeterminate-color': null,
    '--ag-checkbox-unchecked-color': null,
    '--ag-chip-background-color': '--ag-column-drop-cell-background-color',
    '--ag-chip-border-color': '--ag-column-drop-cell-border',
    '--ag-control-panel-background-color': '--ag-chrome-background-color',
    '--ag-data-color': '--ag-cell-text-color',
    '--ag-disabled-foreground-color': null,
    '--ag-filter-tool-panel-sub-level-row-height': null,
    '--ag-formula-token-1-border-color': '--ag-formula-token-1-border',
    '--ag-formula-token-2-border-color': '--ag-formula-token-2-border',
    '--ag-formula-token-3-border-color': '--ag-formula-token-3-border',
    '--ag-formula-token-4-border-color': '--ag-formula-token-4-border',
    '--ag-formula-token-5-border-color': '--ag-formula-token-5-border',
    '--ag-formula-token-6-border-color': '--ag-formula-token-6-border',
    '--ag-formula-token-7-border-color': '--ag-formula-token-7-border',
    '--ag-full-row-invalid-background-color': '--ag-full-row-edit-invalid-background-color',
    '--ag-header-column-resize-handle-display': '--ag-header-column-resize-handle-color',
    '--ag-header-column-separator-color': '--ag-header-column-border',
    '--ag-header-column-separator-display': '--ag-header-column-border',
    '--ag-header-column-separator-height': '--ag-header-column-border-height',
    '--ag-header-column-separator-width': '--ag-header-column-border',
    '--ag-header-foreground-color': '--ag-header-text-color',
    '--ag-icon-font-color': null,
    '--ag-icon-font-family': null,
    '--ag-icon-font-weight': null,
    '--ag-icon-image': null,
    '--ag-icon-image-display': null,
    '--ag-input-border-color': '--ag-input-border',
    '--ag-input-border-color-invalid': '--ag-input-invalid-border',
    '--ag-input-disabled-border-color': '--ag-input-disabled-border',
    '--ag-input-error-focus-box-shadow': '--ag-focus-error-shadow',
    '--ag-input-focus-border-color': '--ag-input-focus-border',
    '--ag-input-focus-box-shadow': '--ag-input-focus-shadow',
    '--ag-menu-border-color': '--ag-menu-border',
    '--ag-menu-min-width': null,
    '--ag-minichart-selected-chart-color': null,
    '--ag-minichart-selected-page-color': null,
    '--ag-panel-border-color': '--ag-dialog-border',
    '--ag-quartz-icon-active-color': '--ag-focus-shadow',
    '--ag-quartz-icon-hover-color': '--ag-icon-button-hover-background-color',
    '--ag-range-selection-background-color-2': null,
    '--ag-range-selection-background-color-3': null,
    '--ag-range-selection-background-color-4': null,
    '--ag-row-border-color': '--ag-row-border',
    '--ag-row-border-style': '--ag-row-border',
    '--ag-row-border-width': '--ag-row-border',
    '--ag-secondary-border-color': null,
    '--ag-secondary-foreground-color': null,
    '--ag-selected-row-checkbox-background-color': null,
    '--ag-selected-row-checkbox-checked-color': null,
    '--ag-selected-row-checkbox-indeterminate-color': null,
    '--ag-selected-row-checkbox-unchecked-color': null,
    '--ag-selected-tab-underline-color': '--ag-tab-selected-underline-color',
    '--ag-selected-tab-underline-transition-speed': '--ag-tab-selected-underline-transition-duration',
    '--ag-selected-tab-underline-width': '--ag-tab-selected-underline-width',
    '--ag-spectrum-alpha-background-checked': null,
    '--ag-subheader-background-color': null,
    '--ag-subheader-toolbar-background-color': null,
    '--ag-tab-min-width': null,
    '--ag-toggle-button-border-width': null,
    '--ag-toggle-button-off-border-color': null,
    '--ag-toggle-button-on-border-color': null,
    '--ag-toggle-button-switch-border-color': null,
    '--ag-toggle-button-switch-border-width': null,
    '--ag-toolbar-separator-color': '--ag-toolbar-separator-border',
    '--ag-toolbar-separator-width': '--ag-toolbar-separator-border',
    '--ag-tooltip-error-border-color': '--ag-tooltip-error-border',
};

type ValueSet<T extends string> = { readonly [K in T]: true };

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _STATIC_CSS_THEME_PARTS: {
    readonly [F in StaticCssThemePart]-?: ValueSet<NonNullable<StaticCssThemeOptions[F]>>;
} = {
    buttonStyle: { base: true, quartz: true, alpine: true, balham: true },
    checkboxStyle: { default: true },
    colorScheme: {
        variable: true,
        light: true,
        lightCold: true,
        lightWarm: true,
        dark: true,
        darkBlue: true,
        darkWarm: true,
    },
    columnDropStyle: { bordered: true, plain: true },
    iconSet: { quartzRegular: true, quartzLight: true, quartzBold: true, alpine: true, balham: true, material: true },
    inputStyle: { base: true, bordered: true, underlined: true },
    tabStyle: { base: true, quartz: true, alpine: true, material: true, rolodex: true },
};

const NON_PART_OPTIONS: ValueSet<Exclude<keyof StaticCssThemeOptions, StaticCssThemePart>> = {
    defaults: true,
    useLinkedImages: true,
};

const has = (values: object, key: string) => Object.prototype.hasOwnProperty.call(values, key);
const formatValues = (values: object) => `\`${Object.keys(values).join('`, `')}\``;

/** The options passed to `staticCssTheme` that name no option, theme or part, in the form reported to the user. */
export function _findInvalidStaticCssThemeValues(
    options: Readonly<StaticCssThemeOptions>
): { option: string; value: string; valid: string }[] {
    const invalid: { option: string; value: string; valid: string }[] = [];
    const { defaults } = options;
    if (defaults != null && !has(_STATIC_CSS_THEME_DEFAULT_PARTS, defaults)) {
        invalid.push({ option: '`defaults`', value: defaults, valid: formatValues(_STATIC_CSS_THEME_DEFAULT_PARTS) });
    }
    const values = options as Readonly<Record<string, unknown>>;
    const keys = Object.keys(values);
    for (let i = 0, len = keys.length; i < len; ++i) {
        const key = keys[i];
        const value = values[key];
        const isPart = has(_STATIC_CSS_THEME_PARTS, key);
        if (!isPart && !has(NON_PART_OPTIONS, key)) {
            invalid.push({
                option: 'option',
                value: key,
                valid: formatValues({ ...NON_PART_OPTIONS, ..._STATIC_CSS_THEME_PARTS }),
            });
        } else if (isPart && value != null && !has(_STATIC_CSS_THEME_PARTS[key as StaticCssThemePart], String(value))) {
            invalid.push({
                option: `\`${key}\``,
                value: String(value),
                valid: formatValues(_STATIC_CSS_THEME_PARTS[key as StaticCssThemePart]),
            });
        }
    }
    return invalid;
}

/**
 * The icon set that a static CSS theme uses and the name of its CSS file, if the file's marker variable
 * is missing from `style`. Undefined if the file is loaded, or if the theme names no valid icon set.
 */
export function _findMissingIconSetFile(
    options: Readonly<StaticCssThemeOptions>,
    style: CSSStyleDeclaration
): { iconSet: string; linked: boolean; file: string } | undefined {
    const defaultParts = _STATIC_CSS_THEME_DEFAULT_PARTS[options.defaults ?? 'quartz'];
    const iconSet = options.iconSet ?? defaultParts?.iconSet;
    if (!iconSet || !has(_STATIC_CSS_THEME_PARTS.iconSet, iconSet)) {
        return undefined;
    }
    const linked = !!options.useLinkedImages;
    const file = _staticCssIconSetFile(iconSet, linked);
    return style.getPropertyValue(`--ag-static-css-${file}-loaded`) ? undefined : { iconSet, linked, file };
}

/**
 * Returns the legacy-only theme variables set on the given element, each paired with the Theming
 * API variable that replaces it, in the form reported to the user. Empty if none are set.
 */
export function _findLegacyOnlyVariables(eRootDiv: HTMLElement): string[] {
    const style = getComputedStyle(eRootDiv);
    const replacements: string[] = [];
    for (const legacyName of Object.keys(LEGACY_ONLY_VARIABLES)) {
        if (style.getPropertyValue(legacyName).trim()) {
            const replacement = LEGACY_ONLY_VARIABLES[legacyName];
            const advice = replacement ? 'use ' + replacement : 'no equivalent';
            replacements.push(`${legacyName} (${advice})`);
        }
    }
    return replacements;
}
