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
import { ChartController } from '../../../chartController';
import { Font, FontPanel, FontPanelParams } from '../fontPanel';
import { ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartOptionsService } from '../../../services/chartOptionsService';
import { FormatPanelOptions, getMaxValue } from '../formatPanel';
import { AgColorPicker } from '../../../../../widgets/agColorPicker';
import { AgAngleSelect } from '../../../../../widgets/agAngleSelect';
import { isPolar, isRadial } from '../../../utils/seriesTypeMapper';

export class PolarAxisPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
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

    private activePanels: Component[] = [];
    private axisLabelUpdateFuncs: Function[] = [];

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

        const updateAxisLabelRotations = () => this.axisLabelUpdateFuncs.forEach((func) => func());
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
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

        const hasConfigurableAxisShape = (() => {
            switch (this.chartController.getChartType()) {
                case 'radarLine':
                case 'radarArea':
                case 'radialColumn':
                    return true;
                case 'nightingale':
                case 'radialBar':
                default:
                    return false;
            }
        })();
        if (hasConfigurableAxisShape) this.initAxisShape();

        if (isPolar(this.chartController.getChartType())) {
            const innerRadiusSlider = this.createManagedBean(
                new AgSlider({
                    label: this.translate('innerRadius'),
                    labelWidth: 'flex',
                })
            )
                .setMinValue(0)
                .setMaxValue(1)
                .setStep(0.05)
                .onValueChange((newValue) => this.chartOptionsService.setRadiusAxisProperty('innerRadiusRatio', newValue));
            const currentValue = this.chartOptionsService.getRadiusAxisProperty('innerRadiusRatio');
            if (currentValue != undefined) innerRadiusSlider.setValue(currentValue);
            this.axisGroup.addItem(innerRadiusSlider);
        }
    }

    private initAxisShape() {
        const options: Array<ListOption> = [
            { value: 'circle', text: this.translate('circle', 'Circle') },
            { value: 'polygon', text: this.translate('polygon', 'Polygon') },
        ];

        const shapeSelect = this.axisGroup.createManagedBean(new AgSelect());
        shapeSelect
            .setLabel(this.translate('shape'))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .addOptions(options)
            .onValueChange((newValue) => this.chartOptionsService.setAngleAxisProperty('shape', newValue));
        const currentValue = this.chartOptionsService.getAngleAxisProperty('shape');
        if (currentValue != undefined) shapeSelect.setValue(currentValue);

        this.axisGroup.addItem(shapeSelect);

        this.activePanels.push(shapeSelect);
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

        // Append additional widgets to the panel
        // (these will have their lifecycle managed by the FontPanel component)
        const labelOrientationComp = this.createOrientationWidget();
        labelPanelComp.addItemToPanel(labelOrientationComp);

        // Add the panel to the DOM and register it as active
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
    }

    private initRadiusAxis() {
        const chartType = this.chartController.getChartType();
        if (isRadial(chartType)) {
            // Create the padding panel
            const paddingPanelComp = this.createBean(new AgGroupComponent({
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                enabled: true,
                suppressEnabledCheckbox: true,
                title: this.translate('padding'),
            }))
                .hideEnabledCheckbox(true)
                .hideOpenCloseIcons(true);

            // Append additional widgets to the padding panel
            {
                const groupPaddingSlider = paddingPanelComp.createManagedBean(
                    new AgSlider({
                        label: this.translate('groupPadding'),
                        labelWidth: 'flex',
                    })
                )
                    .setMinValue(0)
                    .setMaxValue(1)
                    .setStep(0.05)
                    .onValueChange((newValue) =>
                        this.chartOptionsService.setCategoryAxisProperty('paddingInner', newValue)
                    );
                const currentValue = this.chartOptionsService.getCategoryAxisProperty('paddingInner');
                if (currentValue != undefined) groupPaddingSlider.setValue(currentValue);
                paddingPanelComp.addItem(groupPaddingSlider);
            }
            {
                const seriesPaddingSlider = paddingPanelComp.createManagedBean(
                    new AgSlider({
                        label: this.translate('seriesPadding'),
                        labelWidth: 'flex',
                    })
                )
                    .setMinValue(0)
                    .setMaxValue(1)
                    .setStep(0.05)
                    .onValueChange((newValue) =>
                        this.chartOptionsService.setCategoryAxisProperty('groupPaddingInner', newValue)
                    );
                const currentValue = this.chartOptionsService.getCategoryAxisProperty('groupPaddingInner');
                if (currentValue != undefined) seriesPaddingSlider.setValue(currentValue);
                paddingPanelComp.addItem(seriesPaddingSlider);
            }
            
            // Add the padding panel to the DOM and register it as active
            this.axisGroup.addItem(paddingPanelComp);
            this.activePanels.push(paddingPanelComp);
        }

        // Create the label panel
        const labelPanelComp = this.createBean(new AgGroupComponent({
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            enabled: true,
            suppressEnabledCheckbox: true,
        }))
            .setTitle(this.translate('radiusAxis'))
            .hideEnabledCheckbox(true)
            .hideOpenCloseIcons(true);

        // Append additional widgets to the label panel
        const radiusAxisPosition = this.createRadiusAxisPositionWidget();
        const labelRotationComp = this.createLabelRotationWidget('labelRotation', 'yAxis');
        labelPanelComp.addItem(radiusAxisPosition);
        labelPanelComp.addItem(labelRotationComp);

        if (chartType === 'radialBar') {
            const startAngleRotationComp = this.createRotationWidget('startAngle', {
                get: () => this.chartOptionsService.getAngleAxisProperty('startAngle'),
                set: (value: number) => this.chartOptionsService.setAngleAxisProperty('startAngle', value),
            });
            const endAngleRotationComp = this.createRotationWidget('endAngle', {
                get: () => this.chartOptionsService.getAngleAxisProperty('endAngle'),
                set: (value: number) => this.chartOptionsService.setAngleAxisProperty('endAngle', value),
            });
            labelPanelComp.addItem(startAngleRotationComp);
            labelPanelComp.addItem(endAngleRotationComp);
        }

        // Add the label panel to the DOM and register it as active
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
    }

    private createOrientationWidget(): AgSelect {
        const options: Array<ListOption> = [
            { value: 'fixed', text: this.translate('fixed', 'Fixed') },
            { value: 'parallel', text: this.translate('parallel', 'Parallel') },
            { value: 'perpendicular', text: this.translate('perpendicular', 'Perpendicular') },
        ];
        return this.createBean(new AgSelect())
            .setLabel(this.translate('orientation'))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .addOptions(options) // AgSelect bean must be instantiated before adding options
            .setValue(this.chartOptionsService.getAxisProperty('label.orientation'))
            .onValueChange((newValue) => this.chartOptionsService.setAxisProperty('label.orientation', newValue));

    }

    private createLabelRotationWidget(labelKey: string, axisType: 'xAxis' | 'yAxis'): AgAngleSelect {
        const labelRotationComp = this.createRotationWidget(labelKey, {
            get: () => this.chartOptionsService.getLabelRotation(axisType),
            set: (value) => this.chartOptionsService.setLabelRotation(axisType, value),
        });

        // the axis rotation needs to be updated when the default category changes in the data panel
        this.axisLabelUpdateFuncs.push(() => {
            const value = this.chartOptionsService.getLabelRotation(axisType);
            labelRotationComp.setValue(value || 0);
        });

        return labelRotationComp;
    }

    private createRotationWidget(labelKey: string, accessors: {
        get: () => number | undefined;
        set: (value: number) => void;
    }): AgAngleSelect {
        const { get: getValue, set: setValue } = accessors;
        const degreesSymbol = String.fromCharCode(176);

        const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
        const labelRotationComp = new AgAngleSelect()
            .setLabel(label)
            .setLabelWidth('flex')
            .setValue(getValue() ?? 0)
            .onValueChange((value) => setValue((value + 360) % 360));

        return this.createBean(labelRotationComp);
    }

    private createRadiusAxisPositionWidget(): AgAngleSelect {
        const degreesSymbol = String.fromCharCode(176);

        const label = `${this.chartTranslationService.translate('radiusAxisPosition')} ${degreesSymbol}`;
        const value = this.chartOptionsService.getRadiusAxisProperty<number>('positionAngle');
        const labelRotationComp = new AgAngleSelect()
            .setLabel(label)
            .setLabelWidth('flex')
            .setValue(value || 0)
            .onValueChange((newValue) => this.chartOptionsService.setRadiusAxisProperty('positionAngle', newValue));

        return this.createManagedBean(labelRotationComp);
    }

    private translate(key: string, defaultText?: string) {
        return this.chartTranslationService.translate(key, defaultText);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach((panel) => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
        // Clean up stale references to destroyed child components
        this.activePanels = [];
        this.axisLabelUpdateFuncs = [];
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
