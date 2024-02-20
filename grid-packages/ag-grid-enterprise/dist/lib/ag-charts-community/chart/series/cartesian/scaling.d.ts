export type Scaling = ContinuousScaling | CategoryScaling | LogScaling;
export interface ContinuousScaling<T = 'continuous'> {
    type: T;
    domain: [number, number];
    range: [number, number];
}
export interface LogScaling extends ContinuousScaling<'log'> {
    convert(domain: number): number;
}
export interface CategoryScaling {
    type: 'category';
    domain: string[];
    range: number[];
}
export declare function areScalingEqual(a: Scaling | undefined, b: Scaling | undefined): boolean;
