import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSelectParams,
    AgSlider,
    Autowired,
    Component,
    ListOption,
    PostConstruct,
    RefSelector,
} from '@ag-grid-community/core';
import {ChartController} from '../../../chartController';
import {FontPanel, FontPanelParams} from '../fontPanel';
import {ChartTranslationKey, ChartTranslationService} from '../../../services/chartTranslationService';
import {FormatPanelOptions} from '../formatPanel';
import {getSeriesType, isRadial} from '../../../utils/seriesTypeMapper';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

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

    private readonly chartController: ChartController;
    private readonly chartMenuUtils: ChartMenuParamsFactory;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartController, chartAxisMenuParamsFactory: chartAxisMenuUtils, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartMenuUtils = chartAxisMenuUtils;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const axisGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.translate('polarAxis'),
            expanded: this.isExpandedOnInit,
            suppressEnabledCheckbox: true
        };
        const axisColorInputParams = this.chartMenuUtils.getDefaultColorPickerParams('line.color');
        const axisLineWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams('line.width', 'thickness', 10);
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

            this.axisGroup.addItem(this.createSelect({
                labelKey: 'shape',
                options: options,
                property: 'shape'
            }));
        }

        if (chartType !== 'pie') {
            this.axisGroup.addItem(this.createSlider({
                labelKey: 'innerRadius',
                defaultMaxValue: 1,
                property: 'innerRadiusRatio'
            }));
        }
    }

    private initAxisLabels() {
        const params: FontPanelParams = {
            name: this.translate('labels'),
            enabled: true,
            suppressEnabledCheckbox: true,
            chartMenuUtils: this.chartMenuUtils,
            keyMapper: key => `label.${key}`
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

        return this.createSelect({
            labelKey: 'orientation',
            options,
            property: 'label.orientation'
        });
    }

    private initRadiusAxis() {
        const chartSeriesType = getSeriesType(this.chartController.getChartType());
        if (!isRadial(chartSeriesType)) return;

        const items = [
            this.createSlider({
                labelKey: 'groupPadding',
                defaultMaxValue: 1,
                property: 'paddingInner'
            }),
            this.createSlider({
                labelKey: 'seriesPadding',
                defaultMaxValue: 1,
                property: 'groupPaddingInner'
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

    private createSlider(config: {
        labelKey: ChartTranslationKey;
        defaultMaxValue: number;
        step?: number;
        property: string;
    }): AgSlider {
        const { labelKey, defaultMaxValue, step = 0.05, property } = config;
        const params = this.chartMenuUtils.getDefaultSliderParams(property, labelKey, defaultMaxValue);
        params.step = step;
        return this.createManagedBean(new AgSlider(params));
    }

    private createSelect(config: {
        labelKey: ChartTranslationKey;
        options: Array<ListOption>;
        property: string
    }): AgSelect {
        const { labelKey: label, options, property } = config;
        return this.createManagedBean(new AgSelect(this.chartMenuUtils.addValueParams<AgSelectParams>(
            property,
            {
                label: this.chartTranslationService.translate(label),
                labelAlignment: 'left',
                labelWidth: 'flex',
                inputWidth: 'flex',
                options,
            }
        )));
    }

    private translate(key: ChartTranslationKey) {
        return this.chartTranslationService.translate(key);
    }
}
