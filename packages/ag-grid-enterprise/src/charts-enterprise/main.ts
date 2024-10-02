import { AgCharts } from 'ag-charts-community/modules';
import { setupEnterpriseModules } from 'ag-charts-enterprise/modules';

import type { ILicenseManager } from '../license/shared/licenseManager';
import { LicenseManager } from '../license/shared/licenseManager';

setupEnterpriseModules();
AgCharts.setGridContext(true);

LicenseManager.setChartsLicenseManager(AgCharts as ILicenseManager);

export * from '../charts/main';
