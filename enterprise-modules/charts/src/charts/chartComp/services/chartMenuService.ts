import { Bean, BeanStub } from "@ag-grid-community/core";
import { ChartController } from "../chartController";

@Bean('chartMenuService')
export class ChartMenuService extends BeanStub {
    public downloadChart(chartController: ChartController, dimensions?: { width: number, height: number }, fileName?: string, fileFormat?: string): void {
        chartController.getChartProxy().downloadChart(dimensions, fileName, fileFormat);
    }

    public toggleLinked(chartController: ChartController): void {
        chartController.detachChartRange();
    }
}