import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class BackgroundPanel extends Component {
    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="chartBackgroundGroup">
                <ag-color-picker ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const chartBackgroundGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.chartTranslationService.translate('background'),
            enabled: this.chartOptionsService.getChartOption('background.visible'),
            suppressEnabledCheckbox: false,
            onEnableChange: enabled => this.chartOptionsService.setChartOption('background.visible', enabled)
        };
        const colorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams({
            value: this.chartOptionsService.getChartOption('background.fill'),
            onValueChange: newColor => this.chartOptionsService.setChartOption('background.fill', newColor)
        });
        this.setTemplate(BackgroundPanel.TEMPLATE, {
            chartBackgroundGroup: chartBackgroundGroupParams,
            colorPicker: colorPickerParams
        });
    }
}
