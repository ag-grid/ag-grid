// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var convertLegacyHorizontalAlignment = function (alignment) {
    var map = {
        Automatic: 'general',
        Left: 'left',
        Center: 'center',
        Right: 'right',
        Fill: 'fill',
        Justify: 'justify',
        CenterAcrossSelection: 'centerContinuous',
        Distributed: 'distributed',
        JustifyDistributed: 'justify'
    };
    return map[alignment] || 'general';
};
var convertLegacyVerticalAlignment = function (alignment) {
    var map = {
        Automatic: undefined,
        Top: 'top',
        Bottom: 'bottom',
        Center: 'center',
        Justify: 'justify',
        Distributed: 'distributed',
        JustifyDistributed: 'justify'
    };
    return map[alignment] || undefined;
};
var getReadingOrderId = function (readingOrder) {
    var order = ['Context', 'LeftToRight', 'RightToLeft'];
    var pos = order.indexOf(readingOrder);
    return Math.max(pos, 0);
};
var alignmentFactory = {
    getTemplate: function (alignment) {
        var horizontal = alignment.horizontal, indent = alignment.indent, readingOrder = alignment.readingOrder, rotate = alignment.rotate, shrinkToFit = alignment.shrinkToFit, vertical = alignment.vertical, wrapText = alignment.wrapText;
        return {
            name: 'alignment',
            properties: {
                rawMap: {
                    horizontal: horizontal && convertLegacyHorizontalAlignment(horizontal),
                    indent: indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit: shrinkToFit,
                    vertical: vertical && convertLegacyVerticalAlignment(vertical),
                    wrapText: wrapText
                }
            }
        };
    }
};
exports.default = alignmentFactory;
