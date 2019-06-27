import {
    _,
    AgGroupComponent,
    AgSlider,
    Component,
    PostConstruct,
    RefSelector,
    AgToggleButton
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { BarSeries } from "../../../../../charts/chart/series/barSeries";
import { ShadowPanel } from "./shadowPanel";
import { ChartLabelPanelParams, LabelPanel } from "../label/labelPanel";

export class BarSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="seriesStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('seriesStrokeWidthSlider') private seriesStrokeWidthSlider: AgSlider;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private series: BarSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(BarSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as BarSeries[];

        this.seriesGroup
            .setTitle('Series')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesStrokeWidth();
        this.initSeriesTooltips();
        // this.initLabelPanel();
        this.initShadowPanel();
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel('Stroke Width')
            .setMaxValue(20)
            .setTextFieldWidth(45)
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.seriesTooltipsToggle
            .setLabel('Tooltips')
            .setValue(selected)
            .onSelectionChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    // private initLabelPanel() {
    //     const params: ChartLabelPanelParams = {
    //         chartController: this.chartController,
    //         enabled: this.series.some(s => s.labelEnabled),
    //         setEnabled: (enabled: boolean) => {
    //             this.series.forEach(s => s.labelEnabled = enabled);
    //         },
    //         getFont: () => {
    //             return this.series[0].labelFont;
    //         },
    //         setFont: (font: string) => {
    //             this.series.forEach(s => s.labelFont = font);
    //         },
    //         getColor: () => {
    //             return this.series[0].labelColor;
    //         },
    //         setColor: (color: string) => {
    //             this.series.forEach(s => s.labelColor = color);
    //         }
    //     };
    //
    //     const labelPanelComp = new LabelPanel(params);
    //     this.getContext().wireBean(labelPanelComp);
    //     this.activePanels.push(labelPanelComp);
    //
    //     const labelOffsetInput = new AgInputNumberField()
    //         .setLabel('Offset')
    //         .setInputWidth(40)
    //         .setValue(`${this.series[0].labelOffset}`)
    //         .onInputChange(newValue => this.series.forEach(s => s.labelOffset = newValue));
    //
    //     this.getContext().wireBean(labelOffsetInput);
    //     labelPanelComp.addCompToPanel(labelOffsetInput);
    //     this.activePanels.push(labelOffsetInput);
    //
    //     this.seriesGroup.addItem(labelPanelComp);
    // }

    private initShadowPanel() {
        const shadowPanelComp = new ShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
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