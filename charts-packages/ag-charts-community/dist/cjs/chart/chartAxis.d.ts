import Scale from "../scale/scale";
import { Axis } from "../axis";
import { Series } from "./series/series";
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
    readonly type: string;
    getMeta(): ChartAxisMeta;
    protected _position: ChartAxisPosition;
    position: ChartAxisPosition;
}
export {};
