import type { AgTooltipMode } from 'ag-charts-types';

import type { GridSelect } from 'ag-grid-community';
import { AgSelectSelector, Component, RefPlaceholder } from 'ag-grid-community';

import type { AgGroupComponentParams } from '../../../../../widgets/agGroupComponent';
import { AgGroupComponentSelector } from '../../../../../widgets/agGroupComponent';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

function _capitalise<T extends string>(str: T): Capitalize<T> {
    return (str[0].toUpperCase() + str.substring(1)) as Capitalize<T>;
}

export class TooltipPanel extends Component {
    private tooltipMode: GridSelect = RefPlaceholder;

    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const { chartMenuUtils, beans } = this;
        const propertyKey = 'tooltip';
        const chartTranslation = beans.chartTranslation as ChartTranslationService;
        const tooltipGroupParams = chartMenuUtils.addEnableParams<AgGroupComponentParams>(`${propertyKey}.enabled`, {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: chartTranslation.translate('tooltips'),
            suppressEnabledCheckbox: true,
            useToggle: true,
        });
        const tooltipModeLocaleKey = 'tooltipMode';
        const tooltipModeSelectionOptions = (['single', 'shared', 'compact'] as AgTooltipMode[]).map((value) => ({
            value,
            text: chartTranslation.translate(`${tooltipModeLocaleKey}${_capitalise(value)}`),
        }));
        const tooltipModeExpression = `${propertyKey}.mode`;
        const tooltipModeSelectParams = chartMenuUtils.getDefaultSelectParams(
            tooltipModeExpression,
            tooltipModeLocaleKey,
            tooltipModeSelectionOptions
        );
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="tooltipGroup">
                <ag-select data-ref="tooltipMode"></ag-select>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, AgSelectSelector],
            {
                tooltipGroup: tooltipGroupParams,
                tooltipMode: tooltipModeSelectParams,
            }
        );

        this.addManagedEventListeners({
            chartOptionsChanged: () => {
                // tooltip.mode updates outside of series-specific properties
                const tooltipModeValue = chartMenuUtils.getChartOptions().getValue(tooltipModeExpression);
                this.tooltipMode.setValue(tooltipModeValue, true);
            },
        });
    }
}
