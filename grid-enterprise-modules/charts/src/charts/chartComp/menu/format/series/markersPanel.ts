import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";

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

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
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
            .setLabel(this.chartTranslationService.translate('shape'))
            .setValue(this.getSeriesOption("marker.shape"))
            .onValueChange(value => this.setSeriesOption("marker.shape", value));

        // scatter charts should always show markers
        const chartType = this.chartOptionsService.getChartType();
        const shouldHideEnabledCheckbox = _.includes(['scatter', 'bubble'], chartType);

        this.seriesMarkersGroup
            .setTitle(this.chartTranslationService.translate("markers"))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.getSeriesOption("marker.enabled") || false)
            .hideOpenCloseIcons(true)
            .onEnableChange(newValue => this.setSeriesOption("marker.enabled", newValue));

        const initInput = (expression: string, input: AgSlider, labelKey: string, defaultMaxValue: number) => {
            const currentValue = this.getSeriesOption<number>(expression);
            input.setLabel(this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.setSeriesOption(expression, newValue));
        };

        if (chartType === 'bubble') {
            initInput("marker.maxSize", this.seriesMarkerMinSizeSlider, "maxSize", 60);
            initInput("marker.size", this.seriesMarkerSizeSlider, "minSize", 60);
        } else {
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            initInput("marker.size", this.seriesMarkerSizeSlider, "size", 60);
        }

        initInput("marker.strokeWidth", this.seriesMarkerStrokeWidthSlider, "strokeWidth", 10);
    }

    private getSeriesOption<T = string>(expression: string): T {
        return this.chartOptionsService.getSeriesOption<T>(expression, this.getSelectedSeries());
    }

    private setSeriesOption<T = string>(expression: string, newValue: T): void {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries());
    }
}
