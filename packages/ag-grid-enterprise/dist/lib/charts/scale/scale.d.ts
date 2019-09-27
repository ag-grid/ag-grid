// ag-grid-enterprise v21.2.2
export default interface Scale<D, R> {
    domain: D[];
    range: R[];
    convert(value: D): R;
    invert?(value: R): D;
    ticks?(count: number): D[];
    nice?(count: number): void;
    bandwidth?: number;
}
export declare type Reinterpolator<T> = (t: number) => T;
export declare type Deinterpolator<T> = (v: T) => number;
export declare type ReinterpolatorFactory<T> = (a: T, b: T) => Reinterpolator<T>;
export declare type DeinterpolatorFactory<T> = (a: T, b: T) => Deinterpolator<T>;
export declare type PiecewiseReinterpolatorFactory<T> = (a: number[], b: T[], de: DeinterpolatorFactory<number>, re: ReinterpolatorFactory<T>) => Reinterpolator<T>;
export declare type PiecewiseDeinterpolatorFactory<T> = (a: T[], b: number[], de: DeinterpolatorFactory<T>, re: ReinterpolatorFactory<number>) => Deinterpolator<T>;
