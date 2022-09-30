import { ContinuousScale } from './continuousScale';
/**
 * Maps continuous domain to a continuous range.
 */
export declare class LinearScale extends ContinuousScale {
    readonly type = "linear";
    ticks(count?: number): import("../util/ticks").NumericTicks;
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    nice(count?: number): void;
    tickFormat({ count, specifier }: {
        count?: number;
        ticks?: any[];
        specifier?: string;
    }): (n: number | {
        valueOf(): number;
    }) => string;
}
