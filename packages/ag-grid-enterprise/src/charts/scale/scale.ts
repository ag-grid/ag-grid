export default interface Scale<D, R> {
    _domain: D[];
    _range: R[];
    convert(value: D): R;
}

export type Reinterpolator<T> = (t: number) => T;
export type Deinterpolator<T> = (v: T) => number;

export type ReinterpolatorFactory<T> = (a: T, b: T) => Reinterpolator<T>;
export type DeinterpolatorFactory<T> = (a: T, b: T) => Deinterpolator<T>;

export type PiecewiseReinterpolatorFactory<T> =
    (a: number[], b: T[], de: DeinterpolatorFactory<number>, re: ReinterpolatorFactory<T>) => Reinterpolator<T>;
export type PiecewiseDeinterpolatorFactory<T> =
    (a: T[], b: number[], de: DeinterpolatorFactory<T>, re: ReinterpolatorFactory<number>) => Deinterpolator<T>;