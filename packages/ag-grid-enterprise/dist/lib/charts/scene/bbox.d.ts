// ag-grid-enterprise v21.2.2
export declare class BBox {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    dilate(value: number): void;
    containsPoint(x: number, y: number): boolean;
    private static noParams;
    render(ctx: CanvasRenderingContext2D, params?: {
        resetTransform?: boolean;
        label?: string;
        fillStyle?: string;
        lineWidth?: number;
        strokeStyle?: string;
    }): void;
}
