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
import {LineSeries} from "../../../../charts/chart/series/lineSeries";

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

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartLineSeriesPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initMarkers();
    }

    private initSeriesTooltips() {
        this.seriesGroup.setLabel('Series');

        // TODO update code below when this.chart.showTooltips is available
        let enabled = _.every(this.chart.series, (series) => series.tooltipEnabled);
        this.cbTooltipsEnabled.setLabel('Tooltips');
        this.cbTooltipsEnabled.setSelected(enabled);
        this.addDestroyableEventListener(this.cbTooltipsEnabled, 'change', () => {
            this.chart.series.forEach(series => {
                series.tooltipEnabled = this.cbTooltipsEnabled.isSelected();
            });
        });
    }

    private initSeriesLineWidth() {
        this.inputSeriesLineWidth.setLabel('Line Width')
            .setLabelWidth(70)
            .setWidth(105);

        const lineSeries = this.chart.series as LineSeries[];
        if (lineSeries.length > 0) {
            this.inputSeriesLineWidth.setValue(`${lineSeries[0].strokeWidth}`);
        }

        this.addDestroyableEventListener(this.inputSeriesLineWidth.getInputElement(), 'input', () => {
            lineSeries.forEach(series => {
                series.strokeWidth = Number.parseInt(this.inputSeriesLineWidth.getValue());
            });
        });
    }

    private initMarkers() {
        this.seriesMarkersGroup.setLabel('Markers');

        this.cbMarkersEnabled.setLabel('Enabled');

        const lineSeries = this.chart.series as LineSeries[];
        let enabled = lineSeries.some(series => series.marker);
        this.cbMarkersEnabled.setSelected(enabled);

        this.addDestroyableEventListener(this.cbMarkersEnabled, 'change', () => {
            lineSeries.forEach(series => series.marker = this.cbMarkersEnabled.isSelected());
        });

        this.inputSeriesMarkerSize.setLabel('Size')
            .setLabelWidth(80)
            .setWidth(115);

        if (lineSeries.length > 0) {
            this.inputSeriesMarkerSize.setValue(`${lineSeries[0].markerSize}`);
        }

        this.addDestroyableEventListener(this.inputSeriesMarkerSize.getInputElement(), 'input', () => {
            lineSeries.forEach(series => {
                series.markerSize = Number.parseInt(this.inputSeriesMarkerSize.getValue());
            });
        });

        this.inputSeriesMarkerStrokeWidth.setLabel('Stroke Width')
            .setLabelWidth(80)
            .setWidth(115);

        if (lineSeries.length > 0) {
            this.inputSeriesMarkerStrokeWidth.setValue(`${lineSeries[0].markerStrokeWidth}`);
        }

        this.addDestroyableEventListener(this.inputSeriesMarkerStrokeWidth.getInputElement(), 'input', () => {
            lineSeries.forEach(series => {
                series.markerStrokeWidth = Number.parseInt(this.inputSeriesMarkerStrokeWidth.getValue());
            });
        });
    }
}