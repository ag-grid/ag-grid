import { AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector, ChartType } from "@ag-community/grid-core";
import { ChartTranslator } from "../../../chartTranslator";
import { LineChartProxy } from "../../../chartProxies/cartesian/lineChartProxy";
import { AreaChartProxy } from "../../../chartProxies/cartesian/areaChartProxy";
import { ScatterChartProxy } from "../../../chartProxies/cartesian/scatterChartProxy";
import { ChartController } from "../../../chartController";

export class MarkersPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="seriesMarkersGroup">
                <ag-slider ref="seriesMarkerMinSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesMarkersGroup') private seriesMarkersGroup: AgGroupComponent;
    @RefSelector('seriesMarkerSizeSlider') private seriesMarkerSizeSlider: AgSlider;
    @RefSelector('seriesMarkerMinSizeSlider') private seriesMarkerMinSizeSlider: AgSlider;
    @RefSelector('seriesMarkerStrokeWidthSlider') private seriesMarkerStrokeWidthSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private readonly chartController: ChartController;
    private readonly chartProxy: LineChartProxy | ScatterChartProxy | AreaChartProxy;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = chartController.getChartProxy() as LineChartProxy | AreaChartProxy | ScatterChartProxy;
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
            .setTitle(this.chartTranslator.translate("markers"))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.chartProxy.getSeriesOption("marker.enabled") || false)
            .hideOpenCloseIcons(true)
            .onEnableChange(newValue => this.chartProxy.setSeriesOption("marker.enabled", newValue));

        const initInput = (expression: string, input: AgSlider, labelKey: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartProxy.getSeriesOption(expression))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartProxy.setSeriesOption(expression, newValue));
        };

        if (this.chartController.getChartType() === ChartType.Bubble) {
            initInput("marker.minSize", this.seriesMarkerMinSizeSlider, "minSize", 30);
            initInput("marker.size", this.seriesMarkerSizeSlider, "maxSize", 30);
        } else {
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            initInput("marker.size", this.seriesMarkerSizeSlider, "size", 30);
        }

        initInput("marker.strokeWidth", this.seriesMarkerStrokeWidthSlider, "strokeWidth", 10);
    }
}
