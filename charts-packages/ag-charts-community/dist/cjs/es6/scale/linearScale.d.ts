import { ContinuousScale } from './continuousScale';
/**
 * Maps continuous domain to a continuous range.
 */
export declare class LinearScale extends ContinuousScale<number> {
    readonly type = "linear";
    interval?: number;
    constructor();
    toDomain(d: number): number;
    ticks(): never[] | import("../util/ticks").NumericTicks;
    update(): void;
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    protected updateNiceDomain(): void;
    tickFormat({ ticks, specifier }: {
        ticks?: any[];
        specifier?: string;
    }): (n: number | {
        valueOf(): number;
    }) => string;
}
