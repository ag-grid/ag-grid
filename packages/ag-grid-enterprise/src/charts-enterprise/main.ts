import type { ILicenseManager } from '../main';
import { LicenseManager } from '../main';
import { AgCharts } from 'ag-charts-enterprise';
import 'ag-charts-enterprise';

AgCharts.setGridContext(true);

LicenseManager.setChartsLicenseManager(AgCharts as ILicenseManager);

export * from '../charts/main';
