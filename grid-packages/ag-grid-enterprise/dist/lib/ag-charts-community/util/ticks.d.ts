export type NumericTicks = number[] & {
    fractionDigits: number;
};
export declare const createNumericTicks: (fractionDigits: number, takingValues?: number[]) => NumericTicks;
export default function (start: number, stop: number, count: number, minCount?: number, maxCount?: number): NumericTicks;
export declare function tickStep(a: number, b: number, count: number, minCount?: number, maxCount?: number): number;
export declare function singleTickDomain(a: number, b: number): number[];
export declare function range(start: number, stop: number, step: number): NumericTicks;
