import { ContinuousScale } from './continuousScale';
export declare class LogScale extends ContinuousScale {
    readonly type = "log";
    _domain: number[];
    baseLog: (x: any) => any;
    basePow: (x: any) => any;
    protected setDomain(values: any[]): void;
    protected getDomain(): any[];
    _base: number;
    set base(value: number);
    get base(): number;
    rescale(): void;
    /**
     * For example, if `f` is `Math.log10`, we have
     *
     *     f(100) == 2
     *     f(-100) == NaN
     *     rf = reflect(f)
     *     rf(-100) == -2
     *
     * @param f
     */
    reflect(f: (x: number) => number): (x: number) => number;
    nice(): void;
    static pow10(x: number): number;
    static makePowFn(base: number): (x: number) => number;
    static makeLogFn(base: number): (x: number) => number;
    ticks(count?: number): any[];
    tickFormat({ count, specifier, }: {
        count?: any;
        ticks?: any[];
        specifier?: string | ((x: number) => string);
    }): (x: number) => string;
}
