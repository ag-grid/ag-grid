export function initFontPanelParams(_a) {
    var labelName = _a.labelName, chartOptionsService = _a.chartOptionsService, getSelectedSeries = _a.getSelectedSeries, seriesOptionLabelProperty = _a.seriesOptionLabelProperty;
    var getFontOptionExpression = function (fontOption) {
        return seriesOptionLabelProperty + "." + fontOption;
    };
    var getFontOption = function (fontOption) {
        var expression = getFontOptionExpression(fontOption);
        return chartOptionsService.getSeriesOption(expression, getSelectedSeries());
    };
    var setFontOption = function (fontOption, value) {
        var expression = getFontOptionExpression(fontOption);
        chartOptionsService.setSeriesOption(expression, value, getSelectedSeries());
    };
    var initialFont = {
        family: getFontOption('fontFamily'),
        style: getFontOption('fontStyle'),
        weight: getFontOption('fontWeight'),
        size: getFontOption('fontSize'),
        color: getFontOption('color'),
    };
    var setFont = function (font) {
        if (font.family) {
            setFontOption('fontFamily', font.family);
        }
        if (font.weight) {
            setFontOption('fontWeight', font.weight);
        }
        if (font.style) {
            setFontOption('fontStyle', font.style);
        }
        if (font.size) {
            setFontOption('fontSize', font.size);
        }
        if (font.color) {
            setFontOption('color', font.color);
        }
    };
    var params = {
        name: labelName,
        enabled: getFontOption('enabled') || false,
        setEnabled: function (enabled) { return setFontOption('enabled', enabled); },
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udFBhbmVsUGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvc2VyaWVzL2ZvbnRQYW5lbFBhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXQSxNQUFNLFVBQVUsbUJBQW1CLENBQUMsRUFLZDtRQUpsQixTQUFTLGVBQUEsRUFDVCxtQkFBbUIseUJBQUEsRUFDbkIsaUJBQWlCLHVCQUFBLEVBQ2pCLHlCQUF5QiwrQkFBQTtJQUd6QixJQUFNLHVCQUF1QixHQUFHLFVBQUMsVUFBa0I7UUFDL0MsT0FBVSx5QkFBeUIsU0FBSSxVQUFZLENBQUM7SUFDeEQsQ0FBQyxDQUFDO0lBQ0YsSUFBTSxhQUFhLEdBQUcsVUFBYSxVQUFrQjtRQUNqRCxJQUFNLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RCxPQUFPLG1CQUFtQixDQUFDLGVBQWUsQ0FBSSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ25GLENBQUMsQ0FBQztJQUNGLElBQU0sYUFBYSxHQUFHLFVBQUMsVUFBa0IsRUFBRSxLQUFVO1FBQ2pELElBQU0sVUFBVSxHQUFHLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZELG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUNoRixDQUFDLENBQUM7SUFFRixJQUFNLFdBQVcsR0FBRztRQUNoQixNQUFNLEVBQUUsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUNuQyxLQUFLLEVBQUUsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUNqQyxNQUFNLEVBQUUsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUNuQyxJQUFJLEVBQUUsYUFBYSxDQUFTLFVBQVUsQ0FBQztRQUN2QyxLQUFLLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQztLQUNoQyxDQUFDO0lBRUYsSUFBTSxPQUFPLEdBQUcsVUFBQyxJQUFVO1FBQ3ZCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsYUFBYSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUM7UUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWixhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQztRQUNELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDLENBQUM7SUFFRixJQUFNLE1BQU0sR0FBb0I7UUFDNUIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUs7UUFDMUMsVUFBVSxFQUFFLFVBQUMsT0FBZ0IsSUFBSyxPQUFBLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQWpDLENBQWlDO1FBQ25FLHVCQUF1QixFQUFFLEtBQUs7UUFDOUIsV0FBVyxFQUFFLFdBQVc7UUFDeEIsT0FBTyxFQUFFLE9BQU87S0FDbkIsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMifQ==