import { Shape } from './shape';
import { BBox } from '../bbox';
import type { RenderContext } from '../node';
import type { FontStyle, FontWeight, TextWrap } from '../../chart/agChartOptions';
export interface TextSizeProperties {
    fontFamily: string;
    fontSize: number;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    lineHeight?: number;
    textBaseline?: CanvasTextBaseline;
    textAlign?: CanvasTextAlign;
}
export declare class Text extends Shape {
    static className: string;
    static defaultLineHeightRatio: number;
    static defaultStyles: {
        fill: string;
        stroke: undefined;
        strokeWidth: number;
        lineDash: undefined;
        lineDashOffset: number;
        lineCap: undefined;
        lineJoin: undefined;
        opacity: number;
        fillShadow: undefined;
    } & {
        textAlign: CanvasTextAlign;
        fontStyle: undefined;
        fontWeight: undefined;
        fontSize: number;
        fontFamily: string;
        textBaseline: CanvasTextBaseline;
    };
    x: number;
    y: number;
    private lines;
    private _setLines;
    text?: string;
    private _dirtyFont;
    private _font?;
    get font(): string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    lineHeight?: number;
    computeBBox(): BBox;
    private getLineHeight;
    isPointInPath(x: number, y: number): boolean;
    render(renderCtx: RenderContext): void;
    private renderLines;
    static wrap(text: string, maxWidth: number, maxHeight: number, textProps: TextSizeProperties, wrapping: TextWrap): string;
    private static wrapLine;
    private static punctuationMarks;
    private static breakWord;
    private static truncateLine;
    private static wrapLineSequentially;
    private static wrapLineBalanced;
    setFont(props: TextSizeProperties): void;
    setAlign(props: {
        textAlign: CanvasTextAlign;
        textBaseline: CanvasTextBaseline;
    }): void;
}
interface TextMeasurer {
    size(text: string): {
        width: number;
        height: number;
    };
    width(line: string): number;
}
export declare function createTextMeasurer(font: string): TextMeasurer;
export declare function getFont(fontProps: TextSizeProperties): string;
export declare function measureText(lines: string[], x: number, y: number, textProps: TextSizeProperties): BBox;
export declare function splitText(text?: string): string[];
export {};
//# sourceMappingURL=text.d.ts.map