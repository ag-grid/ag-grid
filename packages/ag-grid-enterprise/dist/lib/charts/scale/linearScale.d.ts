// ag-grid-enterprise v21.2.2
import { Deinterpolator, Reinterpolator } from "./scale";
import ContinuousScale from "./continuousScale";
/**
 * Maps continuous domain to a continuous range.
 */
export declare class LinearScale<R> extends ContinuousScale<R> {
    protected deinterpolatorOf(a: number, b: number): Deinterpolator<number>;
    protected reinterpolatorOf(a: number, b: number): Reinterpolator<number>;
    ticks(count?: number): import("../util/ticks").NumericTicks;
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    nice(count?: number): void;
}
export declare function reinterpolateNumber(a: number, b: number): Reinterpolator<number>;
export declare function deinterpolateNumber(a: number, b: number): Deinterpolator<number>;
/**
 * Creates a continuous scale with the default interpolator and no clamping.
 */
export default function scaleLinear(): LinearScale<number>;
