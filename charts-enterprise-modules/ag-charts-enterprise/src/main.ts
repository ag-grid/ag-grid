import {
    AgChart,
    AgChartOptions as AgCommunityChartOptions,
    AgChartInstance,
    _ModuleSupport,
} from 'ag-charts-community';

import { AgAnimationOptions, AnimationModule } from './animation/main';
import { AgChartBackgroundImage, BackgroundModule } from './background/main';
import { AgContextMenuOptions, ContextMenuModule } from './context-menu/main';
import {
    AgCrosshairOptions,
    CrosshairModule,
    AgCrosshairLabel,
    AgCrosshairLabelRendererParams,
    AgCrosshairLabelRendererResult,
} from './crosshair/main';
import { GradientLegendModule } from './gradient-legend/main';
import {
    AgHeatmapSeriesFormat,
    AgHeatmapSeriesFormatterParams,
    AgHeatmapSeriesLabelOptions,
    AgHeatmapSeriesOptions,
    AgHeatmapSeriesTooltip,
    AgHeatmapSeriesTooltipRendererParams,
    HeatmapModule,
} from './heatmap/main';
import { AgNavigatorOptions } from './navigator/main';
import { AngleCategoryAxisModule, AgAngleCategoryAxisOptions } from './polar-axes/angle-category/main';
import { RadiusNumberAxisModule, AgRadiusNumberAxisOptions } from './polar-axes/radius-number/main';
export { RadiusNumberAxisModule } from './polar-axes/radius-number/radiusNumberAxisModule';
import {
    AgBaseRadarSeriesOptions,
    AgRadarSeriesLabelFormatterParams,
    AgRadarSeriesLabelOptions,
    AgRadarSeriesMarker,
    AgRadarSeriesMarkerFormat,
    AgRadarSeriesMarkerFormatter,
    AgRadarSeriesMarkerFormatterParams,
    AgRadarSeriesTooltip,
    AgRadarSeriesTooltipRendererParams,
} from './polar-series/radar/typings';
import { RadarLineModule, AgRadarLineSeriesOptions } from './polar-series/radar-line/main';
import { RadarAreaModule, AgRadarAreaSeriesOptions } from './polar-series/radar-area/main';
import { AgZoomAxes, AgZoomOptions, AgZoomPanKey, AgZoomScrollingPivot, ZoomModule } from './zoom/main';
import {
    WaterfallBarModule,
    WaterfallColumnModule,
    AgWaterfallSeriesOptions,
    AgWaterfallSeriesTooltip,
    AgWaterfallSeriesLabelOptions,
    AgWaterfallSeriesLabelPlacement,
    AgWaterfallSeriesItemOptions,
} from './waterfall/main';

export * from 'ag-charts-community';

_ModuleSupport.registerModule(AngleCategoryAxisModule);
_ModuleSupport.registerModule(AnimationModule);
_ModuleSupport.registerModule(BackgroundModule);
_ModuleSupport.registerModule(ContextMenuModule);
_ModuleSupport.registerModule(CrosshairModule);
_ModuleSupport.registerModule(GradientLegendModule);
_ModuleSupport.registerModule(HeatmapModule);
_ModuleSupport.registerModule(RadarAreaModule);
_ModuleSupport.registerModule(RadarLineModule);
_ModuleSupport.registerModule(RadiusNumberAxisModule);
_ModuleSupport.registerModule(WaterfallBarModule);
_ModuleSupport.registerModule(WaterfallColumnModule);
_ModuleSupport.registerModule(ZoomModule);

export { AgCrosshairOptions, AgCrosshairLabel, AgCrosshairLabelRendererParams, AgCrosshairLabelRendererResult };
export {
    AgHeatmapSeriesFormat,
    AgHeatmapSeriesFormatterParams,
    AgHeatmapSeriesLabelOptions,
    AgHeatmapSeriesOptions,
    AgHeatmapSeriesTooltip,
    AgHeatmapSeriesTooltipRendererParams,
};
export { AgAngleCategoryAxisOptions, AgRadiusNumberAxisOptions };
export {
    AgBaseRadarSeriesOptions,
    AgRadarLineSeriesOptions,
    AgRadarAreaSeriesOptions,
    AgRadarSeriesLabelFormatterParams,
    AgRadarSeriesLabelOptions,
    AgRadarSeriesMarker,
    AgRadarSeriesMarkerFormat,
    AgRadarSeriesMarkerFormatter,
    AgRadarSeriesMarkerFormatterParams,
    AgRadarSeriesTooltip,
    AgRadarSeriesTooltipRendererParams,
};
export { AgZoomAxes, AgZoomOptions, AgZoomPanKey, AgZoomScrollingPivot };
export {
    AgWaterfallSeriesOptions,
    AgWaterfallSeriesTooltip,
    AgWaterfallSeriesLabelOptions,
    AgWaterfallSeriesLabelPlacement,
    AgWaterfallSeriesItemOptions,
};

declare module 'ag-charts-community' {
    export interface AgCartesianChartOptions {
        animation?: AgAnimationOptions;
        contextMenu?: AgContextMenuOptions;
        /** Configuration for the chart navigator. */
        navigator?: AgNavigatorOptions;
        /** Configuration for zoom. */
        zoom?: AgZoomOptions;
    }

    export interface AgBaseCartesianAxisOptions {
        /** Configuration for the axis crosshair. */
        crosshair?: AgCrosshairOptions;
    }

    export type AgPolarAxisOptions = AgAngleCategoryAxisOptions | AgRadiusNumberAxisOptions;

    export interface AgPolarChartOptions {
        animation?: AgAnimationOptions;
        contextMenu?: AgContextMenuOptions;
        /** Axis configurations. */
        axes?: AgPolarAxisOptions[];
    }

    export interface AgHierarchyChartOptions {
        contextMenu?: AgContextMenuOptions;
    }

    export interface AgChartBackground {
        /** Background image. May be combined with fill colour. */
        image?: AgChartBackgroundImage;
    }
}

import { LicenseManager } from './license/licenseManager';

type CartesianAddonType = 'heatmap' | 'waterfall-bar' | 'waterfall-column';
type CartesianAddonSeries = AgHeatmapSeriesOptions | AgWaterfallSeriesOptions;

type PolarAddonType = 'radar-line' | 'radar-area';
type PolarAddonSeries = AgRadarLineSeriesOptions | AgRadarAreaSeriesOptions;

export type AgChartOptions = AgCommunityChartOptions<
    CartesianAddonType,
    CartesianAddonSeries,
    PolarAddonType,
    PolarAddonSeries
>;
export class AgEnterpriseCharts {
    public static create(options: AgChartOptions): AgChartInstance {
        new LicenseManager(options.container?.ownerDocument ?? document).validateLicense();

        return AgChart.create(options as any);
    }

    public static update(chart: AgChartInstance, options: AgChartOptions) {
        return AgChart.update(chart, options as any);
    }
}
