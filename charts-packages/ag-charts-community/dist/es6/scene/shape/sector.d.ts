import { Path } from "./path";
import { BBox } from "../bbox";
export declare class Sector extends Path {
    static className: string;
    private _centerX;
    centerX: number;
    private _centerY;
    centerY: number;
    private _centerOffset;
    centerOffset: number;
    private _innerRadius;
    innerRadius: number;
    private _outerRadius;
    outerRadius: number;
    private _startAngle;
    startAngle: number;
    private _endAngle;
    endAngle: number;
    private _angleOffset;
    angleOffset: number;
    computeBBox(): BBox;
    private isFullPie;
    updatePath(): void;
}
