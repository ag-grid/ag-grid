import {
    _ModuleSupport,
    _Scale,
    _Theme,
    AgChartLegendPosition,
    PixelSize,
    CssColor,
    FontFamily,
    FontSize,
    FontStyle,
    FontWeight,
} from 'ag-charts-community';
import { GradientLegend } from './gradientLegend';
import { GRADIENT_LEGEND_THEME } from './gradientLegendTheme';

export const GradientLegendModule: _ModuleSupport.LegendModule = {
    type: 'legend',
    optionsKey: 'legend',
    packageType: 'enterprise',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],

    identifier: 'gradient',
    instanceConstructor: GradientLegend,

    themeTemplate: GRADIENT_LEGEND_THEME,
};

export interface AgGradientLegendOptions {
    /** The legend type. */
    type: 'gradient';

    /** Enables or disables the legend. */
    enabled?: boolean;
    /** Gradient bar configuration. */
    gradient?: AgGradientLegendGradientBarOptions;
    /** Configuration for the legend labels. */
    label?: AgGradientLegendLabelOptions;
    /** Where the legend should show in relation to the chart. */
    position?: AgChartLegendPosition;
    /** Reverse the display order of legend items if `true`. */
    reverseOrder?: boolean;
    /** The spacing in pixels to use outside the legend. */
    spacing?: PixelSize;
}

export interface AgGradientLegendLabelOptions {
    /** The colour of the text. */
    color?: CssColor;
    /** The font family to use for the legend. */
    fontFamily?: FontFamily;
    /** The font size in pixels to use for the legend. */
    fontSize?: FontSize;
    /** The font style to use for the legend. */
    fontStyle?: FontStyle;
    /** The font weight to use for the legend. */
    fontWeight?: FontWeight;
    /** Function used to render legend labels. */
    formatter?: (params: AgGradientLegendLabelFormatterParams) => string;
}

export interface AgGradientLegendGradientBarOptions {
    /** Preferred length of the gradient bar (may expand to fit labels or shrink to fit inside a chart). */
    preferredLength?: PixelSize;
    /** The thickness of the gradient bar (width for vertical or height for horizontal layout). */
    thickness?: PixelSize;
}

export interface AgGradientLegendLabelFormatterParams {
    /** Numeric colour scale domain value. */
    value: number;
}
