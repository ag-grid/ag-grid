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
import { Bean, BeanStub } from "@ag-grid-community/core";
var ChartTranslationService = /** @class */ (function (_super) {
    __extends(ChartTranslationService, _super);
    function ChartTranslationService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartTranslationService_1 = ChartTranslationService;
    ChartTranslationService.prototype.translate = function (toTranslate, defaultText) {
        var translate = this.localeService.getLocaleTextFunc();
        var defaultTranslation = ChartTranslationService_1.DEFAULT_TRANSLATIONS[toTranslate] || defaultText;
        return translate(toTranslate, defaultTranslation);
    };
    var ChartTranslationService_1;
    ChartTranslationService.DEFAULT_TRANSLATIONS = {
        pivotChartTitle: 'Pivot Chart',
        rangeChartTitle: 'Range Chart',
        settings: 'Settings',
        data: 'Data',
        format: 'Format',
        categories: 'Categories',
        defaultCategory: '(None)',
        series: 'Series',
        xyValues: 'X Y Values',
        paired: 'Paired Mode',
        axis: 'Axis',
        navigator: 'Navigator',
        color: 'Color',
        thickness: 'Thickness',
        xType: 'X Type',
        automatic: 'Automatic',
        category: 'Category',
        number: 'Number',
        time: 'Time',
        autoRotate: 'Auto Rotate',
        xRotation: 'X Rotation',
        yRotation: 'Y Rotation',
        ticks: 'Ticks',
        width: 'Width',
        height: 'Height',
        length: 'Length',
        padding: 'Padding',
        spacing: 'Spacing',
        chart: 'Chart',
        title: 'Title',
        titlePlaceholder: 'Chart title - double click to edit',
        background: 'Background',
        font: 'Font',
        top: 'Top',
        right: 'Right',
        bottom: 'Bottom',
        left: 'Left',
        labels: 'Labels',
        calloutLabels: 'Callout Labels',
        sectorLabels: 'Sector Labels',
        positionRatio: 'Position Ratio',
        size: 'Size',
        shape: 'Shape',
        minSize: 'Minimum Size',
        maxSize: 'Maximum Size',
        legend: 'Legend',
        position: 'Position',
        markerSize: 'Marker Size',
        markerStroke: 'Marker Stroke',
        markerPadding: 'Marker Padding',
        itemSpacing: 'Item Spacing',
        itemPaddingX: 'Item Padding X',
        itemPaddingY: 'Item Padding Y',
        layoutHorizontalSpacing: 'Horizontal Spacing',
        layoutVerticalSpacing: 'Vertical Spacing',
        strokeWidth: 'Stroke Width',
        offset: 'Offset',
        offsets: 'Offsets',
        tooltips: 'Tooltips',
        callout: 'Callout',
        markers: 'Markers',
        shadow: 'Shadow',
        blur: 'Blur',
        xOffset: 'X Offset',
        yOffset: 'Y Offset',
        lineWidth: 'Line Width',
        lineDash: 'Line Dash',
        normal: 'Normal',
        bold: 'Bold',
        italic: 'Italic',
        boldItalic: 'Bold Italic',
        predefined: 'Predefined',
        fillOpacity: 'Fill Opacity',
        strokeOpacity: 'Line Opacity',
        histogramBinCount: 'Bin count',
        columnGroup: 'Column',
        barGroup: 'Bar',
        pieGroup: 'Pie',
        lineGroup: 'Line',
        scatterGroup: 'X Y (Scatter)',
        areaGroup: 'Area',
        histogramGroup: 'Histogram',
        combinationGroup: 'Combination',
        groupedColumnTooltip: 'Grouped',
        stackedColumnTooltip: 'Stacked',
        normalizedColumnTooltip: '100% Stacked',
        groupedBarTooltip: 'Grouped',
        stackedBarTooltip: 'Stacked',
        normalizedBarTooltip: '100% Stacked',
        pieTooltip: 'Pie',
        doughnutTooltip: 'Doughnut',
        lineTooltip: 'Line',
        groupedAreaTooltip: 'Area',
        stackedAreaTooltip: 'Stacked',
        normalizedAreaTooltip: '100% Stacked',
        scatterTooltip: 'Scatter',
        bubbleTooltip: 'Bubble',
        histogramTooltip: 'Histogram',
        columnLineComboTooltip: 'Column & Line',
        areaColumnComboTooltip: 'Area & Column',
        customComboTooltip: 'Custom Combination',
        noDataToChart: 'No data available to be charted.',
        pivotChartRequiresPivotMode: 'Pivot Chart requires Pivot Mode enabled.',
        chartSettingsToolbarTooltip: 'Menu',
        chartLinkToolbarTooltip: 'Linked to Grid',
        chartUnlinkToolbarTooltip: 'Unlinked from Grid',
        chartDownloadToolbarTooltip: 'Download Chart',
        histogramFrequency: "Frequency",
        seriesChartType: 'Series Chart Type',
        seriesType: 'Series Type',
        secondaryAxis: 'Secondary Axis',
    };
    ChartTranslationService = ChartTranslationService_1 = __decorate([
        Bean("chartTranslationService")
    ], ChartTranslationService);
    return ChartTranslationService;
}(BeanStub));
export { ChartTranslationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRUcmFuc2xhdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9zZXJ2aWNlcy9jaGFydFRyYW5zbGF0aW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR3pEO0lBQTZDLDJDQUFRO0lBQXJEOztJQXlIQSxDQUFDO2dDQXpIWSx1QkFBdUI7SUFvSHpCLDJDQUFTLEdBQWhCLFVBQWlCLFdBQW1CLEVBQUUsV0FBb0I7UUFDdEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pELElBQU0sa0JBQWtCLEdBQUcseUJBQXVCLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDO1FBQ3BHLE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxrQkFBNEIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7O0lBdEhjLDRDQUFvQixHQUFnQztRQUMvRCxlQUFlLEVBQUUsYUFBYTtRQUM5QixlQUFlLEVBQUUsYUFBYTtRQUM5QixRQUFRLEVBQUUsVUFBVTtRQUNwQixJQUFJLEVBQUUsTUFBTTtRQUNaLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLGVBQWUsRUFBRSxRQUFRO1FBQ3pCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFFBQVEsRUFBRSxZQUFZO1FBQ3RCLE1BQU0sRUFBRSxhQUFhO1FBQ3JCLElBQUksRUFBRSxNQUFNO1FBQ1osU0FBUyxFQUFFLFdBQVc7UUFDdEIsS0FBSyxFQUFFLE9BQU87UUFDZCxTQUFTLEVBQUUsV0FBVztRQUN0QixLQUFLLEVBQUUsUUFBUTtRQUNmLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLFFBQVEsRUFBRSxV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