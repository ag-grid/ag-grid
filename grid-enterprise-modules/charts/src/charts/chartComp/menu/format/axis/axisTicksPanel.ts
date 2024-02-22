import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class AxisTicksPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsProxy: ChartOptionsProxy) {
        super();
    }

    @PostConstruct
    private init() {
        const axisTicksGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>(
            this.chartOptionsProxy,
            'tick.enabled',
            {
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslationService.translate("ticks"),
                suppressEnabledCheckbox: false
            }
        );
        const axisTicksColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams(this.chartOptionsProxy, "tick.color");
        const axisTicksWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, "tick.width", "width", 10);
        const axisTicksSizeSliderParams = this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, "tick.size", "length", 30);
        this.setTemplate(AxisTicksPanel.TEMPLATE, {
            axisTicksGroup: axisTicksGroupParams,
            axisTicksColorPicker: axisTicksColorPickerParams,
            axisTicksWidthSlider: axisTicksWidthSliderParams,
            axisTicksSizeSlider: axisTicksSizeSliderParams
        });
    }
}
