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
import { LineSeries } from "../../../../../charts/chart/series/lineSeries";
import { MarkersPanel } from "./markersPanel";

export class LineSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-checkbox ref="seriesTooltipsCheckbox"></ag-checkbox>
                <ag-slider ref="seriesLineWidthSlider"></ag-slider>                               
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsCheckbox') private seriesTooltipsCheckbox: AgCheckbox;
    @RefSelector('seriesLineWidthSlider') private seriesLineWidthSlider: AgSlider;

    private series: LineSeries[];
    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(LineSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as LineSeries[];

        this.seriesGroup
            .setTitle('Series')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initMarkersPanel();
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.seriesTooltipsCheckbox
            .setLabel('Tooltips')
            .setSelected(selected)
            .onSelectionChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    private initSeriesLineWidth() {
        this.seriesLineWidthSlider
            .setLabel('Line Width')
            .setMaxValue(20)
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initMarkersPanel() {
        const markersPanelComp = new MarkersPanel(this.series);
        this.getContext().wireBean(markersPanelComp);
        this.seriesGroup.addItem(markersPanelComp);
        this.activePanels.push(markersPanelComp);
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