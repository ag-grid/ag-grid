import { AgChart, AgChartOptions, AgChartInstance, _ModuleSupport } from 'ag-charts-community';

import { AgChartBackgroundImage, BackgroundModule } from './background/main';
import { AgContextMenuOptions } from './context-menu/main';
import { CrosshairModule, AgCrosshairOptions } from './crosshair/main';
import { AgNavigatorOptions } from './navigator/main';
import { AgZoomOptions, ZoomModule } from './zoom/main';

export * from 'ag-charts-community';

_ModuleSupport.registerModule(BackgroundModule);
_ModuleSupport.registerModule(ZoomModule);
_ModuleSupport.registerModule(CrosshairModule);

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
export class AgEnterpriseCharts {
    public static create(options: AgChartOptions): AgChartInstance {
        new LicenseManager(options.container as any).validateLicense();

        return AgChart.create(options);
    }
}
