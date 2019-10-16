import {
    _,
    AgGroupComponent,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    LegendPosition,
} from "@ag-community/grid-core";
import { ChartController } from "../../../chartController";
import { LabelFont, LabelPanel, LabelPanelParams } from "../label/labelPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartProxy } from "../../../chartProxies/chartProxy";

export class LegendPanel extends Component {

    public static TEMPLATE =
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

    private chartProxy: ChartProxy<any, any>;
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = this.chartController.getChartProxy();
    }

    @PostConstruct
    private init() {
        this.setTemplate(LegendPanel.TEMPLATE);

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
            .setEnabled(this.chartProxy.getChartOption<boolean>("legend.enabled") || false)
            .toggleGroupExpand(false)
            .onEnableChange(enabled => {
                this.chartProxy.setChartOption("legend.enabled", enabled);
                this.legendGroup.toggleGroupExpand(true);
            });
    }

    private initLegendPosition() {
        const chartProxy = this.chartController.getChartProxy();

        const positions: LegendPosition[] = ["top", "right", "bottom", "left"];

        this.legendPositionSelect
            .setLabel(this.chartTranslator.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth(80)
            .addOptions(positions.map(position => ({
                value: position,
                text: this.chartTranslator.translate(position)
            })))
            .setValue(chartProxy.getChartOption("legend.position"))
            .onValueChange(newValue => chartProxy.setChartOption("legend.position", newValue));
    }

    private initLegendPadding() {
        this.legendPaddingSlider
            .setLabel(this.chartTranslator.translate("padding"))
            .setValue(this.chartProxy.getChartOption("legend.padding"))
            .setTextFieldWidth(45)
            .setMaxValue(200)
            .onValueChange(newValue => this.chartProxy.setChartOption("legend.padding", newValue));
    }

    private initLegendItems() {
        const initSlider = (expression: string, labelKey: string, input: AgSlider, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartProxy.getChartOption(`legend.${expression}`))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartProxy.setChartOption(`legend.${expression}`, newValue));
        };

        initSlider("marker.size", "markerSize", this.markerSizeSlider, 40);
        initSlider("marker.strokeWidth", "markerStroke", this.markerStrokeSlider, 10);
        initSlider("marker.padding", "markerPadding", this.markerPaddingSlider, 200);
        initSlider("item.paddingX", "itemPaddingX", this.itemPaddingXSlider, 50);
        initSlider("item.paddingY", "itemPaddingY", this.itemPaddingYSlider, 50);
    }

    private initLabelPanel() {
        const initialFont = {
            family: this.chartProxy.getChartOption("label.fontFamily"),
            style: this.chartProxy.getChartOption("label.fontStyle"),
            weight: this.chartProxy.getChartOption("label.fontWeight"),
            size: this.chartProxy.getChartOption<number>("label.fontSize"),
            color: this.chartProxy.getChartOption("label.color")
        };

        // note we don't set the font style via legend panel
        const setFont = (font: LabelFont) => {
            if (font.family) { this.chartProxy.setChartOption("label.fontFamily", font.family); }
            if (font.weight) { this.chartProxy.setChartOption("label.fontWeight", font.weight); }
            if (font.size) { this.chartProxy.setChartOption("label.fontSize", font.size); }
            if (font.color) { this.chartProxy.setChartOption("label.color", font.color); }
        };

        const params: LabelPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = this.wireBean(new LabelPanel(params));
        this.legendGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    public destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
