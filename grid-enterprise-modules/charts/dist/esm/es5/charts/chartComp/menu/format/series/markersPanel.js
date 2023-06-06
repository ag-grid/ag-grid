var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
var MarkersPanel = /** @class */ (function (_super) {
    __extends(MarkersPanel, _super);
    function MarkersPanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
        return _this;
    }
    MarkersPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical'
        };
        this.setTemplate(MarkersPanel.TEMPLATE, { seriesMarkersGroup: groupParams });
        this.initMarkers();
    };
    MarkersPanel.prototype.initMarkers = function () {
        var _this = this;
        var seriesMarkerShapeOptions = [
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
            .onValueChange(function (value) { return _this.setSeriesOption("marker.shape", value); });
        // scatter charts should always show markers
        var chartType = this.chartOptionsService.getChartType();
        var shouldHideEnabledCheckbox = _.includes(['scatter', 'bubble'], chartType);
        this.seriesMarkersGroup
            .setTitle(this.chartTranslationService.translate("markers"))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.getSeriesOption("marker.enabled") || false)
            .hideOpenCloseIcons(true)
            .onEnableChange(function (newValue) { return _this.setSeriesOption("marker.enabled", newValue); });
        var initInput = function (expression, input, labelKey, defaultMaxValue) {
            var currentValue = _this.getSeriesOption(expression);
            input.setLabel(_this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.setSeriesOption(expression, newValue); });
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
    };
    MarkersPanel.prototype.getSeriesOption = function (expression) {
        return this.chartOptionsService.getSeriesOption(expression, this.getSelectedSeries());
    };
    MarkersPanel.prototype.setSeriesOption = function (expression, newValue) {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries());
    };
    MarkersPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesMarkersGroup\">\n                <ag-select ref=\"seriesMarkerShapeSelect\"></ag-select>\n                <ag-slider ref=\"seriesMarkerMinSizeSlider\"></ag-slider>\n                <ag-slider ref=\"seriesMarkerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"seriesMarkerStrokeWidthSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
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
    return MarkersPanel;
}(Component));
export { MarkersPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvc2VyaWVzL21hcmtlcnNQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUtELFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsRUFDZCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3QztJQUFrQyxnQ0FBUztJQW9CdkMsc0JBQTZCLG1CQUF3QyxFQUNqRCxpQkFBd0M7UUFENUQsWUFFSSxpQkFBTyxTQUNWO1FBSDRCLHlCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDakQsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUF1Qjs7SUFFNUQsQ0FBQztJQUdPLDJCQUFJLEdBQVo7UUFDSSxJQUFNLFdBQVcsR0FBMkI7WUFDeEMsYUFBYSxFQUFFLHlCQUF5QjtZQUN4QyxTQUFTLEVBQUUsVUFBVTtTQUN4QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUMsa0JBQWtCLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVPLGtDQUFXLEdBQW5CO1FBQUEsaUJBa0VDO1FBakVHLElBQU0sd0JBQXdCLEdBQUc7WUFDN0I7Z0JBQ0ksS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsSUFBSSxFQUFFLFFBQVE7YUFDakI7WUFDRDtnQkFDSSxLQUFLLEVBQUUsUUFBUTtnQkFDZixJQUFJLEVBQUUsUUFBUTthQUNqQjtZQUNEO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLElBQUksRUFBRSxPQUFPO2FBQ2hCO1lBQ0Q7Z0JBQ0ksS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2FBQ2xCO1lBQ0Q7Z0JBQ0ksS0FBSyxFQUFFLE1BQU07Z0JBQ2IsSUFBSSxFQUFFLE1BQU07YUFDZjtZQUNEO2dCQUNJLEtBQUssRUFBRSxVQUFVO2dCQUNqQixJQUFJLEVBQUUsVUFBVTthQUNuQjtZQUNEO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLElBQUksRUFBRSxPQUFPO2FBQ2hCO1NBQ0osQ0FBQztRQUNGLElBQUksQ0FBQyx1QkFBdUI7YUFDdkIsVUFBVSxDQUFDLHdCQUF3QixDQUFDO2FBQ3BDLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pELFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQzlDLGFBQWEsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLENBQUM7UUFFekUsNENBQTRDO1FBQzVDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMxRCxJQUFNLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFL0UsSUFBSSxDQUFDLGtCQUFrQjthQUNsQixRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMzRCxtQkFBbUIsQ0FBQyx5QkFBeUIsQ0FBQzthQUM5QyxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssQ0FBQzthQUMzRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7YUFDeEIsY0FBYyxDQUFDLFVBQUEsUUFBUSxJQUFJLE9BQUEsS0FBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsRUFBaEQsQ0FBZ0QsQ0FBQyxDQUFDO1FBRWxGLElBQU0sU0FBUyxHQUFHLFVBQUMsVUFBa0IsRUFBRSxLQUFlLEVBQUUsUUFBZ0IsRUFBRSxlQUF1QjtZQUM3RixJQUFNLFlBQVksR0FBRyxLQUFJLENBQUMsZUFBZSxDQUFTLFVBQVUsQ0FBQyxDQUFDO1lBQzlELEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDM0QsV0FBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7aUJBQ3ZELFFBQVEsQ0FBQyxLQUFHLFlBQWMsQ0FBQztpQkFDM0IsaUJBQWlCLENBQUMsRUFBRSxDQUFDO2lCQUNyQixhQUFhLENBQUMsVUFBQSxRQUFRLElBQUksT0FBQSxLQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBMUMsQ0FBMEMsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQztRQUVGLElBQUksU0FBUyxLQUFLLFFBQVEsRUFBRTtZQUN4QixTQUFTLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRSxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDeEU7YUFBTTtZQUNILElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsU0FBUyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVPLHNDQUFlLEdBQXZCLFVBQW9DLFVBQWtCO1FBQ2xELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBSSxVQUFVLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRU8sc0NBQWUsR0FBdkIsVUFBb0MsVUFBa0IsRUFBRSxRQUFXO1FBQy9ELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUEzR2EscUJBQVEsR0FDbEIsa2FBT08sQ0FBQztJQUV1QjtRQUFsQyxXQUFXLENBQUMsb0JBQW9CLENBQUM7NERBQThDO0lBQ3hDO1FBQXZDLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQztpRUFBMkM7SUFDM0M7UUFBdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDO2dFQUEwQztJQUN0QztRQUF6QyxXQUFXLENBQUMsMkJBQTJCLENBQUM7bUVBQTZDO0lBQ3hDO1FBQTdDLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQzt1RUFBaUQ7SUFFeEQ7UUFBckMsU0FBUyxDQUFDLHlCQUF5QixDQUFDO2lFQUEwRDtJQVEvRjtRQURDLGFBQWE7NENBUWI7SUE2RUwsbUJBQUM7Q0FBQSxBQTlHRCxDQUFrQyxTQUFTLEdBOEcxQztTQTlHWSxZQUFZIn0=