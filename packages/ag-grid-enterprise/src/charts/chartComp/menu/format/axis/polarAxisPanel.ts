import { RefPlaceholder } from 'ag-stack';

import type { BeanCollection, GridSelect, ListOption } from 'ag-grid-community';
import { AgSelect, Component } from 'ag-grid-community';

import { AgGroupComponent, AgGroupComponentSelector } from '../../../../../agStack/agGroupComponent';
import { AgSlider, AgSliderSelector } from '../../../../../agStack/agSlider';
import type {
    GridSlider,
    GroupComponent,
    GroupComponentParams,
} from '../../../../../widgets/gridEnterpriseWidgetTypes';
import { ColorPickerSelector } from '../../../../widgets/colorPicker';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import { getSeriesType, isRadial } from '../../../utils/seriesTypeMapper';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import type { FontPanelParams } from '../fontPanel';
import { FontPanel } from '../fontPanel';
import type { FormatPanelOptions } from '../formatPanel';

export class PolarAxisPanel extends Component {
    private readonly axisGroup: GroupComponent = RefPlaceholder;

    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }
    constructor(private readonly options: FormatPanelOptions) {
        super();
    }

    public postConstruct() {
        const { isExpandedOnInit: expanded, chartOptionsService, registerGroupComponent } = this.options;
        const axisGroupParams: GroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.translate('polarAxis'),
            expanded,
            suppressEnabledCheckbox: true,
        };
        const chartAxisThemeOverrides = this.createManagedBean(
            new ChartMenuParamsFactory(chartOptionsService.getPolarAxisThemeOverridesProxy('angle'))
        );
        const axisColorInputParams = chartAxisThemeOverrides.getDefaultColorPickerParams('line.stroke');
        const axisLineWidthSliderParams = chartAxisThemeOverrides.getDefaultSliderParams('line.width', 'thickness', 10);
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="axisGroup">
                <ag-color-picker data-ref="axisColorInput"></ag-color-picker>
                <ag-slider data-ref="axisLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, ColorPickerSelector, AgSliderSelector],
            {
                axisGroup: axisGroupParams,
                axisColorInput: axisColorInputParams,
                axisLineWidthSlider: axisLineWidthSliderParams,
            }
        );
        registerGroupComponent(this.axisGroup);

        this.initAxis(chartAxisThemeOverrides);
        this.initAxisLabels(chartAxisThemeOverrides);
        this.initRadiusAxis();
    }

    /** Only one of the polar axes carries `axisType`'s options, so reads and writes must target it alone. */
    private createSingleAxisParamsFactory(axisType: 'angle' | 'radius'): ChartMenuParamsFactory {
        return this.createManagedBean(
            new ChartMenuParamsFactory(
                this.options.chartOptionsService.getPolarAxisThemeOverridesProxy(axisType, 'thisAxis')
            )
        );
    }

    private initAxis(chartAxisThemeOverrides: ChartMenuParamsFactory) {
        const chartType = this.options.chartController.getChartType();
        const hasConfigurableAxisShape = ['radarLine', 'radarArea'].includes(chartType);
        if (hasConfigurableAxisShape) {
            const options: Array<ListOption> = [
                { value: 'circle', text: this.translate('circle') },
                { value: 'polygon', text: this.translate('polygon') },
            ];

            this.axisGroup.addItem(
                this.createSelect({
                    chartAxisThemeOverrides,
                    labelKey: 'shape',
                    options: options,
                    property: 'shape',
                })
            );
        }

        if (chartType !== 'pie') {
            this.axisGroup.addItem(
                this.createSlider({
                    // The inner radius belongs to the radius axis.
                    chartAxisThemeOverrides: this.createSingleAxisParamsFactory('radius'),
                    labelKey: 'innerRadius',
                    defaultMaxValue: 1,
                    property: 'innerRadiusRatio',
                })
            );
        }
    }

    private initAxisLabels(chartAxisThemeOverrides: ChartMenuParamsFactory) {
        const params: FontPanelParams = {
            name: this.translate('labels'),
            enabled: true,
            suppressEnabledCheckbox: true,
            chartMenuParamsFactory: chartAxisThemeOverrides,
            keyMapper: (key) => `label.${key}`,
        };

        const labelPanelComp = this.createManagedBean(new FontPanel(params));
        const labelOrientationComp = this.createOrientationWidget();
        labelPanelComp.addItem(labelOrientationComp);

        this.axisGroup.addItem(labelPanelComp);
    }

    private createOrientationWidget(): GridSelect {
        const options: Array<ListOption> = [
            { value: 'fixed', text: this.translate('fixed') },
            { value: 'parallel', text: this.translate('parallel') },
            { value: 'perpendicular', text: this.translate('perpendicular') },
        ];

        return this.createSelect({
            // Only the angle axis orients its labels.
            chartAxisThemeOverrides: this.createSingleAxisParamsFactory('angle'),
            labelKey: 'orientation',
            options,
            property: 'label.orientation',
            // No theme sets an orientation, and an unset one renders the same as `fixed`.
            valueWhenUnset: 'fixed',
        });
    }

    private initRadiusAxis() {
        const chartSeriesType = getSeriesType(this.options.chartController.getChartType());
        if (!isRadial(chartSeriesType)) {
            return;
        }
        // Which axis holds the categories depends on the chart type, and only that axis is padded.
        const categoryAxisType = this.options.chartOptionsService.getPolarCategoryAxisType();
        if (!categoryAxisType) {
            return;
        }
        const chartAxisThemeOverrides = this.createSingleAxisParamsFactory(categoryAxisType);

        const items = [
            this.createSlider({
                chartAxisThemeOverrides,
                labelKey: 'groupPadding',
                defaultMaxValue: 1,
                property: 'paddingInner',
            }),
            this.createSlider({
                chartAxisThemeOverrides,
                labelKey: 'seriesPadding',
                defaultMaxValue: 1,
                property: 'groupPaddingInner',
            }),
        ];

        const paddingPanelComp = this.createManagedBean<GroupComponent>(
            new AgGroupComponent({
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                enabled: true,
                suppressEnabledCheckbox: true,
                title: this.translate('padding'),
                items,
            })
        )
            .hideEnabledCheckbox(true)
            .hideOpenCloseIcons(true);

        this.axisGroup.addItem(paddingPanelComp);
    }

    private createSlider(config: {
        chartAxisThemeOverrides: ChartMenuParamsFactory;
        labelKey: ChartTranslationKey;
        defaultMaxValue: number;
        step?: number;
        property: string;
    }): GridSlider {
        const { labelKey, defaultMaxValue, step = 0.05, property, chartAxisThemeOverrides } = config;
        const params = chartAxisThemeOverrides.getDefaultSliderParams(property, labelKey, defaultMaxValue);
        params.step = step;
        return this.createManagedBean(new AgSlider(params));
    }

    private createSelect(config: {
        chartAxisThemeOverrides: ChartMenuParamsFactory;
        labelKey: ChartTranslationKey;
        options: Array<ListOption>;
        property: string;
        valueWhenUnset?: string;
    }): GridSelect {
        const { labelKey, options, property, chartAxisThemeOverrides, valueWhenUnset } = config;
        const params = chartAxisThemeOverrides.getDefaultSelectParams(property, labelKey, options);
        params.value ??= valueWhenUnset;
        return this.createManagedBean(new AgSelect(params));
    }

    private translate(key: ChartTranslationKey) {
        return this.chartTranslation.translate(key);
    }
}
