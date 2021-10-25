import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    Autowired,
    ChartType,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartOptionsService } from "../../chartOptionsService";

export class MarkersPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesMarkersGroup">
                <ag-select ref="seriesMarkerShapeSelect"></ag-select>
                <ag-slider ref="seriesMarkerMinSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesMarkersGroup') private seriesMarkersGroup: AgGroupComponent;
    @RefSelector('seriesMarkerShapeSelect') private seriesMarkerShapeSelect: AgSelect;
    @RefSelector('seriesMarkerSizeSlider') private seriesMarkerSizeSlider: AgSlider;
    @RefSelector('seriesMarkerMinSizeSlider') private seriesMarkerMinSizeSlider: AgSlider;
    @RefSelector('seriesMarkerStrokeWidthSlider') private seriesMarkerStrokeWidthSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical'
        };
        this.setTemplate(MarkersPanel.TEMPLATE, {seriesMarkersGroup: groupParams});
        this.initMarkers();
    }

    private initMarkers() {
        const seriesMarkerShapeOptions = [
            {
                value: 'square',
                text: 'Square'
            },
            {
                value: 'circle',
                text: 'Circle'
            },
            {
                value: 'cross',
                text: 'Cross'
            },
            {
                value: 'diamond',
                text: 'Diamond'
            },
            {
                value: 'plus',
                text: 'Plus'
            },
            {
                value: 'triangle',
                text: 'Triangle'
            },
            {
                value: 'heart',
                text: 'Heart'
            }
        ];
        this.seriesMarkerShapeSelect
            .addOptions(seriesMarkerShapeOptions)
            .setLabel(this.chartTranslator.translate('shape'))
            .setValue(this.chartOptionsService.getSeriesOption("marker.shape"))
            .onValueChange(value => this.chartOptionsService.setSeriesOption("marker.shape", value));

        // scatter charts should always show markers
        const chartType = this.chartOptionsService.getChartType();
        const shouldHideEnabledCheckbox = _.includes([ChartType.Scatter, ChartType.Bubble], chartType);

        this.seriesMarkersGroup
            .setTitle(this.chartTranslator.translate("markers"))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.chartOptionsService.getSeriesOption("marker.enabled") || false)
            .hideOpenCloseIcons(true)
            .onEnableChange(newValue => this.chartOptionsService.setSeriesOption("marker.enabled", newValue));

        const initInput = (expression: string, input: AgSlider, labelKey: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(this.chartOptionsService.getSeriesOption(expression))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(expression, newValue));
        };

        if (chartType === ChartType.Bubble) {
            initInput("marker.maxSize", this.seriesMarkerMinSizeSlider, "maxSize", 60);
            initInput("marker.size", this.seriesMarkerSizeSlider, "minSize", 60);
        } else {
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            initInput("marker.size", this.seriesMarkerSizeSlider, "size", 60);
        }

        initInput("marker.strokeWidth", this.seriesMarkerStrokeWidthSlider, "strokeWidth", 10);
    }
}
