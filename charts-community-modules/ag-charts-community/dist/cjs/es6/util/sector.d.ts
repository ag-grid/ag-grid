import { BBox } from '../scene/bbox';
export interface SectorBoundaries {
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
}
export interface LineCoordinates {
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
}
export declare function isPointInSector(x: number, y: number, sector: SectorBoundaries): boolean;
export declare function boxCollidesSector(box: BBox, sector: SectorBoundaries): boolean;
