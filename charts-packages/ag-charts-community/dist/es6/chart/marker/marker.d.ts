import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
export declare abstract class Marker extends Path {
    protected _x: number;
    x: number;
    protected _y: number;
    y: number;
    protected _size: number;
    size: number;
    computeBBox(): BBox;
}
