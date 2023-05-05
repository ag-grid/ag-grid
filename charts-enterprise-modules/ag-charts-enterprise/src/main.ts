import {
    AgChart,
    AgChartOptions as AgCommunityChartOptions,
    AgChartInstance,
    _ModuleSupport,
} from 'ag-charts-community';

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
import { AgZoomOptions, ZoomModule } from './zoom/main';

export * from 'ag-charts-community';

_ModuleSupport.registerModule(BackgroundModule);
_ModuleSupport.registerModule(ContextMenuModule);
_ModuleSupport.registerModule(CrosshairModule);
_ModuleSupport.registerModule(GradientLegendModule);
_ModuleSupport.registerModule(HeatmapModule);
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

    export interface AgHierarchyChartOptions {
        contextMenu?: AgContextMenuOptions;
    }

    export interface AgChartBackground {
        /** Background image. May be combined with fill colour. */
        image?: AgChartBackgroundImage;
    }
}

import { LicenseManager } from './license/licenseManager';

export type AgChartOptions = AgCommunityChartOptions<'heatmap', AgHeatmapSeriesOptions>;
export class AgEnterpriseCharts {
    public static create(options: AgChartOptions): AgChartInstance {
        new LicenseManager(options.container as any).validateLicense();

        return AgChart.create(options as any);
    }

    public static update(chart: AgChartInstance, options: AgChartOptions) {
        return AgChart.update(chart, options as any);
    }
}
