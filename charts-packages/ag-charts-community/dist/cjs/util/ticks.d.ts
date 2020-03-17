export default function (a: number, b: number, count: number): NumericTicks;
export declare function tickStep(a: number, b: number, count: number): number;
export declare function tickIncrement(a: number, b: number, count: number): number;
export declare class NumericTicks extends Array<number> {
    readonly fractionDigits: number;
    constructor(fractionDigits: number, size?: number);
}
