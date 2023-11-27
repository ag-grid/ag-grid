import type { FontStyle, FontWeight, TextWrap } from '../options/agChartOptions';
import { Text } from '../scene/shape/text';
export declare class Caption {
    static readonly SMALL_PADDING = 10;
    static readonly LARGE_PADDING = 20;
    readonly node: Text;
    enabled: boolean;
    text?: string;
    fontStyle: FontStyle | undefined;
    fontWeight: FontWeight | undefined;
    fontSize: number;
    fontFamily: string;
    color: string | undefined;
    spacing?: number;
    lineHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    wrapping: TextWrap;
    constructor();
    computeTextWrap(containerWidth: number, containerHeight: number): void;
}
