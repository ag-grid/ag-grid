import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartMenuUtils } from "../../chartMenuUtils";

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

    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartMenuUtils = chartOptionsService.getAxisPropertyMenuUtils();
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const crosshairGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>('crosshair.enabled', {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('crosshair'),
            suppressEnabledCheckbox: false,
            suppressToggleExpandOnEnableChange: true,
            expanded: this.isExpandedOnInit,
        });
        const crosshairLabelCheckboxParams = this.chartMenuUtils.getDefaultCheckboxParams(
            'crosshair.label.enabled',
            'crosshairLabel'
        );
        const crosshairSnapCheckboxParams = this.chartMenuUtils.getDefaultCheckboxParams(
            'crosshair.snap',
            'crosshairSnap'
        );
        const crosshairStrokeWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams(
            'crosshair.strokeWidth',
            'lineWidth',
            10
        );
        const crosshairLineDashSliderParams = this.chartMenuUtils.getDefaultSliderParams(
            'crosshair.lineDash',
            'lineDash',
            30,
            true
        );
        const crosshairLineOpacitySliderParams = this.chartMenuUtils.getDefaultSliderParams(
            'crosshair.strokeOpacity',
            'strokeOpacity',
            1
        );
        crosshairLineOpacitySliderParams.step = 0.05;
        const crosshairStrokeColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams(
            'crosshair.stroke',
            'strokeColor'
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
