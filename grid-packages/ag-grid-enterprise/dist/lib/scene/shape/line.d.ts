import { Shape } from './shape';
import { BBox } from '../bbox';
import type { RenderContext } from '../node';
export declare class Line extends Shape {
    static className: string;
    protected static defaultStyles: never;
    constructor();
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    computeBBox(): BBox;
    isPointInPath(_x: number, _y: number): boolean;
    render(renderCtx: RenderContext): void;
}
//# sourceMappingURL=line.d.ts.map