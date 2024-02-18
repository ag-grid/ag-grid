import { BBox } from '../bbox';
import type { NodeOptions, RenderContext } from '../node';
import { Shape } from './shape';
export declare class Line extends Shape {
    static className: string;
    protected static defaultStyles: never;
    constructor(opts?: NodeOptions);
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    set x(value: number);
    set y(value: number);
    computeBBox(): BBox;
    isPointInPath(px: number, py: number): boolean;
    render(renderCtx: RenderContext): void;
}
