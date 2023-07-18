import type { AgAxisCaptionFormatterParams, AgAxisCaptionOptions, FontStyle, FontWeight, TextWrap } from '../../chart/agChartOptions';
export declare class AxisTitle implements AgAxisCaptionOptions {
    enabled: boolean;
    text?: string;
    fontStyle: FontStyle | undefined;
    fontWeight: FontWeight | undefined;
    fontSize: number;
    fontFamily: string;
    color: string | undefined;
    wrapping: TextWrap;
    formatter?: (params: AgAxisCaptionFormatterParams) => string;
}
//# sourceMappingURL=axisTitle.d.ts.map