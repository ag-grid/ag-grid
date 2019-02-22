// ag-grid-enterprise v20.1.0
import { Deinterpolator, Reinterpolator } from "./scale";
import ContinuousScale from "./continuousScale";
export declare class LinearScale<R> extends ContinuousScale<R> {
    protected deinterpolatorOf(a: number, b: number): Deinterpolator<number>;
    protected reinterpolatorOf(a: number, b: number): Reinterpolator<number>;
    ticks(count?: number): import("../util/ticks").NumericTicks;
}
export declare function reinterpolateNumber(a: number, b: number): Reinterpolator<number>;
export declare function deinterpolateNumber(a: number, b: number): Deinterpolator<number>;
/**
 * Creates a continuous scale with the default interpolator and no clamping.
 */
export default function scaleLinear(): LinearScale<number>;
