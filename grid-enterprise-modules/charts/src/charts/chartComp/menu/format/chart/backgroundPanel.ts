import {
    AgGroupComponent,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { AgColorPicker } from "../../../../../widgets/agColorPicker";

export class BackgroundPanel extends Component {
    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="chartBackgroundGroup">
                <ag-color-picker ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;

    @RefSelector('chartBackgroundGroup') private group: AgGroupComponent;
    @RefSelector('colorPicker') private colorPicker: AgColorPicker;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(BackgroundPanel.TEMPLATE, {chartBackgroundGroup: groupParams});

        this.initGroup();
        this.initColorPicker();
    }

    private initGroup(): void {
        this.group
            .setTitle(this.chartTranslationService.translate('background'))
            .setEnabled(this.chartOptionsService.getChartOption('background.visible'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(enabled => this.chartOptionsService.setChartOption('background.visible', enabled));
    }

    private initColorPicker(): void {
        this.colorPicker
            .setLabel(this.chartTranslationService.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getChartOption('background.fill'))
            .onValueChange(newColor => this.chartOptionsService.setChartOption('background.fill', newColor));
    }
}
