import type { AgInputTextFieldParams, BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { AgSliderParams } from '../../../../../widgets/agSlider';
import type { ChartOptionsProxy } from '../../../services/chartOptionsService';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import { FontPanel } from '../fontPanel';
export declare class TitlePanel extends Component {
    private readonly chartMenuUtils;
    private readonly name;
    protected readonly key: string;
    protected chartTranslationService: ChartTranslationService;
    wireBeans(beans: BeanCollection): void;
    protected readonly chartOptions: ChartOptionsProxy;
    protected fontPanel: FontPanel;
    constructor(chartMenuUtils: ChartMenuParamsFactory, name: ChartTranslationKey, key: string);
    postConstruct(): void;
    protected hasTitle(): boolean;
    private initFontPanel;
    protected getTextInputParams(): AgInputTextFieldParams;
    protected getSpacingSliderParams(): AgSliderParams;
    protected onEnableChange(enabled: boolean): void;
}
