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
        readonly fractionDigits: number;
        readonly formatter?: (x: any) => string;
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
        /** When true, the crosshair snaps to the highlighted data point. By default, this property is false and the crosshair is rendered at the mouse pointer position. */
        snap?: boolean;
        /** The crosshair tooltip configuration */
        tooltip?: AgCrosshairTooltip;
    }

    export interface AgCrosshairTooltip {
        /** Whether or not to show tooltips when the crosshair is visible. */
        enabled?: boolean;
        /** Function used to create the content for the tooltip. */
        renderer?: (params: AgCrosshairTooltipRendererParams) => string | AgTooltipRendererResult;
    }

    export interface AgCrosshairTooltipRendererParams {
        /** Axis value that the tooltip is being rendered for. */
        readonly value: any;
        /** If the axis value is a number, the fractional digits used to format the value. */
        readonly fractionDigits?: number;
    }

    export interface AgBaseCartesiancrosshairOptions {
        /** Configuration for the chart navigator. */
        crosshair?: AgCrosshairOptions;
    }

    export interface AgTooltipRendererResult {
        opacity?: number;
    }
}
