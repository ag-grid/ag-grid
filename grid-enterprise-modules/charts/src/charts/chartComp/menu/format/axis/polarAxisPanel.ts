import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    ListOption,
    PostConstruct,
    RefSelector,
} from '@ag-grid-community/core';
import {ChartController} from '../../../chartController';
import {FontPanel, FontPanelParams} from '../fontPanel';
import {ChartTranslationService} from '../../../services/chartTranslationService';
import {ChartOptionsService} from '../../../services/chartOptionsService';
import {FormatPanelOptions} from '../formatPanel';
import {isPolar, isRadial} from '../../../utils/seriesTypeMapper';
import { ChartMenuUtils } from '../../chartMenuUtils';

interface SliderConfig {
    label: string;
    maxValue: number;
    minValue?: number;
    step?: number;
    currentValue: number;
    onValueChange: (newValue: number) => void;
}

interface SelectConfig {
    label: string;
    options: Array<ListOption>;
    currentValue?: string;
    onValueChange: (newValue: string) => void;
}

export class PolarAxisPanel extends Component {
    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('axisGroup') private axisGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    private readonly chartController: ChartController;
    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const axisGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.translate('axis'),
            expanded: this.isExpandedOnInit,
            suppressEnabledCheckbox: true
        };
        const axisColorInputParams = this.chartMenuUtils.getDefaultColorPickerParams({
            value: this.chartOptionsService.getAxisProperty('line.color'),
            onValueChange: (newColor) => this.chartOptionsService.setAxisProperty('line.color', newColor)
        });
        const axisLineWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams({
            defaultMaxValue: 10,
            labelKey: 'thickness',
            value: this.chartOptionsService.getAxisProperty<number>('line.width'),
            onValueChange: (newValue) => this.chartOptionsService.setAxisProperty('line.width', newValue)
        });
        this.setTemplate(PolarAxisPanel.TEMPLATE, {
            axisGroup: axisGroupParams,
            axisColorInput: axisColorInputParams,
            axisLineWidthSlider: axisLineWidthSliderParams
        });

        this.initAxis();
        this.initAxisLabels();
        this.initRadiusAxis();
    }

    private initAxis() {
        const chartType = this.chartController.getChartType();
        const hasConfigurableAxisShape = ['radarLine', 'radarArea'].includes(chartType);
        if (hasConfigurableAxisShape) {
            const options: Array<ListOption> = [
                { value: 'circle', text: this.translate('circle') },
                { value: 'polygon', text: this.translate('polygon') },
            ];

            this.axisGroup.addItem(this.initSelect({
                label: 'shape',
                options: options,
                currentValue: this.chartOptionsService.getAxisProperty('shape'),
                onValueChange: newValue => this.chartOptionsService.setAxisProperty('shape', newValue)
            }));
        }

        if (isPolar(chartType)) {
            const currentValue = this.chartOptionsService.getAxisProperty<number>('innerRadiusRatio');
            this.axisGroup.addItem(this.initSlider({
                label: 'innerRadius',
                maxValue: 1,
                currentValue: currentValue ?? 0, // Provide a default value if undefined
                onValueChange: newValue => this.chartOptionsService.setAxisProperty('innerRadiusRatio', newValue)
            }));
        }
    }

    private initAxisLabels() {
        const params: FontPanelParams = {
            name: this.translate('labels'),
            enabled: true,
            suppressEnabledCheckbox: true,
            fontModelProxy: {
                getValue: key => this.chartOptionsService.getAxisProperty(`label.${key}`),
                setValue: (key, value) => this.chartOptionsService.setAxisProperty(`label.${key}`, value)
            }
        };

        const labelPanelComp = this.createManagedBean(new FontPanel(params));
        const labelOrientationComp = this.createOrientationWidget();
        labelPanelComp.addItemToPanel(labelOrientationComp);

        this.axisGroup.addItem(labelPanelComp);
    }

    private createOrientationWidget(): AgSelect {
        const options: Array<ListOption> = [
            { value: 'fixed', text: this.translate('fixed') },
            { value: 'parallel', text: this.translate('parallel') },
            { value: 'perpendicular', text: this.translate('perpendicular') },
        ];

        return this.initSelect({
            label: 'orientation',
            options: options,
            currentValue: this.chartOptionsService.getAxisProperty('label.orientation'),
            onValueChange: newValue => this.chartOptionsService.setAxisProperty('label.orientation', newValue),
        });
    }

    private initRadiusAxis() {
        const chartType = this.chartController.getChartType();
        if (!isRadial(chartType)) return;

        const items = [
            this.initSlider({
                label: 'groupPadding',
                maxValue: 1,
                currentValue: this.chartOptionsService.getAxisProperty<number>('paddingInner') ?? 0,
                onValueChange: newValue => this.chartOptionsService.setAxisProperty('paddingInner', newValue)
            }),
            this.initSlider({
                label: 'seriesPadding',
                maxValue: 1,
                currentValue: this.chartOptionsService.getAxisProperty<number>('groupPaddingInner') ?? 0,
                onValueChange: newValue => this.chartOptionsService.setAxisProperty('groupPaddingInner', newValue)
            })
        ];

        const paddingPanelComp = this.createManagedBean(new AgGroupComponent({
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            enabled: true,
            suppressEnabledCheckbox: true,
            title: this.translate('padding'),
            items
        })).hideEnabledCheckbox(true).hideOpenCloseIcons(true);

        this.axisGroup.addItem(paddingPanelComp);
    }

    private initSlider(config: SliderConfig): AgSlider {
        const { label, maxValue, minValue = 0, step = 0.05, currentValue, onValueChange } = config;
        return this.createManagedBean(new AgSlider({
            label: this.translate(label),
            labelWidth: 'flex',
            minValue,
            maxValue,
            step,
            value: `${currentValue}`,
            onValueChange
        }));
    }

    private initSelect(config: SelectConfig): AgSelect {
        const { label, options, currentValue, onValueChange } = config;
        return this.createManagedBean(new AgSelect({
            label: this.translate(label),
            labelAlignment: 'left',
            labelWidth: 'flex',
            inputWidth: 'flex',
            options,
            value: currentValue,
            onValueChange: onValueChange
        }));
    }

    private translate(key: string, defaultText?: string) {
        return this.chartTranslationService.translate(key, defaultText);
    }
}
