import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import { ChartController } from "../../chartController";
import { Chart } from "../../../../charts/chart/chart";
import { LineSeries } from "../../../../charts/chart/series/lineSeries";

export class ChartLineSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-input-text-field ref="inputSeriesLineWidth"></ag-input-text-field>
                <ag-checkbox ref="cbTooltipsEnabled"></ag-checkbox>                  
                <ag-group-component ref="seriesMarkersGroup">
                    <ag-checkbox ref="cbMarkersEnabled"></ag-checkbox>
                    <ag-input-text-field ref="inputSeriesMarkerSize"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesMarkerStrokeWidth"></ag-input-text-field>
                </ag-group-component>  
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('inputSeriesLineWidth') private inputSeriesLineWidth: AgInputTextField;
    @RefSelector('cbTooltipsEnabled') private cbTooltipsEnabled: AgCheckbox;
    @RefSelector('seriesMarkersGroup') private seriesMarkersGroup: AgGroupComponent;
    @RefSelector('cbMarkersEnabled') private cbMarkersEnabled: AgCheckbox;
    @RefSelector('inputSeriesMarkerSize') private inputSeriesMarkerSize: AgInputTextField;
    @RefSelector('inputSeriesMarkerStrokeWidth') private inputSeriesMarkerStrokeWidth: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: Chart;
    private series: LineSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartLineSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();
        this.series = this.chart.series as LineSeries[];

        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initMarkers();
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

    private initSeriesLineWidth() {
        this.inputSeriesLineWidth
            .setLabel('Line Width')
            .setLabelWidth(70)
            .setWidth(105)
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initMarkers() {
        this.seriesMarkersGroup.setLabel('Markers');

        this.cbMarkersEnabled.setLabel('Enabled');

        const enabled = this.series.some(s => s.marker);
        this.cbMarkersEnabled.setSelected(enabled);

        this.addDestroyableEventListener(this.cbMarkersEnabled, 'change', () => {
            this.series.forEach(s => s.marker = this.cbMarkersEnabled.isSelected());
        });

        this.inputSeriesMarkerSize
            .setLabel('Size')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.series[0].markerSize}`)
            .onInputChange(newValue => this.series.forEach(s => s.markerSize = newValue));

        this.inputSeriesMarkerStrokeWidth
            .setLabel('Stroke Width')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.series[0].markerStrokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.markerStrokeWidth = newValue));
    }
}