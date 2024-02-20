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
        radiusAxis: 'Radius Axis',
        navigator: 'Navigator',
        color: 'Color',
        thickness: 'Thickness',
        preferredLength: 'Preferred Length',
        xType: 'X Type',
        automatic: 'Automatic',
        category: 'Category',
        number: 'Number',
        time: 'Time',
        autoRotate: 'Auto Rotate',
        xRotation: 'X Rotation',
        yRotation: 'Y Rotation',
        labelRotation: 'Rotation',
        circle: 'Circle',
        orientation: 'Orientation',
        polygon: 'Polygon',
        fixed: 'Fixed',
        parallel: 'Parallel',
        perpendicular: 'Perpendicular',
        radiusAxisPosition: 'Position',
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
        lineDashOffset: 'Dash Offset',
        normal: 'Normal',
        bold: 'Bold',
        italic: 'Italic',
        boldItalic: 'Bold Italic',
        predefined: 'Predefined',
        fillOpacity: 'Fill Opacity',
        strokeColor: 'Line Color',
        strokeOpacity: 'Line Opacity',
        histogramBinCount: 'Bin count',
        connectorLine: 'Connector Line',
        seriesItems: 'Series Items',
        seriesItemType: 'Item Type',
        seriesItemPositive: 'Positive',
        seriesItemNegative: 'Negative',
        seriesItemLabels: 'Item Labels',
        columnGroup: 'Column',
        barGroup: 'Bar',
        pieGroup: 'Pie',
        lineGroup: 'Line',
        scatterGroup: 'X Y (Scatter)',
        areaGroup: 'Area',
        polarGroup: 'Polar',
        statisticalGroup: 'Statistical',
        hierarchicalGroup: 'Hierarchical',
        specializedGroup: 'Specialized',
        combinationGroup: 'Combination',
        groupedColumnTooltip: 'Grouped',
        stackedColumnTooltip: 'Stacked',
        normalizedColumnTooltip: '100% Stacked',
        groupedBarTooltip: 'Grouped',
        stackedBarTooltip: 'Stacked',
        normalizedBarTooltip: '100% Stacked',
        pieTooltip: 'Pie',
        donutTooltip: 'Donut',
        lineTooltip: 'Line',
        groupedAreaTooltip: 'Area',
        stackedAreaTooltip: 'Stacked',
        normalizedAreaTooltip: '100% Stacked',
        scatterTooltip: 'Scatter',
        bubbleTooltip: 'Bubble',
        histogramTooltip: 'Histogram',
        radialColumnTooltip: 'Radial Column',
        radialBarTooltip: 'Radial Bar',
        radarLineTooltip: 'Radar Line',
        radarAreaTooltip: 'Radar Area',
        nightingaleTooltip: 'Nightingale',
        rangeBarTooltip: 'Range Bar',
        rangeAreaTooltip: 'Range Area',
        boxPlotTooltip: 'Box Plot',
        treemapTooltip: 'Treemap',
        sunburstTooltip: 'Sunburst',
        heatmapTooltip: 'Heatmap',
        waterfallTooltip: 'Waterfall',
        columnLineComboTooltip: 'Column & Line',
        areaColumnComboTooltip: 'Area & Column',
        customComboTooltip: 'Custom Combination',
        innerRadius: 'Inner Radius',
        startAngle: 'Start Angle',
        endAngle: 'End Angle',
        reverseDirection: 'Reverse Direction',
        groupPadding: 'Group Padding',
        seriesPadding: 'Series Padding',
        group: 'Group',
        tile: 'Tile',
        whisker: 'Whisker',
        cap: 'Cap',
        capLengthRatio: 'Length Ratio',
        labelPlacement: 'Placement',
        inside: 'Inside',
        outside: 'Outside',
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
