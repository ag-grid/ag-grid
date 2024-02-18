import type { BBox } from '../bbox';
interface SectorBoundaries {
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
}
export declare function isPointInSector(x: number, y: number, sector: SectorBoundaries): boolean;
export declare function boxCollidesSector(box: BBox, sector: SectorBoundaries): boolean;
export {};
