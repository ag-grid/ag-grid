import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    AgSelectParams,
    AgSliderParams,
} from "@ag-grid-community/core";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class LegendPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-slider ref="legendPaddingSlider"></ag-slider>
                <ag-slider ref="markerSizeSlider"></ag-slider>
                <ag-slider ref="markerStrokeSlider"></ag-slider>
                <ag-slider ref="markerPaddingSlider"></ag-slider>
                <ag-slider ref="itemPaddingXSlider"></ag-slider>
                <ag-slider ref="itemPaddingYSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('legendGroup') private legendGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const legendGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("legend"),
            suppressEnabledCheckbox: false,
            enabled: this.chartOptionsService.getChartOption<boolean>("legend.enabled") || false,
            expanded: this.isExpandedOnInit,
            onEnableChange: enabled => {
                this.chartOptionsService.setChartOption("legend.enabled", enabled);
                this.legendGroup.toggleGroupExpand(true);
            },
            items: [this.createLabelPanel()]
        };
        this.setTemplate(LegendPanel.TEMPLATE, {
            legendGroup: legendGroupParams,
            legendPositionSelect: this.getLegendPositionParams(),
            legendPaddingSlider: this.getSliderParams('spacing', 'spacing', 200),
            markerSizeSlider: this.getSliderParams("item.marker.size", "markerSize", 40),
            markerStrokeSlider: this.getSliderParams("item.marker.strokeWidth", "markerStroke", 10),
            markerPaddingSlider: this.getSliderParams("item.marker.padding", "itemSpacing", 20),
            itemPaddingXSlider: this.getSliderParams("item.paddingX", "layoutHorizontalSpacing", 50),
            itemPaddingYSlider: this.getSliderParams("item.paddingY", "layoutVerticalSpacing", 50),
        });
    }

    private getLegendPositionParams(): AgSelectParams {
        return {
            label: this.chartTranslationService.translate("position"),
            labelWidth: "flex",
            inputWidth: 'flex',
            options: ['top', 'right', 'bottom', 'left'].map(position => ({
                value: position,
                text: this.chartTranslationService.translate(position)
            })),
            value: this.chartOptionsService.getChartOption("legend.position"),
            onValueChange: newValue => this.chartOptionsService.setChartOption("legend.position", newValue)
        };
    }

    private getSliderParams(expression: string, labelKey: string, defaultMaxValue: number): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams({
            labelKey,
            defaultMaxValue,
            value: this.chartOptionsService.getChartOption<number | undefined>(`legend.${expression}`) ?? 0,
            onValueChange: newValue => this.chartOptionsService.setChartOption(`legend.${expression}`, newValue)
        });
    }

    private createLabelPanel(): FontPanel {
        const chartProxy = this.chartOptionsService;

        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            fontModelProxy: {
                getValue: key => chartProxy.getChartOption(`legend.item.label.${key}`),
                setValue: (key, value) => chartProxy.setChartOption(`legend.item.label.${key}`, value)
            }
        };

        return this.createManagedBean(new FontPanel(params));
    }
}
