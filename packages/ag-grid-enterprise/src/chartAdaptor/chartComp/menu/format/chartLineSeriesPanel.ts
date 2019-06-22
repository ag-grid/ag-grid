import {AgCheckbox, AgGroupComponent, AgInputTextField, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {LineSeries} from "../../../../charts/chart/series/lineSeries";

export class ChartLineSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-checkbox ref="cbTooltipsEnabled"></ag-checkbox>                  
                <ag-input-text-field ref="inputSeriesLineWidth"></ag-input-text-field>
                <ag-group-component ref="seriesMarkersGroup">
                    <ag-checkbox ref="cbMarkersEnabled"></ag-checkbox>
                    <ag-input-text-field ref="inputSeriesMarkerSize"></ag-input-text-field>
                    <ag-input-text-field ref="inputSeriesMarkerStrokeWidth"></ag-input-text-field>
                </ag-group-component>  
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('cbTooltipsEnabled') private cbTooltipsEnabled: AgCheckbox;
    @RefSelector('inputSeriesLineWidth') private inputSeriesLineWidth: AgInputTextField;
    @RefSelector('seriesMarkersGroup') private seriesMarkersGroup: AgGroupComponent;
    @RefSelector('cbMarkersEnabled') private cbMarkersEnabled: AgCheckbox;
    @RefSelector('inputSeriesMarkerSize') private inputSeriesMarkerSize: AgInputTextField;
    @RefSelector('inputSeriesMarkerStrokeWidth') private inputSeriesMarkerStrokeWidth: AgInputTextField;

    private readonly chartController: ChartController;
    private series: LineSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartLineSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series as LineSeries[];

        this.seriesGroup.setLabel('Series');

        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initMarkers();
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