import { ExcelOOXMLTemplate, ExcelAlignment } from '@ag-grid-community/core';
import { convertLegacyHorizontalAlignment, convertLegacyVerticalAlignment } from '../../../assets/excelLegacyConvert';

const getReadingOrderId = (readingOrder: string): number => {
    const order = ['Context', 'LeftToRight', 'RightToLeft'];
    const pos = order.indexOf(readingOrder);
    return Math.max(pos, 0);
};

const alignmentFactory: ExcelOOXMLTemplate = {
    getTemplate(alignment: ExcelAlignment) {
        const {horizontal, indent, readingOrder, rotate, shrinkToFit, vertical, wrapText} = alignment;

        return {
            name: 'alignment',
            properties: {
                rawMap: {
                    horizontal: horizontal && convertLegacyHorizontalAlignment(horizontal),
                    indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit,
                    vertical: vertical && convertLegacyVerticalAlignment(vertical),
                    wrapText
                }
            }
        };
    }
};

export default alignmentFactory;
