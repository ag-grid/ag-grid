import { ContinuousScale } from './continuousScale';
export declare class LogScale extends ContinuousScale<number> {
    readonly type = "log";
    constructor();
    toDomain(d: number): number;
    base: number;
    protected transform(x: any): number;
    protected transformInvert(x: any): number;
    protected refresh(): void;
    update(): void;
    private baseLog;
    private basePow;
    private log;
    private pow;
    protected updateNiceDomain(): void;
    ticks(): number[];
    tickFormat({ count, ticks, specifier, }: {
        count?: any;
        ticks?: any[];
        specifier?: string | ((x: number) => string);
    }): (x: number) => string;
    static getBaseLogMethod(base: number): (x: number) => number;
    static getBasePowerMethod(base: number): (x: number) => number;
}
