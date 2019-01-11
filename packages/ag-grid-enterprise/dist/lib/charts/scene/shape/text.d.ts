// ag-grid-enterprise v20.0.0
import { Shape } from "./shape";
export declare class Text extends Shape {
    protected static defaults: {
        fillStyle: string;
        strokeStyle: string;
        lineWidth: number;
        opacity: number;
    } & {
        fillStyle: string;
        x: number;
        y: number;
    };
    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
