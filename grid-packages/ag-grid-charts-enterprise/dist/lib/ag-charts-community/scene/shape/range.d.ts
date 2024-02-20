import { BBox } from '../bbox';
import type { NodeOptions, RenderContext } from '../node';
import { Shape } from './shape';
export declare class Range extends Shape {
    static className: string;
    protected static defaultStyles: {
        strokeWidth: number;
        fill: string;
        stroke: undefined;
        lineDash: undefined;
        lineDashOffset: number;
        lineCap: undefined;
        lineJoin: undefined;
        opacity: number;
        fillShadow: undefined;
    };
    constructor(opts?: NodeOptions);
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    startLine: boolean;
    endLine: boolean;
    isRange: boolean;
    computeBBox(): BBox;
    isPointInPath(_x: number, _y: number): boolean;
    render(renderCtx: RenderContext): void;
}
