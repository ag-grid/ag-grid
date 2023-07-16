import { Axis } from '../../axis';
import type { Scale } from '../../scale/scale';
import type { AxisContext } from '../../util/moduleContext';
import type { AgCartesianAxisPosition } from '../agChartOptions';
import { ChartAxisDirection } from '../chartAxisDirection';
import type { CrossLine } from '../crossline/crossLine';
import type { TickInterval } from './axisTick';
export declare abstract class CartesianAxis<S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>, D = any> extends Axis<S, D> {
    thickness: number;
    position: AgCartesianAxisPosition;
    get direction(): ChartAxisDirection;
    protected updateDirection(): void;
    update(primaryTickCount?: number): number | undefined;
    protected createAxisContext(): AxisContext;
    protected assignCrossLineArrayConstructor(crossLines: CrossLine[]): void;
}
//# sourceMappingURL=cartesianAxis.d.ts.map