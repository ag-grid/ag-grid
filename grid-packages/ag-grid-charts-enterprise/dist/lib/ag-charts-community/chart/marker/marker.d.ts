import { BBox } from '../../scene/bbox';
import { Path } from '../../scene/shape/path';
export type MarkerPathMove = {
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
