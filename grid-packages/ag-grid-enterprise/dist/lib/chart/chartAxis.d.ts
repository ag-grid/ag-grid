import { Scale } from '../scale/scale';
import { Axis, TickInterval } from '../axis';
import { ChartAxisDirection } from './chartAxisDirection';
import { AgCartesianAxisPosition, AgCartesianAxisType } from './agChartOptions';
export declare function flipChartAxisDirection(direction: ChartAxisDirection): ChartAxisDirection;
interface BoundSeries {
    type: string;
    getDomain(direction: ChartAxisDirection): any[];
    isEnabled(): boolean;
    visible: boolean;
}
interface BoundSeries {
    type: string;
    getDomain(direction: ChartAxisDirection): any[];
    isEnabled(): boolean;
    visible: boolean;
}
export declare class ChartAxis<S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>, D = any> extends Axis<S, D> {
    keys: string[];
    direction: ChartAxisDirection;
    boundSeries: BoundSeries[];
    linkedTo?: ChartAxis;
    includeInvisibleDomains: boolean;
    get type(): AgCartesianAxisType;
    protected useCalculatedTickCount(): boolean;
    protected _position: AgCartesianAxisPosition;
    set position(value: AgCartesianAxisPosition);
    get position(): AgCartesianAxisPosition;
    protected calculateDomain(): void;
    normaliseDataDomain(d: D[]): D[];
    isAnySeriesActive(): boolean;
}
export {};
