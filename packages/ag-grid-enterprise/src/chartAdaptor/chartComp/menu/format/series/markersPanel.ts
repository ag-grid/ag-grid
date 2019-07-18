import { AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector } from "ag-grid-community";
import { LineSeries } from "../../../../../charts/chart/series/lineSeries";
import { ChartTranslator } from "../../../chartTranslator";
import { AreaSeries } from "../../../../../charts/chart/series/areaSeries";

export class MarkersPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="seriesMarkersGroup">
                <ag-slider ref="seriesMarkerSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerStrokeWidthSlider"></ag-slider>
            </ag-group-component>  
        </div>`;

    @RefSelector('seriesMarkersGroup') private seriesMarkersGroup: AgGroupComponent;
    @RefSelector('seriesMarkerSizeSlider') private seriesMarkerSizeSlider: AgSlider;
    @RefSelector('seriesMarkerStrokeWidthSlider') private seriesMarkerStrokeWidthSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private series: LineSeries[] | AreaSeries[];

    constructor(series: LineSeries[] | AreaSeries[]) {
        super();
        this.series = series;
    }

    @PostConstruct
    private init() {
        this.setTemplate(MarkersPanel.TEMPLATE);
        this.initMarkers();
    }

    private initMarkers() {
        const enabled = this.series.some((s: LineSeries | AreaSeries) => s.marker);

        this.seriesMarkersGroup
            .setTitle(this.chartTranslator.translate('markers'))
            .setEnabled(enabled)
            .hideOpenCloseIcons(true)
            .onEnableChange(enabled => {
                this.series.forEach((s: LineSeries | AreaSeries) => s.marker = enabled);
            });

        type LineMarkerProperty = 'markerSize' | 'markerStrokeWidth';

        const initInput = (property: LineMarkerProperty, input: AgSlider, labelKey: string, initialValue: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(initialValue)
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => {
                    this.series.forEach((s: LineSeries | AreaSeries) => s[property] = newValue)
                });
        };

        const initialSize = this.series.length > 0 ? this.series[0].markerSize : 6;
        initInput('markerSize', this.seriesMarkerSizeSlider, 'size', `${initialSize}`, 30);

        const initialStrokeWidth = this.series.length > 0 ? this.series[0].markerStrokeWidth : 1;
        initInput('markerStrokeWidth', this.seriesMarkerStrokeWidthSlider, 'strokeWidth', `${initialStrokeWidth}`, 10);
    }
}