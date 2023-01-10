import { Scale } from '../scale/scale';
import { Axis } from '../axis';
import { Series } from './series/series';
import { AgCartesianAxisPosition, AgCartesianAxisType } from './agChartOptions';
export declare enum ChartAxisDirection {
    X = "x",
    Y = "y"
}
export declare function flipChartAxisDirection(direction: ChartAxisDirection): ChartAxisDirection;
export declare class ChartAxis<S extends Scale<any, number> = Scale<any, number>, D = any> extends Axis<S, D> {
    keys: string[];
    direction: ChartAxisDirection;
    boundSeries: Series[];
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
