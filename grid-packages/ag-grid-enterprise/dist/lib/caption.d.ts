import { Text } from './scene/shape/text';
import type { FontStyle, FontWeight, TextWrap } from './chart/agChartOptions';
export declare class Caption {
    static readonly PADDING = 10;
    readonly node: Text;
    enabled: boolean;
    text?: string;
    fontStyle: FontStyle | undefined;
    fontWeight: FontWeight | undefined;
    fontSize: number;
    fontFamily: string;
    color: string | undefined;
    spacing?: number;
    lineHeight: number | undefined;
    maxWidth?: number;
    maxHeight?: number;
    wrapping: TextWrap;
    constructor();
    computeTextWrap(containerWidth: number, containerHeight: number): void;
}
//# sourceMappingURL=caption.d.ts.map