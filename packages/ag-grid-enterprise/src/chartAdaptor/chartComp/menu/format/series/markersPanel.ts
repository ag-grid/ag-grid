import {AgGroupComponent, AgInputTextField, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {LineSeries} from "../../../../../charts/chart/series/lineSeries";

export class MarkersPanel extends Component {

    public static TEMPLATE =
        `<div>               
            <ag-group-component ref="seriesMarkersGroup">
                <ag-input-text-field ref="seriesMarkerSizeInput"></ag-input-text-field>
                <ag-input-text-field ref="seriesMarkerStrokeWidthInput"></ag-input-text-field>
            </ag-group-component>  
        </div>`;

    @RefSelector('seriesMarkersGroup') private seriesMarkersGroup: AgGroupComponent;
    @RefSelector('seriesMarkerSizeInput') private seriesMarkerSizeInput: AgInputTextField;
    @RefSelector('seriesMarkerStrokeWidthInput') private seriesMarkerStrokeWidthInput: AgInputTextField;

    private series: LineSeries[];

    constructor(series: LineSeries[]) {
        super();
        this.series = series;
    }

    @PostConstruct
    private init() {
        this.setTemplate(MarkersPanel.TEMPLATE);
        this.initMarkers();
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