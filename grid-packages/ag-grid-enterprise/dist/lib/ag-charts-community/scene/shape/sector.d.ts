import { BBox } from '../bbox';
import { Path } from './path';
export declare class Sector extends Path {
    static className: string;
    centerX: number;
    centerY: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    angleOffset: number;
    inset: number;
    computeBBox(): BBox;
    updatePath(): void;
    isPointInPath(x: number, y: number): boolean;
}
