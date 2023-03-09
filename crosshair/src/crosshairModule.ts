import {
    _ModuleSupport,
    CssColor,
    PixelSize,
    Opacity,
    FontStyle,
    FontWeight,
    FontSize,
    FontFamily,
} from 'ag-charts-community';
import { Corsshair } from './crosshair';

export const CROSSHAIR_MODULE: _ModuleSupport.AxisModule = {
    type: 'axis',
    chartTypes: ['cartesian'],
    optionsKey: 'crosshair',
    initialiseModule: (ctx) => {
        return {
            instance: new Corsshair(ctx),
        };
    },
};

declare module 'ag-charts-community' {
    export interface AgCrosshairLabelFormatterParams {
        readonly value: any;
        readonly formatter?: (x: any) => string;
    }

    export interface AgCrosshairLabelOptions {
        /** The font style to use for the label. */
        fontStyle?: FontStyle;
        /** The font weight to use for the label. */
        fontWeight?: FontWeight;
        /** The font size in pixels to use for the label. */
        fontSize?: FontSize;
        /** The font family to use for the label */
        fontFamily?: FontFamily;
        /** Padding in pixels between the crosshair label and the crosshair line. */
        padding?: PixelSize;
        /** The colour to use for the label */
        color?: CssColor;
        /** The rotation of the crosshair label in degrees. */
        rotation?: number;
        /** Format string used when rendering the label. */
        format?: string;
        /** Function used to render the crosshair label. */
        formatter?: (params: AgCrosshairLabelFormatterParams) => string | undefined;
    }

    export interface AgCrosshairOptions {
        /** The colour of the stroke for the lines. */
        stroke?: CssColor;
        /** The width in pixels of the stroke for the lines. */
        strokeWidth?: PixelSize;
        /** The opacity of the stroke for the lines. */
        strokeOpacity?: Opacity;
        /** Defines how the line stroke is rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
        lineDash?: PixelSize[];
        /** Configuration for the crosshair label. */
        label?: AgCrosshairLabelOptions;
        /** When true, the crosshair snaps to the highlighted data point. By default, this property is false and the crosshair is rendered at the mouse pointer position. */
        snap?: boolean;
    }

    export interface AgBaseCartesiancrosshairOptions {
        /** Configuration for the chart navigator. */
        crosshair?: AgCrosshairOptions;
    }
}
