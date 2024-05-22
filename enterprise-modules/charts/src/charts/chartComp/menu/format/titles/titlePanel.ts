import { AgInputTextField, AgInputTextFieldParams, Autowired, Component } from '@ag-grid-community/core';

import { AgSlider, AgSliderParams } from '../../../../../widgets/agSlider';
import { ChartOptionsProxy } from '../../../services/chartOptionsService';
import { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import { FontPanel, FontPanelParams } from '../fontPanel';

export class TitlePanel extends Component {
    public static TEMPLATE = /* html */ `<div></div>`;

    @Autowired('chartTranslationService') protected readonly chartTranslationService: ChartTranslationService;

    protected readonly chartOptions: ChartOptionsProxy;

    protected fontPanel: FontPanel;

    constructor(
        private readonly chartMenuUtils: ChartMenuParamsFactory,
        private readonly name: ChartTranslationKey,
        protected readonly key: string
    ) {
        super(TitlePanel.TEMPLATE);
        this.chartOptions = chartMenuUtils.getChartOptions();
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.initFontPanel();
    }

    protected hasTitle(): boolean {
        const title: any = this.chartOptions.getValue(this.key);
        return title && title.enabled && title.text && title.text.length > 0;
    }

    private initFontPanel(): void {
        const hasTitle = this.hasTitle();

        const fontPanelParams: FontPanelParams = {
            name: this.chartTranslationService.translate(this.name),
            enabled: hasTitle,
            suppressEnabledCheckbox: false,
            chartMenuParamsFactory: this.chartMenuUtils,
            keyMapper: (key) => `${this.key}.${key}`,
            onEnableChange: (enabled) => this.onEnableChange(enabled),
        };

        this.fontPanel = this.createManagedBean(new FontPanel(fontPanelParams));

        this.fontPanel.addItem(this.createBean(new AgInputTextField(this.getTextInputParams())), true);
        this.fontPanel.addItem(this.createBean(new AgSlider(this.getSpacingSliderParams())));

        this.getGui().appendChild(this.fontPanel.getGui());
    }

    protected getTextInputParams(): AgInputTextFieldParams {
        return this.chartMenuUtils.addValueParams(`${this.key}.text`, {
            label: this.chartTranslationService.translate('title'),
            labelAlignment: 'top',
        });
    }

    protected getSpacingSliderParams(): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams(`${this.key}.spacing`, 'spacing', 100);
    }

    protected onEnableChange(enabled: boolean): void {
        this.chartOptions.setValue(`${this.key}.enabled`, enabled);
    }
}
