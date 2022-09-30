import { Shape } from '../../scene/shape/shape';
export declare class Rectangle extends Shape {
    static className: string;
    private _x;
    set x(value: number);
    get x(): number;
    private _y;
    set y(value: number);
    get y(): number;
    private _width;
    set width(value: number);
    get width(): number;
    private _height;
    set height(value: number);
    get height(): number;
    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     */
    private _crisp;
    set crisp(value: boolean);
    get crisp(): boolean;
    isPointInStroke(x: number, y: number): boolean;
    isPointInPath(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
