"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const excelLegacyConvert_1 = require("../../../assets/excelLegacyConvert");
const getBorderColor = (color) => {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: excelLegacyConvert_1.convertLegacyColor(color || '#000000')
            }
        }
    };
};
const borderFactory = {
    getTemplate(border) {
        const { left, right, top, bottom, diagonal } = border;
        const leftChildren = left ? [getBorderColor(left.color)] : undefined;
        const rightChildren = right ? [getBorderColor(right.color)] : undefined;
        const topChildren = top ? [getBorderColor(top.color)] : undefined;
        const bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        const diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
        return {
            name: 'border',
            children: [{
                    name: 'left',
                    properties: { rawMap: { style: left && left.style } },
                    children: leftChildren
                }, {
                    name: 'right',
                    properties: { rawMap: { style: right && right.style } },
                    children: rightChildren
                }, {
                    name: 'top',
                    properties: { rawMap: { style: top && top.style } },
                    children: topChildren
                }, {
                    name: 'bottom',
                    properties: { rawMap: { style: bottom && bottom.style } },
                    children: bottomChildren
                }, {
                    name: 'diagonal',
                    properties: { rawMap: { style: diagonal && diagonal.style } },
                    children: diagonalChildren
                }]
        };
    }
};
exports.default = borderFactory;
