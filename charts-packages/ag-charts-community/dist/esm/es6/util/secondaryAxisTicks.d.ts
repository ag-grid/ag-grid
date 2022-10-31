import { NumericTicks } from './ticks';
export declare function calculateNiceSecondaryAxis(domain: number[], primaryTickCount: number): [[number, number], NumericTicks];
export declare function getTicks(start: number, step: number, count: number): NumericTicks;
export declare function getTickStep(start: number, stop: number, count: number): number;
