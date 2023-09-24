import { ContinuousScale } from './continuousScale';
export declare class LogScale extends ContinuousScale<number> {
    readonly type = "log";
    constructor();
    toDomain(d: number): number;
    base: number;
    protected transform(x: any): number;
    protected transformInvert(x: any): number;
    protected cacheProps: Array<keyof this>;
    update(): void;
    private baseLog;
    private basePow;
    private log;
    private pow;
    private updateLogFn;
    private updatePowFn;
    protected updateNiceDomain(): void;
    static pow10(x: number): number;
    ticks(): number[];
    tickFormat({ count, ticks, specifier, }: {
        count?: any;
        ticks?: any[];
        specifier?: string | ((x: number) => string);
    }): (x: number) => string;
}
//# sourceMappingURL=logScale.d.ts.map