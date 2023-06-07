export function initFontPanelParams({ labelName, chartOptionsService, getSelectedSeries, seriesOptionLabelProperty }) {
    const getFontOptionExpression = (fontOption) => {
        return `${seriesOptionLabelProperty}.${fontOption}`;
    };
    const getFontOption = (fontOption) => {
        const expression = getFontOptionExpression(fontOption);
        return chartOptionsService.getSeriesOption(expression, getSelectedSeries());
    };
    const setFontOption = (fontOption, value) => {
        const expression = getFontOptionExpression(fontOption);
        chartOptionsService.setSeriesOption(expression, value, getSelectedSeries());
    };
    const initialFont = {
        family: getFontOption('fontFamily'),
        style: getFontOption('fontStyle'),
        weight: getFontOption('fontWeight'),
        size: getFontOption('fontSize'),
        color: getFontOption('color'),
    };
    const setFont = (font) => {
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
    const params = {
        name: labelName,
        enabled: getFontOption('enabled') || false,
        setEnabled: (enabled) => setFontOption('enabled', enabled),
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udFBhbmVsUGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvc2VyaWVzL2ZvbnRQYW5lbFBhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXQSxNQUFNLFVBQVUsbUJBQW1CLENBQUMsRUFDaEMsU0FBUyxFQUNULG1CQUFtQixFQUNuQixpQkFBaUIsRUFDakIseUJBQXlCLEVBQ1A7SUFFbEIsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLFVBQWtCLEVBQUUsRUFBRTtRQUNuRCxPQUFPLEdBQUcseUJBQXlCLElBQUksVUFBVSxFQUFFLENBQUM7SUFDeEQsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxhQUFhLEdBQUcsQ0FBYSxVQUFrQixFQUFFLEVBQUU7UUFDckQsTUFBTSxVQUFVLEdBQUcsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkQsT0FBTyxtQkFBbUIsQ0FBQyxlQUFlLENBQUksVUFBVSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUNuRixDQUFDLENBQUM7SUFDRixNQUFNLGFBQWEsR0FBRyxDQUFDLFVBQWtCLEVBQUUsS0FBVSxFQUFFLEVBQUU7UUFDckQsTUFBTSxVQUFVLEdBQUcsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkQsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ2hGLENBQUMsQ0FBQztJQUVGLE1BQU0sV0FBVyxHQUFHO1FBQ2hCLE1BQU0sRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDO1FBQ25DLEtBQUssRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDO1FBQ25DLElBQUksRUFBRSxhQUFhLENBQVMsVUFBVSxDQUFDO1FBQ3ZDLEtBQUssRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDO0tBQ2hDLENBQUM7SUFFRixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsYUFBYSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUM7UUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWixhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQztRQUNELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBb0I7UUFDNUIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUs7UUFDMUMsVUFBVSxFQUFFLENBQUMsT0FBZ0IsRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDbkUsdUJBQXVCLEVBQUUsS0FBSztRQUM5QixXQUFXLEVBQUUsV0FBVztRQUN4QixPQUFPLEVBQUUsT0FBTztLQUNuQixDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyJ9