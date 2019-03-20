// ag-grid-enterprise v20.2.0
import { Series } from "./series";
export declare abstract class PolarSeries<D, X, Y> extends Series<D, X, Y> {
    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number;
    centerY: number;
    /**
     * The offset from the center. If layering multiple polar series on top of
     * another is not the desired behavior, one can specify the offset from the
     * center (determined by the chart's layout) to position each series anywhere
     * in the chart. Note that this value is absolute and will have to be changed
     * when the size of the chart changes.
     */
    offsetX: number;
    offsetY: number;
    /**
     * The series rotation in degrees.
     */
    _rotation: number;
    abstract rotation: number;
    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number;
    abstract angleField: Extract<keyof D, string> | null;
}
