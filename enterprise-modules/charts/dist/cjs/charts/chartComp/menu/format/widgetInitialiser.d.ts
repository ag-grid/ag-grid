import { ChartTranslator } from "../../chartTranslator";
import { ChartProxy } from "../../chartProxies/chartProxy";
import { AgSlider } from "@ag-grid-community/core";
import { FontPanelParams } from "./fontPanel";
export declare function initLineOpacitySlider(seriesLineOpacitySlider: AgSlider, chartTranslator: ChartTranslator, chartProxy: ChartProxy<any, any>): void;
export declare function initFillOpacitySlider(seriesFillOpacitySlider: AgSlider, chartTranslator: ChartTranslator, chartProxy: ChartProxy<any, any>): void;
export declare function initFontPanelParams(chartTranslator: ChartTranslator, chartProxy: ChartProxy<any, any>): FontPanelParams;
