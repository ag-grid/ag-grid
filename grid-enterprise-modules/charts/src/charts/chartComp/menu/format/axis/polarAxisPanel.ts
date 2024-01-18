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

        this.initAxisShape();
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
            .setValue(this.chartOptionsService.getAxisProperty('shape'))
            .onValueChange((newValue) => this.chartOptionsService.setAxisProperty('shape', newValue));

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
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);

        // Prepend additional widgets to the label panel
        // (these will have their lifecycle managed by the FontPanel component)
        const labelOrientationComp = this.createOrientationWidget();
        const labelRotationComp = this.createRotationWidget('labelRotation', 'xAxis');
        const radiusAxisPosition = this.createRadiusAxisPositionWidget();
        labelPanelComp.addItemToPanel(labelOrientationComp);
        labelPanelComp.addItemToPanel(labelRotationComp);
        labelPanelComp.addItemToPanel(radiusAxisPosition);
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

    private createRotationWidget(labelKey: string, axisType: 'xAxis' | 'yAxis'): AgAngleSelect {
        const degreesSymbol = String.fromCharCode(176);

        const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
        const value = this.chartOptionsService.getLabelRotation(axisType);
        const labelRotationComp = new AgAngleSelect()
            .setLabel(label)
            .setLabelWidth('flex')
            .setValue(value || 0)
            .onValueChange((newValue) => this.chartOptionsService.setLabelRotation(axisType, newValue));

        // the axis rotation needs to be updated when the default category changes in the data panel
        this.axisLabelUpdateFuncs.push(() => {
            const value = this.chartOptionsService.getLabelRotation(axisType);
            labelRotationComp.setValue(value || 0);
        });

        return this.createBean(labelRotationComp);
    }

    private createRadiusAxisPositionWidget(): AgAngleSelect {
        const degreesSymbol = String.fromCharCode(176);

        const label = `${this.chartTranslationService.translate('radiusAxisPosition')} ${degreesSymbol}`;
        const value = this.chartOptionsService.getSecondaryAxisProperty<number>('positionAngle');
        const labelRotationComp = new AgAngleSelect()
            .setLabel(label)
            .setLabelWidth('flex')
            .setValue(value || 0)
            .onValueChange((newValue) => this.chartOptionsService.setSecondaryAxisProperty('positionAngle', newValue));

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
