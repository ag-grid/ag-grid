import type { Direction } from '../../../options/chart/types';
import type { Node } from '../../../scene/node';
import type { ChartAxis } from '../../chartAxis';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { SeriesNodeDatum } from '../seriesTypes';
import { CartesianSeries } from './cartesianSeries';
import type { CartesianSeriesNodeDataContext, CartesianSeriesNodeDatum } from './cartesianSeries';
export declare abstract class AbstractBarSeries<TNode extends Node, TDatum extends CartesianSeriesNodeDatum, TLabel extends SeriesNodeDatum = TDatum, TContext extends CartesianSeriesNodeDataContext<TDatum, TLabel> = CartesianSeriesNodeDataContext<TDatum, TLabel>> extends CartesianSeries<TNode, TDatum, TLabel, TContext> {
    direction: Direction;
    getBandScalePadding(): {
        inner: number;
        outer: number;
    };
    shouldFlipXY(): boolean;
    protected getBarDirection(): ChartAxisDirection;
    protected getCategoryDirection(): ChartAxisDirection;
    protected getValueAxis(): ChartAxis | undefined;
    protected getCategoryAxis(): ChartAxis | undefined;
}
