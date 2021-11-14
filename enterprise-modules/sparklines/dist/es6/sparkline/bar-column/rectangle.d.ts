import { Shape } from "../../scene/shape/shape";
export declare class Rectangle extends Shape {
    static className: string;
    private _x;
    x: number;
    private _y;
    y: number;
    private _width;
    width: number;
    private _height;
    height: number;
    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     */
    private _crisp;
    crisp: boolean;
    isPointInStroke(x: number, y: number): boolean;
    isPointInPath(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
