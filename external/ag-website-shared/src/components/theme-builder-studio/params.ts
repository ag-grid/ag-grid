// Studio's curated editor layout. Unlike grid's EditorPanel (which names params
// inline), Studio drives its panel from this data because its catalog is larger
// and more regular. Param value type and default are derived by the shared layer
// (getParamType by name suffix + the rendered theme), so only presentation hints
// live here.
export type LengthIcon = 'radius' | 'verticalSpacing' | 'horizontalSpacing';

export interface StudioParamConfig {
    key: string;
    label: string;
    icon?: LengthIcon;
    inlineWithNext?: boolean;
    swipeAdjustmentDivisor?: number;
    // Clamp for length editors (px). Colour/font params ignore these.
    min?: number;
    max?: number;
}

export interface StudioParamGroup {
    id: string;
    label: string;
    params: StudioParamConfig[];
}

export const PARAM_GROUPS: StudioParamGroup[] = [
    {
        id: 'general',
        label: 'General',
        params: [
            { key: 'fontFamily', label: 'Font Family', inlineWithNext: true },
            { key: 'fontSize', label: 'Font Size', min: 10, max: 20 },
            { key: 'backgroundColor', label: 'Background Color' },
            { key: 'foregroundColor', label: 'Foreground Color' },
            { key: 'accentColor', label: 'Accent Color' },
        ],
    },
    {
        id: 'borders',
        label: 'Borders & Spacing',
        params: [
            { key: 'borderColor', label: 'Border Color' },
            { key: 'borderWidth', label: 'Border Width', min: 0, max: 4 },
            { key: 'spacing', label: 'Spacing', icon: 'verticalSpacing', min: 2, max: 20 },
            {
                key: 'borderRadius',
                label: 'Border Radius',
                icon: 'radius',
                swipeAdjustmentDivisor: 20,
                min: 0,
                max: 24,
            },
            {
                key: 'studioWidgetBorderRadius',
                label: 'Widget Radius',
                icon: 'radius',
                swipeAdjustmentDivisor: 20,
                min: 0,
                max: 32,
            },
        ],
    },
    {
        id: 'widgets',
        label: 'Widgets',
        params: [
            { key: 'studioCanvasFontFamily', label: 'Canvas Font Family' },
            { key: 'studioWidgetBackgroundColor', label: 'Widget Background' },
            { key: 'studioWidgetTitleTextColor', label: 'Widget Title Color', inlineWithNext: true },
            { key: 'studioWidgetTitleFontSize', label: 'Title Size', min: 12, max: 48 },
            { key: 'studioWidgetCaptionTextColor', label: 'Widget Caption Color', inlineWithNext: true },
            { key: 'studioWidgetCaptionFontSize', label: 'Caption Size', min: 12, max: 48 },
        ],
    },
    {
        id: 'colorPalette',
        label: 'Color Palette',
        params: [
            { key: 'chartPaletteFills1Color', label: 'Palette 1' },
            { key: 'chartPaletteFills2Color', label: 'Palette 2' },
            { key: 'chartPaletteFills3Color', label: 'Palette 3' },
            { key: 'chartPaletteFills4Color', label: 'Palette 4' },
            { key: 'chartPaletteFills5Color', label: 'Palette 5' },
        ],
    },
    {
        id: 'grid',
        label: 'Grids',
        params: [
            { key: 'gridCellTextColor', label: 'Cell Text' },
            { key: 'gridAccentColor', label: 'Grid Accent' },
            { key: 'gridRowHeight', label: 'Row Height', icon: 'verticalSpacing', min: 24, max: 80 },
            { key: 'gridCellFontFamily', label: 'Font Family', inlineWithNext: true },
            { key: 'gridFontSize', label: 'Font Size', min: 10, max: 20 },
        ],
    },
    {
        id: 'charts',
        label: 'Charts',
        params: [
            { key: 'chartTextColor', label: 'Chart Text Color' },
            { key: 'chartFontFamily', label: 'Font Family', inlineWithNext: true },
            { key: 'chartFontSize', label: 'Font Size', min: 8, max: 20 },
            { key: 'chartAxisLineColor', label: 'Axis Color' },
            { key: 'chartGridLineColor', label: 'Grid Line Color' },
        ],
    },
];

// Every curated param must be registered as non-advanced, otherwise the shared
// ParamEditor throws when it is rendered outside the advanced section.
export const STUDIO_CURATED_KEYS: string[] = PARAM_GROUPS.flatMap((group) => group.params.map((param) => param.key));
