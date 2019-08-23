import {AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartTranslator} from "../../../chartTranslator";
import {LineChartProxy} from "../../../chartProxies/cartesian/lineChartProxy";
import {AreaChartProxy} from "../../../chartProxies/cartesian/areaChartProxy";
import {LineMarkerProperty} from "../../../chartProxies/cartesian/cartesianChartProxy";
import {ScatterChartProxy} from "../../../chartProxies/cartesian/scatterChartProxy";

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

    private readonly chartProxy: LineChartProxy | ScatterChartProxy | AreaChartProxy;

    constructor(chartProxy: LineChartProxy | AreaChartProxy | ScatterChartProxy) {
        super();
        this.chartProxy = chartProxy;
    }

    @PostConstruct
    private init() {
        this.setTemplate(MarkersPanel.TEMPLATE);
        this.initMarkers();
    }

    private initMarkers() {

        // scatter charts should always show markers
        const shouldHideEnabledCheckbox = this.chartProxy instanceof ScatterChartProxy;

        this.seriesMarkersGroup
            .setTitle(this.chartTranslator.translate('markers'))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.chartProxy.getMarkersEnabled())
            .hideOpenCloseIcons(true)
            .onEnableChange(newValue => this.chartProxy.setSeriesProperty('marker', newValue));

        const initInput = (property: LineMarkerProperty, input: AgSlider, labelKey: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartProxy.getSeriesProperty(property))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartProxy.setSeriesProperty(property, newValue));
        };

        initInput('markerSize', this.seriesMarkerSizeSlider, 'size', 30);
        initInput('markerStrokeWidth', this.seriesMarkerStrokeWidthSlider, 'strokeWidth', 10);
    }
}
