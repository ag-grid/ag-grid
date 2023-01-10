import { AgChartOptions, AgChartInstance } from './agChartOptions';
declare type DownloadOptions = {
    width?: number;
    height?: number;
    fileName?: string;
    /** The standard MIME type for the image format to return. If you do not specify this parameter, the default value is a PNG format image. See `Canvas.toDataURL()` */
    fileFormat?: string;
};
declare type DeepPartialDepth = [never, 0, 1, 2, 3, 4, 5, 6];
declare type DeepPartial<T, N extends DeepPartialDepth[number] = 5> = [N] extends [never] ? Partial<T> : T extends object ? {
    [P in keyof T]?: DeepPartial<T[P], DeepPartialDepth[N]>;
} : T;
/**
 * Factory for creating and updating instances of AgChartInstance.
 *
 * @docsInterface
 */
export declare abstract class AgChart {
    /**
     * Create a new `AgChartInstance` based upon the given configuration options.
     */
    static create(options: AgChartOptions): AgChartInstance;
    /**
     * Update an existing `AgChartInstance`. Options provided should be complete and not
     * partial.
     *
     * **NOTE**: As each call could trigger a chart redraw, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    static update(chart: AgChartInstance, options: AgChartOptions): void;
    /**
     * Update an existing `AgChartInstance` by applying a partial set of option changes.
     *
     * **NOTE**: As each call could trigger a chart redraw, each individual delta options update
     * should leave the chart in a valid options state. Also, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    static updateDelta(chart: AgChartInstance, deltaOptions: DeepPartial<AgChartOptions>): void;
    /**
     * Initiate a browser-based image download for the given `AgChartInstance`s rendering.
     */
    static download(chart: AgChartInstance, options?: DownloadOptions): void;
}
export {};
