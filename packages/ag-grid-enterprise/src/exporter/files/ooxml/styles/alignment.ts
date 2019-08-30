import { ExcelOOXMLTemplate, ExcelAlignment } from 'ag-grid-community';

const convertLegacyHorizontalAlignment = (alignment: string): string => {
    const map:{[key: string]: string} = {
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

const convertLegacyVerticalAlignment = (alignment: string): string | undefined => {
    const map:{[key: string]: string | undefined} = {
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

export interface Alignment {
    horizontal: string;
    indent: number;
    readingOrder: number;
    textRotation: number;
    shrinkToFit: boolean;
    vertical: string;
    wrapText: boolean;
}

export default alignmentFactory;
