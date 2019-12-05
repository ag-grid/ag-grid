import { AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector, ChartType } from "@ag-grid-community/core";
import { ChartTranslator } from "../../../chartTranslator";
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

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(MarkersPanel.TEMPLATE);
        this.initMarkers();
    }

    private initMarkers() {
        // scatter charts should always show markers
        const shouldHideEnabledCheckbox = this.chartController.getChartProxy() instanceof ScatterChartProxy;

        this.seriesMarkersGroup
            .setTitle(this.chartTranslator.translate("markers"))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.chartController.getChartProxy().getSeriesOption("marker.enabled") || false)
            .hideOpenCloseIcons(true)
            .onEnableChange(newValue => this.chartController.getChartProxy().setSeriesOption("marker.enabled", newValue));

        const initInput = (expression: string, input: AgSlider, labelKey: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartController.getChartProxy().getSeriesOption(expression))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartController.getChartProxy().setSeriesOption(expression, newValue));
        };

        if (this.chartController.getChartType() === ChartType.Bubble) {
            initInput("marker.minSize", this.seriesMarkerMinSizeSlider, "minSize", 60);
            initInput("marker.size", this.seriesMarkerSizeSlider, "maxSize", 60);
        } else {
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            initInput("marker.size", this.seriesMarkerSizeSlider, "size", 60);
        }

        initInput("marker.strokeWidth", this.seriesMarkerStrokeWidthSlider, "strokeWidth", 10);
    }
}
