import type { DistantObject, NearestResult } from './nearest';
import type { Point } from './point';
type Padding = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};
type ShrinkOrGrowPosition = 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal';
export declare class BBox implements DistantObject {
    x: number;
    y: number;
    width: number;
    height: number;
    static zero: BBox;
    constructor(x: number, y: number, width: number, height: number);
    clone(): BBox;
    equals(other: BBox): boolean;
    containsPoint(x: number, y: number): boolean;
    collidesBBox(other: BBox): boolean;
    isInfinite(): boolean;
    distanceSquared(point: Point): number;
    static nearestBox(point: Point, boxes: BBox[]): NearestResult<BBox>;
    shrink(amounts: Partial<Padding>): this;
    shrink(amount: number, position?: ShrinkOrGrowPosition): this;
    grow(amounts: Partial<Padding>): this;
    grow(amount: number, position?: ShrinkOrGrowPosition): this;
    static merge(boxes: BBox[]): BBox;
}
export {};
