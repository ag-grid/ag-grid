import { Path } from './path';
import { BBox } from '../bbox';
export declare class Sector extends Path {
    static className: string;
    centerX: number;
    centerY: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    angleOffset: number;
    computeBBox(): BBox;
    private isFullPie;
    updatePath(): void;
}
