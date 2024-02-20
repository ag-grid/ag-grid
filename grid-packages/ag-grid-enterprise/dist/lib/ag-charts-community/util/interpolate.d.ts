import type { IColor } from './color';
export declare function interpolateNumber(a: number, b: number): (d: number) => number;
export declare function interpolateColor(a: IColor | string, b: IColor | string): (d: number) => string;
