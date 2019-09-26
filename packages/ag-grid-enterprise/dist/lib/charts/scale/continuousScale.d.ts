// ag-grid-enterprise v21.2.2
import { Comparator } from "../util/compare";
import Scale, { Deinterpolator, DeinterpolatorFactory, Reinterpolator, ReinterpolatorFactory } from './scale';
export default abstract class ContinuousScale<R> implements Scale<number, R> {
    constructor(reinterpolatorFactory: ReinterpolatorFactory<R>, deinterpolatorFactory?: DeinterpolatorFactory<R>, rangeComparator?: Comparator<R>);
    private readonly reinterpolatorFactory;
    private readonly deinterpolatorFactory?;
    private readonly rangeComparator?;
    private piecewiseReinterpolatorFactory?;
    private piecewiseReinterpolator?;
    private piecewiseDeinterpolatorFactory?;
    private piecewiseDeinterpolator?;
    protected _domain: number[];
    domain: number[];
    protected _range: R[];
    range: R[];
    clamp: boolean;
    convert(d: number): R;
    invert(r: R): number;
    /**
     * Creates a new deinterpolator for the given pair of output range numbers.
     * The deinterpolator accepts a single parameter `v` in the [a, b] range
     * and returns a value in the [0, 1] range.
     * @param a
     * @param b
     */
    protected abstract deinterpolatorOf(a: number, b: number): Deinterpolator<number>;
    /**
     * Creates a new interpolator for the given pair of input domain numbers.
     * The interpolator accepts a single parameter `t` in the [0, 1] range and
     * returns a value in the [a, b] range.
     * @param a
     * @param b
     */
    protected abstract reinterpolatorOf(a: number, b: number): Reinterpolator<number>;
    protected clampDeinterpolatorFactory(deinterpolatorOf: DeinterpolatorFactory<number>): DeinterpolatorFactory<number>;
    protected clampReinterpolatorFactory(reinterpolatorOf: ReinterpolatorFactory<number>): ReinterpolatorFactory<number>;
    protected rescale(): void;
    private bimap;
    private bimapInvert;
}
