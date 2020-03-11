import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
export declare abstract class Marker extends Path {
    protected _x: number;
    set x(value: number);
    get x(): number;
    protected _y: number;
    set y(value: number);
    get y(): number;
    protected _size: number;
    set size(value: number);
    get size(): number;
    computeBBox(): BBox;
}
