import {
    AgGroupComponentParams,
    AgSliderParams,
    Autowired,
    Component,
    PostConstruct,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class ShadowPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="shadowGroup">
                <ag-color-picker ref="shadowColorPicker"></ag-color-picker>
                <ag-slider ref="shadowBlurSlider"></ag-slider>
                <ag-slider ref="shadowXOffsetSlider"></ag-slider>
                <ag-slider ref="shadowYOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsProxy: ChartOptionsProxy,
                private propertyKey: string = "shadow") {
        super();
    }

    @PostConstruct
    private init() {
        // Determine the path within the series options object to get/set the individual shadow options
        const propertyNamespace = this.propertyKey;
        const shadowGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>(
            this.chartOptionsProxy,
            `${propertyNamespace}.enabled`,
            {
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslationService.translate("shadow"),
                suppressEnabledCheckbox: false,
            }
        );
        const shadowColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams(this.chartOptionsProxy, `${propertyNamespace}.color`);
        this.setTemplate(ShadowPanel.TEMPLATE, {
            shadowGroup: shadowGroupParams,
            shadowColorPicker: shadowColorPickerParams,
            shadowBlurSlider: this.getSliderParams("blur", 0, 20),
            shadowXOffsetSlider: this.getSliderParams("xOffset", -10, 10),
            shadowYOffsetSlider: this.getSliderParams("yOffset", -10, 10)
        });
    }

    private getSliderParams(property: string, minValue: number, defaultMaxValue: number): AgSliderParams {
        const expression = `${this.propertyKey}.${property}`
        const params = this.chartMenuUtils.getDefaultSliderParams(
            this.chartOptionsProxy,
            expression,
            property,
            defaultMaxValue
        );
        params.minValue = minValue;
        return params;
    }
}
