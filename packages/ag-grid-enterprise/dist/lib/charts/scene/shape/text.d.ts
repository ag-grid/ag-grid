// ag-grid-enterprise v20.2.0
import { Shape } from "./shape";
import { BBox } from "../bbox";
export declare class Text extends Shape {
    protected static defaultStyles: {
        fillStyle: string | null;
        strokeStyle: string | null;
        lineWidth: number;
        lineDash: number[] | null;
        lineDashOffset: number;
        lineCap: import("./shape").ShapeLineCap;
        lineJoin: import("./shape").ShapeLineJoin;
        opacity: number;
        shadow: import("../dropShadow").DropShadow | null;
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
    applyContextAttributes(ctx: CanvasRenderingContext2D): void;
    render(ctx: CanvasRenderingContext2D): void;
}
