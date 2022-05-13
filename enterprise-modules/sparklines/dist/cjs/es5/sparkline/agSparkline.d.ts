import { AreaSparkline } from './area/areaSparkline';
import { LineSparkline } from './line/lineSparkline';
import { BarSparkline } from './bar-column/barSparkline';
import { ColumnSparkline } from './bar-column/columnSparkline';
import { SparklineOptions } from '@ag-grid-community/core';
import { SparklineTooltip } from './tooltip/sparklineTooltip';
export declare type SparklineFactoryOptions = SparklineOptions & {
    data: any[];
    width: number;
    height: number;
    context?: any;
    container?: HTMLElement;
};
export declare type SparklineType = LineSparkline | AreaSparkline | ColumnSparkline | BarSparkline;
export declare abstract class AgSparkline {
    static create(options: SparklineFactoryOptions, tooltip: SparklineTooltip): any;
}
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export declare function doOnce(func: () => void, key: string): void;
