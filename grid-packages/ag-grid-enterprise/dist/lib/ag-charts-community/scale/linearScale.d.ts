import { ContinuousScale } from './continuousScale';
/**
 * Maps continuous domain to a continuous range.
 */
export declare class LinearScale extends ContinuousScale<number> {
    readonly type = "linear";
    constructor();
    toDomain(d: number): number;
    ticks(): never[] | import("../util/ticks").NumericTicks;
    update(): void;
    protected getTickStep(start: number, stop: number): number;
    /**
     * Extends the domain so that it starts and ends on nice round values.
     */
    protected updateNiceDomain(): void;
    tickFormat({ ticks, specifier }: {
        ticks?: any[];
        specifier?: string;
    }): (n: number | {
        valueOf(): number;
    }) => string;
}
