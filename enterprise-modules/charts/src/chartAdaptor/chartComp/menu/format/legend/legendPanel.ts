import {
    _,
    AgGroupComponent,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    FontStyle,
    FontWeight,
    LegendPosition,
    PostConstruct,
    RefSelector,
    AgGroupComponentParams,
} from "@ag-grid-community/core";
import {ChartController} from "../../../chartController";
import {Font, FontPanel, FontPanelParams} from "../fontPanel";
import {ChartTranslator} from "../../../chartTranslator";

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
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
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
            .setEnabled(this.chartController.getChartProxy().getChartOption<boolean>("legend.enabled") || false)
            .toggleGroupExpand(false)
            .onEnableChange(enabled => {
                this.chartController.getChartProxy().setChartOption("legend.enabled", enabled);
                this.legendGroup.toggleGroupExpand(true);
            });
    }

    private initLegendPosition() {
        const positions: LegendPosition[] = ["top", "right", "bottom", "left"];

        this.legendPositionSelect
            .setLabel(this.chartTranslator.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth(80)
            .addOptions(positions.map(position => ({
                value: position,
                text: this.chartTranslator.translate(position)
            })))
            .setValue(this.chartController.getChartProxy().getChartOption("legend.position"))
            .onValueChange(newValue => this.chartController.getChartProxy().setChartOption("legend.position", newValue));
    }

    private initLegendPadding() {
        this.legendPaddingSlider
            .setLabel(this.chartTranslator.translate("padding"))
            .setValue(this.chartController.getChartProxy().getChartOption("legend.padding"))
            .setTextFieldWidth(45)
            .setMaxValue(200)
            .onValueChange(newValue => this.chartController.getChartProxy().setChartOption("legend.padding", newValue));
    }

    private initLegendItems() {
        const initSlider = (expression: string, labelKey: string, input: AgSlider, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartController.getChartProxy().getChartOption(`legend.${expression}`))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartController.getChartProxy().setChartOption(`legend.${expression}`, newValue));
        };

        initSlider("item.marker.size", "markerSize", this.markerSizeSlider, 40);
        initSlider("item.marker.strokeWidth", "markerStroke", this.markerStrokeSlider, 10);
        initSlider("item.marker.padding", "markerPadding", this.markerPaddingSlider, 20);
        initSlider("item.paddingX", "itemPaddingX", this.itemPaddingXSlider, 50);
        initSlider("item.paddingY", "itemPaddingY", this.itemPaddingYSlider, 50);
    }

    private initLabelPanel() {
        const chartProxy = this.chartController.getChartProxy();
        const initialFont = {
            family: chartProxy.getChartOption("legend.item.label.fontFamily"),
            style: chartProxy.getChartOption<FontStyle>("legend.item.label.fontStyle"),
            weight: chartProxy.getChartOption<FontWeight>("legend.item.label.fontWeight"),
            size: chartProxy.getChartOption<number>("legend.item.label.fontSize"),
            color: chartProxy.getChartOption("legend.item.label.color")
        };

        const setFont = (font: Font) => {
            const chartProxy = this.chartController.getChartProxy();

            if (font.family) {
                chartProxy.setChartOption("legend.item.label.fontFamily", font.family);
            }
            if (font.weight) {
                chartProxy.setChartOption("legend.item.label.fontWeight", font.weight);
            }
            if (font.style) {
                chartProxy.setChartOption("legend.item.label.fontStyle", font.style);
            }
            if (font.size) {
                chartProxy.setChartOption("legend.item.label.fontSize", font.size);
            }
            if (font.color) {
                chartProxy.setChartOption("legend.item.label.color", font.color);
            }
        };

        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const fontPanelComp = this.wireBean(new FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
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
