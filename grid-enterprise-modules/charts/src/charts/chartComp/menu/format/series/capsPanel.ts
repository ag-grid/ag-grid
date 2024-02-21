import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class CapsPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="capsGroup">
                <ag-slider ref="capLengthRatioSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        const capsGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("cap"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        const capLengthRatioSliderParams = this.chartMenuUtils.getDefaultSliderParams({
            labelKey: "capLengthRatio",
            defaultMaxValue: 1,
            value: this.chartOptionsService.getSeriesOption<number>("cap.lengthRatio", this.getSelectedSeries()),
            onValueChange: newValue => this.chartOptionsService.setSeriesOption("cap.lengthRatio", newValue, this.getSelectedSeries())
        });
        capLengthRatioSliderParams.step = 0.05;
        capLengthRatioSliderParams.minValue = 0;

        this.setTemplate(CapsPanel.TEMPLATE, {
            capsGroup: capsGroupParams,
            capLengthRatioSlider: capLengthRatioSliderParams
        });
    }
}
