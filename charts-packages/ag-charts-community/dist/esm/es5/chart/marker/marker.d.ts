import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
export declare abstract class Marker extends Path {
    x: number;
    y: number;
    size: number;
    computeBBox(): BBox;
}
