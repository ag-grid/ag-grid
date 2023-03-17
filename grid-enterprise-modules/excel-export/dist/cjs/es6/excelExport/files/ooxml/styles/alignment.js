"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const excelLegacyConvert_1 = require("../../../assets/excelLegacyConvert");
const getReadingOrderId = (readingOrder) => {
    const order = ['Context', 'LeftToRight', 'RightToLeft'];
    const pos = order.indexOf(readingOrder);
    return Math.max(pos, 0);
};
const alignmentFactory = {
    getTemplate(alignment) {
        const { horizontal, indent, readingOrder, rotate, shrinkToFit, vertical, wrapText } = alignment;
        return {
            name: 'alignment',
            properties: {
                rawMap: {
                    horizontal: horizontal && excelLegacyConvert_1.convertLegacyHorizontalAlignment(horizontal),
                    indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit,
                    vertical: vertical && excelLegacyConvert_1.convertLegacyVerticalAlignment(vertical),
                    wrapText
                }
            }
        };
    }
};
exports.default = alignmentFactory;
