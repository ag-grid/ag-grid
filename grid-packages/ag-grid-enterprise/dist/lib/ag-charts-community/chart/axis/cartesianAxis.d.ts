import type { AxisContext } from '../../module/moduleContext';
import type { AgCartesianAxisPosition } from '../../options/agChartOptions';
import type { Scale } from '../../scale/scale';
import { ChartAxisDirection } from '../chartAxisDirection';
import type { CrossLine } from '../crossline/crossLine';
import { Axis } from './axis';
import type { TickInterval } from './axisTick';
import { CartesianAxisLabel } from './cartesianAxisLabel';
export declare abstract class CartesianAxis<S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>, D = any> extends Axis<S, D> {
    static is(value: any): value is CartesianAxis<any>;
    thickness: number;
    position: AgCartesianAxisPosition;
    get direction(): ChartAxisDirection;
    protected updateDirection(): void;
    update(primaryTickCount?: number, animated?: boolean): number | undefined;
    calculateLayout(primaryTickCount?: number): {
        primaryTickCount: number | undefined;
        bbox: import("../../integrated-charts-scene").BBox;
    };
    protected createAxisContext(): AxisContext;
    protected assignCrossLineArrayConstructor(crossLines: CrossLine[]): void;
    protected createLabel(): CartesianAxisLabel;
}
