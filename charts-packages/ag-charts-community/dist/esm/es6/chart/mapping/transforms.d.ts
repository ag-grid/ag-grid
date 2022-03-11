import { AgBarSeriesOptions, AgChartOptions } from '../agChartOptions';
declare type Transforms<Source, Result extends {
    [R in keyof Source]?: any;
}, Keys extends keyof Source & keyof Result = keyof Source & keyof Result> = {
    [Property in Keys]: (p: Source[Property], src: Source) => Result[Property];
};
export declare function transform<I, R extends {
    [RKey in keyof I]: O[RKey];
}, T extends Transforms<I, R>, O extends {
    [OKey in keyof T]: ReturnType<T[OKey]>;
} & {
    [OKey in Exclude<keyof I, keyof T>]: I[OKey];
}>(input: I, transforms: T): O;
export declare function barSeriesTransform<T extends AgBarSeriesOptions>(options: T): T;
declare type SeriesTypes = NonNullable<AgChartOptions['series']>[number];
export declare function applySeriesTransform<S extends SeriesTypes>(options: S): S;
export {};
