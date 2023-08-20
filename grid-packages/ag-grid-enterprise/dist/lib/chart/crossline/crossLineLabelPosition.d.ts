import type { BBox } from '../../scene/bbox';
import type { Point } from '../../scene/point';
import type { AgCartesianAxisPosition } from '../agChartOptions';
export declare type CrossLineLabelPosition = 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'inside' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideBottomLeft' | 'insideTopRight' | 'insideBottomRight';
declare type CoordinatesFnOpts = {
    yDirection: boolean;
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
};
declare type CoordinatesFn = ({ yDirection, xStart, xEnd, yStart, yEnd }: CoordinatesFnOpts) => Point;
declare type PositionCalcFns = {
    c: CoordinatesFn;
};
export declare function calculateLabelTranslation({ yDirection, padding, position, bbox, }: {
    yDirection: boolean;
    padding: number;
    position: CrossLineLabelPosition;
    bbox: BBox;
}): {
    xTranslation: number;
    yTranslation: number;
};
export declare function calculateLabelChartPadding({ yDirection, bbox, padding, position, }: {
    yDirection: boolean;
    padding: number;
    position: CrossLineLabelPosition;
    bbox: BBox;
}): Partial<Record<AgCartesianAxisPosition, number>>;
export declare const POSITION_TOP_COORDINATES: CoordinatesFn;
export declare const labeldDirectionHandling: Record<CrossLineLabelPosition, PositionCalcFns>;
export {};
//# sourceMappingURL=crossLineLabelPosition.d.ts.map