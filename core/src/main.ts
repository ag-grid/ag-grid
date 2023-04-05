import {
    AgChart,
    AgChartOptions as AgCommunityChartOptions,
    AgChartInstance,
    _ModuleSupport,
} from 'ag-charts-community';

import { AgChartBackgroundImage, BackgroundModule } from './background/main';
import { AgContextMenuOptions, ContextMenuModule } from './context-menu/main';
import { AgCrosshairOptions, CrosshairModule } from './crosshair/main';
import * as Heatmap from './heatmap/main';
import { AgNavigatorOptions } from './navigator/main';
import { AgZoomOptions, ZoomModule } from './zoom/main';

export * from 'ag-charts-community';

_ModuleSupport.registerModule(BackgroundModule);
_ModuleSupport.registerModule(ContextMenuModule);
_ModuleSupport.registerModule(CrosshairModule);
_ModuleSupport.registerModule(Heatmap.HeatmapModule);
_ModuleSupport.registerModule(ZoomModule);

declare module 'ag-charts-community' {
    export interface AgCartesianChartOptions {
        contextMenu?: AgContextMenuOptions;
        /** Configuration for the chart navigator. */
        navigator?: AgNavigatorOptions;
        zoom?: AgZoomOptions;
    }

    export interface AgBaseCartesianAxisOptions {
        /** Configuration for the axis crosshair. */
        crosshair?: AgCrosshairOptions;
    }

    export interface AgPolarChartOptions {
        contextMenu?: AgContextMenuOptions;
    }

    export type AgHeatmapSeriesFormat = Heatmap.AgHeatmapSeriesFormat;
    export type AgHeatmapSeriesFormatterParams<T> = Heatmap.AgHeatmapSeriesFormatterParams<T>;
    export type AgHeatmapSeriesLabelOptions = Heatmap.AgHeatmapSeriesLabelOptions;
    export type AgHeatmapSeriesOptions = Heatmap.AgHeatmapSeriesOptions;
    export type AgHeatmapSeriesTooltip = Heatmap.AgHeatmapSeriesTooltip;
    export type AgHeatmapSeriesTooltipRendererParams = Heatmap.AgHeatmapSeriesTooltipRendererParams;

    export interface AgHierarchyChartOptions {
        contextMenu?: AgContextMenuOptions;
    }

    export interface AgChartBackground {
        /** Background image. May be combined with fill colour. */
        image?: AgChartBackgroundImage;
    }
}

import { LicenseManager } from './license/licenseManager';

export type AgChartOptions = AgCommunityChartOptions<'heatmap', Heatmap.AgHeatmapSeriesOptions>;
export class AgEnterpriseCharts {
    public static create(options: AgChartOptions): AgChartInstance {
        new LicenseManager(options.container as any).validateLicense();

        return AgChart.create(options as any);
    }
}
