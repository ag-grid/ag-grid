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
import {Chart} from "../../../../charts/chart/chart";
import {PieSeries} from "../../../../charts/chart/series/pieSeries";
import {ChartShadowPanel} from "./chartShadowPanel";
import {ChartLabelPanel, ChartLabelPanelParams} from "./chartLabelPanel";

export class ChartPieSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-input-text-field ref="inputSeriesStrokeWidth"></ag-input-text-field>
                <ag-checkbox ref="cbTooltipsEnabled"></ag-checkbox>                               
                <ag-group-component ref="labelSeriesCallout">
                    <ag-input-text-field ref="inputSeriesCalloutLength"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesCalloutStrokeWidth"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesLabelOffset"></ag-input-text-field>
                </ag-group-component>                              
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('inputSeriesStrokeWidth') private inputSeriesStrokeWidth: AgInputTextField;
    @RefSelector('cbTooltipsEnabled') private cbTooltipsEnabled: AgCheckbox;

    @RefSelector('labelSeriesCallout') private labelSeriesCallout: AgGroupComponent;
    @RefSelector('inputSeriesCalloutLength') private inputSeriesCalloutLength: AgInputTextField;
    @RefSelector('inputSeriesCalloutStrokeWidth') private inputSeriesCalloutStrokeWidth: AgInputTextField;
    @RefSelector('inputSeriesLabelOffset') private inputSeriesLabelOffset: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: Chart;

    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPieSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

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
        this.seriesGroup.setLabel('Series');

        // TODO update code below when this.chart.showTooltips is available
        const enabled = _.every(this.chart.series, (series) => series.tooltipEnabled);
        this.cbTooltipsEnabled.setLabel('Tooltips');
        this.cbTooltipsEnabled.setSelected(enabled);
        this.addDestroyableEventListener(this.cbTooltipsEnabled, 'change', () => {
            this.chart.series.forEach(series => {
                series.tooltipEnabled = this.cbTooltipsEnabled.isSelected();
            });
        });
    }

    private initSeriesStrokeWidth() {
        this.inputSeriesStrokeWidth.setLabel('Stroke Width');

        const pieSeries = this.chart.series as PieSeries[];
        if (pieSeries.length > 0) {
            this.inputSeriesStrokeWidth.setValue(`${pieSeries[0].strokeWidth}`);
        }

        this.addDestroyableEventListener(this.inputSeriesStrokeWidth.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.strokeWidth = Number.parseInt(this.inputSeriesStrokeWidth.getValue());
            });
        });
    }

    private initLabelPanel() {
        const pieSeries = this.chart.series as PieSeries[];
        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            isEnabled: () => {
                return pieSeries.some(series => series.labelEnabled);
            },
            setEnabled: (enabled: boolean) => {
                pieSeries.forEach(series => series.labelEnabled = enabled);
            },
            getFont: () =>  pieSeries.length > 0 ? pieSeries[0].labelFont : '',
            setFont: (font: string) => {
                pieSeries.forEach(series => series.labelFont = font);
            },
            getColor: () => pieSeries.length > 0 ? pieSeries[0].labelColor : '',
            setColor: (color: string) => {
                pieSeries.forEach(series => series.labelColor = color);
            }
        };

        const labelPanelComp = new ChartLabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.seriesGroup.getGui().appendChild(labelPanelComp.getGui());
        this.activePanels.push(labelPanelComp);
    }

    private initCalloutOptions() {
        this.labelSeriesCallout.setLabel('Callout');

        const pieSeries = this.chart.series as PieSeries[];

        this.inputSeriesCalloutLength.setLabel('Length')
            .setLabelWidth(80)
            .setWidth(115);

        if (pieSeries.length > 0) {
            this.inputSeriesCalloutLength.setValue(`${pieSeries[0].calloutLength}`);
        }

        this.addDestroyableEventListener(this.inputSeriesCalloutLength.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.calloutLength = Number.parseInt(this.inputSeriesCalloutLength.getValue());
            });
        });

        this.inputSeriesCalloutStrokeWidth.setLabel('Stroke Width')
            .setLabelWidth(80)
            .setWidth(115);

        if (pieSeries.length > 0) {
            this.inputSeriesCalloutStrokeWidth.setValue(`${pieSeries[0].calloutStrokeWidth}`);
        }

        this.addDestroyableEventListener(this.inputSeriesCalloutStrokeWidth.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.calloutStrokeWidth = Number.parseInt(this.inputSeriesCalloutStrokeWidth.getValue());
            });
        });

        this.inputSeriesLabelOffset.setLabel('Padding')
            .setLabelWidth(80)
            .setWidth(115);

        if (pieSeries.length > 0) {
            this.inputSeriesLabelOffset.setValue(`${pieSeries[0].labelOffset}`);
        }

        this.addDestroyableEventListener(this.inputSeriesLabelOffset.getInputElement(), 'input', () => {
            pieSeries.forEach(series => {
                series.labelOffset = Number.parseInt(this.inputSeriesLabelOffset.getValue());
            });
        });
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