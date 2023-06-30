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
    updatePath(): void;
    isPointInPath(x: number, y: number): boolean;
}
//# sourceMappingURL=sector.d.ts.map