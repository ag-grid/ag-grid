import { Series } from "../series";
import { ChartAxis, ChartAxisDirection } from "../../chartAxis";

export abstract class PolarSeries extends Series {
    directionKeys = {
        [ChartAxisDirection.X]: ['angleKey'],
        [ChartAxisDirection.Y]: ['radiusKey']
    };

    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number = 0;
    centerY: number = 0;

    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number = 0;
}
