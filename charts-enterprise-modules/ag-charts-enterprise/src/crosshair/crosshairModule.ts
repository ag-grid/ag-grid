import { _ModuleSupport, CssColor, PixelSize, Opacity } from 'ag-charts-community';
import { Crosshair } from './crosshair';
import { AXIS_CROSSHAIR_THEME } from './crosshairTheme';

export const CrosshairModule: _ModuleSupport.AxisModule = {
    type: 'axis',
    optionsKey: 'crosshair',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],
    axisTypes: ['category', 'number', 'log', 'time'],
    instanceConstructor: Crosshair,
    themeTemplate: AXIS_CROSSHAIR_THEME,
};

export interface AgCrosshairLabelFormatterParams {
    readonly value: any;
    readonly fractionDigits: number;
    readonly formatter?: (x: any) => string;
}

export interface AgCrosshairOptions {
    /** Whether or not to show the crosshair. */
    enabled?: boolean;
    /** When true, the crosshair snaps to the highlighted data point. By default this property is false and the crosshair is rendered at the mouse pointer position. */
    snap?: boolean;
    /** The colour of the stroke for the lines. */
    stroke?: CssColor;
    /** The width in pixels of the stroke for the lines. */
    strokeWidth?: PixelSize;
    /** The opacity of the stroke for the lines. */
    strokeOpacity?: Opacity;
    /** Defines how the line stroke is rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** The crosshair label configuration */
    label?: AgCrosshairLabel;
}

export interface AgCrosshairLabel {
    /** Whether or not to show label when the crosshair is visible. */
    enabled?: boolean;
    /** A class name to be added to the crosshair label element. */
    className?: string;
    /** The horizontal offset in pixels for the label. */
    xOffset?: PixelSize;
    /** The vertical offset in pixels for the label. */
    yOffset?: PixelSize;
    /** Format string used when rendering the crosshair label. */
    format?: string;
    /** Function used to create the content for the label. */
    renderer?: (params: AgCrosshairLabelRendererParams) => string | AgCrosshairLabelRendererResult;
}

export interface AgCrosshairLabelRendererParams {
    /** Axis value that the label is being rendered for. */
    readonly value: any;
    /** If the axis value is a number, the fractional digits used to format the value. */
    readonly fractionDigits?: number;
}

export interface AgCrosshairLabelRendererResult {
    /** Text for the label. */
    text?: string;
    /** Label text color. */
    color?: CssColor;
    /** Label background color. */
    backgroundColor?: CssColor;
    /** Opacity of the label. */
    opacity?: Opacity;
}
