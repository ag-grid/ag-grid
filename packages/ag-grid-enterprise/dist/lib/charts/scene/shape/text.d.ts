// ag-grid-enterprise v21.0.1
import { Shape } from "./shape";
import { BBox } from "../bbox";
export declare class Text extends Shape {
    static className: string;
    protected static defaultStyles: {
        fill: string;
        stroke: undefined;
        strokeWidth: number;
        lineDash: undefined;
        lineDashOffset: number;
        lineCap: import("./shape").ShapeLineCap;
        lineJoin: import("./shape").ShapeLineJoin;
        opacity: number;
        fillShadow: undefined;
        strokeShadow: undefined;
    } & {
        textAlign: CanvasTextAlign;
        font: string;
        textBaseline: CanvasTextBaseline;
    };
    private _x;
    x: number;
    private _y;
    y: number;
    private lineBreakRe;
    private lines;
    private splitText;
    private _text;
    text: string;
    private _font;
    font: string;
    private _textAlign;
    textAlign: CanvasTextAlign;
    private _textBaseline;
    textBaseline: CanvasTextBaseline;
    readonly getBBox: () => BBox;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
