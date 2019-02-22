// ag-grid-enterprise v20.1.0
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
    _domain: number[];
    _range: R[];
    domain: number[];
    range: R[];
    clamp: boolean;
    convert(d: number): R;
    invert(r: R): number;
    protected abstract deinterpolatorOf(a: number, b: number): Deinterpolator<number>;
    protected abstract reinterpolatorOf(a: number, b: number): Reinterpolator<number>;
    protected clampDeinterpolatorFactory(deinterpolatorOf: DeinterpolatorFactory<number>): DeinterpolatorFactory<number>;
    protected clampReinterpolatorFactory(reinterpolatorOf: ReinterpolatorFactory<number>): ReinterpolatorFactory<number>;
    protected rescale(): void;
    private bimap;
    private bimapInvert;
}
