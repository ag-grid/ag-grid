import type { ILicenseManager} from '@ag-grid-enterprise/core';
import { LicenseManager } from '@ag-grid-enterprise/core';
import { AgCharts } from 'ag-charts-enterprise';
import 'ag-charts-enterprise';

AgCharts.setGridContext(true);

LicenseManager.setChartsLicenseManager(AgCharts as ILicenseManager);

export * from '@ag-grid-enterprise/charts';
