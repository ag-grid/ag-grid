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
export declare class ChartAxis extends Axis<Scale<any, number>> {
    keys: string[];
    direction: ChartAxisDirection;
    boundSeries: Series[];
    linkedTo?: ChartAxis;
    readonly type: string;
    protected _position: ChartAxisPosition;
    position: ChartAxisPosition;
}
