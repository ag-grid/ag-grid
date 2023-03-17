import { AgChartOptions, AgChartInstance } from './agChartOptions';
export interface DownloadOptions extends ImageDataUrlOptions {
    /** Name of downloaded image file. Defaults to `image`.  */
    fileName?: string;
}
export interface ImageDataUrlOptions {
    /** Width of downloaded chart image in pixels. Defaults to current chart width. */
    width?: number;
    /** Height of downloaded chart image in pixels. Defaults to current chart height. */
    height?: number;
    /** A MIME-type string indicating the image format. The default format type is `image/png`. Options: `image/png`, `image/jpeg`.  */
    fileFormat?: string;
}
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
     * <br/>
     * <br/>
     * **NOTE**: As each call could trigger a chart redraw, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    static update(chart: AgChartInstance, options: AgChartOptions): void;
    /**
     * Update an existing `AgChartInstance` by applying a partial set of option changes.
     * <br/>
     * <br/>
     * **NOTE**: As each call could trigger a chart redraw, each individual delta options update
     * should leave the chart in a valid options state. Also, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    static updateDelta(chart: AgChartInstance, deltaOptions: DeepPartial<AgChartOptions>): void;
    /**
     * Starts a browser-based image download for the given `AgChartInstance`.
     */
    static download(chart: AgChartInstance, options?: DownloadOptions): void;
    /**
     * Returns a base64-encoded image data URL for the given `AgChartInstance`.
     */
    static getImageDataURL(chart: AgChartInstance, options?: ImageDataUrlOptions): Promise<string>;
}
export {};
