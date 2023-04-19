import { SparklineOptions } from '@ag-grid-community/core';
import { SparklineTooltip } from './tooltip/sparklineTooltip';
export declare type SparklineFactoryOptions = SparklineOptions & {
    data: any[];
    width: number;
    height: number;
    context?: any;
    container?: HTMLElement;
};
export declare abstract class AgSparkline {
    static create(options: SparklineFactoryOptions, tooltip: SparklineTooltip): any;
}
