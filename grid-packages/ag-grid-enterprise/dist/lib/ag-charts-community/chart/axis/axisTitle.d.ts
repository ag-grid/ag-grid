import type { AgAxisCaptionFormatterParams, AgAxisCaptionOptions, FontStyle, FontWeight, TextWrap } from '../../options/agChartOptions';
export declare class AxisTitle implements AgAxisCaptionOptions {
    enabled: boolean;
    text?: string;
    spacing?: number;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    color?: string;
    wrapping: TextWrap;
    formatter?: (params: AgAxisCaptionFormatterParams) => string;
}
