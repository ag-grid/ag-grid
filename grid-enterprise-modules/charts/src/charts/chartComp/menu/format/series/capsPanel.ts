import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";

export class CapsPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="capsGroup">
                <ag-slider ref="capLengthRatioSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('capsGroup') private capsGroup: AgGroupComponent;
    @RefSelector('capLengthRatioSlider') private capLengthRatioSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("cap"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(CapsPanel.TEMPLATE, {capsGroup: groupParams});

        this.initControls();
    }

    private initControls() {
        const lengthRatio = this.chartOptionsService.getSeriesOption<number>("cap.lengthRatio", this.getSelectedSeries());
        this.capLengthRatioSlider
            .setLabel(this.chartTranslationService.translate("capLengthRatio"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(`${lengthRatio}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("cap.lengthRatio", newValue, this.getSelectedSeries()));
    }
}
