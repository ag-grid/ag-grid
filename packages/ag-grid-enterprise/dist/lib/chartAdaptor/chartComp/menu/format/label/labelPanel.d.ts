// ag-grid-enterprise v21.1.1
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare type LabelFont = {
    family?: string;
    style?: string;
    weight?: string;
    size?: number;
    color?: string;
};
export interface LabelPanelParams {
    name?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    setEnabled?: (enabled: boolean) => void;
    initialFont: LabelFont;
    setFont: (font: LabelFont) => void;
}
export declare class LabelPanel extends Component {
    static TEMPLATE: string;
    private labelsGroup;
    private labelFontFamilySelect;
    private labelFontWeightSelect;
    private labelFontSizeSelect;
    private labelColorPicker;
    private chartTranslator;
    private chart;
    private params;
    private activeComps;
    private chartController;
    constructor(chartController: ChartController, params: LabelPanelParams);
    private init;
    addCompToPanel(comp: Component): void;
    setEnabled(enabled: boolean): void;
    private initGroup;
    private initFontSelects;
    private initFontColorPicker;
    private getWeigthNames;
    private destroyActiveComps;
    destroy(): void;
}
