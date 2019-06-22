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
import {PieSeries} from "../../../../charts/chart/series/pieSeries";
import {ChartShadowPanel} from "./chartShadowPanel";
import {ChartLabelPanel, ChartLabelPanelParams} from "./chartLabelPanel";

export class ChartPieSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-checkbox ref="cbTooltipsEnabled"></ag-checkbox>                               
                <ag-input-text-field ref="inputSeriesStrokeWidth"></ag-input-text-field>
                <ag-group-component ref="labelSeriesCallout">
                    <ag-input-text-field ref="inputSeriesCalloutLength"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesCalloutStrokeWidth"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesLabelOffset"></ag-input-text-field>
                </ag-group-component>                              
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('cbTooltipsEnabled') private cbTooltipsEnabled: AgCheckbox;
    @RefSelector('inputSeriesStrokeWidth') private inputSeriesStrokeWidth: AgInputTextField;

    @RefSelector('labelSeriesCallout') private labelSeriesCallout: AgGroupComponent;
    @RefSelector('inputSeriesCalloutLength') private inputSeriesCalloutLength: AgInputTextField;
    @RefSelector('inputSeriesCalloutStrokeWidth') private inputSeriesCalloutStrokeWidth: AgInputTextField;
    @RefSelector('inputSeriesLabelOffset') private inputSeriesLabelOffset: AgInputTextField;

    private readonly chartController: ChartController;

    private activePanels: Component[] = [];
    private series: PieSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPieSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as PieSeries[];

        this.seriesGroup.setLabel('Series');

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initLabelPanel();

        this.initCalloutOptions();

        // init shadow panel
        const shadowPanelComp = new ChartShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
        this.activePanels.push(shadowPanelComp);
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

    private initSeriesStrokeWidth() {
        this.inputSeriesStrokeWidth
            .setLabel('Stroke Width')
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
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
            getFont: () =>  this.series[0].labelFont,
            setFont: (font: string) => {
                this.series.forEach(s => s.labelFont = font);
            },
            getColor: () => this.series[0].labelColor,
            setColor: (color: string) => {
                this.series.forEach(s => s.labelColor = color);
            }
        };

        const labelPanelComp = new ChartLabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.seriesGroup.getGui().appendChild(labelPanelComp.getGui());
        this.activePanels.push(labelPanelComp);
    }

    private initCalloutOptions() {
        this.labelSeriesCallout.setLabel('Callout');

        this.inputSeriesCalloutLength
            .setLabel('Length')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.series[0].calloutLength}`)
            .onInputChange(newValue => this.series.forEach(s => s.calloutLength = newValue));

        this.inputSeriesCalloutStrokeWidth
            .setLabel('Stroke Width')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.series[0].calloutStrokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.calloutStrokeWidth = newValue));

        this.inputSeriesLabelOffset
            .setLabel('Padding')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.series[0].labelOffset}`)
            .onInputChange(newValue => this.series.forEach(s => s.labelOffset = newValue));
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