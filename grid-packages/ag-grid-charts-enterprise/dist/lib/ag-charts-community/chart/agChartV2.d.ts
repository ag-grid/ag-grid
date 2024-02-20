import type { AgChartInstance, AgChartOptions, DownloadOptions, ImageDataUrlOptions } from '../options/agChartOptions';
import type { DeepPartial } from '../util/types';
/**
 * Factory for creating and updating instances of AgChartInstance.
 *
 * @docsInterface
 */
export declare abstract class AgCharts {
    private static readonly INVALID_CHART_REF_MESSAGE;
    private static licenseManager?;
    private static licenseChecked;
    private static licenseKey?;
    private static gridContext;
    private static licenseCheck;
    static setLicenseKey(licenseKey: string): void;
    static setGridContext(gridContext: boolean): void;
    static getLicenseDetails(licenseKey: string): {} | undefined;
    /**
     * Returns the `AgChartInstance` for a DOM node, if there is one.
     */
    static getInstance(element: HTMLElement): AgChartInstance | undefined;
    /**
     * Create a new `AgChartInstance` based upon the given configuration options.
     */
    static create(options: AgChartOptions): AgChartInstance;
    /**
     * Update an existing `AgChartInstance`. Options provided should be complete and not
     * partial.
     *
     * __NOTE__: As each call could trigger a chart redraw, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    static update(chart: AgChartInstance, options: AgChartOptions): void;
    /**
     * Update an existing `AgChartInstance` by applying a partial set of option changes.
     *
     * __NOTE__: As each call could trigger a chart redraw, each individual delta options update
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
/** @deprecated v9.0 use AgCharts instead */
export declare class AgChart {
    private static warnDeprecated;
    static create(options: AgChartOptions): AgChartInstance;
    static update(chart: AgChartInstance, options: AgChartOptions): void;
    static updateDelta(chart: AgChartInstance, deltaOptions: DeepPartial<AgChartOptions>): void;
    static download(chart: AgChartInstance, options?: DownloadOptions): void;
    static getImageDataURL(chart: AgChartInstance, options?: ImageDataUrlOptions): Promise<string>;
}
