import { AgCheckbox, AgSelect, Autowired, Component, PostConstruct } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';

import { AgSlider } from '../../../../../widgets/agSlider';
import { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import { FontPanel, FontPanelParams } from '../fontPanel';
import { FormatPanelOptions } from '../formatPanel';

export class LegendPanel extends Component {
    private static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="legendGroup">
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    private readonly legendGroup: AgGroupComponent;

    private readonly key: string;
    private readonly isGradient: boolean;

    constructor(private readonly options: FormatPanelOptions) {
        super();

        this.isGradient = ['treemap', 'sunburst', 'heatmap'].includes(options.seriesType);
        this.key = this.isGradient ? 'gradientLegend' : 'legend';
    }

    @PostConstruct
    private init() {
        const { chartMenuParamsFactory, isExpandedOnInit: expanded, registerGroupComponent } = this.options;
        const positionSelect = this.createManagedBean(
            new AgSelect(
                chartMenuParamsFactory.getDefaultSelectParams(
                    `${this.key}.position`,
                    'position',
                    ['top', 'right', 'bottom', 'left'].map((position: ChartTranslationKey) => ({
                        value: position,
                        text: this.chartTranslationService.translate(position),
                    }))
                )
            )
        );
        const enabledGroup = this.createManagedBean(
            new AgGroupComponent(
                chartMenuParamsFactory.addEnableParams<AgGroupComponentParams>(`${this.key}.enabled`, {
                    cssIdentifier: 'charts-format-sub-level',
                    direction: 'vertical',
                    suppressOpenCloseIcons: true,
                    title: this.chartTranslationService.translate('legendEnabled'),
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
        const legendGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('legend'),
            suppressEnabledCheckbox: true,
            expanded,
            items: [enabledGroup],
        };
        this.setTemplate(LegendPanel.TEMPLATE, [AgGroupComponent], {
            legendGroup: legendGroupParams,
        });
        registerGroupComponent(this.legendGroup);
    }

    private getItems(chartMenuParamsFactory: ChartMenuParamsFactory): Component[] {
        const createSlider = (expression: string, labelKey: ChartTranslationKey, defaultMaxValue: number) =>
            this.createManagedBean(
                new AgSlider(
                    chartMenuParamsFactory.getDefaultSliderParams(
                        `${this.key}.${expression}`,
                        labelKey,
                        defaultMaxValue
                    )
                )
            );
        if (this.isGradient) {
            return [
                this.createManagedBean(
                    new AgCheckbox(
                        chartMenuParamsFactory.addValueParams('gradientLegend.reverseOrder', {
                            label: this.chartTranslationService.translate('reverseDirection'),
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
            createSlider('item.marker.strokeWidth', 'markerStroke', 10),
            createSlider('item.marker.padding', 'itemSpacing', 20),
            createSlider('item.paddingX', 'layoutHorizontalSpacing', 50),
            createSlider('item.paddingY', 'layoutVerticalSpacing', 50),
        ];
    }

    private createLabelPanel(chartMenuParamsFactory: ChartMenuParamsFactory): FontPanel {
        const rootKey = this.isGradient ? 'gradientLegend.scale.label' : 'legend.item.label';
        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            chartMenuParamsFactory,
            keyMapper: (key) => `${rootKey}.${key}`,
        };

        return this.createManagedBean(new FontPanel(params));
    }
}
