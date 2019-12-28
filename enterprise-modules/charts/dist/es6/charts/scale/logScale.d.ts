import ContinuousScale from "./continuousScale";
export declare class LogScale extends ContinuousScale {
    protected _domain: any[];
    baseLog: (x: number) => number;
    basePow: (x: number) => number;
    private _base;
    base: number;
    protected rescale(): void;
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
    private pow10;
    private makePowFn;
    private makeLogFn;
    ticks(count?: number): number[];
}
