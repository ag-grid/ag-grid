import { FontPanelParams } from "../fontPanel";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
interface InitFontPanelParams {
    labelName: string;
    chartOptionsService: ChartOptionsService;
    getSelectedSeries: () => ChartSeriesType;
    seriesOptionLabelProperty: 'calloutLabel' | 'sectorLabel' | 'label';
}
export declare function initFontPanelParams({ labelName, chartOptionsService, getSelectedSeries, seriesOptionLabelProperty }: InitFontPanelParams): FontPanelParams;
export {};
