/**
 * The curated editor layout. Value type and default are derived by the shared
 * layer, so only presentation hints live here. Every public param must appear in
 * exactly one group, which `params.test.ts` asserts so that a new API param
 * cannot quietly go missing from the builder.
 */
import { paramToVariableName } from '@ag-website-shared/theming/utils';

import { CHARTS_PARAM_DEFAULTS, PUBLIC_PARAM_NAMES } from './chartsTheme';

export type LengthIcon = 'radius' | 'verticalSpacing' | 'horizontalSpacing';

/** Named because the preview watches for it, to hold a tooltip open. See `editedGroup.ts`. */
export const TOOLTIPS_GROUP_ID = 'tooltips';

export interface ChartsParamConfig {
    key: string;
    label: string;
    icon?: LengthIcon;
    swipeAdjustmentDivisor?: number;
    /** Clamp for length editors (px). Colour and font params ignore these. */
    min?: number;
    max?: number;
}

export interface ChartsParamGroup {
    id: string;
    label: string;
    /** Groups past the essentials start collapsed to keep the panel scannable. */
    collapsed?: boolean;
    params: ChartsParamConfig[];
}

export const PARAM_GROUPS: ChartsParamGroup[] = [
    {
        id: 'general',
        label: 'General',
        params: [
            { key: 'fontFamily', label: 'Font Family' },
            { key: 'fontSize', label: 'Font Size', min: 8, max: 24 },
            { key: 'fontWeight', label: 'Font Weight' },
            { key: 'backgroundColor', label: 'Background Color' },
            { key: 'foregroundColor', label: 'Foreground Color' },
            { key: 'accentColor', label: 'Accent Color' },
            { key: 'chartPadding', label: 'Chart Padding', icon: 'horizontalSpacing', min: 0, max: 60 },
            {
                key: 'borderRadius',
                label: 'Border Radius',
                icon: 'radius',
                swipeAdjustmentDivisor: 20,
                min: 0,
                max: 24,
            },
            { key: 'textColor', label: 'Text Color' },
            { key: 'subtleTextColor', label: 'Subtle Text Color' },
            // Follows the background colour by default, so it sits beside it.
            { key: 'chartBackgroundColor', label: 'Chart Background' },
        ],
    },
    {
        id: 'axes',
        label: 'Axes & Grid',
        params: [
            { key: 'axisLineColor', label: 'Axis Line Color' },
            { key: 'gridLineColor', label: 'Grid Line Color' },
            { key: 'groupedCategoryLineColor', label: 'Grouped Category Line' },
            { key: 'crosshairLabelBackgroundColor', label: 'Crosshair Label Background' },
            { key: 'crosshairLabelTextColor', label: 'Crosshair Label Text' },
        ],
    },
    {
        id: 'borders',
        label: 'Borders & Spacing',
        params: [
            { key: 'borderColor', label: 'Border Color' },
            { key: 'borderWidth', label: 'Border Width', min: 0, max: 8 },
        ],
    },
    {
        id: 'ui',
        label: 'UI Elements',
        collapsed: true,
        params: [
            { key: 'chromeBackgroundColor', label: 'Background Color' },
            { key: 'chromeTextColor', label: 'Text Color' },
            { key: 'chromeSubtleTextColor', label: 'Subtle Text Color' },
            { key: 'chromeFontFamily', label: 'Font Family' },
            { key: 'chromeFontSize', label: 'Font Size', min: 8, max: 24 },
            { key: 'chromeFontWeight', label: 'Font Weight' },
            { key: 'menuBackgroundColor', label: 'Menu Background' },
            { key: 'menuTextColor', label: 'Menu Text' },
            { key: 'menuBorder', label: 'Menu Border' },
            { key: 'menuBorderRadius', label: 'Menu Radius', icon: 'radius', min: 0, max: 24 },
            { key: 'panelBackgroundColor', label: 'Panel Background' },
            { key: 'panelSubtleTextColor', label: 'Panel Subtle Text' },
        ],
    },
    {
        id: TOOLTIPS_GROUP_ID,
        label: 'Tooltips',
        collapsed: true,
        params: [
            { key: 'tooltipBackgroundColor', label: 'Background Color' },
            { key: 'tooltipTextColor', label: 'Text Color' },
            { key: 'tooltipSubtleTextColor', label: 'Subtle Text Color' },
            { key: 'tooltipBorder', label: 'Border' },
            { key: 'tooltipBorderRadius', label: 'Border Radius', icon: 'radius', min: 0, max: 24 },
        ],
    },
    {
        id: 'controls',
        label: 'Buttons & Inputs',
        collapsed: true,
        params: [
            { key: 'buttonBackgroundColor', label: 'Button Background' },
            { key: 'buttonTextColor', label: 'Button Text' },
            { key: 'buttonBorder', label: 'Button Border' },
            { key: 'buttonBorderRadius', label: 'Button Radius', icon: 'radius', min: 0, max: 24 },
            { key: 'buttonFontWeight', label: 'Button Font Weight' },
            { key: 'inputBackgroundColor', label: 'Input Background' },
            { key: 'inputTextColor', label: 'Input Text' },
            { key: 'inputBorder', label: 'Input Border' },
            { key: 'inputBorderRadius', label: 'Input Radius', icon: 'radius', min: 0, max: 24 },
        ],
    },
    {
        id: 'effects',
        label: 'Effects',
        collapsed: true,
        params: [
            { key: 'focusShadow', label: 'Focus Shadow' },
            { key: 'popupShadow', label: 'Popup Shadow' },
        ],
    },
];

export const CURATED_KEYS = PARAM_GROUPS.flatMap((group) => group.params.map(({ key }) => key));

/**
 * Whether a param's default is derived from another param rather than chosen.
 * Covers every form a reference takes once translated - a bare `{ ref }`, a mix,
 * a composite whose members are references, and a raw CSS string naming a param
 * variable, which is how `focusShadow` tracks the accent colour.
 */
const isDerivedValue = (value: unknown): boolean => {
    if (typeof value === 'string') return value.includes('var(--ag-');
    if (typeof value !== 'object' || value == null || Array.isArray(value)) return false;
    return 'ref' in value || Object.values(value).some(isDerivedValue);
};

/** Which of a theme's params follow another one rather than standing alone. */
export const inheritedKeysOf = (params: Record<string, unknown>): Set<string> =>
    new Set(
        Object.entries(params)
            .filter(([, value]) => isDerivedValue(value))
            .map(([key]) => key)
    );

/**
 * The params that follow another one rather than standing alone. Read from the
 * defaults rather than listed here, so a param whose default becomes a reference
 * - or stops being one - changes side on its own. `params.test.ts` asserts the
 * classification holds for every stock theme.
 */
export const INHERITED_KEYS = inheritedKeysOf(CHARTS_PARAM_DEFAULTS);

/** `--ag-accent-color` back to `accentColor`, for a default written as raw CSS. */
const PARAM_BY_VARIABLE: Record<string, string> = Object.fromEntries(
    PUBLIC_PARAM_NAMES.map((property) => [paramToVariableName(property), property])
);

const collectSources = (value: unknown, found: string[]): void => {
    if (typeof value === 'string') {
        for (const [, variable] of value.matchAll(/var\((--ag-[a-z\d-]+)/g)) {
            const property = PARAM_BY_VARIABLE[variable];
            if (property) {
                found.push(property);
            }
        }
        return;
    }
    if (typeof value !== 'object' || value == null || Array.isArray(value)) {
        return;
    }
    const { ref, onto } = value as { ref?: unknown; onto?: unknown };
    if (typeof ref === 'string') {
        found.push(ref);
        if (typeof onto === 'string') {
            found.push(onto);
        }
        return;
    }
    // A composite - a border's colour and width - each member of which may be a
    // reference of its own.
    for (const member of Object.values(value)) {
        collectSources(member, found);
    }
};

/**
 * Which params a default follows, in the order it names them, so the panel can
 * say what an unset param inherits from rather than only that it inherits.
 */
export const inheritedSourcesOf = (value: unknown): string[] => {
    const found: string[] = [];
    collectSources(value, found);
    return [...new Set(found)];
};

/** What each inherited param follows, for the editor panel's footnotes. */
export const INHERITED_SOURCES: Record<string, string[]> = Object.fromEntries(
    [...INHERITED_KEYS].map((key) => [key, inheritedSourcesOf(CHARTS_PARAM_DEFAULTS[key])])
);
