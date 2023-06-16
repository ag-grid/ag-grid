declare type Padding = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};
declare type ShrinkOrGrowPosition = 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal';
export declare class BBox {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    clone(): BBox;
    equals(other: BBox): boolean;
    containsPoint(x: number, y: number): boolean;
    collidesBBox(other: BBox): boolean;
    isInfinite(): boolean;
    shrink(amounts: Partial<Padding>): this;
    shrink(amount: number, position?: ShrinkOrGrowPosition): this;
    grow(amounts: Partial<Padding>): this;
    grow(amount: number, position?: ShrinkOrGrowPosition): this;
    static merge(boxes: BBox[]): BBox;
}
export {};
//# sourceMappingURL=bbox.d.ts.map