import type { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

import type { BorderSet } from '../../../assets/excelInterfaces';
import { convertLegacyColor } from '../../../assets/excelLegacyConvert';

const getBorderColor = (color?: string): XmlElement => {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: convertLegacyColor(color || '#000000'),
            },
        },
    };
};

const borderFactory: ExcelOOXMLTemplate = {
    getTemplate(border: BorderSet) {
        const { left, right, top, bottom, diagonal } = border;
        const leftChildren = left ? [getBorderColor(left.color)] : undefined;
        const rightChildren = right ? [getBorderColor(right.color)] : undefined;
        const topChildren = top ? [getBorderColor(top.color)] : undefined;
        const bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        const diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
        return {
            name: 'border',
            children: [
                {
                    name: 'left',
                    properties: { rawMap: { style: left?.style } },
                    children: leftChildren,
                },
                {
                    name: 'right',
                    properties: { rawMap: { style: right?.style } },
                    children: rightChildren,
                },
                {
                    name: 'top',
                    properties: { rawMap: { style: top?.style } },
                    children: topChildren,
                },
                {
                    name: 'bottom',
                    properties: { rawMap: { style: bottom?.style } },
                    children: bottomChildren,
                },
                {
                    name: 'diagonal',
                    properties: { rawMap: { style: diagonal?.style } },
                    children: diagonalChildren,
                },
            ],
        };
    },
};

export default borderFactory;
