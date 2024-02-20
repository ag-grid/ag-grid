import type { FromToMotionPropFn } from '../../../motion/fromToMotion';
import type { Sector } from '../../../scene/shape/sector';
import type { Circle } from '../../marker/circle';
type AnimatableSectorDatum = {
    radius: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    sectorFormat: {
        fill?: string;
        stroke?: string;
    };
};
type ScaleFn = {
    convert(x: number): number;
};
export declare function preparePieSeriesAnimationFunctions(initialLoad: boolean, rotationDegrees: number, scaleFn: ScaleFn, oldScaleFn: ScaleFn): {
    nodes: {
        toFn: FromToMotionPropFn<Sector, any, AnimatableSectorDatum>;
        fromFn: FromToMotionPropFn<Sector, any, AnimatableSectorDatum>;
    };
    innerCircle: {
        fromFn: FromToMotionPropFn<Circle, any, {
            radius: number;
        }>;
        toFn: FromToMotionPropFn<Circle, any, {
            radius: number;
        }>;
    };
};
export declare function resetPieSelectionsFn(_node: Sector, datum: AnimatableSectorDatum): {
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
    fill: string | undefined;
    stroke: string | undefined;
};
export {};
