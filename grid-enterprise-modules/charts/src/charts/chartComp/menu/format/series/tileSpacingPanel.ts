import {
    AgGroupComponentParams,
    AgSliderParams,
    Autowired,
    Component,
    PostConstruct,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class TileSpacingPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="groupSpacing">
                <ag-slider ref="groupPaddingSlider"></ag-slider>
                <ag-slider ref="groupSpacingSlider"></ag-slider>
            </ag-group-component>
            <ag-group-component ref="tileSpacing">
                <ag-slider ref="tilePaddingSlider"></ag-slider>
                <ag-slider ref="tileSpacingSlider"></ag-slider>
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
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(TileSpacingPanel.TEMPLATE, {
            groupSpacing: { ...groupParams, title: this.chartTranslationService.translate("group") },
            tileSpacing: { ...groupParams, title: this.chartTranslationService.translate("tile") },
            groupPaddingSlider: this.getSliderParams('padding', 'group.padding'),
            groupSpacingSlider: this.getSliderParams('spacing', 'group.gap'),
            tilePaddingSlider: this.getSliderParams('padding', 'tile.padding'),
            tileSpacingSlider: this.getSliderParams('spacing', 'tile.gap')
        });
    }

    private getSliderParams(labelKey: string, key: string): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams(
            this.chartOptionsService.getSeriesOption<number>(key, this.getSelectedSeries()),
            newValue => this.chartOptionsService.setSeriesOption(key, newValue, this.getSelectedSeries()),
            labelKey,
            10
        );
    }
}
