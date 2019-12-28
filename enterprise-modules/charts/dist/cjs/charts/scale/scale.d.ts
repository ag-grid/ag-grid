export default interface Scale<D, R> {
    domain: D[];
    range: R[];
    convert(value: D): R;
    invert?(value: R): D;
    ticks?(count: any): D[];
    tickFormat?(count: any, specifier?: string): (x: any) => string;
    nice?(count?: number): void;
    bandwidth?: number;
}
export declare type Reinterpolator<T> = (t: number) => T;
export declare type Deinterpolator<T> = (v: T) => number;
