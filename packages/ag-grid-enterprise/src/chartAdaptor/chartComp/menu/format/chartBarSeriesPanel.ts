import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {BarSeries} from "../../../../charts/chart/series/barSeries";
import {ChartShadowPanel} from "./chartShadowPanel";
import {ChartLabelPanel, ChartLabelPanelParams} from "./chartLabelPanel";

export class ChartBarSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-checkbox ref="cbTooltipsEnabled"></ag-checkbox>                       
                <ag-input-text-field ref="inputSeriesStrokeWidth"></ag-input-text-field>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('cbTooltipsEnabled') private cbTooltipsEnabled: AgCheckbox;
    @RefSelector('inputSeriesStrokeWidth') private inputSeriesStrokeWidth: AgInputTextField;
    @RefSelector('inputSeriesLabelOffset') private inputSeriesLabelOffset: AgInputTextField;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private series: BarSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartBarSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as BarSeries[];

        this.seriesGroup.setLabel('Series');

        this.initSeriesStrokeWidth();
        this.initSeriesTooltips();
        this.initLabelPanel();
        this.initShadowPanel();
    }

    private initSeriesStrokeWidth() {
        this.inputSeriesStrokeWidth
            .setLabel('Stroke Width')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initSeriesTooltips() {
        const selected = this.series.some(s => s.tooltipEnabled);

        this.cbTooltipsEnabled
            .setLabel('Tooltips')
            .setSelected(selected)
            .onSelectionChange(newSelection => {
                this.series.forEach(s => s.tooltipEnabled = newSelection);
            });
    }

    private initLabelPanel() {
        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            isEnabled: () => {
                return this.series.some(s => s.labelEnabled);
            },
            setEnabled: (enabled: boolean) => {
                this.series.forEach(s => s.labelEnabled = enabled);
            },
            getFont: () => {
                return this.series[0].labelFont;
            },
            setFont: (font: string) => {
                this.series.forEach(s => s.labelFont = font);
            },
            getColor: () => {
                return this.series[0].labelColor;
            },
            setColor: (color: string) => {
                this.series.forEach(s => s.labelColor = color);
            }
        };

        const labelPanelComp = new ChartLabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.seriesGroup.getGui().appendChild(labelPanelComp.getGui());
        this.activePanels.push(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = new ChartShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
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