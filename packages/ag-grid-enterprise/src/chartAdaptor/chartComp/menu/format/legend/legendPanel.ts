import {
    _,
    AgGroupComponent,
    AgSlider,
    Component,
    PostConstruct,
    RefSelector,
    AgSelect
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { Chart, LegendPosition } from "../../../../../charts/chart/chart";
import {LabelPanelParams, LabelFont, LabelPanel} from "../label/labelPanel";
import {ExpandablePanel} from "../chartFormatingPanel";

export class LegendPanel extends Component implements ExpandablePanel {

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

    private readonly chartController: ChartController;
    private chart: Chart;
    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(LegendPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    }

    public expandPanel(expanded: boolean): void {
        this.legendGroup.toggleGroupExpand(expanded);
    }

    public setExpandedCallback(expandedCallback: () => void) {
        this.addDestroyableEventListener(this.legendGroup, 'expanded', expandedCallback);
    }

    private initLegendGroup() {
        this.legendGroup
            .setTitle('Legend')
            .hideEnabledCheckbox(false)
            .onEnableChange(enabled => {
                this.chart.legend.enabled = enabled;
                this.legendGroup.toggleGroupExpand(true);
            });
    }

    private initLegendPosition() {
        const positions: LegendPosition[] = ['top', 'right', 'bottom', 'left'];

        this.legendPositionSelect
            .setLabel('Position')
            .setLabelWidth('flex')
            .setInputWidth(80)
            .addOptions(positions.map(position => ({
                value: position,
                text: _.capitalise(position)
            })))
            .onValueChange((value) => {
                this.chart.legendPosition = value as LegendPosition;
            })
            .setValue(this.chart.legendPosition);
    }

    private initLegendPadding() {
        this.legendPaddingSlider
            .setLabel('Padding')
            .setValue(`${this.chart.legendPadding}`)
            .setTextFieldWidth(45)
            .setMaxValue(200)
            .onValueChange(newValue => this.chart.legendPadding = newValue);
    }

    private initLegendItems() {
        type LegendOptions = 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';

        const initSlider = (property: LegendOptions, labelText: string, input: AgSlider, initialValue: string, maxValue: number) => {
            input.setLabel(labelText)
                 .setValue(initialValue)
                 .setMaxValue(maxValue)
                 .setTextFieldWidth(45)
                 .onValueChange(newValue => this.chart.legend[property] = newValue)
        };

        const initialMarkerSize = `${this.chart.legend.markerSize}`;
        initSlider('markerSize', 'Marker Size', this.markerSizeSlider, initialMarkerSize, 40);

        const initialMarkerStroke = `${this.chart.legend.markerStrokeWidth}`;
        initSlider('markerStrokeWidth', 'Marker Stroke', this.markerStrokeSlider,  initialMarkerStroke, 10);

        const initialMarkerPadding = `${this.chart.legend.markerPadding}`;
        initSlider('markerPadding',  'Marker Padding', this.markerPaddingSlider, initialMarkerPadding, 200);

        const initialItemPaddingX = `${this.chart.legend.itemPaddingX}`;
        initSlider('itemPaddingX', 'Item Padding X', this.itemPaddingXSlider,  initialItemPaddingX, 50);

        const initialItemPaddingY = `${this.chart.legend.itemPaddingY}`;
        initSlider('itemPaddingY', 'Item Padding Y', this.itemPaddingYSlider,  initialItemPaddingY, 50);
    }

    private initLabelPanel() {

        const initialFont = {
            family: this.chart.legend.labelFontFamily,
            style: this.chart.legend.labelFontStyle,
            weight: this.chart.legend.labelFontWeight,
            size: this.chart.legend.labelFontSize,
            color: this.chart.legend.labelColor
        };

        const setFont = (font: LabelFont) => {
            if (font.family) this.chart.legend.labelFontFamily = font.family;
            if (font.style) this.chart.legend.labelFontStyle = font.style;
            if (font.weight) this.chart.legend.labelFontWeight = font.weight;
            if (font.size) this.chart.legend.labelFontSize = font.size;
            if (font.color) this.chart.legend.labelColor = font.color;
            this.chart.performLayout();
        };

        const params: LabelPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = new LabelPanel(this.chartController, params);
        this.getContext().wireBean(labelPanelComp);
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