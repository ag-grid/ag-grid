import { AgCharts } from 'ag-charts-enterprise';
import 'ag-charts-enterprise';

import type { ILicenseManager } from '../license/shared/licenseManager';
import { LicenseManager } from '../license/shared/licenseManager';

AgCharts.setGridContext(true);

LicenseManager.setChartsLicenseManager(AgCharts as ILicenseManager);

export * from '../charts/main';
