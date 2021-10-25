import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartOptionsService } from "../../chartOptionsService";
import { LegendPosition } from "ag-charts-community";

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
    @RefSelector('legendPositionSelect') private legendPositionSelect: AgSelect;
    @RefSelector('legendPaddingSlider') private legendPaddingSlider: AgSlider;
    @RefSelector('markerSizeSlider') private markerSizeSlider: AgSlider;
    @RefSelector('markerStrokeSlider') private markerStrokeSlider: AgSlider;
    @RefSelector('markerPaddingSlider') private markerPaddingSlider: AgSlider;
    @RefSelector('itemPaddingXSlider') private itemPaddingXSlider: AgSlider;
    @RefSelector('itemPaddingYSlider') private itemPaddingYSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(LegendPanel.TEMPLATE, {legendGroup: groupParams});

        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    }

    private initLegendGroup() {
        this.legendGroup
            .setTitle(this.chartTranslator.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption<boolean>("legend.enabled") || false)
            .toggleGroupExpand(false)
            .onEnableChange(enabled => {
                this.chartOptionsService.setChartOption("legend.enabled", enabled);
                this.legendGroup.toggleGroupExpand(true);
            });
    }

    private initLegendPosition() {
        const positions = [LegendPosition.Top, LegendPosition.Right, LegendPosition.Bottom, LegendPosition.Left];

        this.legendPositionSelect
            .setLabel(this.chartTranslator.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth(80)
            .addOptions(positions.map(position => ({
                value: position,
                text: this.chartTranslator.translate(position)
            })))
            .setValue(this.chartOptionsService.getChartOption("legend.position"))
            .onValueChange(newValue => this.chartOptionsService.setChartOption("legend.position", newValue));
    }

    private initLegendPadding() {
        this.legendPaddingSlider
            .setLabel(this.chartTranslator.translate("spacing"))
            .setValue(this.chartOptionsService.getChartOption("legend.spacing"))
            .setTextFieldWidth(45)
            .setMaxValue(200)
            .onValueChange(newValue => this.chartOptionsService.setChartOption("legend.spacing", newValue));
    }

    private initLegendItems() {
        const initSlider = (expression: string, labelKey: string, input: AgSlider, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartOptionsService.getChartOption(`legend.${expression}`))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => {
                        this.chartOptionsService.setChartOption(`legend.${expression}`, newValue)
                });
        };

        initSlider("item.marker.size", "markerSize", this.markerSizeSlider, 40);
        initSlider("item.marker.strokeWidth", "markerStroke", this.markerStrokeSlider, 10);
        initSlider("item.marker.padding", "itemSpacing", this.markerPaddingSlider, 20);
        initSlider("item.paddingX", "layoutHorizontalSpacing", this.itemPaddingXSlider, 50);
        initSlider("item.paddingY", "layoutVerticalSpacing", this.itemPaddingYSlider, 50);
    }

    private initLabelPanel() {
        const chartProxy = this.chartOptionsService;
        const initialFont = {
            family: chartProxy.getChartOption("legend.item.label.fontFamily"),
            style: chartProxy.getChartOption("legend.item.label.fontStyle"),
            weight: chartProxy.getChartOption("legend.item.label.fontWeight"),
            size: chartProxy.getChartOption<number>("legend.item.label.fontSize"),
            color: chartProxy.getChartOption("legend.item.label.color")
        };

        const setFont = (font: Font) => {
            const proxy = this.chartOptionsService;

            if (font.family) {
                proxy.setChartOption("legend.item.label.fontFamily", font.family);
            }
            if (font.weight) {
                proxy.setChartOption("legend.item.label.fontWeight", font.weight);
            }
            if (font.style) {
                proxy.setChartOption("legend.item.label.fontStyle", font.style);
            }
            if (font.size) {
                proxy.setChartOption("legend.item.label.fontSize", font.size);
            }
            if (font.color) {
                proxy.setChartOption("legend.item.label.color", font.color);
            }
        };

        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const fontPanelComp = this.createBean(new FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
