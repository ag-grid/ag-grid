import { Path } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
export declare type MarkerPathMove = {
    x: number;
    y: number;
    t?: 'move';
};
export declare abstract class Marker extends Path {
    x: number;
    y: number;
    size: number;
    computeBBox(): BBox;
    protected applyPath(s: number, moves: MarkerPathMove[]): void;
}
