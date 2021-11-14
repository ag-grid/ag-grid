import { ChartTranslator } from "../../chartTranslator";
import { AgSlider } from "@ag-grid-community/core";
import { FontPanelParams } from "./fontPanel";
import { ChartOptionsService } from "../../chartOptionsService";
export declare function initLineOpacitySlider(seriesLineOpacitySlider: AgSlider, chartTranslator: ChartTranslator, chartOptionsService: ChartOptionsService): void;
export declare function initFillOpacitySlider(seriesFillOpacitySlider: AgSlider, chartTranslator: ChartTranslator, chartOptionsService: ChartOptionsService): void;
export declare function initFontPanelParams(chartTranslator: ChartTranslator, chartOptionsService: ChartOptionsService): FontPanelParams;
