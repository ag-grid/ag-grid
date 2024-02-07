import {LicenseManager, ILicenseManager} from "@ag-grid-enterprise/core";
import {AgCharts} from "ag-charts-enterprise";

AgCharts.setGridContext(true);

LicenseManager.setChartsLicenseManager(AgCharts as ILicenseManager)

import "ag-charts-enterprise";

export  * from "@ag-grid-enterprise/charts";
