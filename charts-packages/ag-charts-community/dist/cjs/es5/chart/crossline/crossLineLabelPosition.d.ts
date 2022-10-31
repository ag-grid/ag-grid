import { BBox } from '../../scene/bbox';
import { Point } from '../../scene/point';
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
export declare const calculateLabelTranslation: ({ yDirection, padding, position, bbox, }: {
    yDirection: boolean;
    padding: number;
    position: import("../agChartOptions").AgCrossLineLabelPosition;
    bbox: BBox;
}) => {
    xTranslation: number;
    yTranslation: number;
};
export declare const POSITION_TOP_COORDINATES: CoordinatesFn;
export declare const POSITION_LEFT_COORDINATES: CoordinatesFn;
export declare const POSITION_RIGHT_COORDINATES: CoordinatesFn;
export declare const POSITION_BOTTOM_COORDINATES: CoordinatesFn;
export declare const POSITION_INSIDE_COORDINATES: CoordinatesFn;
export declare const POSITION_TOP_LEFT_COORDINATES: CoordinatesFn;
export declare const POSITION_BOTTOM_LEFT_COORDINATES: CoordinatesFn;
export declare const POSITION_TOP_RIGHT_COORDINATES: CoordinatesFn;
export declare const POSITION_BOTTOM_RIGHT_COORDINATES: CoordinatesFn;
export declare const labeldDirectionHandling: Record<CrossLineLabelPosition, PositionCalcFns>;
export {};
