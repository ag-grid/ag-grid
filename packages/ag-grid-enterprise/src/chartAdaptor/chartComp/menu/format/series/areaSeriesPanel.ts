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
import {ChartController} from "../../../chartController";
import {LineSeries} from "../../../../../charts/chart/series/lineSeries";
import {MarkersPanel} from "./markersPanel";
import {ExpandablePanel} from "../chartFormatingPanel";
import {ChartTranslator} from "../../../chartTranslator";
import {AreaSeries} from "../../../../../charts/chart/series/areaSeries";
import {ShadowPanel} from "./shadowPanel";

export class AreaSeriesPanel extends Component implements ExpandablePanel {

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

    private series: AreaSeries[];
    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(AreaSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as AreaSeries[];

        this.seriesGroup
            .setTitle(this.chartTranslator.translate('series'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initMarkersPanel();
        this.initShadowPanel();
    }

    public expandPanel(expanded: boolean): void {
        this.seriesGroup.toggleGroupExpand(expanded);
    }

    public setExpandedCallback(expandedCallback: () => void) {
        this.addDestroyableEventListener(this.seriesGroup, 'expanded', expandedCallback);
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
        this.seriesLineWidthSlider
            .setLabel(this.chartTranslator.translate('lineWidth'))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${this.series[0].strokeWidth}`)
            .onValueChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initMarkersPanel() {
        const markersPanelComp = new MarkersPanel(this.series);
        this.getContext().wireBean(markersPanelComp);
        this.seriesGroup.addItem(markersPanelComp);
        this.activePanels.push(markersPanelComp);
    }

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
