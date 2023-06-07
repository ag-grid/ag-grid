var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class MarkersPanel extends Component {
    constructor(chartOptionsService, getSelectedSeries) {
        super();
        this.chartOptionsService = chartOptionsService;
        this.getSelectedSeries = getSelectedSeries;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical'
        };
        this.setTemplate(MarkersPanel.TEMPLATE, { seriesMarkersGroup: groupParams });
        this.initMarkers();
    }
    initMarkers() {
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
        const initInput = (expression, input, labelKey, defaultMaxValue) => {
            const currentValue = this.getSeriesOption(expression);
            input.setLabel(this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.setSeriesOption(expression, newValue));
        };
        if (chartType === 'bubble') {
            initInput("marker.maxSize", this.seriesMarkerMinSizeSlider, "maxSize", 60);
            initInput("marker.size", this.seriesMarkerSizeSlider, "minSize", 60);
        }
        else {
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            initInput("marker.size", this.seriesMarkerSizeSlider, "size", 60);
        }
        initInput("marker.strokeWidth", this.seriesMarkerStrokeWidthSlider, "strokeWidth", 10);
    }
    getSeriesOption(expression) {
        return this.chartOptionsService.getSeriesOption(expression, this.getSelectedSeries());
    }
    setSeriesOption(expression, newValue) {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries());
    }
}
MarkersPanel.TEMPLATE = `<div>
            <ag-group-component ref="seriesMarkersGroup">
                <ag-select ref="seriesMarkerShapeSelect"></ag-select>
                <ag-slider ref="seriesMarkerMinSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('seriesMarkersGroup')
], MarkersPanel.prototype, "seriesMarkersGroup", void 0);
__decorate([
    RefSelector('seriesMarkerShapeSelect')
], MarkersPanel.prototype, "seriesMarkerShapeSelect", void 0);
__decorate([
    RefSelector('seriesMarkerSizeSlider')
], MarkersPanel.prototype, "seriesMarkerSizeSlider", void 0);
__decorate([
    RefSelector('seriesMarkerMinSizeSlider')
], MarkersPanel.prototype, "seriesMarkerMinSizeSlider", void 0);
__decorate([
    RefSelector('seriesMarkerStrokeWidthSlider')
], MarkersPanel.prototype, "seriesMarkerStrokeWidthSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], MarkersPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], MarkersPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvc2VyaWVzL21hcmtlcnNQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUtELFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsRUFDZCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3QyxNQUFNLE9BQU8sWUFBYSxTQUFRLFNBQVM7SUFvQnZDLFlBQTZCLG1CQUF3QyxFQUNqRCxpQkFBd0M7UUFDeEQsS0FBSyxFQUFFLENBQUM7UUFGaUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUNqRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXVCO0lBRTVELENBQUM7SUFHTyxJQUFJO1FBQ1IsTUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7U0FDeEIsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFDLGtCQUFrQixFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxXQUFXO1FBQ2YsTUFBTSx3QkFBd0IsR0FBRztZQUM3QjtnQkFDSSxLQUFLLEVBQUUsUUFBUTtnQkFDZixJQUFJLEVBQUUsUUFBUTthQUNqQjtZQUNEO2dCQUNJLEtBQUssRUFBRSxRQUFRO2dCQUNmLElBQUksRUFBRSxRQUFRO2FBQ2pCO1lBQ0Q7Z0JBQ0ksS0FBSyxFQUFFLE9BQU87Z0JBQ2QsSUFBSSxFQUFFLE9BQU87YUFDaEI7WUFDRDtnQkFDSSxLQUFLLEVBQUUsU0FBUztnQkFDaEIsSUFB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