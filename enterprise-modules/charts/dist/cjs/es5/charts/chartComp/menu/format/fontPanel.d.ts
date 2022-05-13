import { Component } from "@ag-grid-community/core";
export interface Font {
    family?: string;
    style?: string;
    weight?: string;
    size?: number;
    color?: string;
}
export interface FontPanelParams {
    name?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    setEnabled?: (enabled: boolean) => void;
    initialFont: Font;
    setFont: (font: Font) => void;
}
export declare class FontPanel extends Component {
    static TEMPLATE: string;
    private fontGroup;
    private familySelect;
    private weightStyleSelect;
    private sizeSelect;
    private colorPicker;
    private chartTranslationService;
    private params;
    private activeComps;
    constructor(params: FontPanelParams);
    private init;
    addCompToPanel(comp: Component): void;
    setEnabled(enabled: boolean): void;
    private initGroup;
    private initFontFamilySelect;
    private initFontSizeSelect;
    private initFontWeightStyleSelect;
    private initFontColorPicker;
    private destroyActiveComps;
    protected destroy(): void;
}
