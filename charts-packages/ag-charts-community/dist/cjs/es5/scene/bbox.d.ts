export declare class BBox {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    clone(): BBox;
    equals(other: BBox): boolean;
    containsPoint(x: number, y: number): boolean;
    isInfinite(): boolean;
    shrink(amount: number, position?: 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal'): void;
    grow(amount: number, position?: 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal'): void;
    static merge(boxes: BBox[]): BBox;
}
