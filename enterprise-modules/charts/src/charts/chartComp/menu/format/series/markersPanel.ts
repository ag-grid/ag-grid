import type { BeanCollection } from '@ag-grid-community/core';
import { AgSelectSelector, Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentSelector } from '@ag-grid-enterprise/core';

import type { AgSlider, AgSliderParams } from '../../../../../widgets/agSlider';
import { AgSliderSelector } from '../../../../../widgets/agSlider';
import type { ChartOptionsService } from '../../../services/chartOptionsService';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class MarkersPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="seriesMarkersGroup">
                <ag-select data-ref="seriesMarkerShapeSelect"></ag-select>
                <ag-slider data-ref="seriesMarkerSizeSlider"></ag-slider>
                <ag-slider data-ref="seriesMarkerStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }
    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const seriesMarkersGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>('marker.enabled', {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('markers'),
            suppressEnabledCheckbox: true,
            useToggle: true,
            suppressOpenCloseIcons: true,
        });

        this.setTemplate(MarkersPanel.TEMPLATE, [AgGroupComponentSelector, AgSelectSelector, AgSliderSelector], {
            seriesMarkersGroup: seriesMarkersGroupParams,
            seriesMarkerShapeSelect: this.chartMenuUtils.getDefaultSelectParams(
                'marker.shape',
                'shape',
                getShapeSelectOptions(this.chartTranslationService)
            ),
            seriesMarkerSizeSlider: this.chartMenuUtils.getDefaultSliderParams('marker.size', 'size', 60),
            seriesMarkerStrokeWidthSlider: this.chartMenuUtils.getDefaultSliderParams(
                'marker.strokeWidth',
                'strokeWidth',
                10
            ),
        });
    }
}
