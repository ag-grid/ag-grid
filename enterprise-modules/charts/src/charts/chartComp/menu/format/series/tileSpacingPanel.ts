import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentSelector } from '@ag-grid-enterprise/core';

import type { AgSliderParams } from '../../../../../widgets/agSlider';
import { AgSliderSelector } from '../../../../../widgets/agSlider';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class TileSpacingPanel extends Component {
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }
    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="groupSpacing">
                <ag-slider data-ref="groupPaddingSlider"></ag-slider>
                <ag-slider data-ref="groupSpacingSlider"></ag-slider>
            </ag-group-component>
            <ag-group-component data-ref="tileSpacing">
                <ag-slider data-ref="tilePaddingSlider"></ag-slider>
                <ag-slider data-ref="tileSpacingSlider"></ag-slider>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, AgSliderSelector],
            {
                groupSpacing: { ...groupParams, title: this.chartTranslationService.translate('group') },
                tileSpacing: { ...groupParams, title: this.chartTranslationService.translate('tile') },
                groupPaddingSlider: this.getSliderParams('padding', 'group.padding'),
                groupSpacingSlider: this.getSliderParams('spacing', 'group.gap'),
                tilePaddingSlider: this.getSliderParams('padding', 'tile.padding'),
                tileSpacingSlider: this.getSliderParams('spacing', 'tile.gap'),
            }
        );
    }

    private getSliderParams(labelKey: ChartTranslationKey, key: string): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams(key, labelKey, 10);
    }
}
