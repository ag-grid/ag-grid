import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
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

    constructor(private readonly chartOptionsProxy: ChartOptionsProxy) {
        super();
    }

    @PostConstruct
    private init() {
        const chartBackgroundGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>(
            this.chartOptionsProxy,
            'background.visible',
            {
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslationService.translate('background'),
                suppressEnabledCheckbox: false
            }
        );
        const colorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams(this.chartOptionsProxy, 'background.fill');
        this.setTemplate(BackgroundPanel.TEMPLATE, {
            chartBackgroundGroup: chartBackgroundGroupParams,
            colorPicker: colorPickerParams
        });
    }
}
