export declare class BBox {
    x: number;
    y: number;
    width: number;
    height: number;
    private static noParams;
    constructor(x: number, y: number, width: number, height: number);
    clone(): BBox;
    equals(other: BBox): boolean;
    isValid(): boolean;
    dilate(value: number): void;
    containsPoint(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D, params?: {
        resetTransform?: boolean;
        label?: string;
        fillStyle?: string;
        lineWidth?: number;
        strokeStyle?: string;
    }): void;
}
