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

    @RefSelector('groupSpacing') private groupSpacing: AgGroupComponent;
    @RefSelector('groupPaddingSlider') private groupPaddingSlider: AgSlider;
    @RefSelector('groupSpacingSlider') private groupSpacingSlider: AgSlider;
    @RefSelector('tilePaddingSlider') private tilePaddingSlider: AgSlider;
    @RefSelector('tileSpacingSlider') private tileSpacingSlider: AgSlider;

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
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(TileSpacingPanel.TEMPLATE, {
            groupSpacing: { ...groupParams, title: this.chartTranslationService.translate("group") },
            tileSpacing: { ...groupParams, title: this.chartTranslationService.translate("tile") },
        });

        this.initControls();
    }

    private initControls() {
        const optionGroups = [
            {
                optionNamespace: "group",
                components: {
                    paddingSlider: this.groupPaddingSlider,
                    spacingSlider: this.groupSpacingSlider,
                },
            },
            {
                optionNamespace: "tile",
                components: {
                    paddingSlider: this.tilePaddingSlider,
                    spacingSlider: this.tileSpacingSlider,
                },
            },
        ];
        for (const group of optionGroups) {
            const { optionNamespace, components } = group;
            const { paddingSlider, spacingSlider } = components;

            const paddingValue = this.chartOptionsService.getSeriesOption<number>(`${optionNamespace}.padding`, this.getSelectedSeries());
            paddingSlider
                .setLabel(this.chartTranslationService.translate("padding"))
                .setMinValue(0)
                .setMaxValue(10)
                .setTextFieldWidth(45)
                .setValue(`${paddingValue}`)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${optionNamespace}.padding`, newValue, this.getSelectedSeries()));

            const spacingValue = this.chartOptionsService.getSeriesOption<number>(`${optionNamespace}.gap`, this.getSelectedSeries());
            spacingSlider
                .setLabel(this.chartTranslationService.translate("spacing"))
                .setMinValue(0)
                .setMaxValue(10)
                .setTextFieldWidth(45)
                .setValue(`${spacingValue}`)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`${optionNamespace}.gap`, newValue, this.getSelectedSeries()));
        }
    }
}
