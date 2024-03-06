import { Autowired, Bean, BeanStub } from "@ag-grid-community/core";
import { ChartService } from "../../chartService";
import { ChartController } from "../chartController";

@Bean('chartMenuService')
export class ChartMenuService extends BeanStub {
    @Autowired('chartService') private readonly chartService: ChartService;

    public isLegacyFormat(): boolean {
        return this.gridOptionsService.get('legacyChartsMenu') ?? !this.chartService.isEnterprise();
    }

    public downloadChart(chartController: ChartController, dimensions?: { width: number, height: number }, fileName?: string, fileFormat?: string): void {
        chartController.getChartProxy().downloadChart(dimensions, fileName, fileFormat);
    }

    public toggleLinked(chartController: ChartController): void {
        chartController.detachChartRange();
    }
}