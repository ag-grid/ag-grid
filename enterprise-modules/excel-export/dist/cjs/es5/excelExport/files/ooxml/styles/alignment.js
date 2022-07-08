"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var excelLegacyConvert_1 = require("../../../assets/excelLegacyConvert");
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
                    horizontal: horizontal && excelLegacyConvert_1.convertLegacyHorizontalAlignment(horizontal),
                    indent: indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit: shrinkToFit,
                    vertical: vertical && excelLegacyConvert_1.convertLegacyVerticalAlignment(vertical),
                    wrapText: wrapText
                }
            }
        };
    }
};
exports.default = alignmentFactory;
