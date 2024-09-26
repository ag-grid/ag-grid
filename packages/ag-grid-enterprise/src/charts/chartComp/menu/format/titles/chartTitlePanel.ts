import type { AgInputTextFieldParams, BeanCollection } from 'ag-grid-community';

import type { AgSliderParams } from '../../../../widgets/agSlider';
import type { ChartMenuService } from '../../../services/chartMenuService';
import { TitlePanel } from './titlePanel';

export class ChartTitlePanel extends TitlePanel {
    private chartMenuService: ChartMenuService;

    public override wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.chartMenuService = beans.chartMenuService as ChartMenuService;
    }

    private titlePlaceholder: string;

    public override postConstruct(): void {
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
        super.postConstruct();
        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedEventListeners({
            chartTitleEdit: () => {
                this.fontPanel.setEnabled(this.hasTitle());
            },
        });
    }

    protected override getTextInputParams(): AgInputTextFieldParams {
        const params = super.getTextInputParams();
        if (this.shouldOverrideTextWithPlaceholder(params.value)) {
            params.value = this.titlePlaceholder;
        }
        return params;
    }

    protected override getSpacingSliderParams(): AgSliderParams {
        const params = super.getSpacingSliderParams();
        // Default title spacing is 10, but this isn't reflected in the options - this should really be fixed there.
        params.value = '10';
        return params;
    }

    protected override onEnableChange(enabled: boolean): void {
        if (this.chartMenuService.doesChartToolbarExist()) {
            // extra padding is only included when the toolbar is present
            const topPadding: number = this.chartOptions.getValue('padding.top');
            this.chartOptions.setValue('padding.top', enabled ? topPadding - 20 : topPadding + 20);
        }

        this.chartOptions.setValue(`${this.key}.enabled`, enabled);
        const currentTitleText = this.chartOptions.getValue(`${this.key}.text`);
        if (enabled && this.shouldOverrideTextWithPlaceholder(currentTitleText)) {
            this.chartOptions.setValue(`${this.key}.text`, this.titlePlaceholder);
        }
    }

    private shouldOverrideTextWithPlaceholder(currentTitleText?: string): boolean {
        return currentTitleText === 'Title' || currentTitleText?.trim().length === 0;
    }
}
