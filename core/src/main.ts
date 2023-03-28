import { AgChart, AgChartOptions, AgChartInstance, _ModuleSupport } from 'ag-charts-community';
import { LicenseManager } from './license/licenseManager';
import { BackgroundModule } from './background/main';

export * from 'ag-charts-community';

_ModuleSupport.registerModule(BackgroundModule);

export class AgEnterpriseCharts {
    public static create(options: AgChartOptions): AgChartInstance {
        new LicenseManager(options.container as any).validateLicense();

        return AgChart.create(options);
    }
}
