import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";

export class CrosshairPanel extends Component {
    public static TEMPLATE = /* html */ `<div>
            <ag-group-component ref="crosshairGroup">
                <ag-checkbox ref="crosshairLabelCheckbox"></ag-checkbox>
                <ag-checkbox ref="crosshairSnapCheckbox"></ag-checkbox>
                <ag-color-picker ref="crosshairStrokeColorPicker"></ag-color-picker>
                <ag-slider ref="crosshairStrokeWidthSlider"></ag-slider>
                <ag-slider ref="crosshairLineDashSlider"></ag-slider>
                <ag-slider ref="crosshairLineOpacitySlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(private readonly chartMenuParamsFactory: ChartMenuParamsFactory) {
        super();
    }

    @PostConstruct
    private init() {
        const crosshairGroupParams = this.chartMenuParamsFactory.addEnableParams<AgGroupComponentParams>('crosshair.enabled', {
            cssIdentifier: 'charts-advanced-settings-top-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.chartTranslationService.translate('crosshair'),
            suppressEnabledCheckbox: true,
            useToggle: true
        });
        const crosshairLabelCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
            'crosshair.label.enabled',
            'crosshairLabel'
        );
        const crosshairSnapCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
            'crosshair.snap',
            'crosshairSnap'
        );
        const crosshairStrokeWidthSliderParams = this.chartMenuParamsFactory.getDefaultSliderParams(
            'crosshair.strokeWidth',
            'crosshairWidth',
            10
        );
        const crosshairLineDashSliderParams = this.chartMenuParamsFactory.getDefaultSliderParams(
            'crosshair.lineDash',
            'crosshairDashOffset',
            30,
            true
        );
        const crosshairLineOpacitySliderParams = this.chartMenuParamsFactory.getDefaultSliderParams(
            'crosshair.strokeOpacity',
            'crosshairColor',
            1
        );
        crosshairLineOpacitySliderParams.step = 0.05;
        const crosshairStrokeColorPickerParams = this.chartMenuParamsFactory.getDefaultColorPickerParams(
            'crosshair.stroke',
            'crosshairOpacity'
        );
        this.setTemplate(CrosshairPanel.TEMPLATE, {
            crosshairGroup: crosshairGroupParams,
            crosshairLabelCheckbox: crosshairLabelCheckboxParams,
            crosshairSnapCheckbox: crosshairSnapCheckboxParams,
            crosshairStrokeColorPicker: crosshairStrokeColorPickerParams,
            crosshairStrokeWidthSlider: crosshairStrokeWidthSliderParams,
            crosshairLineDashSlider: crosshairLineDashSliderParams,
            crosshairLineOpacitySlider: crosshairLineOpacitySliderParams,
        });
    }
}
