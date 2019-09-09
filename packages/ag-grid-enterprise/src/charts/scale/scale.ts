export default interface Scale<D, R> {
    domain: D[];
    range: R[];
    convert(value: D): R;
    invert?(value: R): D;
    ticks?(count: number): D[];
    tickFormat?(count?: number, specifier?: string): (x: any) => string;
    nice?(count: number): void;
    bandwidth?: number;
}

export type Reinterpolator<T> = (t: number) => T;
export type Deinterpolator<T> = (v: T) => number;
