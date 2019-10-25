import ContinuousScale from "./continuousScale";
/**
 * Maps continuous domain to a continuous range.
 */
export declare class LinearScale extends ContinuousScale {
    ticks(count?: number): import("../util/ticks").NumericTicks;
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    nice(count?: number): void;
}
/**
 * Creates a continuous scale with the default interpolator and no clamping.
 */
export default function scaleLinear(): LinearScale;
