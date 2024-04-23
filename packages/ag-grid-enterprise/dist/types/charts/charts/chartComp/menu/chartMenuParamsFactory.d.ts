import { AgFieldParams, AgCheckboxParams, AgInputNumberFieldParams, AgSelectParams, AgSliderParams, BeanStub, ListOption } from "ag-grid-community";
import { AgColorPickerParams } from "../../../widgets/agColorPicker";
import { ChartOptionsProxy } from "../services/chartOptionsService";
import { ChartTranslationKey } from "../services/chartTranslationService";
import { FontPanelParams } from "./format/fontPanel";
export declare class ChartMenuParamsFactory extends BeanStub {
    private readonly chartOptionsProxy;
    private readonly chartTranslationService;
    constructor(chartOptionsProxy: ChartOptionsProxy);
    getDefaultColorPickerParams(expression: string, labelKey?: ChartTranslationKey, options?: {
        parseInputValue: (value: any) => any;
        formatInputValue: (value: any) => any;
    }): AgColorPickerParams;
    getDefaultNumberInputParams(expression: string, labelKey: ChartTranslationKey, options?: {
        precision?: number;
        step?: number;
        min?: number;
        max?: number;
    }): AgInputNumberFieldParams;
    getDefaultSliderParams(expression: string, labelKey: ChartTranslationKey, defaultMaxValue: number, isArray?: boolean): AgSliderParams;
    getDefaultSliderParamsWithoutValueParams(value: number, labelKey: ChartTranslationKey, defaultMaxValue: number): AgSliderParams;
    getDefaultCheckboxParams(expression: string, labelKey: ChartTranslationKey, options?: {
        readOnly?: boolean;
        passive?: boolean;
    }): AgCheckboxParams;
    getDefaultSelectParams(expression: string, labelKey: ChartTranslationKey, dropdownOptions: Array<ListOption>, options?: {
        pickerType?: string;
        pickerAriaLabelKey?: string;
        pickerAriaLabelValue?: string;
    }): AgSelectParams;
    getDefaultLegendParams(expression: string): AgSelectParams;
    getDefaultFontPanelParams(expression: string, labelKey: ChartTranslationKey): FontPanelParams;
    addValueParams<P extends AgFieldParams>(expression: string, params: P, options?: {
        parseInputValue: (value: any) => any;
        formatInputValue: (value: any) => any;
    }): P;
    addEnableParams<P extends {
        enabled?: boolean;
        onEnableChange?: (value: boolean) => void;
    }>(expression: string, params: P): P;
    getChartOptions(): ChartOptionsProxy;
}
