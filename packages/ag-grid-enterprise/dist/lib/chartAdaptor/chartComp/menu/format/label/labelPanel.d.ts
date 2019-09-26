// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
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
    private params;
    private activeComps;
    constructor(params: LabelPanelParams);
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
