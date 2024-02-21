import {
    _,
    AgGroupComponentParams,
    AgSlider,
    AgSliderParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    AgSelectParams
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { ChartMenuUtils } from "../../chartMenuUtils";

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

    @RefSelector('seriesMarkerMinSizeSlider') private seriesMarkerMinSizeSlider: AgSlider;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        // scatter charts should always show markers
        const chartType = this.chartOptionsService.getChartType();
        const shouldHideEnabledCheckbox = _.includes(['scatter', 'bubble'], chartType);
        const seriesMarkersGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("markers"),
            suppressEnabledCheckbox: shouldHideEnabledCheckbox,
            enabled: this.getSeriesOption("marker.enabled") || false,
            suppressOpenCloseIcons: true,
            onEnableChange: newValue => this.setSeriesOption("marker.enabled", newValue)
        };

        let seriesMarkerMinSizeSliderParams: AgSliderParams;
        let seriesMarkerSizeSliderParams: AgSliderParams;
        if (chartType === 'bubble') {
            seriesMarkerMinSizeSliderParams = this.getSliderParams("marker.maxSize", "maxSize", 60);
            seriesMarkerSizeSliderParams = this.getSliderParams("marker.size", "minSize", 60);
        } else {
            seriesMarkerMinSizeSliderParams = {};
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            seriesMarkerSizeSliderParams = this.getSliderParams("marker.size", "size", 60);
        }

        this.setTemplate(MarkersPanel.TEMPLATE, {
            seriesMarkersGroup: seriesMarkersGroupParams,
            seriesMarkerShapeSelect: this.getMarkerShapeSelectParams(),
            seriesMarkerMinSizeSlider: seriesMarkerMinSizeSliderParams,
            seriesMarkerSizeSlider: seriesMarkerSizeSliderParams,
            seriesMarkerStrokeWidthSlider: this.getSliderParams("marker.strokeWidth", "strokeWidth", 10)
        });
        this.getMarkerShapeSelectParams();
    }

    private getMarkerShapeSelectParams(): AgSelectParams {
        const options = [
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
        return {
            options,
            label: this.chartTranslationService.translate('shape'),
            value: this.getSeriesOption("marker.shape"),
            onValueChange: value => this.setSeriesOption("marker.shape", value)
        }
    }

    private getSliderParams(expression: string, labelKey: string, defaultMaxValue: number): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams({
            labelKey,
            defaultMaxValue,
            value: this.getSeriesOption<number>(expression),
            onValueChange: newValue => this.setSeriesOption(expression, newValue)
        });
    }

    private getSeriesOption<T = string>(expression: string): T {
        return this.chartOptionsService.getSeriesOption<T>(expression, this.getSelectedSeries());
    }

    private setSeriesOption<T = string>(expression: string, newValue: T): void {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries());
    }
}
