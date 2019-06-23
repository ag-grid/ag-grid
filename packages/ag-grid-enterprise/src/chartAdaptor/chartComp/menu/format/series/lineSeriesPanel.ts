import {AgCheckbox, AgGroupComponent, AgInputTextField, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {LineSeries} from "../../../../../charts/chart/series/lineSeries";

export class LineSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>   
            <ag-group-component ref="seriesGroup">
                <ag-checkbox ref="seriesTooltipsCheckbox"></ag-checkbox>
                <ag-input-text-field ref="seriesLineWidthInput"></ag-input-text-field>
                
                <ag-group-component ref="seriesMarkersGroup">
                    <ag-input-text-field ref="seriesMarkerSizeInput"></ag-input-text-field>
                    <ag-input-text-field ref="seriesMarkerStrokeWidthInput"></ag-input-text-field>
                </ag-group-component>  
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsCheckbox') private seriesTooltipsCheckbox: AgCheckbox;
    @RefSelector('seriesLineWidthInput') private seriesLineWidthInput: AgInputTextField;
    @RefSelector('seriesMarkersGroup') private seriesMarkersGroup: AgGroupComponent;
    @RefSelector('seriesMarkerSizeInput') private seriesMarkerSizeInput: AgInputTextField;
    @RefSelector('seriesMarkerStrokeWidthInput') private seriesMarkerStrokeWidthInput: AgInputTextField;

    private readonly chartController: ChartController;
    private series: LineSeries[];

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
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initMarkers();
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
        this.seriesLineWidthInput
            .setLabel('Line Width')
            .setLabelWidth(70)
            .setWidth(105)
            .setValue(`${this.series[0].strokeWidth}`)
            .onInputChange(newValue => this.series.forEach(s => s.strokeWidth = newValue));
    }

    private initMarkers() {
        const enabled = this.series.some(s => s.marker);

        this.seriesMarkersGroup
            .setTitle('Markers')
            .setEnabled(enabled)
            .onEnableChange(enabled => {
                this.series.forEach(s => s.marker = enabled);
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
        initInput('markerSize', this.seriesMarkerSizeInput, 'Size', initialSize);

        const initialStrokeWidth = `${this.series[0].markerStrokeWidth}`;
        initInput('markerStrokeWidth', this.seriesMarkerStrokeWidthInput, 'Stroke Width', initialStrokeWidth);
    }
}