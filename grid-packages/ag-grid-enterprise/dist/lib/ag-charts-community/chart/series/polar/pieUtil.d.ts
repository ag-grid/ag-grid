import type { FromToMotionPropFnContext, NodeUpdateState } from '../../../motion/fromToMotion';
import type { Sector } from '../../../scene/shape/sector';
import type { Circle } from '../../marker/circle';
type AnimatableSectorDatum = {
    radius: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    sectorFormat: {
        fill: string;
        stroke: string;
    };
};
type ScaleFn = {
    convert(x: number): number;
};
export declare function preparePieSeriesAnimationFunctions(initialLoad: boolean, rotationDegrees: number, scaleFn: ScaleFn, oldScaleFn: ScaleFn): {
    nodes: {
        toFn: (_sect: Sector, datum: AnimatableSectorDatum, status: NodeUpdateState, { prevLive }: FromToMotionPropFnContext<Sector>) => {
            startAngle: number;
            endAngle: number;
            outerRadius: number;
            innerRadius: number;
            stroke: string;
            fill: string;
        };
        fromFn: (sect: Sector, datum: AnimatableSectorDatum, status: NodeUpdateState, { prevFromProps }: FromToMotionPropFnContext<Sector>) => {
            startAngle: number;
            endAngle: number;
            innerRadius: number;
            outerRadius: number;
            fill: string;
            stroke: string;
        };
    };
    innerCircle: {
        fromFn: (node: Circle, _datum: {
            radius: number;
        }) => {
            size: any;
        };
        toFn: (_node: Circle, datum: {
            radius: number;
        }) => {
            size: number;
        };
    };
};
export declare function resetPieSelectionsFn(_node: Sector, datum: AnimatableSectorDatum): {
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
    fill: string;
    stroke: string;
};
export {};
