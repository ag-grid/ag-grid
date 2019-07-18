import {
    _,
    AgGroupComponent,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { LineSeries } from "../../../../../charts/chart/series/lineSeries";
import { MarkersPanel } from "./markersPanel";
import { ChartTranslator } from "../../../chartTranslator";

export class LineSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="seriesLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('seriesLineWidthSlider') private seriesLineWidthSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

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
            .setTitle(this.chartTranslator.translate('series'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initMarkersPanel();
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate('tooltips'))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth(40)
            .setValue(selected)
            .onValueChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    private initSeriesLineWidth() {
        const strokeWidth = this.series.length > 0 ? this.series[0].strokeWidth : 3;

        this.seriesLineWidthSlider
            .setLabel(this.chartTranslator.translate('lineWidth'))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${strokeWidth}`)
            .onValueChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
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
