import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgSlider,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { PieSeries } from "../../../../../charts/chart/series/pieSeries";
import { ShadowPanel } from "./shadowPanel";
import { ChartLabelPanelParams, LabelPanel } from "../label/labelPanel";
import { CalloutPanel } from "./calloutPanel";

export class PieSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-checkbox ref="seriesTooltipsCheckbox"></ag-checkbox>
                <ag-slider ref="seriesStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsCheckbox') private seriesTooltipsCheckbox: AgCheckbox;
    @RefSelector('seriesStrokeWidthSlider') private seriesStrokeWidthSlider: AgSlider;

    private readonly chartController: ChartController;

    private activePanels: Component[] = [];
    private series: PieSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(PieSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as PieSeries[];

        this.initGroup();
        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        // this.initLabelPanel();
        this.initShadowPanel();
    }

    private initGroup() {
        this.seriesGroup
            .setTitle('Series')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.seriesTooltipsCheckbox
            .setLabel('Tooltips')
            .setValue(selected)
            .onSelectionChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel('Stroke Width')
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    // private initLabelPanel() {
    //     const params: ChartLabelPanelParams = {
    //         chartController: this.chartController,
    //         enabled: this.series.some(s => s.labelEnabled),
    //         setEnabled: (enabled: boolean) => {
    //             this.series.forEach(s => s.labelEnabled = enabled);
    //         },
    //         getFont: () =>  this.series[0].labelFont,
    //         setFont: (font: string) => {
    //             this.series.forEach(s => s.labelFont = font);
    //         },
    //         getColor: () => this.series[0].labelColor,
    //         setColor: (color: string) => {
    //             this.series.forEach(s => s.labelColor = color);
    //         }
    //     };
    //
    //     const labelPanelComp = new LabelPanel(params);
    //     this.getContext().wireBean(labelPanelComp);
    //     this.activePanels.push(labelPanelComp);
    //
    //     const calloutPanelComp = new CalloutPanel(this.series);
    //     this.getContext().wireBean(calloutPanelComp);
    //     labelPanelComp.addCompToPanel(calloutPanelComp);
    //     this.activePanels.push(calloutPanelComp);
    //
    //     this.seriesGroup.addItem(labelPanelComp);
    // }

    private initShadowPanel() {
        const shadowPanelComp = new ShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
        this.seriesGroup.addItem(shadowPanelComp);
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