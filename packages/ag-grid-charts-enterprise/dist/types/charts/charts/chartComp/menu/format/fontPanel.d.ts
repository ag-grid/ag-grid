import { Component } from "ag-grid-community";
import { ChartMenuParamsFactory } from "../chartMenuParamsFactory";
export interface FontPanelParams {
    name?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    onEnableChange?: (enabled: boolean) => void;
    chartMenuUtils: ChartMenuParamsFactory;
    keyMapper: (key: string) => string;
}
export declare class FontPanel extends Component {
    static TEMPLATE: string;
    private fontGroup;
    private readonly chartTranslationService;
    private readonly params;
    private readonly chartOptions;
    private activeComps;
    constructor(params: FontPanelParams);
    private init;
    addCompToPanel(comp: Component): void;
    setEnabled(enabled: boolean): void;
    private getFamilySelectParams;
    private getSizeSelectParams;
    private getWeightStyleSelectParams;
    addItemToPanel(item: Component): void;
    private destroyActiveComps;
    protected destroy(): void;
    private setFont;
    private getInitialFontValue;
}
