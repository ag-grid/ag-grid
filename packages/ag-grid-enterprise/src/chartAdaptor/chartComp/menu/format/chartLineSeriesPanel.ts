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

        const enabled = this.series.some(s => s.marker);

        this.cbMarkersEnabled
            .setLabel('Enabled')
            .setSelected(enabled)
            .onSelectionChange(newSelection => {
                this.series.forEach(s => s.marker = newSelection);
            });

        type LineMarkerProperty = 'markerSize' | 'markerStrokeWidth';

        const initInput = (property: LineMarkerProperty, input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth(80)
                .setWidth(115)
                .setValue(initialValue)
                .onInputChange(newValue => {
                    this.series.forEach(s => s[property] = newValue)
                });
        };

        const initialSize = `${this.series[0].markerSize}`;
        initInput('markerSize', this.inputSeriesMarkerSize, 'Size', initialSize);

        const initialStrokeWidth = `${this.series[0].markerStrokeWidth}`;
        initInput('markerStrokeWidth', this.inputSeriesMarkerStrokeWidth, 'Stroke Width', initialStrokeWidth);
    }
}