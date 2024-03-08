import { Autowired, Bean, BeanStub } from "@ag-grid-community/core";
import { ChartService } from "../../chartService";
import { ChartMenuContext } from "../menu/chartMenuContext";
import { AdvancedSettingsMenuFactory } from "../menu/advancedSettings/advancedSettingsMenuFactory";

@Bean('chartMenuService')
export class ChartMenuService extends BeanStub {
    @Autowired('chartService') private readonly chartService: ChartService;
    @Autowired('advancedSettingsMenuFactory') private readonly advancedSettingsMenuFactory: AdvancedSettingsMenuFactory;

    public isLegacyFormat(): boolean {
        return this.gridOptionsService.get('legacyChartsMenu') ?? !this.chartService.isEnterprise();
    }

    public downloadChart(chartMenuContext: ChartMenuContext, dimensions?: { width: number, height: number }, fileName?: string, fileFormat?: string): void {
        chartMenuContext.chartController.getChartProxy().downloadChart(dimensions, fileName, fileFormat);
    }

    public toggleLinked(chartMenuContext: ChartMenuContext): void {
        chartMenuContext.chartController.detachChartRange();
    }

    public openAdvancedSettings(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void {
        this.advancedSettingsMenuFactory.showMenu(chartMenuContext, eventSource);
    }
}