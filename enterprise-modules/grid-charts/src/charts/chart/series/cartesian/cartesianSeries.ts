import { Series } from "../series";
import { ChartAxis, ChartAxisDirection } from "../../chartAxis";

export abstract class CartesianSeries extends Series {
    directionKeys: { [key in ChartAxisDirection]?: string[] } = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKey']
    };
}
