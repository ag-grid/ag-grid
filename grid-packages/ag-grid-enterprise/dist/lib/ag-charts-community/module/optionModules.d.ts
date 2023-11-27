import type { SeriesNodeDatum } from '../chart/series/seriesTypes';
import type { AgCartesianSeriesOptions } from '../options/series/cartesian/cartesianSeriesTypes';
import type { AgHierarchySeriesOptions } from '../options/series/hierarchy/hierarchyOptions';
import type { AgPolarSeriesOptions } from '../options/series/polar/polarOptions';
import type { Point } from '../scene/point';
import type { BaseModule, ModuleInstance } from './baseModule';
import type { AxisContext, ModuleContextWithParent, SeriesContext } from './moduleContext';
type SeriesType = NonNullable<AgCartesianSeriesOptions['type'] | AgPolarSeriesOptions['type'] | AgHierarchySeriesOptions['type']>;
export type PickNodeDatumResult = {
    datum: SeriesNodeDatum;
    distanceSquared: number;
} | undefined;
export interface AxisOptionModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'axis-option';
    axisTypes: ('category' | 'number' | 'log' | 'time')[];
    instanceConstructor: new (ctx: ModuleContextWithParent<AxisContext>) => M;
    themeTemplate: {};
}
export interface SeriesOptionInstance extends ModuleInstance {
    pickNodeExact(point: Point): PickNodeDatumResult;
    pickNodeNearest(point: Point): PickNodeDatumResult;
    pickNodeMainAxisFirst(point: Point): PickNodeDatumResult;
}
export interface SeriesOptionModule<M extends SeriesOptionInstance = SeriesOptionInstance> extends BaseModule {
    type: 'series-option';
    seriesTypes: readonly SeriesType[];
    instanceConstructor: new (ctx: SeriesContext) => M;
    themeTemplate: {};
}
export {};
