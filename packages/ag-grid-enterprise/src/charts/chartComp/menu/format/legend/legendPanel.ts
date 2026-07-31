import { RefPlaceholder } from 'ag-stack';

import type { BeanCollection, GridSelect } from 'ag-grid-community';
import { AgCheckbox, AgSelect, Component } from 'ag-grid-community';

import { AgGroupComponent, AgGroupComponentSelector } from '../../../../../agStack/agGroupComponent';
import { AgSlider } from '../../../../../agStack/agSlider';
import type {
    GridSlider,
    GroupComponent,
    GroupComponentParams,
} from '../../../../../widgets/gridEnterpriseWidgetTypes';
import type { ChartController } from '../../../chartController';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuContext } from '../../chartMenuContext';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import type { FontPanelParams } from '../fontPanel';
import { FontPanel } from '../fontPanel';
import type { FormatPanelOptions } from '../formatPanel';

export class LegendPanel extends Component {
    private chartTranslation: ChartTranslationService;
    private readonly chartController: ChartController;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }
    private readonly legendGroup: GroupComponent = RefPlaceholder;
    private enabledGroup: GroupComponent = RefPlaceholder;

    private readonly key: string;
    private readonly isGradient: boolean;

    constructor(
        private readonly options: FormatPanelOptions,
        chartMenuContext: ChartMenuContext
    ) {
        super();

        this.isGradient = ['treemap', 'sunburst', 'heatmap'].includes(options.seriesType);
        this.key = this.isGradient ? 'gradientLegend' : 'legend';
        this.chartController = chartMenuContext.chartController;
    }

    public postConstruct() {
        const { chartMenuParamsFactory, isExpandedOnInit: expanded, registerGroupComponent } = this.options;
        const positionSelect = this.createManagedBean<GridSelect>(
            new AgSelect(
                chartMenuParamsFactory.getDefaultSelectParams(
                    `${this.key}.position`,
                    'position',
                    ['top', 'right', 'bottom', 'left'].map((position: ChartTranslationKey) => ({
                        value: position,
                        text: this.chartTranslation.translate(position),
                    }))
                )
            )
        );
        this.enabledGroup = this.createManagedBean(
            new AgGroupComponent(
                chartMenuParamsFactory.addEnableParams<GroupComponentParams>(`${this.key}.enabled`, {
                    cssIdentifier: 'charts-format-sub-level',
                    direction: 'vertical',
                    suppressOpenCloseIcons: true,
                    title: this.chartTranslation.translate('legendEnabled'),
                    suppressEnabledCheckbox: true,
                    useToggle: true,
                    items: [
                        this.createLabelPanel(chartMenuParamsFactory),
                        positionSelect,
                        ...this.getItems(chartMenuParamsFactory),
                    ],
                })
            )
        );
        const legendGroupParams: GroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslation.translate('legend'),
            suppressEnabledCheckbox: true,
            expanded,
            items: [this.enabledGroup],
        };
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="legendGroup">
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector],
            {
                legendGroup: legendGroupParams,
            }
        );
        registerGroupComponent(this.legendGroup);

        const listener = this.updateLegendEnabledState.bind(this);
        this.addManagedListeners(this.chartController, {
            chartModelUpdate: listener,
            chartApiUpdate: listener,
        });
    }

    private updateLegendEnabledState(): void {
        const { valueCols } = this.chartController.getColStateForMenu();
        this.enabledGroup.setEnabled(valueCols.filter((vc) => vc.selected).length > 1);
    }

    private getItems(chartMenuParamsFactory: ChartMenuParamsFactory): Component<any>[] {
        const createSlider = (
            expression: string,
            labelKey: ChartTranslationKey,
            defaultMaxValue: number,
            valueWhenUnset?: number
        ): GridSlider => {
            const fullExpression = `${this.key}.${expression}`;
            const params = chartMenuParamsFactory.getDefaultSliderParams(fullExpression, labelKey, defaultMaxValue);
            if (valueWhenUnset != null && chartMenuParamsFactory.getChartOptions().getValue(fullExpression) == null) {
                params.value = `${valueWhenUnset}`;
            }
            return this.createManagedBean(new AgSlider(params));
        };
        if (this.isGradient) {
            return [
                this.createManagedBean(
                    new AgCheckbox(
                        chartMenuParamsFactory.addValueParams('gradientLegend.reverseOrder', {
                            label: this.chartTranslation.translate('reverseDirection'),
                            labelWidth: 'flex',
                        })
                    )
                ),
                createSlider('gradient.thickness', 'thickness', 40),
                createSlider('gradient.preferredLength', 'preferredLength', 300),
                createSlider('spacing', 'spacing', 200),
            ];
        }
        return [
            createSlider('spacing', 'spacing', 200),
            createSlider('item.marker.size', 'markerSize', 40),
            // The legend has no stroke width of its own; left unset each marker takes the series' own
            // stroke width capped at 2, which is 1 for every series default.
            createSlider('item.marker.strokeWidth', 'markerStroke', 10, 1),
            // The marker padding is four-sided; only the side facing the label is the marker-to-label gap.
            createSlider('item.marker.padding.right', 'itemSpacing', 20),
            this.createItemPaddingSlider(chartMenuParamsFactory, 'layoutHorizontalSpacing', ['left', 'right']),
            this.createItemPaddingSlider(chartMenuParamsFactory, 'layoutVerticalSpacing', ['top', 'bottom']),
        ];
    }

    /**
     * Item spacing is a single four-sided `padding` on the legend item, whereas the panel offers one
     * slider per axis, so each slider reads one side of the pair it owns and writes both.
     */
    private createItemPaddingSlider(
        chartMenuParamsFactory: ChartMenuParamsFactory,
        labelKey: ChartTranslationKey,
        sides: [string, string]
    ): GridSlider {
        const expressionFor = (side: string) => `${this.key}.item.padding.${side}`;
        const params = chartMenuParamsFactory.getDefaultSliderParams(expressionFor(sides[0]), labelKey, 50);
        const chartOptions = chartMenuParamsFactory.getChartOptions();
        params.onValueChange = (value) =>
            chartOptions.setValues(sides.map((side) => ({ expression: expressionFor(side), value })));
        return this.createManagedBean(new AgSlider(params));
    }

    private createLabelPanel(chartMenuParamsFactory: ChartMenuParamsFactory): FontPanel {
        const rootKey = this.isGradient ? 'gradientLegend.scale.label' : 'legend.item.label';
        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            chartMenuParamsFactory,
            keyMapper: (key) => `${rootKey}.${key}`,
            cssIdentifier: 'charts-format-sub-level-no-header',
        };

        return this.createManagedBean(new FontPanel(params));
    }
}
