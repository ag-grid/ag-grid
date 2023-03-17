import { Shape } from './shape';
import { BBox } from '../bbox';
import { RenderContext } from '../node';
import { FontStyle, FontWeight } from '../../chart/agChartOptions';
export declare class Text extends Shape {
    static className: string;
    protected static defaultStyles: {
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
    private _splitText;
    text: string;
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
    private getPreciseBBox;
    private getVerticalOffset;
    private getApproximateBBox;
    private getLineHeight;
    isPointInPath(x: number, y: number): boolean;
    render(renderCtx: RenderContext): void;
    private renderLines;
}
export declare function getFont(fontSize: number, fontFamily: string, fontStyle?: string, fontWeight?: string): string;
