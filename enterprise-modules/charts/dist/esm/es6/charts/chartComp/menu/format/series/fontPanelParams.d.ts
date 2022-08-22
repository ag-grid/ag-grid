import { ChartTranslationService } from "../../../services/chartTranslationService";
import { FontPanelParams } from "../fontPanel";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
export declare function initFontPanelParams(chartTranslationService: ChartTranslationService, chartOptionsService: ChartOptionsService, getSelectedSeries: () => ChartSeriesType): FontPanelParams;
