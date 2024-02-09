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
import {Font, FontPanel, FontPanelParams} from '../fontPanel';
import {ChartTranslationService} from '../../../services/chartTranslationService';
import {ChartOptionsService} from '../../../services/chartOptionsService';
import {FormatPanelOptions, getMaxValue} from '../formatPanel';
import {AgColorPicker} from '../../../../../widgets/agColorPicker';
import {isPolar, isRadial} from '../../../utils/seriesTypeMapper';

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
    @RefSelector('axisColorInput') private axisColorInput: AgColorPicker;
    @RefSelector('axisLineWidthSlider') private axisLineWidthSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private readonly chartController: ChartController;
    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    private dynamicComponents: Component[] = [];

    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
        };
        this.setTemplate(PolarAxisPanel.TEMPLATE, { axisGroup: groupParams });

        this.initAxis();
        this.initAxisLabels();
        this.initRadiusAxis();
    }

    private initAxis() {
        this.axisGroup
            .setTitle(this.translate('axis'))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);

        this.axisColorInput
            .setLabel(this.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .setValue(this.chartOptionsService.getAxisProperty('line.color'))
            .onValueChange((newColor) => this.chartOptionsService.setAxisProperty('line.color', newColor));

        const currentValue = this.chartOptionsService.getAxisProperty<number>('line.width');
        this.axisLineWidthSlider
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(this.translate('thickness'))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange((newValue) => this.chartOptionsService.setAxisProperty('line.width', newValue));

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
        const initialFont = {
            family: this.chartOptionsService.getAxisProperty('label.fontFamily'),
            style: this.chartOptionsService.getAxisProperty('label.fontStyle'),
            weight: this.chartOptionsService.getAxisProperty('label.fontWeight'),
            size: this.chartOptionsService.getAxisProperty<number>('label.fontSize'),
            color: this.chartOptionsService.getAxisProperty('label.color'),
        };

        const setFont = (font: Font) => {
            if (font.family) {
                this.chartOptionsService.setAxisProperty('label.fontFamily', font.family);
            }
            if (font.weight) {
                this.chartOptionsService.setAxisProperty('label.fontWeight', font.weight);
            }
            if (font.style) {
                this.chartOptionsService.setAxisProperty('label.fontStyle', font.style);
            }
            if (font.size) {
                this.chartOptionsService.setAxisProperty('label.fontSize', font.size);
            }
            if (font.color) {
                this.chartOptionsService.setAxisProperty('label.color', font.color);
            }
        };

        const params: FontPanelParams = {
            name: this.translate('labels'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont,
        };

        const labelPanelComp = this.createBean(new FontPanel(params));
        const labelOrientationComp = this.createOrientationWidget();
        labelPanelComp.addItemToPanel(labelOrientationComp);

        this.axisGroup.addItem(labelPanelComp);
        this.dynamicComponents.push(labelPanelComp);
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

        const paddingPanelComp = this.createBean(new AgGroupComponent({
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            enabled: true,
            suppressEnabledCheckbox: true,
            title: this.translate('padding'),
        })).hideEnabledCheckbox(true).hideOpenCloseIcons(true);

        paddingPanelComp.addItem(this.initSlider({
            label: 'groupPadding',
            maxValue: 1,
            currentValue: this.chartOptionsService.getAxisProperty<number>('paddingInner') ?? 0,
            onValueChange: newValue => this.chartOptionsService.setAxisProperty('paddingInner', newValue)
        }));

        paddingPanelComp.addItem(this.initSlider({
            label: 'seriesPadding',
            maxValue: 1,
            currentValue: this.chartOptionsService.getAxisProperty<number>('groupPaddingInner') ?? 0,
            onValueChange: newValue => this.chartOptionsService.setAxisProperty('groupPaddingInner', newValue)
        }));

        this.axisGroup.addItem(paddingPanelComp);
        this.dynamicComponents.push(paddingPanelComp);
    }

    private initSlider(config: SliderConfig): AgSlider {
        const { label, maxValue, minValue = 0, step = 0.05, currentValue, onValueChange } = config;
        const slider = this.createManagedBean(new AgSlider());
        slider
            .setLabel(this.translate(label))
            .setLabelWidth('flex')
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setStep(step)
            .setValue(`${currentValue}`)
            .onValueChange(onValueChange);

        this.dynamicComponents.push(slider);
        return slider;
    }

    private initSelect(config: SelectConfig): AgSelect {
        const { label, options, currentValue, onValueChange } = config;
        const select = this.createManagedBean(new AgSelect());
        select
            .setLabel(this.translate(label))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .addOptions(options)

        if (currentValue !== undefined) {
            select.setValue(currentValue);
        }

        select.onValueChange(onValueChange);

        this.dynamicComponents.push(select);
        return select;
    }

    private translate(key: string, defaultText?: string) {
        return this.chartTranslationService.translate(key, defaultText);
    }

    private destroyDynamicComponents(): void {
        this.dynamicComponents.forEach(component => {
            _.removeFromParent(component.getGui());
            this.destroyBean(component);
        });
        this.dynamicComponents = [];
    }

    protected destroy(): void {
        this.destroyDynamicComponents();
        super.destroy();
    }
}
