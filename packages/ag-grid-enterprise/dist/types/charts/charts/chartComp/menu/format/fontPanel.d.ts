import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuParamsFactory } from '../chartMenuParamsFactory';
export interface FontPanelParams {
    name?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    onEnableChange?: (enabled: boolean) => void;
    chartMenuParamsFactory: ChartMenuParamsFactory;
    keyMapper: (key: string) => string;
    cssIdentifier?: string;
}
export declare class FontPanel extends Component {
    private readonly params;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private readonly fontGroup;
    private readonly chartOptions;
    private activeComps;
    constructor(params: FontPanelParams);
    postConstruct(): void;
    addItem(comp: Component<any>, prepend?: boolean): void;
    setEnabled(enabled: boolean): void;
    private getFamilySelectParams;
    private getSizeSelectParams;
    private getWeightStyleSelectParams;
    private destroyActiveComps;
    destroy(): void;
    private setFont;
    private getInitialFontValue;
}
