import type { Scale } from '../../scale/scale';
import type { BBox } from '../../scene/bbox';
import { Axis } from './axis';
import type { TickInterval } from './axisTick';
export interface PolarAxisPathPoint {
    x: number;
    y: number;
    moveTo: boolean;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    arc?: boolean;
}
export declare abstract class PolarAxis<S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>, D = any> extends Axis<S, D> {
    gridAngles: number[] | undefined;
    gridRange: number[] | undefined;
    shape: 'polygon' | 'circle';
    innerRadiusRatio: number;
    protected defaultTickMinSpacing: number;
    computeLabelsBBox(_options: {
        hideWhenNecessary: boolean;
    }, _seriesRect: BBox): BBox | null;
    computeRange?: () => void;
    getAxisLinePoints?(): {
        points: PolarAxisPathPoint[];
        closePath: boolean;
    };
}
