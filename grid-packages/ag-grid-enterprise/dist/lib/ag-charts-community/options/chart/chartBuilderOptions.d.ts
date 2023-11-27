import type { AgBaseCartesianChartOptions } from '../series/cartesian/cartesianOptions';
import type { AgBaseHierarchyChartOptions } from '../series/hierarchy/hierarchyOptions';
import type { AgBasePolarChartOptions } from '../series/polar/polarOptions';
import type { AgBaseChartOptions } from './chartOptions';
import type { AgBaseChartThemeOptions, AgBaseChartThemeOverrides, AgChartTheme, AgChartThemeName } from './themeOptions';
export interface AgChartThemeOptions extends AgBaseChartThemeOptions {
}
export type AgChartThemeOverrides = AgBaseChartThemeOverrides;
export interface AgCartesianChartOptions extends AgBaseCartesianChartOptions, AgBaseChartOptions {
    /**
     * A predefined theme name or an object containing theme overrides.
     *
     * See: [Themes Reference](../themes-api/)
     */
    theme?: AgChartTheme | AgChartThemeName;
}
export interface AgPolarChartOptions extends AgBasePolarChartOptions, AgBaseChartOptions {
    theme?: AgChartTheme | AgChartThemeName;
}
export interface AgHierarchyChartOptions extends AgBaseHierarchyChartOptions, AgBaseChartOptions {
    theme?: AgChartTheme | AgChartThemeName;
}
export type AgChartOptions = AgCartesianChartOptions | AgPolarChartOptions | AgHierarchyChartOptions;
export interface AgChartInstance {
    /** Get the `AgChartOptions` representing the current chart configuration. */
    getOptions(): AgChartOptions;
    /** Destroy the chart instance and any allocated resources to support its rendering. */
    destroy(): void;
}
export interface AgChartInterface {
    /**
     * Create a new `AgChartInstance` based upon the given configuration options.
     */
    create(options: AgChartOptions): AgChartInstance;
    /**
     * Update an existing `AgChartInstance`. Options provided should be complete and not partial.
     *
     * __NOTE__ As each call could trigger a chart redraw, multiple calls to update options in quick succession could result in undesirable flickering, so callers should batch up and/or debounce changes to avoid unintended partial update renderings.
     */
    update(chart: AgChartInstance, options: AgChartOptions): void;
    /**
     * Update an existing `AgChartInstance` by applying a partial set of option changes.
     *
     * __NOTE__: As each call could trigger a chart redraw, each individual delta options update should leave the chart in a valid options state. Also, multiple calls to update options in quick succession could result in undesirable flickering, so callers should batch up and/or debounce changes to avoid unintended partial update renderings.
     */
    updateDelta(chart: AgChartInstance, deltaOptions: AgChartOptions): void;
    /** Starts a browser-based image download for the given `AgChartInstance`. */
    download(chart: AgChartInstance, options?: DownloadOptions): void;
    /** Returns a base64-encoded image data URL for the given `AgChartInstance`. */
    getImageDataURL(chart: AgChartInstance, options?: ImageDataUrlOptions): Promise<string>;
}
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
