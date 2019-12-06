var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "@ag-grid-community/core";
var ChartTranslator = /** @class */ (function () {
    function ChartTranslator() {
    }
    ChartTranslator_1 = ChartTranslator;
    ChartTranslator.prototype.translate = function (toTranslate) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var defaultTranslation = ChartTranslator_1.DEFAULT_TRANSLATIONS[toTranslate];
        return translate(toTranslate, defaultTranslation);
    };
    var ChartTranslator_1;
    ChartTranslator.DEFAULT_TRANSLATIONS = {
        pivotChartTitle: 'Pivot Chart',
        rangeChartTitle: 'Range Chart',
        settings: 'Settings',
        data: 'Data',
        format: 'Format',
        categories: 'Categories',
        series: 'Series',
        xyValues: 'X Y Values',
        paired: 'Paired Mode',
        axis: 'Axis',
        color: 'Color',
        thickness: 'Thickness',
        xRotation: 'X Rotation',
        yRotation: 'Y Rotation',
        ticks: 'Ticks',
        width: 'Width',
        length: 'Length',
        padding: 'Padding',
        chart: 'Chart',
        title: 'Title',
        background: 'Background',
        font: 'Font',
        top: 'Top',
        right: 'Right',
        bottom: 'Bottom',
        left: 'Left',
        labels: 'Labels',
        size: 'Size',
        minSize: 'Minimum Size',
        maxSize: 'Maximum Size',
        legend: 'Legend',
        position: 'Position',
        markerSize: 'Marker Size',
        markerStroke: 'Marker Stroke',
        markerPadding: 'Marker Padding',
        itemPaddingX: 'Item Padding X',
        itemPaddingY: 'Item Padding Y',
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
        normal: 'Normal',
        bold: 'Bold',
        italic: 'Italic',
        boldItalic: 'Bold Italic',
        predefined: 'Predefined',
        fillOpacity: 'Fill Opacity',
        strokeOpacity: 'Line Opacity',
        columnGroup: 'Column',
        barGroup: 'Bar',
        pieGroup: 'Pie',
        lineGroup: 'Line',
        scatterGroup: 'X Y (Scatter)',
        areaGroup: 'Area',
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
        noDataToChart: 'No data available to be charted.',
        pivotChartRequiresPivotMode: 'Pivot Chart requires Pivot Mode enabled.',
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ChartTranslator.prototype, "gridOptionsWrapper", void 0);
    ChartTranslator = ChartTranslator_1 = __decorate([
        Bean("chartTranslator")
    ], ChartTranslator);
    return ChartTranslator;
}());
export { ChartTranslator };
