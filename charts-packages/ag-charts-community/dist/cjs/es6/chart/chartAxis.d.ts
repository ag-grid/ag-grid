import { Scale } from '../scale/scale';
import { Axis } from '../axis';
import { Series } from './series/series';
export declare enum ChartAxisDirection {
    X = "x",
    Y = "y"
}
export declare function flipChartAxisDirection(direction: ChartAxisDirection): ChartAxisDirection;
export declare enum ChartAxisPosition {
    Top = "top",
    Right = "right",
    Bottom = "bottom",
    Left = "left",
    Angle = "angle",
    Radius = "radius"
}
interface ChartAxisMeta {
    id: string;
    direction: ChartAxisDirection;
    boundSeries: Series[];
}
export declare class ChartAxis<S extends Scale<any, number> = Scale<any, number>> extends Axis<S> {
    keys: string[];
    direction: ChartAxisDirection;
    boundSeries: Series[];
    linkedTo?: ChartAxis;
    includeInvisibleDomains: boolean;
    get type(): string;
    getMeta(): ChartAxisMeta;
    protected useCalculatedTickCount(): boolean;
    /**
     * For continuous axes, if tick count has not been specified, set the number of ticks based on the available range
     */
    calculateTickCount(): void;
    protected calculateTickIntervalEstimate(): number;
    protected _position: ChartAxisPosition;
    set position(value: ChartAxisPosition);
    get position(): ChartAxisPosition;
    calculateDomain({ primaryTickCount }: {
        primaryTickCount?: number;
    }): {
        primaryTickCount: number | undefined;
    };
    protected updateDomain(domain: any[], _isYAxis: boolean, primaryTickCount?: number): number | undefined;
}
export {};
